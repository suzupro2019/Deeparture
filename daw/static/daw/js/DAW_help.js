//ヘルプ機能のスクリプト

const help_trigger = [".save_callout", ".help_callout",".back_callout",".saisei_callout",".bar_callout",".bpm_callout",".extime_callout",".key_callout",".exartist_callout",".scalebar_callout",".mute_callout",".pan_callout",".volume_callout",".effect_callout",".reverb_callout",".chorus_callout",".distortion_callout",".delay_callout",".autowah_callout"];

jQuery(function(){
  $(".callout").hide();

  $(".trigger").hover(
    function() {
      var callout_idx = $(".trigger").index(this);
      if(help_flg){
        $(help_trigger[callout_idx]).show();
      }
    },
    function() {
      if(help_flg){
        $(".callout").hide();
      }
    }
  );
});
