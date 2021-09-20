"use strict"; // 寫了才能正常運行 jQuery

$(document).jQuery(function () {
  // 漢堡選單
  $('#collapse-navbar-btn').on('click', function(){
    $('#collapse-navbar-menu').slideToggle();
  })
});

