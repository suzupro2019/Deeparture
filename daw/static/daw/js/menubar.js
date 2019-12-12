const add = (x) => {
  return (x) && parseInt(x);
}
/*saveボタン・ウィンドウ*/
$(function() { //Enterを押しても送信されないようにする。
  $(document).on("keypress", "input:not(.allow_submit)", function(event) {
    return event.which !== 13;
  });

  var save_flg = 0;
  $("#save").click(function(){
    $(".save-window").show();
  });
  $(".times").click(function(){
    $(".save-window").hide();
  });
  if(project_name) {
    document.getElementById('song_name_input').value = project_name;
  }
  $(".new_save-btn").click(function(){
    var song_name = document.getElementById("song_name_input").value;
    if(song_name.length > 0){
      save(MIDI_Melody, song_name, artist, key, rhythm_pattern, chord_prog, bpm, volume, pan, effect_selecter, chord_idx).then(response => {
        // ここで成功時の処理
        // console.log('succeed');
        // console.log(response);
        alert("保存しました。");
        // console.log(song_name);
        $(".save-window").css("display", "none");
      })
      .catch(error => {
        // ここで失敗時の処理
        // console.log('failed');
        // console.log(error);
        if(error.responseJSON.non_field_errors.includes("作成者とプロジェクト名でユニークになっていなければいけません。")) {
          // 同名のプロジェクトが存在する場合
          if(confirm('"' + song_name + '"' + 'はすでに存在します。\n上書き保存しますか？')) {
            getProjectIdByProjectName(song_name).then(id => {
              project_id = id;
              // 以下の処理はデータ更新時とほぼ同じ
              overwrite(project_id, MIDI_Melody, song_name, artist, key, rhythm_pattern, chord_prog, bpm, volume, pan, effect_selecter, chord_idx).then(response => {
                // ここで成功時の処理
                // console.log('succeed');
                // console.log(response);
                alert("保存しました。");
                $(".save-window").css("display", "none");
              })
              .catch(error => {
                // ここで失敗時の処理
                // console.log('failed');
                // console.log(error);
                alert("保存できませんでした。");
              });
            });
          }
        } else {
          alert("保存できませんでした。");
        }
      });
    }else{
      alert("ファイル名を入力してください。");
    }
  });
  $(".ow_save-btn").click(function(){
    var song_name = document.getElementById("song_name_input").value;
    if(song_name.length > 0){
      overwrite(project_id, MIDI_Melody, song_name, artist, key, rhythm_pattern, chord_prog, bpm, volume, pan, effect_selecter, chord_idx).then(response => {
        // ここで成功時の処理
        // console.log('succeed');
        // console.log(response);
        alert("保存しました。");
        $(".save-window").css("display", "none");
      })
      .catch(error => {
        // ここで失敗時の処理
        // console.log('failed');
        // console.log(error);
        alert("保存できませんでした。");
      });
    }else{
      alert("ファイル名を入力してください。");
    }
  });

  /*helpボタン*/
  $('#help').click(function() {
    if(help_flg == false){
      $('#help').css('background','#ffff7f');
      help_flg = true;
    }else{
      $('#help').css('background','#8fdfda');
      $(".callout").hide();
      help_flg = false;
    }
  });

  $("#back").click(function(){
    if(confirm('保存していない内容は破棄されますが、本当にプロジェクト選択画面に戻りますか。')){
      window.sessionStorage.clear();
      location.href = index;
    }else{
      return false;
    }
  });

  /*再生ボタンと停止ボタン*/
  function play_change(){
    if(play_flg == false){
      $('.play-btn').hide();
      $('.stop-btn').show();
      play_flg = true;
    }else{
      $('.play-btn').show();
      $('.stop-btn').hide();
      play_flg = false;
    }
  }
  $('#play').click(function() {
    play_change();
  });

  /*作曲情報バー*/
  $('.artist').html(artist);
  $('.key').html(key);

  //BPM
  $('.bpm_value').html(bpm);
  $('.bpm_slider').on('input change', function() {
    bpm = $(this).val();
    $('.bpm_value').html(bpm);
  });

  //ショートカットキー
  $(document).on("keydown", function(e){
    if(e.metaKey && e.keyCode == 83){ //Cmd+Sで保存
      if(e.preventDefault){
        e.preventDefault();
      }
      $(".save-window").show();
    }
    //Enterで再生位置を初期位置に戻す >> MIDIinput.jsに記載
    if(e.keyCode == 32){ //スペースキーで再生・停止
      if(e.preventDefault){
        e.preventDefault();
      }
      play_change();
    }
  });
});


// データ更新用
function overwrite(id, melody_data, project_name, artist, key, rhythm_pattern, chord_prog, bpm, volume_data, pan_data, effect_data, chord_inst_num) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'PUT',
      url: '/api/v1/projects/' + id + '/',
      dataType: 'json',
      headers: {
        'X-CSRFToken': token
      },
      data: {
        'melody_data': JSON.stringify(melody_data),
        'project_name': project_name,
        'artist': artist,
        'key': key,
        'rhythm_pattern': rhythm_pattern,
        'chord_prog': chord_prog,
        'bpm': bpm,
        'volume_data': JSON.stringify(volume_data),
        'pan_data': JSON.stringify(pan_data),
        'effect_data': JSON.stringify(effect_data),
        'chord_inst_num': chord_inst_num,
      },
    })
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}

// 新規作成用
function save(melody_data, project_name, artist, key, rhythm_pattern, chord_prog, bpm, volume_data, pan_data, effect_data, chord_inst_num) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: '/api/v1/projects/',
      dataType: 'json',
      headers: {
        'X-CSRFToken': token
      },
      data: {
        'melody_data': JSON.stringify(melody_data),
        'project_name': project_name,
        'artist': artist,
        'key': key,
        'rhythm_pattern': rhythm_pattern,
        'chord_prog': chord_prog,
        'bpm': bpm,
        'volume_data': JSON.stringify(volume_data),
        'pan_data': JSON.stringify(pan_data),
        'effect_data': JSON.stringify(effect_data),
        'chord_inst_num': chord_inst_num,
      },
    })
      .then(response => resolve(response))
      .catch(error => reject(error));
  });
}

// 新規作成画面での上書き保存用 プロジェクト名からidを取得する
function getProjectIdByProjectName(name) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: '/api/v1/projects/?project_name=' + name,
      dataType: 'json',
    })
      .then(response => resolve(response[0].id))
      .catch(error => reject(error));
  });
}
