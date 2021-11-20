"use strict"; // 寫了才能正常運行 jQuery

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGSMcP5U44-K3qE0Y5lt77k4Bcq5sVKtU",
  authDomain: "chan-sushi.firebaseapp.com",
  projectId: "chan-sushi",
  storageBucket: "chan-sushi.appspot.com",
  messagingSenderId: "373508304619",
  appId: "1:373508304619:web:6aa5d730627f26955a58ae",
  measurementId: "G-F6FLCKX6C1"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const products = db.collection('menu');
const stores = db.collection('stores');
let productCategory = '握壽司';
let storeCategory = '尋找最近的店舖';

// 初始化 AOS
AOS.init();

// 渲染畫面
function render(){
  if(document.querySelector('#productList')){
    // 產品列表頁
    // 先確定網址有無參數
    const url = location.href.split('?type=');
    if(url[1]){
      productCategory = decodeURI(url[1]);
    }
    // 抓 api
    products.where('category','==',productCategory).orderBy('price').onSnapshot(querySnapshot => {
      let str = '';
      querySnapshot.forEach(item => {
        const product = item.data();
        str+=`
        <div class="col-xl-3 col-md-4 col-sm-6 col-12 mb-5">
          <div class="card border-0">
            <img src="${product.imgUrl}" alt="${product.title}" class="card-img">
            <div class="card-body d-flex justify-content-between">
              <h3>${product.title}</h3>
              <p class="card-subtitle ml-3">NT ${product.price}</p>
            </div>
          </div>
        </div>
        `
      });
      $('#productList').html(str);
      $('#loader').hide();
      // 第一次進入頁面時， nav-item 即可正確顯示 active class
      document.querySelectorAll('.nav-link').forEach(item=>{
        if(item.innerHTML === productCategory){
          item.parentElement.classList.add('active');
        }
      })
    }); 
  }else if(document.querySelector('#storeList')){
    // 店舖列表頁
    let storeArr = [];
    const url = location.href.split('?type=');
    if(url[1]){
      storeCategory = decodeURI(url[1]);
    }
    if(storeCategory === '尋找最近的店舖'){
      stores.onSnapshot(querySnapshot=>{
        // 店舖照地區北至南順序排列，先分類成物件裡的陣列，再取出放到 storeArr 渲染
        const categoryObj = {
          '台北':[],
          '新北':[],
          '台中':[],
          '台南':[],
          '高雄':[],
        };
        querySnapshot.forEach(item => {
          const store = item.data();
          categoryObj[store.category].push(store);
        });
        storeArr = Object.values(categoryObj).flat(Infinity);
        renderStoreList(storeArr);
      })
    }else{
      stores.where('category','==',storeCategory).onSnapshot(querySnapshot =>{
        querySnapshot.forEach(item => {
          storeArr.push(item.data());
        });
        renderStoreList(storeArr);
      })
    }
  }else{
    $('#loader').hide();
  }
}
function renderStoreList(storeArr){
  let str = '';
  let str2 = '';

  storeArr.forEach((store,storeKey) => {
    str+=`
    <div class="col-lg-4 col-md-6 col-12 mb-5">
      <div class="card">
        <img src="${store.imgUrl}" alt="${store.category}${store.title}店" class="card-img">
        <div class="card-body">
          <h3 class="card-title">${store.category}${store.title}店</h3>
          <ul>
            <li class="mb-2">
              <i class="bi bi-telephone-fill"></i>
              <span class="ml-1">${store.tel}</span>
            </li>
            <li class="mb-2">
              <i class="bi bi-clock-fill"></i>
              <span class="ml-1">${store.time[0]}:00 ~ ${store.time[1]}:00</span>
            </li>
            <li class="d-flex">
              <i class="bi bi-pin-angle-fill"></i>
              <span class="ml-1">${store.address}</span>
            </li>
          </ul>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary-light modal-label-btn" id="modal-label-${storeKey}" data-modal-title="${store.title}">立即訂位</button>
          <button class="btn btn-outline-secondary-light ml-2">外送點餐</button>
        </div>
      </div>
    </div>
    `
    str2+=`
    <div class="modal-outer d-none" id="modal-${storeKey}">
      <div class="modal-inner">
        <p class="modal-exit mb-3">
          <i class="bi bi-x-lg"></i>
        </p>
        <h3 class="modal-title">${store.category}${store.title}店</h3>
        <p class="modal-subtitle mb-5">${store.address}</p>
        <div class="d-flex justify-content-between">
          <div class="w-50">
          </div>
          <form class="w-50">
            <div class="mb-5">
              <p class="mb-2">預定日期：</p>
              <input type="text" class="datepicker w-100">
            </div>
            <div class="mb-5">
              <p class="mb-2">預定時段：</p>
              <input type="text" class="timepicker w-100" name="time" id="booking-time-${storeKey}"/>
            </div>
            <div class="d-flex mb-5">
              <div>
                <p class="mb-2">訂位姓名：</p>
                <input type="text"/>
              </div>
              <div class="ml-1">
                <p class="mb-2">訂位人數：</p>
                <input type="number"/>
              </div>
            </div>
            <div class="mb-5">
              <p class="mb-2">連絡信箱：</p>
              <input type="text" class="w-100"/>
            </div>
            <button type="button" class="btn btn-secondary-light w-100 send-rsvn">確認訂位</button>
          </form>
        </div>
      </div>
    </div>
    `
  })
  $('#storeList').html(str);
  $('#storeModal').html(str2);
  $('#loader').hide();
  // 跑完上面才綁定店舖頁訂位 modal
  storeModalShow(storeArr);
}
// 店舖頁點「立即訂位」 modal 相關功能
function storeModalShow(storeArr){
  // 開啟
  $('.modal-label-btn').on('click', function(e){
    const storeKey = e.target.id.split('-')[2];
    $(`#modal-${storeKey}`).removeClass('d-none');
    const modalStore = storeArr.find(store=> store.title===e.target.dataset.modalTitle);
    const timePickerMin = modalStore.time[0].toString();  
    const timePickerMax = modalStore.time[1].toString();  
    $(function () {
      // datePicker
      $(".datepicker").datepicker({
        dateFormat: "yy-mm-dd", 
        minDate: '0',
        maxDate: "+1M -1D"
      });
      // timePicker
      $(`#booking-time-${storeKey}`).timepicker({
        timeFormat: 'hh:mm p',
        minTime: timePickerMin,
        maxTime: timePickerMax,
      });
    });
    // 送出訂單關閉 modal 彈出 alert 視窗
    $('.send-rsvn').on('click',function(){
      $(`#modal-${storeKey}`).addClass('d-none');
      $('#bookingAlert').fadeIn(1000).delay(1500).fadeOut(1000);
    })
  })
  // 關閉
  // $('.modal-outer').on('click',function(){
  //   $(this).addClass('d-none');
  // })
  $('.modal-exit').on('click', function(){
    $(this).parent().parent().addClass('d-none');
  })
}

$(document).ready(function () {
  // 渲染畫面
  render();
  // 漢堡選單
  $('#collapseNavbarBtn').on('click', function(){
    $('#collapseNavbarMenu').slideToggle();
  })  
  // 菜單點選列表，沒被點到的移除 active class (render function 中會加上對應 active class)
  $('.nav-link').on('click',function(event){
    event.preventDefault(); 
    $(this).parent().siblings().removeClass('active');
    // 如果是產品列表頁，要秀出對應資料
    if($('#productList')){
      productCategory = $(this)[0].innerHTML;
      const url = `/product-list.html?type=${productCategory}`;
      // 更新網址參數但不刷新整個頁面讓 nav-item active 消失
      history.replaceState({url: url, title: document.title}, document.title, url);
    }
    render();
  })
  // 常見問答點選列表，點到的展開
  $('#faqList').children().on('click', function(){
    $(this).children().next().slideToggle();
    $(this).children().next().addClass('active');
  })
  // 首頁聯絡我們表單驗證
  $("#contactForm").validate({
    rules: {
      name: {
        required: true,
      },
      tel: {
        required: true,
        number: true,
        minlength: 7,
      },
      email: {
        required: true,
        email: true,
      },
      feedback: {
        required: true,
      },
      policy: {
        required: true,
      }     
    },
    errorPlacement:function(error, element){
      if($(element).attr("name") == "policy"){
        if(element.parent().next().attr("class") == "error"){
          element.parent().next().remove();
        }
        error.css("display","block").insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    },
    submitHandler: function(form) {
      $('#alert').fadeIn(1000).delay(1500).fadeOut(1000);
      setTimeout(function(){form.submit();}, 3500);
    }       
  });
  // 首頁搜尋店舖，跳轉畫面秀出對應資料
  $('#searchStoreBtnIndex').on('click',function(){
    storeCategory = $(this).siblings()[0].value;
    const url = `/store-location.html?type=${storeCategory}`;
    document.location = url;
  })
  // 店舖頁搜尋店舖，秀出對應資料
  $('#searchStoreLocation').on('click',function(e){
    $('#storeLocationList').slideToggle();
    if(e.target.innerHTML.length === 2){
      storeCategory = e.target.innerHTML;
      const url = `/store-location.html?type=${storeCategory}`;
      history.replaceState({url: url, title: document.title}, document.title, url);
      render();  
    }
  })
});

