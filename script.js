const STORE = {
  whatsapp: "2348143331161",
  products: [
    {id:"de-01", name:"Diamond Noir", category:"Perfumes", price:28000, image:"assets/products/perfume-01.jpg", badge:"Signature", desc:"A rich, polished fragrance for evening entrances."},
    {id:"de-02", name:"Golden Veil", category:"Perfumes", price:25000, image:"assets/products/perfume-02.jpg", badge:"New", desc:"Warm, elegant notes with a soft luxurious trail."},
    {id:"de-03", name:"Velvet Bloom", category:"Perfumes", price:24000, image:"assets/products/perfume-03.jpg", badge:"Best Seller", desc:"Floral, feminine and designed for everyday confidence."},
    {id:"de-04", name:"Royal Oud", category:"Perfume Oil", price:15000, image:"assets/products/oil-01.jpg", badge:"Premium", desc:"Concentrated perfume oil with a deep, long-lasting finish."},
    {id:"de-05", name:"Gold Mist", category:"Body Mists", price:12000, image:"assets/products/mist-01.jpg", badge:"Everyday", desc:"A light fragrance mist for an effortless refresh."},
    {id:"de-06", name:"Diamond Fresh", category:"Body Mists", price:11000, image:"assets/products/mist-02.jpg", badge:"Popular", desc:"Clean, smooth and easy to wear throughout the day."},
    {id:"de-07", name:"Empire Roll-On", category:"Body Care", price:6500, image:"assets/products/rollon-01.jpg", badge:"Travel", desc:"Pocket-sized fragrance designed for quick touch-ups."},
    {id:"de-08", name:"Hair Growth Elixir", category:"Body Care", price:9000, image:"assets/products/hair-01.jpg", badge:"Care", desc:"A botanical hair-care option for your beauty routine."}
  ]
};

const money = n => new Intl.NumberFormat("en-NG", {style:"currency", currency:"NGN", maximumFractionDigits:0}).format(n);

let cart = JSON.parse(localStorage.getItem("diamondEmpireCart") || "[]");
let activeFilter = "All";

const productGrid = document.getElementById("productGrid");
const bagCount = document.getElementById("bagCount");
const cartDrawer = document.getElementById("cartDrawer");
const pageOverlay = document.getElementById("pageOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

function saveCart() {
  localStorage.setItem("diamondEmpireCart", JSON.stringify(cart));
  renderCart();
}

function getProduct(id) {
  return STORE.products.find(p => p.id === id);
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({id, qty:1});
  saveCart();
  searchOverlay.classList.remove("open");
  openCart();
  showToast("Added to your bag.");
}

function updateQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
}

function cartTotalValue() {
  return cart.reduce((sum, item) => {
    const p = getProduct(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderProducts() {
  const list = STORE.products.filter(p => activeFilter === "All" || p.category === activeFilter);
  if (!list.length) {
    productGrid.innerHTML = `<div class="empty-cart">No products in this category yet.</div>`;
    return;
  }
  productGrid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="product-fallback" style="display:none;">
          <strong>DE</strong>
          <span>ADD ${p.category.toUpperCase()} IMAGE</span>
        </div>
        <span class="product-badge">${p.badge}</span>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">Add to Bag</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  bagCount.textContent = count;
  cartTotal.textContent = money(cartTotalValue());
  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart">Your bag is waiting.<br />Add a fragrance to begin your order.</div>`;
    return;
  }
  cartItems.innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}" onerror="this.style.opacity='.15';" />
        <div>
          <h4>${p.name}</h4>
          <p>${p.category}</p>
          <div class="qty">
            <button data-minus="${p.id}">−</button>
            <span>${item.qty}</span>
            <button data-plus="${p.id}">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <strong>${money(p.price * item.qty)}</strong>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  pageOverlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  pageOverlay.classList.remove("open");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function makeWhatsAppMessage() {
  if (!cart.length) return "Hello Diamond Empire, I would like to shop from your fragrance collection.";
  const lines = cart.map(item => {
    const p = getProduct(item.id);
    return `${p.name} x${item.qty} — ${money(p.price * item.qty)}`;
  });
  return [
    "Hello Diamond Empire, I would like to place this order:",
    "",
    ...lines,
    "",
    `Subtotal: ${money(cartTotalValue())}`,
    "",
    "Please confirm availability, delivery fee and payment details."
  ].join("\n");
}

function openWhatsApp(message) {
  const url = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) addToCart(add.dataset.add);

  const plus = e.target.closest("[data-plus]");
  if (plus) updateQty(plus.dataset.plus, 1);

  const minus = e.target.closest("[data-minus]");
  if (minus) updateQty(minus.dataset.minus, -1);

  const remove = e.target.closest("[data-remove]");
  if (remove) removeFromCart(remove.dataset.remove);

  const filter = e.target.closest("[data-filter]");
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn === filter));
    renderProducts();
  }

  const category = e.target.closest("[data-category]");
  if (category) {
    activeFilter = category.dataset.category;
    document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === activeFilter));
    document.getElementById("shop").scrollIntoView({behavior:"smooth"});
    renderProducts();
  }
});

document.getElementById("bagBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
pageOverlay.addEventListener("click", closeCart);

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("open");
});
document.querySelectorAll(".mobile-menu a").forEach(a => a.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.remove("open");
}));

const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

document.getElementById("searchBtn").addEventListener("click", () => {
  searchOverlay.classList.add("open");
  setTimeout(() => searchInput.focus(), 50);
  renderSearch("");
});
document.getElementById("closeSearch").addEventListener("click", () => searchOverlay.classList.remove("open"));
searchOverlay.addEventListener("click", e => {
  if (e.target === searchOverlay) searchOverlay.classList.remove("open");
});
searchInput.addEventListener("input", () => renderSearch(searchInput.value));

function renderSearch(q) {
  const query = q.trim().toLowerCase();
  const list = STORE.products.filter(p => !query || `${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(query)).slice(0, 8);
  searchResults.innerHTML = list.length ? list.map(p => `
    <div class="search-result">
      <div><strong>${p.name}</strong><small> • ${p.category}</small></div>
      <button class="add-btn" data-add="${p.id}">Add</button>
    </div>
  `).join("") : `<div class="empty-cart">No matching fragrance found.</div>`;
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return showToast("Your bag is empty.");
  openWhatsApp(makeWhatsAppMessage());
});

document.getElementById("consultBtn").addEventListener("click", e => {
  e.preventDefault();
  openWhatsApp("Hello Diamond Empire, I would like a private fragrance consultation.");
});

document.getElementById("whatsappLink").href = `https://wa.me/${STORE.whatsapp}`;

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
