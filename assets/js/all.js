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
        str += "\n        <div class=\"col-md-4 col-sm-6 col-12 mb-5\">\n          <div class=\"card border-0\">\n            <img src=\"".concat(product.imgUrl, "\" alt=\"").concat(product.title, "\" class=\"card-img\">\n            <div class=\"card-body\">\n              <h3 class=\"card-title mb-0\">").concat(product.title, "</h3>\n              <p class=\"text-center font-2\">").concat(product.price, " \u5143</p>\n            </div>\n          </div>\n        </div>\n        ");
      });
      $('#productList').html(str);
      $('#productListTitle').html(productCategory);
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
  storeArr.forEach(function (store) {
    str += "\n    <div class=\"col-lg-4 col-md-6 col-12 mb-5\">\n      <div class=\"card\">\n        <img src=\"".concat(store.imgUrl, "\" alt=\"").concat(store.category).concat(store.title, "\u5E97\" class=\"card-img\">\n        <div class=\"card-body\">\n          <h3 class=\"card-title\">").concat(store.category).concat(store.title, "\u5E97</h3>\n          <ul>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-telephone-fill\"></i>\n              <span class=\"ml-1\">").concat(store.tel, "</span>\n            </li>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-clock-fill\"></i>\n              <span class=\"ml-1\">").concat(store.time[0], ":00 ~ ").concat(store.time[1], ":00</span>\n            </li>\n            <li class=\"d-flex\">\n              <i class=\"bi bi-pin-angle-fill\"></i>\n              <span class=\"ml-1\">").concat(store.address, "</span>\n            </li>\n          </ul>\n        </div>\n        <div class=\"card-footer\">\n          <a href=\"#\" class=\"btn btn-secondary-light\">\u7ACB\u5373\u8A02\u4F4D</a>\n          <a href=\"#\" class=\"btn btn-outline-secondary-light ml-2\">\u5916\u9001\u9EDE\u9910</a>\n        </div>\n      </div>\n    </div>\n    ");
  });
  $('#storeList').html(str);
  $('#loader').hide();
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
      var url = "/product-list.html?type=".concat(productCategory); // 更新網址參數但不刷新整個頁面讓 nav-item active 消失

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
    var url = "/store-location.html?type=".concat(storeCategory);
    document.location = url;
  }); // 店舖頁搜尋店舖，秀出對應資料

  $('#searchStoreBtnLocation').on('click', function () {
    storeCategory = $(this).siblings()[0].value;
    var url = "/store-location.html?type=".concat(storeCategory);
    history.replaceState({
      url: url,
      title: document.title
    }, document.title, url);
    render();
  });
});
//# sourceMappingURL=all.js.map
