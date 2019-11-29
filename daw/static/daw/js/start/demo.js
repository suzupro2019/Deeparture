var MIDI_chord = [];
var bassline = [];
var MIDI_bass = [];
var MIDI_drum = [];
var default_chord = "C Dm Em F";
// HACK: generated_chordはchord_progに置き換えるべき
var generated_chord = "Dm Am Bb F"; //Chainerからの出力
var bpm = 120;


var MIDI_Mscale = 72; //音階数 重すぎるのでヤマハ式のC1〜B6まで(72)
var notes_measure = 128; //notesの列数 (デフォルト>> 16小節 * 16拍 = 256) 重い場合はここを調整してください(コード自動生成等の都合上、ここをいじるだけだとエラーを吐きます)
var Mscale_Do = ["ド", "ド#", "レ", "レ#", "ミ", "ファ", "ファ#", "ソ", "ソ#", "ラ", "ラ#", "シ"];
var Mscale_C = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var Keys = {"C":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,"E":4,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,"A":9,"A#":10,"Bb":10,"B":11};
var chord_list =[ //C3のインデックス基準 テンションコードは別で付与 逆順で表示しているため、+-が逆
  [0, 0, 0], //Major
  [0, 1, 0], //Minor
  [0, 2, 0], //sus2
  [0, -1, 0], //sus4
  [0, 0, -1], //aug
  [0, 1, 1] //dim
]
var Tensions = [
  2, //6th
  3, //7th
  4, //M7th
  6, //add9thb
  7 //add9th
];
Mscale_Do.reverse(); //逆から表示するために反転している
Mscale_C.reverse(); //同上

// NOTE: タブ切り替え初回時のみデモを生成するようにするためのフラグ
let isCreatedDeme = 0;

jQuery(function($){
  //音源の定義
  var polysynth_chord = new Tone.PolySynth().toMaster(); //Chord用
  var plucksynth = new Tone.PluckSynth().toMaster(); //Bass用
  var Drum_sampler = new Tone.Sampler({ //Drum用
    "C1" : "/static/daw/audio/Drum/Kick_C1.wav",
    "C#1" : "/static/daw/audio/Drum/Snare_Cs1.wav",
    "D1" : "/static/daw/audio/Drum/Snare_D1.wav",
    "E1" : "/static/daw/audio/Drum/Snare_E1.wav",
    "F1" : "/static/daw/audio/Drum/LowTom_F1.wav",
    "F#1" : "/static/daw/audio/Drum/CH_Fs1.wav",
    "G1" : "/static/daw/audio/Drum/LowTom_G1.wav",
    "G#1" : "/static/daw/audio/Drum/CHF_Gs1.wav",
    "A1" : "/static/daw/audio/Drum/MidTom_A1.wav",
    "A#1" : "/static/daw/audio/Drum/OH_As1.wav",
    "B1" : "/static/daw/audio/Drum/MidTom_B1.wav",
    "C2" : "/static/daw/audio/Drum/HighTom_C2.wav",
    "C#2" : "/static/daw/audio/Drum/CrashLeft_Cs2.wav",
    "D2" : "/static/daw/audio/Drum/HighTom_D2.wav",
    "D#2" : "/static/daw/audio/Drum/Ride_Ds2.wav",
    "E2" : "/static/daw/audio/Drum/OH_E2.wav"
  }).toMaster();
  function addChord(time, note) {
    polysynth_chord.triggerAttackRelease(note.note, note.duration, time);
  }
  function addBass(time, note) {
    plucksynth.triggerAttackRelease(note, '16n', time);
  }
  function addDrum(time, note) {
    Drum_sampler.triggerAttackRelease(note, '1n', time);
  }

  function Chord_gene(ch, pattern){ //コード進行(文字列)、リズムパターン(A, B, C)
    var chords = ch.split(" ");
    var ch_key = [];
    var chord = [];
    var tension = [];
    var cc_index = 0;

    for(var x=0; x<notes_measure/16; x++){
      if(chords[x%4].indexOf("/") >= 0){
        bassline.push(chords[x%4].slice(chords[x%4].indexOf("/")+1));
      }else if(chords[x%4].indexOf("#") == 1 || chords[x%4].indexOf("b") == 1){
        bassline.push(chords[x%4].slice(0, 2));
      }else{
        bassline.push(chords[x%4].slice(0, 1));
      }

      if(chords[x%4].indexOf("#") == 1 || chords[x%4].indexOf("b") == 1){
        ch_key.push(chords[x%4].slice(0, 2));
      }else{
        ch_key.push(chords[x%4].slice(0, 1));
      }

      if(chords[x%4].indexOf("dim") >= 0){
        chord.push(chord_list[5]);
      }else if(chords[x%4].indexOf("aug") >= 0){
        chord.push(chord_list[4]);
      }else if(chords[x%4].indexOf("sus4") >= 0){
        chord.push(chord_list[3]);
      }else if(chords[x%4].indexOf("sus2") >= 0){
        chord.push(chord_list[2]);
      }else if(chords[x%4].indexOf("m") >= 0){
        chord.push(chord_list[1]);
      }else{
        chord.push(chord_list[0]);
      }

      if(chords[x%4].indexOf("add9b") >= 0){
        tension.push(Tensions[3]);
      }else if(chords[x%4].indexOf("add9") >= 0){
        tension.push(Tensions[4]);
      }else if(chords[x%4].indexOf("M7") >= 0){
        tension.push(Tensions[2]);
      }else if(chords[x%4].indexOf("7") >= 0){
        tension.push(Tensions[1]);
      }else if(chords[x%4].indexOf("6") >= 0){
        tension.push(Tensions[0]);
      }else{
        tension.push(0);
      }

      for(var y=0; y<16; y++){
        if(chord_stroke[pattern][x*16+y].note.length > 0 && chord_stroke[pattern][x*16+y].note[0] != ""){
          MIDI_chord.push(chord_stroke[pattern][x*16+y]);
          for(var z=0; z<3; z++){
            MIDI_chord[cc_index].note[z] -= Keys[ch_key[x]];
            MIDI_chord[cc_index].note[z] += chord[x][z];
          }
          if(tension[x] != 0){
            MIDI_chord[cc_index].note.push(MIDI_chord[cc_index].note[2] - tension[x]);
          }
          for(var aa=0; aa<MIDI_chord[cc_index].note.length; aa++){
            var note_name = MIDI_chord[cc_index].note[aa] % 12;
            var pitch =  Math.ceil((MIDI_Mscale-MIDI_chord[cc_index].note[aa]%MIDI_Mscale) / 12);
            var MIDI_note = Mscale_C[note_name] + pitch;
            MIDI_chord[cc_index].note.splice(aa, 1, MIDI_note);
          }
          cc_index += 1;
        }
      }
    }
    //console.log(MIDI_chord);
  }

  function Stroke_init(){
    for(var x=0; x<chord_stroke.A.length; x++){
      if(chord_stroke.A[x].note.length > 0 && chord_stroke.A[x].note[0] != ""){
        chord_stroke.A[x].note = [47, 43, 40];
      }
    }
    for(var x=0; x<chord_stroke.B.length; x++){
      if(chord_stroke.B[x].note.length > 0 && chord_stroke.B[x].note[0] != ""){
        chord_stroke.B[x].note = [47, 43, 40];
      }
    }
    for(var x=0; x<chord_stroke.C.length; x++){
      if(chord_stroke.C[x].note.length > 0 && chord_stroke.C[x].note[0] != ""){
        chord_stroke.C[x].note = [47, 43, 40];
      }
    }
    for(var x=0; x<chord_stroke.D.length; x++){
      if(chord_stroke.D[x].note.length > 0 && chord_stroke.D[x].note[0] != ""){
        chord_stroke.D[x].note = [47, 43, 40];
      }
    }
    //console.log(chord_stroke);
  }

  function Bass_gene(){
    for(x=0; x<notes_measure/16; x++){ //
      for(y=0; y<4; y++){
        for(z=0; z<4; z++){
          if(z%2 == 0){
            MIDI_bass.push([x+":"+y+":"+z, bassline[x]+2]);
          }
        }
      }
    }
    console.log(MIDI_bass);
  }

  function Drum_gene(){
    for(var x=0; x<drum_pattern[rhythm_pattern].length; x++){
      if(drum_pattern[rhythm_pattern][x][1].length > 0 && drum_pattern[rhythm_pattern][x][1][0] != ""){
        MIDI_drum.push(drum_pattern[rhythm_pattern][x]);
      }
    }
    //console.log(MIDI_drum);
  }

  function MIDI_gene(ch, pattern){ //(コード進行, リズムパターン)
    //初期化
    Stroke_init();
    MIDI_chord = [];
    MIDI_bass = [];
    bassline = [];
    MIDI_drum = [];
    //生成
    Chord_gene(ch, pattern);
    Bass_gene();
    Drum_gene();
  }

  function Demo_play_init(){ //デモの再生情報・表示の初期化
    $('.play-btn').show();
    $('.stop-btn').hide();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  $(".beat_play").on("click", function(){
    if(rhythm_pattern != ""){
      if($(".beat_play-btn").css("display") == "block"){
        $('.beat_play-btn').css('display','none');
        $('.beat_stop-btn').css('display','block');
        //再生の処理
        polysynth_chord.triggerAttackRelease("", '16n'); //Chrome用の処理
        MIDI_gene(default_chord, rhythm_pattern);
        Tone.Transport.bpm.value = bpm;
        var Chord = new Tone.Part(addChord, MIDI_chord).start();
        var Drum = new Tone.Part(addDrum, MIDI_drum).start();
        Tone.Transport.start();
      }else{
        Demo_play_init();
      }
    }else{
      alert("リズムパターンを選択してください。")
    }
  });

  $(".start_next-btn").click(function(){
    Demo_play_init();
    if($('.start_next-btn').index(this) == 2){
      console.log(artist);
      console.log(key);
      console.log(rhythm_pattern);
      if(!isCreatedDeme) {
        generateChordProgression(artist, key.split("/")[0]).then(response => {
          console.log('succeed');
          console.log(response);
          chord_prog = generated_chord = response.chord_progression;
          MIDI_gene(generated_chord, rhythm_pattern);
          $(".gene_chords").html(generated_chord);
          isCreatedDeme = 1;
        })
        .catch(error => {
          console.log('failed');
          console.log(error);
        });
      }
    }
  });
  $(".Progress_number").click(function(){
    if($(".Progress_number").index(this) == 3 && $(this).hasClass("is-active")){
      Demo_play_init();
      console.log(artist);
      console.log(key);
      console.log(rhythm_pattern);
      if(!isCreatedDeme) {
        generateChordProgression(artist, key.split("/")[0]).then(response => {
          console.log('succeed');
          console.log(response);
          chord_prog = generated_chord = response.chord_progression;
          MIDI_gene(generated_chord, rhythm_pattern);
          $(".gene_chords").html(generated_chord);
          isCreatedDeme = 1;
        })
        .catch(error => {
          console.log('failed');
          console.log(error);
        });
      }
    }
  });

  $('.bpm_number').attr("value", bpm);
  $('.bpm_number').on('input change', function() {
    bpm = $(this).val();
  });

  $(".regeneration_btn").on("click", function(){ //コード再生成btn
    if(confirm('本当にコード進行の再生成を行いますか。')){
      generateChordProgression(artist, key.split("/")[0]).then(response => {
        console.log('succeed');
        console.log(response);
        chord_prog = generated_chord = response.chord_progression;
        MIDI_gene(generated_chord, rhythm_pattern);
        $(".gene_chords").html(generated_chord);
        isCreatedDeme = 1;
        Demo_play_init();
      })
      .catch(error => {
        console.log('failed');
        console.log(error);
      });
    }else{
      return false;
    }
  });

  $('.demo_play').on("click", function() {
    Tone.Transport.bpm.value = bpm;
    if($(".demo_play-btn").css("display") == "block"){
      $('.demo_play-btn').css('display','none');
      $('.demo_stop-btn').css('display','block');
      //再生の処理
      polysynth_chord.triggerAttackRelease("", '16n'); //Chrome用の処理
      var Chord = new Tone.Part(addChord, MIDI_chord).start();
      var Bass = new Tone.Part(addBass, MIDI_bass).start();
      var Drum = new Tone.Part(addDrum, drum_pattern[rhythm_pattern]).start();
      Tone.Transport.start();
    }else{
      Demo_play_init();
    }
  });
});

function generateChordProgression(artist, key) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: '/api/v1/chordprog/',
      dataType: 'json',
      headers: {
        'X-CSRFToken': token
      },
      data: {
        'artist': artist,
        'key': key,
      },
    })
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}
