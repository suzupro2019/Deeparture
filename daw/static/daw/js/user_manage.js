jQuery(function(){
  //ユーザウィンドウ
  $(".user_prof").on("click", function(){
    if($(".user_window").css("display") == "none"){
      $(".user_window").show();
    }else{
      $(".user_window").hide();
    }
  });
  $(".logout-btn").on("click", function(){
    if(confirm("本当にログアウトしますか？")){
      location.href = logout;
    }else{
      return false;
    }
  });
});
