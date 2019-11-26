/**
 * highlight.js
 */
window.addEventListener('DOMContentLoaded', function() {
  [].forEach.call(document.querySelectorAll('pre > code'), function(elem) {
    elem.textContent = elem.textContent.replace(/^[\r\n]+|[\r\n]+$/g, '');

    hljs.highlightBlock(elem);
    hljs.lineNumbersBlock(elem);
  });
}, false);

/**
 * swiper.js
 */
window.addEventListener('DOMContentLoaded', function() {
  var swiper = new Swiper('.swiper-container', {
    initialSlide: 0,
    width: 928,
    pagination: '.swiper-pagination',
    paginationClickable: true,
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    loop: true
    // speed: 600
  });
}, false);

jQuery(function(){
  $(".start_tutorial").on("click", function(){
    if($(".l-wrapper").css("display") == "block"){
      $(".l-wrapper").css("display", "none");
    }else{
      $(".l-wrapper").css("display", "block");
    }
  });
  $(".tutorial_close-btn").on("click", function(){
    if($(".l-wrapper").css("display") == "block"){
      $(".l-wrapper").css("display", "none");
    }
  });
});
