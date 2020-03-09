jQuery(function($){
  var MIDI_Mscale = 42; // 音階数 重すぎるのでヤマハ式のC1〜B6まで(72) スケール内の音だけなら7*6=42音
  var notes_measure = 128; // notesの列数 (デフォルト>> 16小節 * 16拍 = 256) 重い場合はここを調整してください(コード自動生成等の都合上、ここをいじるだけだとエラーを吐きます)
  var Mscale_Do = ["シ", "ラ#", "ラ", "ソ#", "ソ", "ファ#", "ファ", "ミ", "レ#", "レ", "ド#", "ド"];
  var Mscale_C = ["B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"];
  const Scales = {
    "C/Am": ["B","A","G","F","E","D","C"],
    "Db/Bbm": ["Bb","Ab","Gb","F","Eb","Db","C"],
    "D/Bm": ["B","A","G","F#","E","D","C#"],
    "Eb/Cm": ["Bb","Ab","G","F","Eb","D","C"],
    "E/Dbm": ["B","A","Gb","Fb","E","Db","Cb"],
    "F/Dm": ["Bb","A","G","F","E","D","C"],
    "Gb/Ebm": ["B","Bb","Ab","Gb","F","Eb","Db"],
    "G/Em": ["B","A","G","F#","E","D","C"],
    "Ab/Fm": ["Bb","Ab","G","F","Eb","Db","C"],
    "A/Gbm": ["B","A","Gb","Fb","E","D","Cb"],
    "Bb/Gm": ["Bb","A","G","F","Eb","D","C"],
    "B/Abm": ["B","Ab","Gb","Fb","E","Db","Cb"]
  }
  const Scales_DoReMi = {
    "C/Am": ["シ","ラ","ソ","ファ","ミ","レ","ド"],
    "Db/Bbm": ["シb","ラb","ソb","ファ","ミb","レb","ド"],
    "D/Bm": ["シ","ラ","ソ","ファ#","ミ","レ","ド#"],
    "Eb/Cm": ["シb","ラb","ソ","ファ","ミb","レ","ド"],
    "E/Dbm": ["シ","ラ","ソb","ファb","ミ","レb","ドb"],
    "F/Dm": ["シb","ラ","ソ","ファ","ミ","レ","ド"],
    "Gb/Ebm": ["シ","シb","ラb","ソb","ファ","ミb","レb"],
    "G/Em": ["シ","ラ","ソ","ファ#","ミ","レ","ド"],
    "Ab/Fm": ["シb","ラb","ソ","ファ","ミb","レb","ド"],
    "A/Gbm": ["シ","ラ","ソb","ファb","ミ","レ","ドb"],
    "Bb/Gm": ["シb","ラ","ソ","ファ","ミb","レ","ド"],
    "B/Abm": ["シ","ラb","ソb","ファb","ミ","レb","ドb"]
  }
  
  //Cを基準とした音高を数値化した値
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
  
  
  /*=== メロディ入力用グリッドの自動生成 ===*/
  // 小節
  for(var h = 1; h-1 < notes_measure/16; h++){
    $(".Measure_grid").append("<div class=\"measures\"><p>"+h);
  }
  
  // 音階
  for(var i = 0; i < MIDI_Mscale; i++){
    var Mscale_index = Math.ceil((MIDI_Mscale-i) / 7); // 国際式はi-12 ヤマハ式はi-24
    $(".Mscale_grid").append("<div class=\"Mscale_notes\"><p>" + Scales_DoReMi[key][i%7] + Mscale_index);
  }
  
  // 入力部分
  for(var j = 0; j < notes_measure; j++){
    $(".note_grid").append("<div class=\"MIDI_notes\">");
    for(var k = 0; k < MIDI_Mscale; k++){
      if(j % 16 == 0){
        $(".MIDI_notes").eq(j).append("<div class=\"notes measure_first_notes\">");
      }else if(j % 4 == 0){
        $(".MIDI_notes").eq(j).append("<div class=\"notes measure_beat_notes\">");
      }else{
        $(".MIDI_notes").eq(j).append("<div class=\"notes\">");
      }
    }
  }
  /*=== メロディ入力用グリッドの自動生成 ===*/

  //Measure_grid, note_gridの横幅の設定（場合によってはwindow_resizeも追記）
  var MIDIinput_right_width = $(".main").width() - $(".inst_bar").width() - 100;
  $(".Measure_grid").css("width", MIDIinput_right_width);
  $(".note_grid").css("width", MIDIinput_right_width);
  
  //ウィンドウサイズをリサイズした時
  $(window).resize(function(){
    var MIDIinput_right_width = $(".main").width() - $(".inst_bar").width() - 100;
    $(".Measure_grid").css("width", MIDIinput_right_width);
    $(".note_grid").css("width", MIDIinput_right_width);
  });

  //スクロール連動 小節, 音階
  $(".note_grid").scroll(function() {
    $(".Measure_grid").scrollLeft(
      $(".note_grid").scrollLeft()
    );
    $(".Mscale_grid").scrollTop(
      $(".note_grid").scrollTop()
    );
  });

  $(".Measure_grid").scroll(function(){
    $(".note_grid").scrollLeft(
      $(".Measure_grid").scrollLeft()
    );
  });
  $(".Mscale_grid").scroll(function(){
    $(".note_grid").scrollTop(
      $(".Mscale_grid").scrollTop()
    );
  });

  //notes縦横可変
  const measure_width = 800; //measuresの最低幅 ページ読み込み時の初期サイズは1600px
  const note_width = 50; //notesの最低幅 ページ読み込み時の初期サイズは100px
  const note_height = 20; //notesの最低高さ ページ読み込み時の初期サイズは40px
  var note_resize_width = 100; //notesの現在幅
  var measure_resize_width = 1600; //measuresの現在幅

  $(".Mscale_notes").css({"width":note_width*2, "height":note_height*2});
  $(".notes").css({"width":note_width*2, "height":note_height*2});

  $(".width_scale_bar").on("input",function(){
    measure_resize_width = measure_width * ($(".width_scale_bar").val() / 50);
    $(".measures").eq(Seek_measure).css("width",measure_resize_width+3);
    $(".measures").css("width", measure_resize_width);
    note_resize_width = note_width * ($(".width_scale_bar").val() / 50);
    $(".notes").css("width", note_resize_width);
  });
  $(".height_scale_bar").on("input",function(){
    var note_resize_height = note_height * ($(".height_scale_bar").val() / 50);
    $(".Mscale_notes").css("height", note_resize_height);
    $(".notes").css("height", note_resize_height);
  });

  //MIDI色切り替え, 音声出力
  var isMouseDown = false; //マウスを押下しているか
  var polysynth_melody = new Tone.PolySynth().toMaster(); //Melody用
  var polysynth_chord = new Tone.PolySynth().toMaster(); //Chord用
  var plucksynth = new Tone.PluckSynth().toMaster(); //Bass用
  /*Samplerについての注意事項
  初期状態ではXHRでローカルファイルを持ってくることはセキュリティ上できないため、
  ローカルで起動する場合はWebブラウザの設定が必要。
  Firefoxならstrict_origin_policy = True(既定値) → Falseにする。(非推奨)*/
  var Vocaloid_sampler = new Tone.Sampler({
    "C3":"/static/daw/audio/Vocaloid/C3.mp3",
    "G3":"/static/daw/audio/Vocaloid/G3.mp3",
    "C4":"/static/daw/audio/Vocaloid/C4.mp3",
    "G4":"/static/daw/audio/Vocaloid/G4.mp3",
    "C5":"/static/daw/audio/Vocaloid/C5.mp3"
  }).toMaster();
  var Piano_sampler = new Tone.Sampler({
    "C3" : "/static/daw/audio/Piano/Piano_C3.wav",
  }, {attack:0.05 ,release:1.0}).toMaster();
  var Guitar_sampler = new Tone.Sampler({"C3" : "/static/daw/audio/Guitar/GuitarC4.wav",},{attack:0.05,release:2.0}).toMaster();
  var Drum_sampler = new Tone.Sampler({
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
  //メロディ・コード・ベース・ドラムのinst情報
  const Melody_inst = [polysynth_melody, Vocaloid_sampler];
  const Chord_inst = [Guitar_sampler, polysynth_chord, Piano_sampler]; //コード用楽器リスト
  var Instruments = [Melody_inst[melody_idx], Chord_inst[chord_idx], plucksynth, Drum_sampler];

  function addMelody(time, note) {
    Instruments[0].triggerAttackRelease(note.note, note.duration, time);
  }
  function addChord(time, note) {
    Instruments[1].triggerAttackRelease(note.note, note.duration, time);
  }
  function addBass(time, note) {
    Instruments[2].triggerAttackRelease(note, '16n', time);
  }
  function addDrum(time, note) {
    Instruments[3].triggerAttackRelease(note, '1n', time);
  }

  //楽器選択(メロディ)
  var melody_inst_name = $(".melody_inst_item").eq(melody_idx).html();
  $(".melody_inst").html(melody_inst_name);

  $(".melody_inst_item").on("click", function(){
    melody_idx = $(".melody_inst_item").index(this);
    
    //楽器のボリューム等の情報を渡す
    if($(".mute").eq(0).hasClass("active")){
      Melody_inst[melody_idx].volume.value = -Infinity; //ミュート
    }else{
      Melody_inst[melody_idx].volume.value = volume[0]; //ボリューム
    }
    Melody_inst[melody_idx].connect(efpan[0]); //エフェクト・パン

    Instruments[0] = Melody_inst[melody_idx];
    melody_inst_name = $(".melody_inst_item").eq(melody_idx).html();
    $(".melody_inst").html(melody_inst_name);
    $(".inst_item_melody > details").removeAttr("open");
  });

  //楽器選択(コード)
  var chord_inst_name = $(".chord_inst_item").eq(chord_idx).html();
  $(".chord_inst").html(chord_inst_name);

  $(".chord_inst_item").on("click", function(){
    chord_idx = $(".chord_inst_item").index(this);
    
    //楽器のボリューム等の情報を渡す
    if($(".mute").eq(1).hasClass("active")){
      Chord_inst[chord_idx].volume.value = -Infinity; //ミュート
    }else{
      Chord_inst[chord_idx].volume.value = volume[1]; //ボリューム
    }
    Chord_inst[chord_idx].connect(efpan[1]); //エフェクト・パン

    Instruments[1] = Chord_inst[chord_idx];
    chord_inst_name = $(".chord_inst_item").eq(chord_idx).html();
    $(".chord_inst").html(chord_inst_name);
    $(".inst_item_chord > details").removeAttr("open");
  });


  /*=== ボリューム・ミュート・パン ===*/
  /*ボリューム*/
  //ロード処理
  for(var x=0; x<Instruments.length; x++){
    Instruments[x].volume.value = volume[x];
    $('.volume').eq(x).val(volume[x]);
  }

  //クリック時の処理
  $('.volume').on('input change', function() {
    var idx = $(".volume").index(this);
    volume[idx] = $(this).val();
    $('.volume').eq(idx).html(volume[idx]);
    if($(".mute").eq(idx).hasClass("active") == false){
      Instruments[idx].volume.value = volume[idx];
    }
  });

  /*ミュート*/
  $(".mute").on("click", function(){
    var idx = $(".mute").index(this);
    if($(this).hasClass("active")){
      Instruments[idx].volume.value = -Infinity;
    }else{
      Instruments[idx].volume.value = volume[idx];
    }
  });

  /*パン*/
  //ロード処理
  var efpan = ["", "", "", ""]; //全楽器のエフェクト・パン
  for(var x=0; x<pan.length; x++){
    efpan[x] = new Tone.Panner(pan[x]);
    $('.pan').eq(x).val(pan[x]);
    Instruments[x].connect(efpan[x]);
    efpan[x].toMaster();
  }

  //クリック時の処理
  $('.pan').on('input change', function() {
    var idx = $(".pan").index(this);
    pan[idx] = $(this).val();
    efpan[idx].pan.value = pan[idx];
    $('.pan').eq(idx).html(efpan[idx])
  });

  /*エフェクト*/
  var effect_list = [
    "", "", "", "", ""
  ];
  effect_list[0] = new Tone.Freeverb().toMaster(); //リバーブ
  effect_list[1] = new Tone.Chorus().toMaster(); //コーラス
  effect_list[2] = new Tone.Distortion().toMaster(); //ディストーション
  effect_list[3] = new Tone.FeedbackDelay().toMaster(); //ディレイ
  effect_list[4] = new Tone.AutoWah(50, 8, 0).toMaster(); //ワウ
  effect_list[4].Q.value = 6;
  console.log(effect_list[4])

  //エフェクトコントロール関数
  function ef_control(inst, idx, load){ //配列の値が1ならエフェクトオン loadなら処理をスキップ
    if(effect_selecter[inst][idx] == 1){
      efpan[inst].connect(effect_list[idx]);
    }else if(load){

    }else{
      efpan[inst].disconnect(effect_list[idx]);
    }
  }

  //ロード処理
  var count = 0;
  const ef_amount = effect_selecter[0].length;
  for(var x=0; x<4; x++){
    for(var y=0; y<ef_amount; y++){
      if(effect_selecter[x][y] == 1){
        $(".effect_list > li").eq(count).addClass("ef_selected");
      }
      ef_control(x, y, true);
      count += 1;
    }
  }
  /*=== ボリューム・ミュート・パン ===*/
  
  
  /*=== メロディ入力部分 クリック時の処理 ===*/
  $(".effect_list > li").on("click", function(){
    $(this).toggleClass("ef_selected");
    var ef_idx = $('.effect_list > li').index(this) % ef_amount;
    var ef_inst = Math.floor($('.effect_list > li').index(this) / ef_amount);
    if(effect_selecter[ef_inst][ef_idx] == 0){
      effect_selecter[ef_inst][ef_idx] = 1;
    }else{
      effect_selecter[ef_inst][ef_idx] = 0;
    }
    ef_control(ef_inst, ef_idx, false);
    console.log(effect_selecter);
  });

  for(x=0; x<notes_measure/16; x++){ //
    for(y=0; y<4; y++){
      for(z=0; z<4; z++){
        MIDI_Melody.push({"time":x+":"+y+":"+z, "note":[""], "duration":"16n"});
      }
    }
  }
  var note_position = 0;
  var ml_column = 0; //どの行？
  var ml_line = 0; //どの列？
  var first_line = 0; //最初の列
  var line_count = 0; //現在ml_highlitedにした列数
  var remove_flg = 0; //消す処理をしているか否か

  //リドゥ・アンドゥ用配列 (計5つまで)
  var Melody_log = []; //初期状態では起動後の状態を保存したログが一つ入っている
  var Undo_idx = -1;

  $(".notes").mousedown(function(event) {
    isMouseDown = true;
    if(Melody_log.length != Undo_idx+2){ //Undo_idxは常にMelody_logの最後尾-1に位置する
      Melody_log.splice(Undo_idx+2, Melody_log.length-Undo_idx+2);
    }

    note_position = $('.notes').index(this); //ノートの全体からの位置
    var note_name = note_position % 7;
    var pitch =  Math.ceil((MIDI_Mscale-note_position%MIDI_Mscale) / 7);
    var MIDI_note = Scales[key][note_name] + pitch;
    var measure_count = $(this).parent().index(".MIDI_notes");
    console.log("measure:" + measure_count);
    if($(this).hasClass('highlighted') == false){
      Instruments[0].triggerAttackRelease(MIDI_note, '16n');

      if(MIDI_Melody[measure_count].note == ""){
        MIDI_Melody[measure_count].note.splice(0, 1, MIDI_note);
        console.log("新規追加");
        console.log(MIDI_Melody);
      }else{
        MIDI_Melody[measure_count].note.push(MIDI_note);
        console.log("追加");
        console.log(MIDI_Melody);
      }
    }else{
      var highlight_index = $.inArray(MIDI_note, MIDI_Melody[measure_count].note);
      MIDI_Melody[measure_count].note.splice(highlight_index, 1);
      console.log("削除");
      console.log(MIDI_Melody);
    }
    $(this).toggleClass("highlighted");
    return false; // prevent text selection
  })
  .mouseover(function() {
    if (isMouseDown) {
      note_position = $('.notes').index(this); //ノートの全体からの位置
      var note_name = note_position % 7;
      var pitch =  Math.ceil((MIDI_Mscale-note_position%MIDI_Mscale) / 7);
      var MIDI_note = Scales[key][note_name] + pitch;
      var measure_count = $(this).parent().index(".MIDI_notes");
      if($(this).hasClass('highlighted') == false){
        Instruments[0].triggerAttackRelease(MIDI_note, '16n');

        if(MIDI_Melody[measure_count].note == ""){
          MIDI_Melody[measure_count].note.splice(0, 1, MIDI_note);
          console.log("新規追加");
          console.log(MIDI_Melody);
        }else{
          MIDI_Melody[measure_count].note.push(MIDI_note);
          console.log("追加");
          console.log(MIDI_Melody);
        }
        $(this).addClass("highlighted");
      }else{
        var highlight_index = $.inArray(MIDI_note, MIDI_Melody[measure_count].note);
        MIDI_Melody[measure_count].note.splice(highlight_index, 1);
        console.log("削除");
        console.log(MIDI_Melody);
        $(this).removeClass("highlighted");
      }
      // $(this).toggleClass("highlighted");
    }
  })
  .bind("selectstart", function () {
    return false; // prevent text selection in IE
  });

  $(document).mouseup(function() {
    if(isMouseDown){ //リドゥ・アンドゥ用のLog
      if(Melody_log.length < 100){
        Melody_cup = JSON.parse(JSON.stringify(MIDI_Melody));
        Melody_log.push(Melody_cup);
      }else{
        Melody_log.shift();
        Melody_cup = JSON.parse(JSON.stringify(MIDI_Melody));
        Melody_log.push(Melody_cup);
      }
      if(Undo_idx < 98){
        Undo_idx++;
      }
    }
    isMouseDown = false;

    //変数の初期化
    remove_flg = 0;
    ml_line = 0;
    line_count = 0;
  })
  /*=== クリック時の処理 ===*/

  /*=== メロディの表示 ===*/
  //受け渡された情報からメロディを表示する 読み込みに使用
  //Polysynthは和音に対応 三次元配列で記述可
  // CHANGED: メロディデータを引数として受け取るように変更
  function Melody_display(melody){
    for(y=0; y<melody.length; y++){
      if(melody[y].note.length > 0 && melody[y].note[0] != ""){
        for(z=0; z<melody[y].note.length; z++){
          var pitch = melody[y].note[z].slice(-1);
          if(melody[y].note[z].length == 3){ //C#3
            var note_name = melody[y].note[z].slice(0, 2);
          }else{
            var note_name = melody[y].note[z].slice(0, 1);
          }

          if(Scales[key].indexOf(note_name) < 0){
            //エラー処理 エラーがあれば音情報を組み込まず表示もしない
            console.log("この音は"+key+"内に存在しません："+note_name+pitch);
          }else{
            if(MIDI_Melody[y].note == ""){ //音情報
              MIDI_Melody[y].note.splice(0, 1, melody[y].note[0]);
            }else{
              MIDI_Melody[y].note.push(melody[y].note[z]);
            }
            $(".notes").eq( //highlighted
              Scales[key].indexOf(note_name) + (6-pitch)*7 + y*MIDI_Mscale
            ).addClass("highlighted");
          }
        }
      }
    }
    console.log("保存データ読み込み")
    console.log(MIDI_Melody);
  };
  Melody_display(melody);
  /*=== メロディの表示 ===*/


  /*=== コードの生成(文字列から) ===*/
  var gene_chords = chord_prog.split(" ");
  var bassline = [];
  var key_array = [];
  var chord = [];
  var tension = [];
  var MIDI_chord = [];
  var cc_index = 0;
  for(var x=0; x<notes_measure/16; x++){
    if(gene_chords[x%4].indexOf("/") >= 0){
      bassline.push(gene_chords[x%4].slice(gene_chords[x%4].indexOf("/")+1));
    }else if(gene_chords[x%4].indexOf("#") == 1 || gene_chords[x%4].indexOf("b") == 1){
      bassline.push(gene_chords[x%4].slice(0, 2));
    }else{
      bassline.push(gene_chords[x%4].slice(0, 1));
    }

    if(gene_chords[x%4].indexOf("#") == 1 || gene_chords[x%4].indexOf("b") == 1){
      key_array.push(gene_chords[x%4].slice(0, 2));
    }else{
      key_array.push(gene_chords[x%4].slice(0, 1));
    }

    if(gene_chords[x%4].indexOf("dim") >= 0){
      chord.push(chord_list[5]);
    }else if(gene_chords[x%4].indexOf("aug") >= 0){
      chord.push(chord_list[4]);
    }else if(gene_chords[x%4].indexOf("sus4") >= 0){
      chord.push(chord_list[3]);
    }else if(gene_chords[x%4].indexOf("sus2") >= 0){
      chord.push(chord_list[2]);
    }else if(gene_chords[x%4].indexOf("m") >= 0){
      chord.push(chord_list[1]);
    }else{
      chord.push(chord_list[0]);
    }

    if(gene_chords[x%4].indexOf("add9b") >= 0){
      tension.push(Tensions[3]);
    }else if(gene_chords[x%4].indexOf("add9") >= 0){
      tension.push(Tensions[4]);
    }else if(gene_chords[x%4].indexOf("M7") >= 0){
      tension.push(Tensions[2]);
    }else if(gene_chords[x%4].indexOf("7") >= 0){
      tension.push(Tensions[1]);
    }else if(gene_chords[x%4].indexOf("6") >= 0){
      tension.push(Tensions[0]);
    }else{
      tension.push(0);
    }

    for(var y=0; y<16; y++){
      if(chord_stroke[rhythm_pattern][x*16+y].note.length > 0 && chord_stroke[rhythm_pattern][x*16+y].note[0] != ""){
        MIDI_chord.push(chord_stroke[rhythm_pattern][x*16+y]);
        for(var z=0; z<3; z++){
          MIDI_chord[cc_index].note[z] -= Keys[key_array[x]];
          MIDI_chord[cc_index].note[z] += chord[x][z];
        }
        if(tension[x] != 0){
          MIDI_chord[cc_index].note.push(MIDI_chord[cc_index].note[2] - tension[x]);
        }
        for(var aa=0; aa<MIDI_chord[cc_index].note.length; aa++){
          var note_name = MIDI_chord[cc_index].note[aa] % 12;
          var pitch =  Math.ceil((72-MIDI_chord[cc_index].note[aa]%72) / 12);
          var MIDI_note = Mscale_C[note_name] + pitch;
          MIDI_chord[cc_index].note.splice(aa, 1, MIDI_note);
        }
        cc_index += 1;
      }
    }
  }
  console.log(MIDI_chord);
  /*=== コードの生成 ===*/

  /*=== ベースの生成(コードから) ===*/
  /*2拍に1回のペースでルート音を演奏。(C2〜B2)\
  分数コードの場合は、該当する音を演奏。*/
  var MIDI_bass = [];
  for(x=0; x<notes_measure/16; x++){ //
    for(y=0; y<4; y++){
      for(z=0; z<4; z++){
        if(z%2 == 0){
          MIDI_bass.push([x+":"+y+":"+z, bassline[x]+2]);
        }
      }
    }
  }
  //console.log(MIDI_bass);
  /*=== ベースの生成 ===*/


  /*=== 再生用の処理 ===*/
  var Seekbar_position = 0;
  
  // 再生時, →キーの処理
  function Seekbar_move(){ 
    if(Seekbar_position > notes_measure){
      Seekbar_position = 0;
      $(".Seekbar").remove();
      $(".MIDI_notes").eq(Seekbar_position).after("<div class=\"Seekbar\">");
    }else{
      $(".Seekbar").remove();
      $(".MIDI_notes").eq(Seekbar_position).after("<div class=\"Seekbar\">");
      Seekbar_position++;
    }
    $(".note_grid").scrollLeft(note_resize_width*Seekbar_position);
    Mwidth_control();
  }
  
  // ←キーの処理
  function Seekbar_back(){ 
    Seekbar_position--;
    $(".Seekbar").remove();
    $(".MIDI_notes").eq(Seekbar_position).before("<div class=\"Seekbar\">");
    $(".note_grid").scrollLeft(note_resize_width*Seekbar_position);
    Mwidth_control();
  }
  
  // 再生位置の計算
  var Measure_position = "0:0:0";
  function Measure_calc(num){
    var a = Math.floor(num / 16);
    var b = Math.floor(num / 4) % 4;
    var c = num % 4;
    if(a > 7){
      Measure_position = "0:0:0";
    }else{
      Measure_position = (a+":"+b+":"+c);
    }
    var Disp_Measure_position = ((a+1)+":"+b+":"+c); //表示用
    $(".exbar .gr").html(Disp_Measure_position);
  }
  var Seek_measure = 0;
  
  // シークバーのサイズ分横幅が広がってしまうため、その微調整
  function Mwidth_control(){
    Seek_measure = Math.floor(Seekbar_position / 16);
    $(".measures").css("width",measure_resize_width);
    $(".measures").eq(Seek_measure).css("width",measure_resize_width+3);
  }
  $(".exbar .gr").html("1:0:0");
  $(".extime .gr").html("00:00");

  // 再生位置を初期位置に戻す
  function music_back(){
    Tone.Transport.stop();
    Tone.Transport.cancel();
    play_flg = false;
    $('.play-btn').show();
    $('.stop-btn').hide();
    Seekbar_position = 0;
    $(".Seekbar").remove();
    $(".MIDI_notes").eq(Seekbar_position).before("<div class=\"Seekbar\">");
    Measure_position = "0:0:0";
    $(".exbar .gr").html("1:0:0");
    $(".extime .gr").html("00:00");
    $(".note_grid").scrollLeft(0);
  }
  $("#backward").on("click", function(){ //シークバーを初期位置に戻すよ
    music_back();
  });
  
  // 楽曲の再生
  function music_play(){
    Tone.Transport.bpm.value = bpm; //bpm
    if(play_flg == false){
      var play_MIDI_Melody = []; // Nullなどの要素を省いたもの
      var play_MIDI_Drum =[]; // Nullなどの要素を省いたもの
      for(z=0; z<drum_pattern[rhythm_pattern].length; z++){ //本来はz<notes_measure
        if(MIDI_Melody[z].note.length > 0 && MIDI_Melody[z].note[0] != ""){
          play_MIDI_Melody.push(MIDI_Melody[z]);
        }
        if(drum_pattern[rhythm_pattern][z][1].length > 0 && drum_pattern[rhythm_pattern][z][1][0] != ""){
          play_MIDI_Drum.push(drum_pattern[rhythm_pattern][z]);
        }
      }
      var Melody = new Tone.Part(addMelody, play_MIDI_Melody).start();
      var Chord = new Tone.Part(addChord, MIDI_chord).start();
      var Bass = new Tone.Part(addBass, MIDI_bass).start();
      var Drum = new Tone.Part(addDrum, play_MIDI_Drum).start();

      Tone.Transport.seconds = Measure_position; //再生位置
      Tone.Transport.scheduleRepeat(function(){ //シークバー他再生時の処理
        Tone.Transport.bpm.value = bpm;
        Seekbar_move();
        Measure_calc(Seekbar_position);
        if(Tone.Transport.getSecondsAtTime()%60 > 10){
          var Seekbar_time = "0"+Math.floor(Tone.Transport.getSecondsAtTime()/60)+":"+Math.floor(Tone.Transport.getSecondsAtTime()%60);
        }else{
          var Seekbar_time = "0"+Math.floor(Tone.Transport.getSecondsAtTime()/60)+":"+"0"+Math.floor(Tone.Transport.getSecondsAtTime()%60);
        }
        $(".extime .gr").html(Seekbar_time);
        //console.log($('.Seekbar').offset().left);
        //console.log($('.note_grid').offset().left);
      }, "16n");
      Tone.Transport.loop = true;
      Tone.Transport.loopEnd = "8:0:0";
      Tone.Transport.start();
    }else{
      music_stop();
    }
  }
  $("#play").click(function(){
    music_play();
  });
  
  // 楽曲の停止
  function music_stop(){
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }


  /*=== ショートカット ===*/
  $(document).on("keydown", function(e){
    if($(".save-window").css("display") == "none"){
      // 「space」 再生・停止
      if(e.keyCode == 32){ 
        e.preventDefault();
        music_play();
      }
      
      // 「enter」 再生位置を初期位置に戻す
      if(e.keyCode == 13){ 
        if(e.preventDefault){
          e.preventDefault();
        }
        music_back();
      }
      
      // 「←」 再生位置を戻す
      if(e.keyCode == 37){ 
        e.preventDefault();
        if(Seekbar_position > 0){
          if(play_flg){
            music_stop();
          }
          Seekbar_back();
          Measure_calc(Seekbar_position);
        }
      }
      
      // 「→」 再生位置を進める
      if(e.keyCode == 39){
        e.preventDefault();
        if(Seekbar_position < 128){
          if(play_flg){
            music_stop();
          }
          Seekbar_move();
          Measure_calc(Seekbar_position);
        }
      }
      
      // 「cmd + y」 リドゥ
      if(e.metaKey && e.keyCode == 89 && Undo_idx+2 < Melody_log.length){
        if(e.preventDefault){
          e.preventDefault();
        }
        Redo_Melody();
      }
      
      //「cmd + z」 アンドゥ
      if(e.metaKey && e.keyCode == 90 && Undo_idx >= 0){
        if(e.preventDefault){
          e.preventDefault();
        }
        Undo_Melody();
      }
    }
  })
  
  /*=== リドゥの処理 ===*/
  function Redo_Melody(){
    $(".notes").removeClass("highlighted");
    
    // 再生情報の差し替え
    Melody_cup = JSON.parse(JSON.stringify(Melody_log[Undo_idx+2]));
    MIDI_Melody = Melody_cup;

    // メロディ表示の差し替え
    for(y=0; y<MIDI_Melody.length; y++){
      if(MIDI_Melody[y].note.length > 0 && MIDI_Melody[y].note[0] != ""){
        for(z=0; z<MIDI_Melody[y].note.length; z++){
          var pitch = MIDI_Melody[y].note[z].slice(-1);
          if(MIDI_Melody[y].note[z].length == 3){ //C#3
            var note_name = MIDI_Melody[y].note[z].slice(0, 2);
          }else{
            var note_name = MIDI_Melody[y].note[z].slice(0, 1);
          }
          $(".notes").eq( //highlighted
            Scales[key].indexOf(note_name) + (6-pitch)*7 + y*MIDI_Mscale
          ).addClass("highlighted");
        }
      }
    }
    Undo_idx++;
  }
  
  /*===  アンドゥの処理 ===*/
  function Undo_Melody(){
    $(".notes").removeClass("highlighted");
    
    // 再生情報の差し替え
    Melody_cup = JSON.parse(JSON.stringify(Melody_log[Undo_idx]));
    MIDI_Melody = Melody_cup;
    
    // メロディ表示の差し替え
    for(y=0; y<MIDI_Melody.length; y++){
      if(MIDI_Melody[y].note.length > 0 && MIDI_Melody[y].note[0] != ""){
        for(z=0; z<MIDI_Melody[y].note.length; z++){
          var pitch = MIDI_Melody[y].note[z].slice(-1);
          if(MIDI_Melody[y].note[z].length == 3){ //C#3
            var note_name = MIDI_Melody[y].note[z].slice(0, 2);
          }else{
            var note_name = MIDI_Melody[y].note[z].slice(0, 1);
          }
          $(".notes").eq( //highlighted
            Scales[key].indexOf(note_name) + (6-pitch)*7 + y*MIDI_Mscale
          ).addClass("highlighted");
        }
      }
    }
    Undo_idx--;
  }

  //起動後の初期状態をMelody_logに入れておく
  Melody_cup = JSON.parse(JSON.stringify(MIDI_Melody));
  Melody_log.push(Melody_cup);
  /*=== 再生用の処理 ===*/
});
