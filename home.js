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

function updateProfileUI() {
    // 1. THIS IS THE FIX: Looking for 'userAvatar' to match your profile.js exactly
    const savedImage = localStorage.getItem('userAvatar'); 
    
    // 2. Grabbing the UI elements from your index.html header
    const initialDiv = document.getElementById('home-profile-initial');
    const imgElement = document.getElementById('home-profile-img');

    if (savedImage) {
        // If an image exists, hide the "P" and show the profile picture
        initialDiv.style.display = 'none';
        imgElement.src = savedImage;
        imgElement.style.display = 'block';
    } else {
        // If no image, show the "P" and hide the image tag
        initialDiv.style.display = 'flex'; 
        imgElement.style.display = 'none';
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
    { id: "e1", subcategory: "Headphones & Speakers", name: "Sony WH-1000XM5", desc: "Noise canceling wireless headphones.", price: 348.00, image: "images/1000xm5.jpg" },
    { id: "e2", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S21", desc: "UK used, 128GB", price: 169.99, image: "images/s21.jpg" },
    { id: "e3", subcategory: "Mobile Phones & Accessories", name: "Apple Watch Series 3", desc: "Used apple watch", price: 69.99, image: "images/apple watch.jpg" },
    { id: "e4", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11 pro max", desc: "UK used, 128GB", price: 169.99, image: "images/11 pro max.jpg" },
    { id: "e5", subcategory: "Mobile Phones & Accessories", name: "Apple iPad 11", desc: "UK used, 256GB", price: 169.99, image: "images/ipad 11.jpg" },
    { id: "e6", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 12", desc: "IDM, IBM, Battery health: 85", price: 399.99, image: "images/iphone 12.jpg" },
    { id: "e7", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 14 pro", desc: "Open box, 128GB BH 100, LLA 2Sim", price: 99.99, image: "images/14 pro.jpg" },
    { id: "e8", subcategory: "Computer & Accessories", name: "Dell Latitiude 7490", desc: "16GB/512GB, Intel core i7-8650U", price: 296.99, image: "images/7490.jpg" },
    { id: "e9", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 12 pro", desc: "Open box, 128GB, BH 69", price: 237.99, image: "images/12 pro.jpg" },
    { id: "e10", subcategory: "Headphones & Speakers", name: "JBL BoomBox 3", desc: "Brand New Sealed, Green", price: 455.99, image: "images/boombox 3.jpg" },
    { id: "e11", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11 pro", desc: "UK used, 64GB, IDM, BH 87.", price: 167, image: "images/11 pro.jpg" },
    { id: "e12", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11", desc: "UK standard, 128GB, BH 86", price: 174.99, image: "images/iphone 11.jpg" },
    { id: "e13", subcategory: "Computer & Accessories", name: "Hp EliteBook 850 G7", desc: "UK used, 8GB/256GB, Intel core i5-10365U", price: 147.99, image: "images/850 g7.jpg" },
    { id: "e14", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone X", desc: "UK standard, 64GB, BH 72", price: 99.99, image: "images/iphone x.jpg" },
    { id: "e15", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S25", desc: "UK used, 128GB,", price: 629.99, image: "images/s25.jpg" },
    { id: "e16", subcategory: "Headphones & Speakers", name: "Samsung Galaxy Bud 3 pro", desc: "Samsung earpods,Brand new, silver", price: 89.99, image: "images/buds 3 pro.jpg" },
    { id: "e17", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S22", desc: "UK used, 256GB", price: 222.50, image: "images/s22.jpg" },
    { id: "e18", subcategory: "Computer & Accessories", name: "HP EliteBook 1040 G8", desc: "16GB/512GB, Intel core i7-1165G7", price: 481.99, image: "images/1040 g8.jpg" },
    { id: "e19", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S22 Ultra", desc: "UK used, 128GB", price: 334.99, image: "images/s22 ultra.jpg" },
    { id: "e20", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S20", desc: "UK standard, 128GB", price: 149.99, image: "images/s20.jpg" },
    { id: "e21", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S10", desc: "UK standard, 128GB", price: 266.99, image: "images/s10.jpg" },
    { id: "e22", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S9", desc: "UK used, 64GB", price: 66.99, image: "images/s9.jpg" },
    { id: "e23", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy A07", desc: "Brand new, 6GB/128GB", price: 166.99, image: "images/a07.jpg" },
    { id: "e24", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 16", desc: "Open box, 128GB", price: 566.99, image: "images/iphone 16.jpg" },
    { id: "e25", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 17 pro", desc: "UK used,256GB", price: 866.99, image: "images/17 pro.jpg" },
    { id: "e26", subcategory: "Headphones & Speakers", name: "JBL Charge 5", desc: "Waterproof Bluetooth speaker.", price: 149.95, image: "images/charge 5.jpg" },
    { id: "e27", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone XR", desc: "128GB, BH 80, Screen strike", price: 244.99, image: "images/iphone xr.jpg" },
    { id: "e28", subcategory: "Game Consoles & Accessories", name: "PS5 slim with Two gamepads", desc: "Wireless controller, White, comes with box", price: 469.00, image: "images/ps5.jpg" },

    // MEN's FASHION
    { id: "m1", subcategory: "Clothing", name: "Classic Oxford Shirt", desc: "100% cotton button-down shirt.", price: 45.00, image: "https://picsum.photos/seed/m1/400/400" },
    // WOMEN's FASHION
    { id: "w1", subcategory: "Clothing", name: "Floral Summer Dress", desc: "Lightweight midi dress.", price: 48.00, image: "https://picsum.photos/seed/w1/400/400" },
    // HOME & KITCHEN
    { id: "h1", subcategory: "Kitchen & Dining", name: "Ninja Professional Blender", desc: "1000-watt power crushing technology.", price: 89.99, image: "https://picsum.photos/seed/h1/400/400" },
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
    updateNotificationUI(); 
    updateProfileUI(); // <-- ADD THIS LINE
});
