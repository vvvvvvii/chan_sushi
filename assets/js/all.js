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
var storeCategory = '尋找最近的店舖'; // 渲染畫面

function render() {
  if (document.querySelector('#product-list')) {
    // 產品列表頁
    products.where('category', '==', productCategory).orderBy('price').onSnapshot(function (querySnapshot) {
      var str = '';
      querySnapshot.forEach(function (item) {
        var product = item.data();
        str += "\n        <div class=\"col-4\">\n          <div class=\"card border-0\">\n            <img src=\"".concat(product.imgUrl, "\" alt=\"").concat(product.title, "\" class=\"card-img\">\n            <div class=\"card-body\">\n              <h3 class=\"card-title mb-0\">").concat(product.title, "</h3>\n              <p class=\"text-center font-2\">").concat(product.price, " \u5143</p>\n            </div>\n          </div>\n        </div>\n        ");
        document.querySelector('#product-list').innerHTML = str;
      });
    });
  } else if (document.querySelector('#store-list')) {
    // 店舖列表頁
    var storeArr = [];

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
  }
}

function renderStoreList(storeArr) {
  var str = '';
  storeArr.forEach(function (store) {
    str += "\n    <div class=\"col-lg-4 mb-6\">\n      <div class=\"card\">\n        <img src=\"".concat(store.imgUrl, "\" alt=\"").concat(store.category).concat(store.title, "\u5E97\" class=\"card-img\">\n        <div class=\"card-body\">\n          <h3 class=\"card-title\">").concat(store.category).concat(store.title, "\u5E97</h3>\n          <ul>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-telephone-fill\"></i>\n              <span class=\"ml-1\">").concat(store.tel, "</span>\n            </li>\n            <li class=\"mb-2\">\n              <i class=\"bi bi-clock-fill\"></i>\n              <span class=\"ml-1\">").concat(store.time[0], ":00 ~ ").concat(store.time[1], ":00</span>\n            </li>\n            <li>\n              <i class=\"bi bi-pin-angle-fill\"></i>\n              <span class=\"ml-1\">").concat(store.address, "</span>\n            </li>\n          </ul>\n        </div>\n        <div class=\"card-footer\">\n          <a href=\"#\" class=\"btn btn-secondary-light\">\u7ACB\u5373\u8A02\u4F4D</a>\n          <a href=\"#\" class=\"btn btn-outline-secondary-light ml-2\">\u5916\u9001\u9EDE\u9910</a>\n        </div>\n      </div>\n    </div>\n    ");
  });
  document.querySelector('#store-list').innerHTML = str;
}

$(document).ready(function () {
  render(); // 漢堡選單

  $('#collapse-navbar-btn').on('click', function () {
    $('#collapse-navbar-menu').slideToggle();
  }); // 點選列表，被點到的加上 active class

  $('.nav-link').on('click', function (event) {
    event.preventDefault();
    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active'); // 如果是產品列表頁，要秀出對應資料

    if (document.querySelector('#product-list')) {
      $('#product-list-title').html($(this)[0].innerHTML);
      productCategory = $(this)[0].innerHTML;
    }

    render();
  }); // 點選店舖 select ，秀出對應資料

  $('#search-store-btn').on('click', function () {
    storeCategory = $(this).siblings()[0].value;
    render();
  });
});
//# sourceMappingURL=all.js.map
