const STORE={
  whatsapp:"2348143331161",
  products:[
    {id:"de-01",name:"Diamond Noir",category:"Perfumes",price:28000,image:"assets/products/perfume-01.jpg",badge:"Signature",desc:"A rich, polished fragrance for evening entrances."},
    {id:"de-02",name:"Golden Veil",category:"Perfumes",price:25000,image:"assets/products/perfume-02.jpg",badge:"New",desc:"Warm, elegant notes with a soft luxurious trail."},
    {id:"de-03",name:"Velvet Bloom",category:"Perfumes",price:24000,image:"assets/products/perfume-03.jpg",badge:"Best Seller",desc:"Floral, feminine and designed for everyday confidence."},
    {id:"de-04",name:"Royal Oud",category:"Perfume Oil",price:15000,image:"assets/products/oil-01.jpg",badge:"Premium",desc:"Concentrated perfume oil with a deep, lasting finish."},
    {id:"de-05",name:"Gold Mist",category:"Body Mists",price:12000,image:"assets/products/mist-01.jpg",badge:"Everyday",desc:"A light fragrance mist for an effortless refresh."},
    {id:"de-06",name:"Diamond Fresh",category:"Body Mists",price:11000,image:"assets/products/mist-02.jpg",badge:"Popular",desc:"Clean, smooth and easy to wear throughout the day."},
    {id:"de-07",name:"Empire Roll-On",category:"Body Care",price:6500,image:"assets/products/rollon-01.jpg",badge:"Travel",desc:"Pocket-sized fragrance for quick touch-ups."},
    {id:"de-08",name:"Hair Growth Elixir",category:"Body Care",price:9000,image:"assets/products/hair-01.jpg",badge:"Care",desc:"A botanical hair-care option for your beauty routine."}
  ]
};

const money=n=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
const safeGet=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const safeJSON=(key,fallback)=>{try{return JSON.parse(safeGet(key,JSON.stringify(fallback)))}catch{return fallback}};
let cart=Array.isArray(safeJSON("diamondEmpireCart",[]))?safeJSON("diamondEmpireCart",[]):[];
let activeFilter="All";
let wishes=Array.isArray(safeJSON("diamondEmpireWishes",[]))?safeJSON("diamondEmpireWishes",[]):[];

const productGrid=document.getElementById("productGrid");
const resultsCount=document.getElementById("resultsCount");
const bagCount=document.getElementById("bagCount");
const cartDrawer=document.getElementById("cartDrawer");
const pageOverlay=document.getElementById("pageOverlay");
const cartItems=document.getElementById("cartItems");
const cartTotal=document.getElementById("cartTotal");
const toast=document.getElementById("toast");

const svg=id=>`<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

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
let modalProductId=null;
function openProductModal(id){
  const p=getProduct(id);if(!p)return;
  modalProductId=id;modalCategory.textContent=p.category;modalName.textContent=p.name;modalDesc.textContent=p.desc;modalPrice.textContent=money(p.price);
  modalFallback.style.display="none";modalImage.style.display="block";modalImage.src=p.image;modalImage.alt=p.name;
  modalImage.onerror=()=>{modalImage.style.display="none";modalFallback.style.display="flex"};
  productModal.classList.add("open");productModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");
}
function closeProductModal(){productModal.classList.remove("open");productModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
function openCart(){cartDrawer.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");pageOverlay.classList.add("open")}
function closeCart(){cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");pageOverlay.classList.remove("open")}
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
    document.querySelectorAll(".filter").forEach(btn=>btn.classList.toggle("active",btn===filter));
    renderProducts();return
  }
  const category=e.target.closest("[data-category]");if(category){
    activeFilter=category.dataset.category;
    document.querySelectorAll(".filter").forEach(btn=>btn.classList.toggle("active",btn.dataset.filter===activeFilter));
    scrollToElementSafe(document.getElementById("shop"));
    renderProducts();
  }
});

document.getElementById("bagBtn").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
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


document.getElementById("closeProductModal").addEventListener("click",closeProductModal);
productModal.addEventListener("click",e=>{if(e.target===productModal)closeProductModal()});
document.getElementById("modalAdd").addEventListener("click",()=>{if(modalProductId){addToCart(modalProductId);closeProductModal()}});
document.getElementById("modalWhatsApp").addEventListener("click",()=>{const p=getProduct(modalProductId);if(p)openWhatsApp(`Hello Diamond Empire, I would like more information about ${p.name} (${money(p.price)}).`)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeProductModal();closeCart();searchOverlay.classList.remove("open")}});

document.getElementById("checkoutBtn").addEventListener("click",()=>cart.length?openWhatsApp(orderText()):showToast("Your bag is empty."));
document.getElementById("consultBtn").addEventListener("click",e=>{e.preventDefault();openWhatsApp("Hello Diamond Empire, I would like a private fragrance consultation.")});
document.getElementById("whatsappLink").href=`https://wa.me/${STORE.whatsapp}`;
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();

// Lightweight navigation highlighting. No scroll interception or scroll-driven repaint.
const navLinks=[...document.querySelectorAll(".desktop-nav a")];
const navTargets=[document.getElementById("home"),document.getElementById("shop"),document.getElementById("collections"),document.getElementById("story"),document.getElementById("contact")].filter(Boolean);
if("IntersectionObserver" in window){
  const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){const id=entry.target.id;navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${id}`))}})},{rootMargin:"-48% 0px -48% 0px",threshold:0});
  navTargets.forEach(el=>navObserver.observe(el));
}
