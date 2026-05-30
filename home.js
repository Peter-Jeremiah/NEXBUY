// ============================================================
//   NEXBUY HOME PAGE JAVASCRIPT
// ============================================================

// --- 1. DOM ELEMENTS ---
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const productGrid = document.getElementById('product-grid');
const cartBadge = document.getElementById('cart-badge');
const notificationBadge = document.getElementById('notification-badge');
const searchLink = document.getElementById('search-link');
const searchDropdown = document.getElementById('search-dropdown');
const homeLink = document.getElementById('home-link');

// --- 2. GLOBAL CART STATE ---
let cart = JSON.parse(localStorage.getItem('cart')) || {};

function saveCart() { 
    localStorage.setItem('cart', JSON.stringify(cart)); 
}

function updateCartUI() {
    let totalItems = 0;
    for (const id in cart) { totalItems += cart[id]; }
    
    if (totalItems > 0) {
        cartBadge.style.display = 'block';
        cartBadge.innerText = totalItems;
    } else {
        cartBadge.style.display = 'none';
    }
}

function updateNotificationUI() {
    // Grab the count from memory, default to 0 if it doesn't exist
    const count = parseInt(localStorage.getItem('notifCount')) || 0;
    
    if (count > 0) {
        notificationBadge.style.display = 'block';
        notificationBadge.innerText = count;
    } else {
        notificationBadge.style.display = 'none';
    }
}

function addToCart(id) {
    cart[id] = 1; 
    document.getElementById(`add-btn-${id}`).style.display = 'none';
    document.getElementById(`qty-ctrl-${id}`).style.display = 'flex';
    document.getElementById(`qty-val-${id}`).innerText = cart[id];
    saveCart(); 
    updateCartUI();
}

// --- 3. QUANTITY MODIFIERS ---
function increaseQty(id) {
    cart[id]++;
    document.getElementById(`qty-val-${id}`).innerText = cart[id];
    saveCart(); 
    updateCartUI();
}

function decreaseQty(id) {
    cart[id]--;
    if (cart[id] <= 0) {
        delete cart[id];
        document.getElementById(`qty-ctrl-${id}`).style.display = 'none';
        document.getElementById(`add-btn-${id}`).style.display = 'block';
    } else {
        document.getElementById(`qty-val-${id}`).innerText = cart[id];
    }
    saveCart(); 
    updateCartUI();
}

// --- 4. SIDEBAR & THEME LAYER ---
function toggleMenu() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

menuBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

searchLink.addEventListener('click', (e) => {
    e.preventDefault();
    searchDropdown.classList.toggle('active');
    if (searchDropdown.classList.contains('active')) {
        setTimeout(() => searchDropdown.querySelector('.search-input').focus(), 300); 
    }
});

if (localStorage.getItem('theme') === 'dark') themeToggle.checked = true;

themeToggle.addEventListener('change', (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- 5. INTERACTIVE SIDEBAR ROUTING ---
let categoryMenuStack = ['main-menu-page'];

function navigateToPage(pageName) {
    let targetPage = document.querySelector(`.sidebar-page.${pageName}`) || document.querySelector(`.sidebar-page[data-category="${pageName}"]`);
    if (!targetPage) return;
    
    const currentPageName = categoryMenuStack[categoryMenuStack.length - 1];
    let currentPage = document.querySelector(`.sidebar-page.${currentPageName}`) || document.querySelector(`.sidebar-page[data-category="${currentPageName}"]`);

    if (currentPage) { 
        currentPage.style.transform = 'translateX(-100%)'; 
        currentPage.style.zIndex = '5'; 
    }
    
    targetPage.style.transform = 'translateX(0)'; 
    targetPage.style.zIndex = '10';
    categoryMenuStack.push(pageName);
}

function goBack() {
    if (categoryMenuStack.length <= 1) return;
    
    const currentPageName = categoryMenuStack.pop();
    const previousPageName = categoryMenuStack[categoryMenuStack.length - 1];
    
    let currentPage = document.querySelector(`.sidebar-page.${currentPageName}`) || document.querySelector(`.sidebar-page[data-category="${currentPageName}"]`);
    let previousPage = document.querySelector(`.sidebar-page.${previousPageName}`) || document.querySelector(`.sidebar-page[data-category="${previousPageName}"]`);
    
    if (currentPage) { 
        currentPage.style.transform = 'translateX(100%)'; 
        currentPage.style.zIndex = '5'; 
    }
    if (previousPage) { 
        previousPage.style.transform = 'translateX(0)'; 
        previousPage.style.zIndex = '10'; 
    }
}

document.getElementById('categories-toggle').addEventListener('click', (e) => {
    e.preventDefault(); 
    document.getElementById('categories-dropdown').classList.toggle('active');
    e.currentTarget.querySelector('.category-arrow').classList.toggle('open');
});

document.addEventListener('click', (e) => {
    const categoryItem = e.target.closest('.category-item');
    const subcategoryItem = e.target.closest('.subcategory-item');
    const backBtn = e.target.closest('.back-btn');
    
    if (categoryItem) {
        e.preventDefault();
        const category = categoryItem.dataset.category;
        const categoryPageMap = {
            'electronics': 'electronics-page', 'mens-fashion': 'mens-fashion',
            'womens-fashion': 'womens-fashion', 'home-kitchen': 'home-kitchen',
            'beauty-care': 'beauty-care', 'sports-outdoors': 'sports-outdoors',
            'toys-games': 'toys-games'
        };
        navigateToPage(categoryPageMap[category] || category);
    }
    
    if (subcategoryItem) {
        e.preventDefault();
        const subcategoryText = subcategoryItem.innerText.trim();
        renderProducts(subcategoryText);
        toggleMenu(); 
    }
    
    if (backBtn) { 
        e.preventDefault(); 
        goBack(); 
    }
});

if (homeLink) {
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderProducts('all'); 
        toggleMenu(); 
    });
}

// --- 6. DATA HUB (56 BRANDED PROTOTYPE ITEMS) ---
const storeProducts = [
    // ELECTRONICS
    { id: "e1", subcategory: "Headphones", name: "Sony WH-1000XM5", desc: "Noise canceling wireless headphones.", price: 348.00, image: "https://picsum.photos/seed/e1/400/400" },
    { id: "e2", subcategory: "Mobile Phones & Accessories", name: "Apple Watch Series 9", desc: "Advanced health tracking smartwatch.", price: 399.00, image: "https://picsum.photos/seed/e2/400/400" },
    { id: "e3", subcategory: "Computer & Accessories", name: "Logitech MX Master 3S", desc: "Ergonomic wireless mouse.", price: 99.99, image: "https://picsum.photos/seed/e3/400/400" },
    { id: "e4", subcategory: "Computer & Accessories", name: "Keychron K2 Keyboard", desc: "Wireless mechanical keyboard.", price: 79.50, image: "https://picsum.photos/seed/e4/400/400" },
    { id: "e5", subcategory: "Computer & Accessories", name: "Samsung 49\" Odyssey", desc: "Curved gaming monitor 240Hz.", price: 1199.00, image: "https://picsum.photos/seed/e5/400/400" },
    { id: "e6", subcategory: "Mobile Phones & Accessories", name: "JBL Charge 5", desc: "Waterproof Bluetooth speaker.", price: 149.95, image: "https://picsum.photos/seed/e6/400/400" },
    { id: "e7", subcategory: "Mobile Phones & Accessories", name: "Anker PowerCore", desc: "20,000mAh portable charger.", price: 49.99, image: "https://picsum.photos/seed/e7/400/400" },
    { id: "e8", subcategory: "Game Consoles & Accessories", name: "PS5 DualSense", desc: "Wireless controller with haptic feedback.", price: 69.00, image: "https://picsum.photos/seed/e8/400/400" },

    // MEN's FASHION
    { id: "m1", subcategory: "Clothing", name: "Classic Oxford Shirt", desc: "100% cotton button-down shirt.", price: 45.00, image: "https://picsum.photos/seed/m1/400/400" },
    { id: "m2", subcategory: "Clothing", name: "Slim Fit Chinos", desc: "Stretch fabric comfortable trousers.", price: 55.00, image: "https://picsum.photos/seed/m2/400/400" },
    { id: "m3", subcategory: "Shoes", name: "Leather Chelsea Boots", desc: "Premium suede slip-on boots.", price: 120.00, image: "https://picsum.photos/seed/m3/400/400" },
    { id: "m4", subcategory: "Clothing", name: "Denim Jacket", desc: "Vintage wash trucker jacket.", price: 85.00, image: "https://picsum.photos/seed/m4/400/400" },
    { id: "m5", subcategory: "Watches", name: "Minimalist Watch", desc: "Matte black dial with leather strap.", price: 95.00, image: "https://picsum.photos/seed/m5/400/400" },
    { id: "m6", subcategory: "Accessories", name: "Polarized Sunglasses", desc: "UV400 protection aviators.", price: 25.00, image: "https://picsum.photos/seed/m6/400/400" },
    { id: "m7", subcategory: "Clothing", name: "Athletic Running Shorts", desc: "Lightweight breathable activewear.", price: 30.00, image: "https://picsum.photos/seed/m7/400/400" },
    { id: "m8", subcategory: "Accessories", name: "Wool Blend Beanie", desc: "Warm winter knit cap.", price: 18.00, image: "https://picsum.photos/seed/m8/400/400" },

    // WOMEN's FASHION
    { id: "w1", subcategory: "Clothing", name: "Floral Summer Dress", desc: "Lightweight midi dress.", price: 48.00, image: "https://picsum.photos/seed/w1/400/400" },
    { id: "w2", subcategory: "Handbags", name: "Leather Tote Bag", desc: "Spacious everyday work bag.", price: 110.00, image: "https://picsum.photos/seed/w2/400/400" },
    { id: "w3", subcategory: "Clothing", name: "High-Waist Jeans", desc: "Vintage straight leg denim.", price: 65.00, image: "https://picsum.photos/seed/w3/400/400" },
    { id: "w4", subcategory: "Clothing", name: "Silk Blouse", desc: "Elegant evening wear top.", price: 55.00, image: "https://picsum.photos/seed/w4/400/400" },
    { id: "w5", subcategory: "Shoes", name: "Ankle Strap Heels", desc: "Comfortable block heel sandals.", price: 75.00, image: "https://picsum.photos/seed/w5/400/400" },
    { id: "w6", subcategory: "Jewelry", name: "Gold Plated Necklace", desc: "Minimalist pendant chain.", price: 35.00, image: "https://picsum.photos/seed/w6/400/400" },
    { id: "w7", subcategory: "Clothing", name: "Yoga Leggings", desc: "Squat-proof activewear.", price: 40.00, image: "https://picsum.photos/seed/w7/400/400" },
    { id: "w8", subcategory: "Clothing", name: "Oversized Cardigan", desc: "Cozy knit winter sweater.", price: 50.00, image: "https://picsum.photos/seed/w8/400/400" },

    // HOME & KITCHEN
    { id: "h1", subcategory: "Kitchen & Dining", name: "Ninja Professional Blender", desc: "1000-watt power crushing technology.", price: 89.99, image: "https://picsum.photos/seed/h1/400/400" },
    { id: "h2", subcategory: "Kitchen & Dining", name: "Cast Iron Skillet", desc: "Pre-seasoned 10-inch pan.", price: 29.50, image: "https://picsum.photos/seed/h2/400/400" },
    { id: "h3", subcategory: "Kitchen & Dining", name: "Nespresso Machine", desc: "Espresso maker with milk frother.", price: 199.00, image: "https://picsum.photos/seed/h3/400/400" },
    { id: "h4", subcategory: "Kitchen & Dining", name: "Ceramic Dinnerware Set", desc: "16-piece plates and bowls.", price: 65.00, image: "https://picsum.photos/seed/h4/400/400" },
    { id: "h5", subcategory: "Bedding", name: "Memory Foam Pillow", desc: "Cooling gel orthopedic pillow.", price: 45.00, image: "https://picsum.photos/seed/h5/400/400" },
    { id: "h6", subcategory: "Vacuums & Floor Care", name: "Robot Vacuum Cleaner", desc: "Smart navigation auto-charging.", price: 249.99, image: "https://picsum.photos/seed/h6/400/400" },
   // ... your previous products ...
    { id: "h6", subcategory: "Vacuums & Floor Care", name: "Robot Vacuum Cleaner", desc: "Smart navigation auto-charging.", price: 249.99, image: "https://picsum.photos/seed/h6/400/400" },
    // 1. FIX: Close the string and the array properly
    { id: "h7", subcategory: "Home Décor", name: "Essential Oil Diffuser", desc: "Aromatherapy diffuser with LED lights.", price: 25.00, image: "https://picsum.photos/seed/h7/400/400" }
];

localStorage.setItem('masterProducts', JSON.stringify(storeProducts));


// 2. FIX: Add the missing render function
function renderProducts(filterCategory) {
    // Clear the current grid
    productGrid.innerHTML = ''; 

    // Filter the products based on the category
    const filteredProducts = filterCategory === 'all' 
        ? storeProducts 
        : storeProducts.filter(p => p.subcategory === filterCategory);

    // Loop through the filtered products and create HTML cards
    filteredProducts.forEach(product => {
        // Check if the item is already in the cart to show correct buttons
        const qty = cart[product.id] || 0;
        const addBtnStyle = qty > 0 ? 'display: none;' : 'display: block;';
        const qtyCtrlStyle = qty > 0 ? 'display: flex;' : 'display: none;';

        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Inject the HTML using your existing CSS classes
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <span class="description">${product.desc}</span>
            <div class="price">$${product.price.toFixed(2)}</div>
            
            <button class="add-to-cart-btn" id="add-btn-${product.id}" style="${addBtnStyle}" onclick="addToCart('${product.id}')">Add to Cart</button>
            
            <div class="qty-controls" id="qty-ctrl-${product.id}" style="${qtyCtrlStyle}">
                <button class="qty-btn" onclick="decreaseQty('${product.id}')">-</button>
                <span class="qty-display" id="qty-val-${product.id}">${qty}</span>
                <button class="qty-btn" onclick="increaseQty('${product.id}')">+</button>
            </div>
        `;
        
        productGrid.appendChild(card);
    });
}

// Update this block at the bottom of home.js
document.addEventListener('DOMContentLoaded', () => {
    renderProducts('all');
    updateCartUI(); 
    updateNotificationUI(); // <-- ADD THIS LINE
});