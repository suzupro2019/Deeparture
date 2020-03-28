// インストバーの表示のスクリプト

//ミュート
$(function(){
  $('.mute').on('click', function(event){
    event.preventDefault();
    $(this).toggleClass('active');
  });
});

//パン用ノブ
window.inputKnobsOptions={
  fgcolor:"#333",
  bgcolor:"#ccc",
  knobDiameter:"48"
}
