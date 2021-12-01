"use strict"; // 寫了才能正常運行 jQuery
// Firebase configuration

var firebaseConfig = {
  apiKey: "AIzaSyDGSMcP5U44-K3qE0Y5lt77k4Bcq5sVKtU",
  authDomain: "chan-sushi.firebaseapp.com",
  projectId: "chan-sushi",
  storageBucket: "chan-sushi.appspot.com",
  messagingSenderId: "373508304619",
  appId: "1:373508304619:web:6aa5d730627f26955a58ae",
  measurementId: "G-F6FLCKX6C1"
}; // 初始化 Firebase

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var products = db.collection('menu');
var stores = db.collection('stores');
var productCategory = '握壽司';
var storeCategory = '尋找最近的店舖'; // 初始化 AOS

AOS.init(); // 渲染畫面

function render() {
  if (document.querySelector('#productList')) {
    // 產品列表頁
    // 先確定網址有無參數
    var url = location.href.split('?type=');

    if (url[1]) {
      productCategory = decodeURI(url[1]);
    } // 抓 api


    products.where('category', '==', productCategory).orderBy('price').onSnapshot(function (querySnapshot) {
      var str = '';
      querySnapshot.forEach(function (item) {
        var product = item.data();
        str += "\n        <div class=\"col-xl-3 col-md-4 col-sm-6 col-12 mb-5\">\n          <div class=\"card border-0\">\n            <img src=\"".concat(product.imgUrl, "\" alt=\"").concat(product.title, "\" class=\"card-img\">\n            <div class=\"card-body d-flex justify-content-between\">\n              <h3>").concat(product.title, "</h3>\n              <p class=\"card-subtitle ml-3\">NT ").concat(product.price, "</p>\n            </div>\n          </div>\n        </div>\n        ");
      });
      $('#productList').html(str);
      $('#loader').hide(); // 第一次進入頁面時， nav-item 即可正確顯示 active class

      document.querySelectorAll('.nav-link').forEach(function (item) {
        if (item.innerHTML === productCategory) {
          item.parentElement.classList.add('active');
        }
      });
    });
  } else if (document.querySelector('#storeList')) {
    // 店舖列表頁
    var storeArr = [];

    var _url = location.href.split('?type=');

    if (_url[1]) {
      storeCategory = decodeURI(_url[1]);
    }

    if (storeCategory === '尋找最近的店舖') {
      stores.onSnapshot(function (querySnapshot) {
        // 店舖照地區北至南順序排列，先分類成物件裡的陣列，再取出放到 storeArr 渲染
        var categoryObj = {
          '台北': [],
          '新北': [],
          '台中': [],
          '台南': [],
          '高雄': []
        };
        querySnapshot.forEach(function (item) {
          var store = item.data();
          categoryObj[store.category].push(store);
        });
        storeArr = Object.values(categoryObj).flat(Infinity);
        renderStoreList(storeArr);
      });
    } else {
      stores.where('category', '==', storeCategory).onSnapshot(function (querySnapshot) {
        querySnapshot.forEach(function (item) {
          storeArr.push(item.data());
        });
        renderStoreList(storeArr);
      });
    }
  } else {
    $('#loader').hide();
  }
}

function renderStoreList(storeArr) {
  var str = '';
  var str2 = '';
  storeArr.forEach(function (store, storeKey) {
    str += "\n    <div class=\"col-lg-4 col-md-6 col-12 mb-5\">\n      <div class=\"card\">\n        <img src=\"".concat(store.imgUrl, "\" alt=\"").concat(store.category).concat(store.title, "\u5E97\" class=\"card-img\">\n        <div class=\"card-body\">\n          <h3 class=\"card-title\">").concat(store.category).concat(store.title, "\u5E97</h3>\n          <ul>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-telephone-fill\"></i>\n              <span class=\"ml-1\">").concat(store.tel, "</span>\n            </li>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-clock-fill\"></i>\n              <span class=\"ml-1\">").concat(store.time[0], ":00 ~ ").concat(store.time[1], ":00</span>\n            </li>\n            <li class=\"d-flex\">\n              <i class=\"bi bi-pin-angle-fill\"></i>\n              <span class=\"ml-1\">").concat(store.address, "</span>\n            </li>\n          </ul>\n        </div>\n        <div class=\"card-footer\">\n          <button class=\"btn btn-secondary-light modal-label-btn\" id=\"modal-label-").concat(storeKey, "\" data-modal-title=\"").concat(store.title, "\">\u7ACB\u5373\u8A02\u4F4D</button>\n          <button class=\"btn btn-outline-secondary-light ml-2\">\u5916\u9001\u9EDE\u9910</button>\n        </div>\n      </div>\n    </div>\n    ");
    str2 += "\n    <div class=\"modal-outer d-none\" id=\"modal-".concat(storeKey, "\">\n      <div class=\"modal-inner\">\n        <p class=\"modal-exit mb-3\">\n          <i class=\"bi bi-x-lg\"></i>\n        </p>\n        <h3 class=\"modal-title\">").concat(store.category).concat(store.title, "\u5E97</h3>\n        <p class=\"modal-subtitle mb-5\">").concat(store.address, "</p>\n        <div class=\"d-md-flex justify-content-md-between\">\n          <div class=\"w-md-50 w-100 map mb-md-0 mb-5\" id=\"map-").concat(storeKey, "\">\n          </div>\n          <form class=\"w-md-50 w-100 ml-md-5\" id=\"bookingForm-").concat(storeKey, "\">\n            <div class=\"mb-5\">\n              <label for=\"rsvnDate-").concat(storeKey, "\" class=\"mb-2\">\u9810\u5B9A\u65E5\u671F\uFF1A</label>\n              <input id=\"rsvnDate-").concat(storeKey, "\" name=\"date\" type=\"text\" class=\"datepicker w-100\">\n            </div>\n            <div class=\"mb-5\">\n              <label for=\"rsvnTime-").concat(storeKey, "\" class=\"mb-2\">\u9810\u5B9A\u6642\u6BB5\uFF1A</label>\n              <input type=\"text\" class=\"timepicker w-100\" name=\"time\" id=\"booking-time-").concat(storeKey, "\"/>\n            </div>\n            <div class=\"d-md-flex mb-5\">\n              <div class=\"w-md-50 mb-md-0 mb-5\">\n                <label for=\"rsvnName-").concat(storeKey, "\" class=\"mb-2\">\u8A02\u4F4D\u59D3\u540D\uFF1A</label>\n                <input id=\"rsvnName-").concat(storeKey, "\" name=\"name\" type=\"text\" class=\"w-100\"/>\n              </div>\n              <div class=\"w-md-50 ml-md-1\">\n                <label for=\"rsvnNum-").concat(storeKey, "\" class=\"mb-2\">\u8A02\u4F4D\u4EBA\u6578\uFF1A</label>\n                <input id=\"rsvnNum-").concat(storeKey, "\" name=\"num\" type=\"number\" class=\"w-100\"/>\n              </div>\n            </div>\n            <div class=\"mb-5\">\n              <label for=\"rsvnEmail-").concat(storeKey, "\" class=\"mb-2\">\u9023\u7D61\u4FE1\u7BB1\uFF1A</label>\n              <input id=\"rsvnEmail-").concat(storeKey, "\" name=\"email\" type=\"email\" class=\"w-100\"/>\n            </div>\n            <button type=\"submit\" class=\"btn btn-secondary-light w-100 send-rsvn\">\u78BA\u8A8D\u8A02\u4F4D</button>\n          </form>\n        </div>\n      </div>\n    </div>\n    ");
  });
  $('#storeList').html(str);
  $('#storeModal').html(str2);
  $('#loader').hide(); // 跑完上面才綁定店舖頁訂位 modal

  storeModalShow(storeArr);
} // 店舖頁點「立即訂位」 modal 相關功能


function storeModalShow(storeArr) {
  // 開啟
  $('.modal-label-btn').on('click', function (e) {
    var storeKey = e.target.id.split('-')[2];
    $("#modal-".concat(storeKey)).removeClass('d-none');
    var modalStore = storeArr.find(function (store) {
      return store.title === e.target.dataset.modalTitle;
    }); // 顯示地圖

    var lat = modalStore.latlng[0];
    var lng = modalStore.latlng[1];
    initMap(lat, lng, "map-".concat(storeKey)); // 顯示日期時間外掛

    var timePickerMin = modalStore.time[0].toString();
    var timePickerMax = modalStore.time[1].toString();
    $(function () {
      // datePicker
      $(".datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        minDate: '0',
        maxDate: "+1M -1D"
      }); // timePicker

      $("#booking-time-".concat(storeKey)).timepicker({
        timeFormat: 'hh:mm p',
        minTime: timePickerMin,
        maxTime: timePickerMax
      });
    }); // 店舖頁表單驗證

    $("#bookingForm-".concat(storeKey)).validate({
      rules: {
        date: {
          required: true
        },
        time: {
          required: true
        },
        name: {
          required: true
        },
        num: {
          required: true
        },
        email: {
          required: true,
          email: true
        }
      },
      errorPlacement: function errorPlacement(error, element) {
        error.insertAfter(element);
      },
      submitHandler: function submitHandler() {
        $("#modal-".concat(storeKey)).addClass('d-none');
        $('#bookingAlert').fadeIn(1000).delay(1500).fadeOut(1000);
      }
    });
  });
  $('.modal-exit').on('click', function () {
    $(this).parent().parent().addClass('d-none');
  });
} // 初始化地圖 api


function initMap() {
  var lat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var lng = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "map";
  var storeLatlng = {
    lat: lat,
    lng: lng
  };
  var map = new google.maps.Map(document.getElementById(id), {
    zoom: 15,
    //放大的倍率
    center: storeLatlng //初始化的地圖中心位置

  });
  var marker = new google.maps.Marker({
    position: storeLatlng,
    //marker的放置位置
    map: map
  });
}

$(document).ready(function () {
  // 渲染畫面
  render(); // 漢堡選單

  $('#collapseNavbarBtn').on('click', function () {
    $('#collapseNavbarMenu').slideToggle();
  }); // 菜單點選列表，沒被點到的移除 active class (render function 中會加上對應 active class)

  $('.nav-link').on('click', function (event) {
    event.preventDefault();
    $(this).parent().siblings().removeClass('active'); // 如果是產品列表頁，要秀出對應資料

    if ($('#productList')) {
      productCategory = $(this)[0].innerHTML;
      var url = "./product-list.html?type=".concat(productCategory); // 更新網址參數但不刷新整個頁面讓 nav-item active 消失

      history.replaceState({
        url: url,
        title: document.title
      }, document.title, url);
    }

    render();
  }); // 常見問答點選列表，點到的展開

  $('#faqList').children().on('click', function () {
    $(this).children().next().slideToggle();
    $(this).children().next().addClass('active');
  }); // 首頁聯絡我們表單驗證

  $("#contactForm").validate({
    rules: {
      name: {
        required: true
      },
      tel: {
        required: true,
        number: true,
        minlength: 7
      },
      email: {
        required: true,
        email: true
      },
      feedback: {
        required: true
      },
      policy: {
        required: true
      }
    },
    errorPlacement: function errorPlacement(error, element) {
      if ($(element).attr("name") == "policy") {
        if (element.parent().next().attr("class") == "error") {
          element.parent().next().remove();
        }

        error.css("display", "block").insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    },
    submitHandler: function submitHandler(form) {
      $('#alert').fadeIn(1000).delay(1500).fadeOut(1000);
      setTimeout(function () {
        form.submit();
      }, 3500);
    }
  }); // 首頁搜尋店舖，跳轉畫面秀出對應資料

  $('#searchStoreBtnIndex').on('click', function () {
    storeCategory = $(this).siblings()[0].value;
    var url = "./store-location.html?type=".concat(storeCategory);
    document.location = url;
  }); // 店舖頁搜尋店舖，秀出對應資料

  $('#searchStoreLocation').on('click', function (e) {
    $('#storeLocationList').slideToggle();

    if (e.target.innerHTML.length === 2) {
      storeCategory = e.target.innerHTML;
      var url = "./store-location.html?type=".concat(storeCategory);
      history.replaceState({
        url: url,
        title: document.title
      }, document.title, url);
      render();
    }
  });
});
//# sourceMappingURL=all.js.map
