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
        <div class="col-md-4 col-sm-6 col-12 mb-7">
          <div class="card border-0">
            <img src="${product.imgUrl}" alt="${product.title}" class="card-img">
            <div class="card-body">
              <h3 class="card-title mb-0">${product.title}</h3>
              <p class="text-center font-2">${product.price} 元</p>
            </div>
          </div>
        </div>
        `
      });
      $('#productList').html(str);
      $('#productListTitle').html(productCategory);
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
  }
}
function renderStoreList(storeArr){
  let str = '';
  storeArr.forEach(store => {
    str+=`
    <div class="col-lg-4 col-md-6 col-12 mb-7">
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
          <a href="#" class="btn btn-secondary-light">立即訂位</a>
          <a href="#" class="btn btn-outline-secondary-light ml-2">外送點餐</a>
        </div>
      </div>
    </div>
    `
  })
  $('#storeList').html(str);
}

$(document).ready(function () {
  // 渲染畫面
  render();
  // 漢堡選單
  $('#collapseNavbarBtn').on('click', function(){
    $('#collapse-navbar-menu').slideToggle();
  })  
  // 點選列表，沒被點到的移除 active class (render function 中會加上對應 active class)
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
  // 首頁搜尋店舖，跳轉畫面秀出對應資料
  $('#searchStoreBtnIndex').on('click',function(){
    storeCategory = $(this).siblings()[0].value;
    const url = `/store-location.html?type=${storeCategory}`;
    document.location = url;
  })
  // 店舖頁搜尋店舖，秀出對應資料
  $('#searchStoreBtnLocation').on('click',function(){
    storeCategory = $(this).siblings()[0].value;
    const url = `/store-location.html?type=${storeCategory}`;
    history.replaceState({url: url, title: document.title}, document.title, url);
    render();
  })
});

