const STORE={
  whatsapp:"2348143331161",
  products:[
    {id:"de-01",name:"Al Dirgham",category:"Perfumes",price:null,image:"assets/products/al-dirgham.png",slides:["assets/products/al-dirgham/slide-01.jpg","assets/products/al-dirgham/slide-02.jpg","assets/products/al-dirgham/slide-03.jpg","assets/products/al-dirgham/slide-04.jpg"],badge:"Eau de Parfum",desc:"A sophisticated floral-woody fragrance with an alluring gourmand character. Presented as a 30ml Eau de Parfum from Swaff World.",size:"30 ml / 1.01 fl oz"},
    {id:"de-02",name:"Golden Veil",category:"Perfumes",price:25000,image:"assets/products/perfume-02.jpg",badge:"New",desc:"Warm, elegant notes with a soft luxurious trail."},
    {id:"de-03",name:"Velvet Bloom",category:"Perfumes",price:24000,image:"assets/products/perfume-03.jpg",badge:"Best Seller",desc:"Floral, feminine and designed for everyday confidence."},
    {id:"de-04",name:"Royal Oud",category:"Perfume Oil",price:15000,image:"assets/products/oil-01.jpg",badge:"Premium",desc:"Concentrated perfume oil with a deep, lasting finish."},
    {id:"de-05",name:"Gold Mist",category:"Body Mists",price:12000,image:"assets/products/mist-01.jpg",badge:"Everyday",desc:"A light fragrance mist for an effortless refresh."},
    {id:"de-06",name:"Diamond Fresh",category:"Body Mists",price:11000,image:"assets/products/mist-02.jpg",badge:"Popular",desc:"Clean, smooth and easy to wear throughout the day."},
    {id:"de-07",name:"Empire Roll-On",category:"Body Care",price:6500,image:"assets/products/rollon-01.jpg",badge:"Travel",desc:"Pocket-sized fragrance for quick touch-ups."},
    {id:"de-08",name:"Hair Growth Elixir",category:"Body Care",price:9000,image:"assets/products/hair-01.jpg",badge:"Care",desc:"A botanical hair-care option for your beauty routine."},
    {id:"de-09",name:"Aqua Bergamot",category:"Body Care",price:null,image:"assets/products/axe-aqua-bergamot.png",slides:["assets/products/axe-aqua-bergamot/slide-01.jpg","assets/products/axe-aqua-bergamot/slide-02.jpg","assets/products/axe-aqua-bergamot/slide-03.jpg","assets/products/axe-aqua-bergamot/slide-04.jpg"],badge:"AXE Fine Fragrance Collection",desc:"An energizing, fresh fragrance with bergamot, sage and juniper essential oils. Premium deodorant body spray."},
    {id:"de-10",name:"Black Vanilla",category:"Body Care",price:null,image:"assets/products/axe-black-vanilla.png",slides:["assets/products/axe-black-vanilla/slide-01.jpg","assets/products/axe-black-vanilla/slide-02.jpg","assets/products/axe-black-vanilla/slide-03.jpg","assets/products/axe-black-vanilla/slide-04.jpg"],badge:"AXE Fine Fragrance Collection",desc:"A rich fragrance combining vanilla, orange and sandalwood essential oils. Premium deodorant body spray."},
    {id:"de-11",name:"Blue Lavender",category:"Body Care",price:null,image:"assets/products/axe-blue-lavender.png",slides:["assets/products/axe-blue-lavender/slide-01.jpg","assets/products/axe-blue-lavender/slide-02.jpg","assets/products/axe-blue-lavender/slide-03.jpg","assets/products/axe-blue-lavender/slide-04.jpg"],badge:"AXE Fine Fragrance Collection",desc:"A fresh aromatic fragrance with lavender, mint and amber essential oils. Premium deodorant body spray."}
  ]
};

const money=n=>n==null?"Price on request":new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
const safeGet=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const safeJSON=(key,fallback)=>{try{return JSON.parse(safeGet(key,JSON.stringify(fallback)))}catch{return fallback}};
let cart=Array.isArray(safeJSON("diamondEmpireCart",[]))?safeJSON("diamondEmpireCart",[]):[];
let activeFilter="All";
let showcaseCategory=null;
let showcaseIndex=0;
const CATEGORY_INFO={
  "Perfumes":{eyebrow:"PERFUMES",title:"Signature perfumes",desc:"Explore statement fragrances selected for memorable entrances, with each scent shown in its own product slide."},
  "Perfume Oil":{eyebrow:"PERFUME OILS",title:"Concentrated perfume oils",desc:"Discover close-to-skin fragrance oils, presented one scent at a time with their details and pricing."},
  "Body Mists":{eyebrow:"BODY MISTS",title:"Everyday body mists",desc:"Light, easy fragrance refreshes displayed as a simple swipeable collection."},
  "Body Care":{eyebrow:"BODY CARE",title:"Body care essentials",desc:"Practical fragrance and beauty essentials, with each product available as a separate slide."}
};
let wishes=Array.isArray(safeJSON("diamondEmpireWishes",[]))?safeJSON("diamondEmpireWishes",[]):[];

const productGrid=document.getElementById("productGrid");
const resultsCount=document.getElementById("resultsCount");
const bagCount=document.getElementById("bagCount");
const cartDrawer=document.getElementById("cartDrawer");
const pageOverlay=document.getElementById("pageOverlay");
const cartItems=document.getElementById("cartItems");
const cartTotal=document.getElementById("cartTotal");
const toast=document.getElementById("toast");
const categoryShowcase=document.getElementById("categoryShowcase");
const showcaseEyebrow=document.getElementById("showcaseEyebrow");
const showcaseTitle=document.getElementById("showcaseTitle");
const showcaseDesc=document.getElementById("showcaseDesc");
const sliderTrack=document.getElementById("sliderTrack");
const sliderPrev=document.getElementById("sliderPrev");
const sliderNext=document.getElementById("sliderNext");

const svg=id=>`<svg aria-hidden="true"><use href="#${id}"></use></svg>`;
const hasStoreDom=()=>Boolean(productGrid&&resultsCount&&bagCount&&cartDrawer&&pageOverlay&&cartItems&&cartTotal&&toast);

function saveCart(){safeSet("diamondEmpireCart",JSON.stringify(cart));renderCart()}
function saveWishes(){safeSet("diamondEmpireWishes",JSON.stringify(wishes))}
function getProduct(id){return STORE.products.find(p=>p.id===id)}
function cartTotalValue(){return cart.reduce((sum,item)=>{const p=getProduct(item.id);return sum+(p?p.price*item.qty:0)},0)}

function addToCart(id){
  const existing=cart.find(x=>x.id===id);
  existing?existing.qty+=1:cart.push({id,qty:1});
  saveCart();openCart();showToast("Added to your bag.");
}
function updateQty(id,delta){
  const item=cart.find(x=>x.id===id);if(!item)return;
  item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);saveCart();
}
function removeFromCart(id){cart=cart.filter(x=>x.id!==id);saveCart()}
function toggleWish(id){
  wishes=wishes.includes(id)?wishes.filter(x=>x!==id):[...wishes,id];
  saveWishes();renderProducts();showToast(wishes.includes(id)?"Saved to favourites.":"Removed from favourites.");
}

function categoryProducts(category){return STORE.products.filter(p=>p.category===category)}
function renderCategoryShowcase(){
  if(!categoryShowcase)return;
  if(!showcaseCategory){categoryShowcase.hidden=true;return}
  const info=CATEGORY_INFO[showcaseCategory]||{eyebrow:showcaseCategory,title:showcaseCategory,desc:"Explore the products in this collection."};
  const list=categoryProducts(showcaseCategory);
  categoryShowcase.hidden=false;
  showcaseEyebrow.textContent=info.eyebrow;
  showcaseTitle.textContent=info.title;
  showcaseDesc.textContent=info.desc;
  if(!list.length){
    sliderTrack.innerHTML='<div class="showcase-empty">No products are listed in this collection yet.</div>';
    sliderPrev.disabled=true;sliderNext.disabled=true;return;
  }
  if(showcaseIndex>=list.length)showcaseIndex=0;
  if(showcaseIndex<0)showcaseIndex=list.length-1;
  sliderTrack.innerHTML=list.map((p,i)=>`
    <article class="showcase-slide ${i===showcaseIndex?'active':''}">
      <div class="showcase-slide-image"><img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="product-fallback"><strong>DE</strong><span>ADD PRODUCT IMAGE</span></div><span class="product-badge">${p.badge}</span></div>
      <div class="showcase-slide-copy"><div class="card-category">${p.category}</div><h4>${p.name}</h4><p>${p.desc}</p><div class="showcase-slide-footer"><strong>${money(p.price)}</strong><div><button class="card-view" data-view="${p.id}" type="button">View details</button><button class="add-btn" data-add="${p.id}" type="button">Add to bag ${svg("i-plus")}</button></div></div></div>
    </article>`).join('');
  sliderTrack.style.transform=`translateX(-${showcaseIndex*100}%)`;
  sliderPrev.disabled=list.length<2;sliderNext.disabled=list.length<2;
}
function openCategoryView(category){
  activeFilter=category;showcaseCategory=category;showcaseIndex=0;
  document.querySelectorAll(".filter").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===activeFilter));
  renderCategoryShowcase();renderProducts();
  scrollToElementSafe(document.getElementById("shop"));
}
function stepShowcase(delta){
  const list=categoryProducts(showcaseCategory);if(list.length<2)return;
  showcaseIndex=(showcaseIndex+delta+list.length)%list.length;renderCategoryShowcase();
}

function renderProducts(){
  const list=STORE.products.filter(p=>activeFilter==="All"||p.category===activeFilter);
  resultsCount.textContent=`${list.length} ${list.length===1?"piece":"pieces"}`;
  productGrid.innerHTML=list.length?list.map(p=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="product-fallback"><strong>DE</strong><span>ADD PRODUCT IMAGE</span></div>
        <span class="product-badge">${p.badge}</span>
        <button class="wish-btn ${wishes.includes(p.id)?"active":""}" data-wish="${p.id}" aria-label="Save ${p.name}">${svg("i-heart")}</button>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          <div class="card-actions"><button class="card-view" data-view="${p.id}">View details</button><button class="add-btn" data-add="${p.id}">Add to bag ${svg("i-plus")}</button></div>
        </div>
      </div>
    </article>
  `).join(""):`<div class="empty-cart">No pieces are listed in this collection yet.</div>`;
}

function renderCart(){
  bagCount.textContent=cart.reduce((sum,item)=>sum+item.qty,0);
  cartTotal.textContent=money(cartTotalValue());
  if(!cart.length){cartItems.innerHTML=`<div class="empty-cart">Your bag is waiting.<br>Choose a fragrance to begin your order.</div>`;return}
  cartItems.innerHTML=cart.map(item=>{
    const p=getProduct(item.id);if(!p)return "";
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}" onerror="this.style.opacity='.12'">
      <div><h4>${p.name}</h4><p>${p.category}</p>
        <div class="qty">
          <button data-minus="${p.id}" aria-label="Decrease quantity">${svg("i-minus")}</button>
          <span>${item.qty}</span>
          <button data-plus="${p.id}" aria-label="Increase quantity">${svg("i-plus")}</button>
        </div>
      </div>
      <div class="cart-item-right"><strong>${money(p.price*item.qty)}</strong><br><button class="remove" data-remove="${p.id}">Remove</button></div>
    </div>`;
  }).join("");
}

const productModal=document.getElementById("productModal");
const modalImage=document.getElementById("modalProductImage");
const modalFallback=document.getElementById("modalFallback");
const modalCategory=document.getElementById("modalCategory");
const modalName=document.getElementById("modalName");
const modalDesc=document.getElementById("modalDesc");
const modalPrice=document.getElementById("modalPrice");
const modalSize=document.getElementById("modalSize");
const modalPrev=document.getElementById("modalPrev");
const modalNext=document.getElementById("modalNext");
const modalDots=document.getElementById("modalDots");
let modalProductId=null,modalSlideIndex=0;
function getProductSlides(p){return Array.isArray(p.slides)&&p.slides.length?p.slides:[p.image]};
function renderModalSlide(){
  const p=getProduct(modalProductId);if(!p)return;
  const slides=getProductSlides(p);
  if(modalSlideIndex>=slides.length)modalSlideIndex=0;
  if(modalSlideIndex<0)modalSlideIndex=slides.length-1;
  const src=slides[modalSlideIndex];
  modalFallback.style.display="none";modalImage.style.display="block";modalImage.src=src;modalImage.alt=`${p.name} slide ${modalSlideIndex+1}`;
  modalImage.onerror=()=>{modalImage.style.display="none";modalFallback.style.display="flex"};
  modalPrev.disabled=slides.length<2;modalNext.disabled=slides.length<2;
  modalDots.innerHTML=slides.map((_,i)=>`<button type="button" class="modal-dot ${i===modalSlideIndex?'active':''}" data-modal-slide="${i}" aria-label="Show image ${i+1}"></button>`).join("");
}
function openProductModal(id){
  const p=getProduct(id);if(!p)return;
  modalProductId=id;modalSlideIndex=0;modalCategory.textContent=p.category;modalName.textContent=p.name;modalDesc.textContent=p.desc;modalPrice.textContent=money(p.price);modalSize.textContent=p.size||"";
  renderModalSlide();
  productModal.classList.add("open");productModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");
}
function stepModalSlide(delta){const p=getProduct(modalProductId);if(!p)return;const slides=getProductSlides(p);if(slides.length<2)return;modalSlideIndex=(modalSlideIndex+delta+slides.length)%slides.length;renderModalSlide()}
function closeProductModal(){productModal.classList.remove("open");productModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
function openCart(){cartDrawer.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");pageOverlay.classList.add("open")}
function closeCart(){
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden","true");
  pageOverlay.classList.remove("open");
}
window.closeDiamondCart=function(event){
  if(event) event.preventDefault();
  closeCart();
};
function showToast(message){toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200)}

function orderText(){
  if(!cart.length)return"Hello Diamond Empire, I would like to shop from your fragrance collection.";
  const lines=cart.map(item=>{const p=getProduct(item.id);return`${p.name} x${item.qty} — ${money(p.price*item.qty)}`});
  return["Hello Diamond Empire, I would like to place this order:","",...lines,"",`Subtotal: ${money(cartTotalValue())}`,"","Please confirm availability, delivery fee and payment details."].join("\n");
}

function scrollToElementSafe(el){
  if(!el)return;
  try{el.scrollIntoView({behavior:("scrollBehavior" in document.documentElement.style)?"smooth":"auto",block:"start"})}
  catch{el.scrollIntoView()}
}

function openWhatsApp(message){
  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`,"_blank","noopener");
}

document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return}
  const plus=e.target.closest("[data-plus]");if(plus){updateQty(plus.dataset.plus,1);return}
  const minus=e.target.closest("[data-minus]");if(minus){updateQty(minus.dataset.minus,-1);return}
  const remove=e.target.closest("[data-remove]");if(remove){removeFromCart(remove.dataset.remove);return}
  const wish=e.target.closest("[data-wish]");if(wish){toggleWish(wish.dataset.wish);return}
  const view=e.target.closest("[data-view]");if(view){openProductModal(view.dataset.view);return}
  const filter=e.target.closest("[data-filter]");if(filter){
    activeFilter=filter.dataset.filter;
    showcaseCategory=null;showcaseIndex=0;
    document.querySelectorAll(".filter").forEach(btn=>btn.classList.toggle("active",btn===filter));
    renderCategoryShowcase();renderProducts();return
  }
  const category=e.target.closest("[data-category]");if(category){openCategoryView(category.dataset.category);return}
});

sliderPrev?.addEventListener("click",()=>stepShowcase(-1));
sliderNext?.addEventListener("click",()=>stepShowcase(1));
document.getElementById("showcaseClose")?.addEventListener("click",()=>{showcaseCategory=null;showcaseIndex=0;document.querySelectorAll(".filter").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter==="All"));activeFilter="All";renderCategoryShowcase();renderProducts();});

document.getElementById("bagBtn").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",window.closeDiamondCart);
pageOverlay.addEventListener("click",closeCart);
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("mobileMenu").classList.toggle("open"));
document.querySelectorAll(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mobileMenu").classList.remove("open")));

const searchOverlay=document.getElementById("searchOverlay"),searchInput=document.getElementById("searchInput"),searchResults=document.getElementById("searchResults");
document.getElementById("searchBtn").addEventListener("click",()=>{searchOverlay.classList.add("open");setTimeout(()=>searchInput.focus(),50);renderSearch("")});
document.getElementById("closeSearch").addEventListener("click",()=>searchOverlay.classList.remove("open"));
searchOverlay.addEventListener("click",e=>{if(e.target===searchOverlay)searchOverlay.classList.remove("open")});
searchInput.addEventListener("input",()=>renderSearch(searchInput.value));

function renderSearch(q){
  const query=q.trim().toLowerCase();
  const list=STORE.products.filter(p=>!query||`${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(query)).slice(0,8);
  searchResults.innerHTML=list.length?list.map(p=>`
    <div class="search-result"><div><strong>${p.name}</strong><small>${p.category}</small></div>
    <button class="add-btn" data-add="${p.id}">Add ${svg("i-plus")}</button></div>`).join(""):`<div class="empty-cart">No matching fragrance found.</div>`;
}


modalPrev?.addEventListener("click",()=>stepModalSlide(-1));
modalNext?.addEventListener("click",()=>stepModalSlide(1));
modalDots?.addEventListener("click",e=>{const dot=e.target.closest("[data-modal-slide]");if(dot){modalSlideIndex=Number(dot.dataset.modalSlide)||0;renderModalSlide()}});
document.getElementById("closeProductModal").addEventListener("click",closeProductModal);
productModal.addEventListener("click",e=>{if(e.target===productModal)closeProductModal()});
document.getElementById("modalAdd").addEventListener("click",()=>{if(modalProductId){addToCart(modalProductId);closeProductModal()}});
document.getElementById("modalWhatsApp").addEventListener("click",()=>{const p=getProduct(modalProductId);if(p)openWhatsApp(`Hello Diamond Empire, I would like more information about ${p.name} (${money(p.price)}).`)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeProductModal();closeCart();searchOverlay.classList.remove("open")}});

document.getElementById("checkoutBtn").addEventListener("click",()=>cart.length?openWhatsApp(orderText()):showToast("Your bag is empty."));
document.getElementById("consultBtn").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hello Diamond Empire, I would like a private fragrance consultation.")});
document.getElementById("whatsappLink").href=`https://wa.me/${STORE.whatsapp}`;
document.getElementById("year").textContent=new Date().getFullYear();
if(hasStoreDom()){renderCategoryShowcase();renderProducts();renderCart();}
