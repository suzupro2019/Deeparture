//Mute
$(function(){
  $('.mute').on('click', function(event){
    event.preventDefault();
    $(this).toggleClass('active');
  });
});

//knob
window.inputKnobsOptions={
  fgcolor:"#333",
  bgcolor:"#ccc",
  knobDiameter:"48"
}
