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
  if(document.querySelector('#product-list')){
  // 產品列表頁
    products.where('category','==',productCategory).orderBy('price').onSnapshot(querySnapshot => {
      let str = '';
      querySnapshot.forEach(item => {
        const product = item.data();
        str+=`
        <div class="col-4">
          <div class="card border-0">
            <img src="${product.imgUrl}" alt="${product.title}" class="card-img">
            <div class="card-body">
              <h3 class="card-title mb-0">${product.title}</h3>
              <p class="text-center font-2">${product.price} 元</p>
            </div>
          </div>
        </div>
        `
        document.querySelector('#product-list').innerHTML = str;
      });
    }); 
  }else if(document.querySelector('#store-list')){
  // 店舖列表頁
    let storeArr = [];
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
    <div class="col-lg-4 mb-6">
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
            <li>
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
  document.querySelector('#store-list').innerHTML = str;
}

$(document).ready(function () {
  render();
  // 漢堡選單
  $('#collapse-navbar-btn').on('click', function(){
    $('#collapse-navbar-menu').slideToggle();
  })
  // 點選列表，被點到的加上 active class
  $('.nav-link').on('click',function(event){
    event.preventDefault(); 
    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');
    // 如果是產品列表頁，要秀出對應資料
    if(document.querySelector('#product-list')){
      $('#product-list-title').html($(this)[0].innerHTML);
      productCategory = $(this)[0].innerHTML;
    }
    render();
  })
  // 點選店舖 select ，秀出對應資料
  $('#search-store-btn').on('click',function(){
    storeCategory = $(this).siblings()[0].value;
    render();
  })
});

