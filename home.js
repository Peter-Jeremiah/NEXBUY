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
const floatingGift = document.getElementById('floating-gift');

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

// --- 7. FLOATING GIFT BOX - DRAG & DROP ---
let isDraggingGift = false;
let giftOffsetX = 0;
let giftOffsetY = 0;
let giftStartX = 0;
let giftStartY = 0;

// Load saved gift position from localStorage
function loadGiftPosition() {
    const savedPos = localStorage.getItem('giftBoxPos');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        floatingGift.style.right = 'auto';
        floatingGift.style.bottom = 'auto';
        floatingGift.style.left = pos.x + 'px';
        floatingGift.style.top = pos.y + 'px';
    }
}

// Save gift position to localStorage
function saveGiftPosition() {
    const rect = floatingGift.getBoundingClientRect();
    const pos = {
        x: floatingGift.style.left ? parseInt(floatingGift.style.left) : rect.left,
        y: floatingGift.style.top ? parseInt(floatingGift.style.top) : rect.top
    };
    localStorage.setItem('giftBoxPos', JSON.stringify(pos));
}

// Mouse down - start dragging
floatingGift.addEventListener('mousedown', (e) => {
    isDraggingGift = true;
    const rect = floatingGift.getBoundingClientRect();
    giftStartX = e.clientX;
    giftStartY = e.clientY;
    giftOffsetX = rect.left;
    giftOffsetY = rect.top;
    floatingGift.style.animation = 'none'; // Pause animations while dragging
});

// Mouse move - drag the gift
document.addEventListener('mousemove', (e) => {
    if (!isDraggingGift) return;
    
    const deltaX = e.clientX - giftStartX;
    const deltaY = e.clientY - giftStartY;
    
    let newX = giftOffsetX + deltaX;
    let newY = giftOffsetY + deltaY;
    
    // Keep gift within viewport bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - 80));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 80));
    
    floatingGift.style.left = newX + 'px';
    floatingGift.style.top = newY + 'px';
    floatingGift.style.right = 'auto';
    floatingGift.style.bottom = 'auto';
});

// Mouse up - stop dragging
document.addEventListener('mouseup', () => {
    if (isDraggingGift) {
        isDraggingGift = false;
        floatingGift.style.animation = ''; // Resume animations
        saveGiftPosition();
    }
});

// Load saved position on page load
loadGiftPosition();

// --- 6. DATA HUB (56 BRANDED PROTOTYPE ITEMS) ---
const storeProducts = [
    // ELECTRONICS
    { id: "e1", subcategory: "Headphones & Speakers", name: "Sony WH-1000XM5", desc: "Noise canceling wireless headphones.", longDesc: "Experience industry-leading noise cancellation, exceptional sound quality, and all-day comfort with the Sony WH-1000XM5. Features a 30-hour battery life and multi-point Bluetooth connection.", price: 420000, image: "images/1000xm5.jpg", rating: 4.8, reviews: 1245 },
    { id: "e2", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S21", desc: "UK used, 128GB", longDesc: "This UK used Samsung Galaxy S21 offers flagship performance with its 128GB storage, pro-grade camera, and stunning 120Hz display. Fully tested and verified to be in excellent working condition.", price: 200000, image: "images/s21.jpg", rating: 4.5, reviews: 342 },
    { id: "e3", subcategory: "Mobile Phones & Accessories", name: "Apple Watch Series 3", desc: "Used apple watch", longDesc: "Track your health, stay connected, and get motivated with this Apple Watch Series 3. Includes standard fitness tracking features, water resistance, and pairs seamlessly with your iPhone.", price: 120000, image: "images/apple watch.jpg", rating: 4.2, reviews: 89 },
    { id: "e4", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11 pro max", desc: "UK used, 128GB", longDesc: "Get the most out of your smartphone experience with this UK used Apple iPhone 11 Pro Max. Featuring 128GB of storage, a stunning Super Retina XDR display, and an advanced triple-camera system for professional-grade photos and videos.", price: 300000, image: "images/11 pro max.jpg", rating: 4.7, reviews: 512 },
    { id: "e5", subcategory: "Mobile Phones & Accessories", name: "Apple iPad 11", desc: "UK used, 256GB", longDesc: "This UK used Apple iPad 11 offers incredible versatility and power. With a generous 256GB of storage, it's perfect for sketching, taking notes, streaming, and light productivity tasks on its beautiful Liquid Retina display.", price: 320000, image: "images/ipad 11.jpg", rating: 4.6, reviews: 275 },
    { id: "e6", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 12", desc: "IDM, IBM, Battery health: 85", longDesc: "Step up to 5G speed with this Apple iPhone 12. Verified to have 85% battery health, this device delivers excellent performance, a durable Ceramic Shield front, and an advanced dual-camera system with Night mode.", price: 240000, image: "images/iphone 12.jpg", rating: 4.3, reviews: 156 },
    { id: "e7", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 14 pro", desc: "Open box, 128GB BH 100, LLA 2Sim", longDesc: "Like-new open box Apple iPhone 14 Pro with 100% battery health. This LLA model supports dual SIM and comes with 128GB storage, featuring the innovative Dynamic Island and an incredible 48MP Main camera for breathtaking detail.", price: 520000, image: "images/14 pro.jpg", rating: 4.9, reviews: 88 },
    { id: "e8", subcategory: "Computer & Accessories", name: "Dell Latitiude 7490", desc: "16GB/512GB, Intel core i7-8650U", longDesc: "Boost your productivity with the Dell Latitude 7490. Powered by an Intel Core i7-8650U processor, 16GB of RAM, and a fast 512GB SSD, this business-class laptop provides reliable performance and robust security features for professionals on the go.", price: 410000, image: "images/7490.jpg", rating: 4.4, reviews: 112 },
    { id: "e9", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 12 pro", desc: "Open box, 128GB, BH 69", longDesc: "An open box Apple iPhone 12 Pro offering a premium smartphone experience with 128GB storage. Note: Battery health is at 69%. Enjoy the stunning surgical-grade stainless steel design, Pro camera system, and LiDAR Scanner.", price: 310000, image: "images/12 pro.jpg", rating: 4.1, reviews: 45 },
    { id: "e10", subcategory: "Headphones & Speakers", name: "JBL BoomBox 3", desc: "Brand New Sealed, Green", longDesc: "Bring the party anywhere with the brand new, sealed JBL BoomBox 3 in green. Experience massive JBL Original Pro Sound, deep bass, and up to 24 hours of playtime. Its IP67 dust and water-proof design makes it perfect for outdoor adventures.", price: 570000, image: "images/boombox 3.jpg", rating: 4.8, reviews: 230 },
    { id: "e11", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11 pro", desc: "UK used, 64GB, IDM, BH 87.", longDesc: "This UK used Apple iPhone 11 Pro comes with 64GB of storage and a healthy 87% battery life. Capture amazing photos with its triple-camera setup and enjoy smooth performance thanks to the A13 Bionic chip.", price: 260000, image: "images/11 pro.jpg", rating: 4.5, reviews: 198 },
    { id: "e12", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 11", desc: "UK standard, 128GB, BH 86", longDesc: "A reliable UK standard Apple iPhone 11 boasting 128GB storage and 86% battery health. Shoot 4K video, beautiful portraits, and sweeping landscapes with the dual-camera system, all powered by an all-day battery.", price: 210000, image: "images/iphone 11.jpg", rating: 4.6, reviews: 876 },
    { id: "e13", subcategory: "Computer & Accessories", name: "Hp EliteBook 850 G7", desc: "UK used, 8GB/256GB, Intel core i5-10365U", longDesc: "The HP EliteBook 850 G7 is a premium UK used laptop tailored for business. Equipped with an Intel Core i5-10365U, 8GB of RAM, and a 256GB SSD, it delivers crisp visuals and snappy performance in a sleek, lightweight aluminum chassis.", price: 480000, image: "images/850 g7.jpg", rating: 4.3, reviews: 92 },
    { id: "e14", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone X", desc: "UK standard, 64GB, BH 72", longDesc: "Experience the device that revolutionized the iPhone design. This UK standard Apple iPhone X includes 64GB storage and 72% battery health. Features a beautiful 5.8-inch Super Retina display and Face ID for secure authentication.", price: 170000, image: "images/iphone x.jpg", rating: 4.0, reviews: 654 },
    { id: "e15", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S25", desc: "UK used, 128GB,", longDesc: "Stay ahead of the curve with this UK used Samsung Galaxy S25. Featuring 128GB of storage, cutting-edge AI features, and a brilliantly vibrant display, it's engineered to provide top-tier flagship performance for all your daily needs.", price: 680000, image: "images/s25.jpg", rating: 5.0, reviews: 12 },
    { id: "e16", subcategory: "Headphones & Speakers", name: "Samsung Galaxy Bud 3 pro", desc: "Samsung earpods,Brand new, silver", longDesc: "Immerse yourself in premium audio with the brand new Samsung Galaxy Buds 3 Pro in Silver. Enjoy intelligent active noise cancellation, a comfortable ergonomic fit, and studio-quality sound tuning for music and calls.", price: 145000, image: "images/buds 3 pro.jpg", rating: 4.7, reviews: 34 },
    { id: "e17", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S22", desc: "UK used, 256GB", longDesc: "Capture the night with brilliant photography on this UK used Samsung Galaxy S22. Offering a generous 256GB of storage and a dynamic AMOLED 2X display, this device strikes the perfect balance between pocketable size and flagship power.", price: 240000, image: "images/s22.jpg", rating: 4.6, reviews: 412 },
    { id: "e18", subcategory: "Computer & Accessories", name: "HP EliteBook 1040 G8", desc: "16GB/512GB, Intel core i7-1165G7", longDesc: "An elite computing experience awaits with the HP EliteBook 1040 G8. Driven by a powerful Intel Core i7-1165G7 processor, 16GB RAM, and a 512GB SSD, this ultrabook is crafted for maximum productivity, security, and enterprise-grade collaboration.", price: 650000, image: "images/1040 g8.jpg", rating: 4.5, reviews: 67 },
    { id: "e19", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S22 Ultra", desc: "UK used, 128GB", longDesc: "Unleash your creativity with the UK used Samsung Galaxy S22 Ultra. Featuring 128GB storage, an integrated S Pen for precision note-taking, and an epic 108MP camera array, it represents the pinnacle of Samsung's smartphone engineering.", price: 320000, image: "images/s22 ultra.jpg", rating: 4.8, reviews: 289 },
    { id: "e20", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S20", desc: "UK standard, 128GB", longDesc: "A compact powerhouse, this UK standard Samsung Galaxy S20 provides 128GB of storage and a smooth 120Hz display. Its versatile triple camera system and sleek design make it an excellent choice for everyday flagship performance.", price: 170000, image: "images/s20.jpg", rating: 4.4, reviews: 521 },
    { id: "e21", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S10", desc: "UK standard, 128GB", longDesc: "This UK standard Samsung Galaxy S10 combines elegant design with robust performance. With 128GB of storage, an Infinity-O display, and an ultrasonic fingerprint sensor, it continues to deliver a premium user experience.", price: 200000, image: "images/s10.jpg", rating: 4.3, reviews: 832 },
    { id: "e22", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy S9", desc: "UK used, 64GB", longDesc: "The UK used Samsung Galaxy S9 features a revolutionary camera that adapts like the human eye. Complete with 64GB of storage, stereo speakers tuned by AKG, and a gorgeous curved Infinity Display.", price: 90000, image: "images/s9.jpg", rating: 4.1, reviews: 1024 },
    { id: "e23", subcategory: "Mobile Phones & Accessories", name: "Samsung Galaxy A07", desc: "Brand new, 6GB/128GB", longDesc: "Enjoy incredible value with the brand new Samsung Galaxy A07. Boasting 6GB of RAM and 128GB of storage, it offers smooth multitasking, a large battery for all-day use, and a vibrant display perfect for streaming and social media.", price: 210000, image: "images/a07.jpg", rating: 4.6, reviews: 45 },
    { id: "e24", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 16", desc: "Open box, 128GB", longDesc: "Get your hands on the latest tech with this open box Apple iPhone 16. It includes 128GB of storage, the newest A-series bionic chip for unparalleled efficiency, and next-generation computational photography capabilities.", price: 850000, image: "images/iphone 16.jpg", rating: 4.9, reviews: 115 },
    { id: "e25", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 17 pro", desc: "UK used,256GB", longDesc: "Experience the future with this UK used Apple iPhone 17 Pro. Offering a massive 256GB of storage, a revolutionary titanium build, and pro-level cameras designed to shoot cinematic quality footage wherever you go.", price: 1600000, image: "images/17 pro.jpg", rating: 5.0, reviews: 8 },
    { id: "e26", subcategory: "Headphones & Speakers", name: "JBL Charge 5", desc: "Waterproof Bluetooth speaker.", longDesc: "Take your music on the go with the JBL Charge 5. This waterproof and dustproof Bluetooth speaker delivers bold JBL Original Pro Sound and features a built-in powerbank to keep your devices charged while you party.", price: 250000, image: "images/charge 5.jpg", rating: 4.8, reviews: 1432 },
    { id: "e27", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone XR", desc: "128GB, BH 80, Screen strike", longDesc: "A budget-friendly entry into the iOS ecosystem. This Apple iPhone XR has 128GB storage and 80% battery health. Note: Device has a 'screen strike' (minor display damage), but functions perfectly with Face ID and the capable A12 Bionic chip.", price: 170000, image: "images/iphone xr.jpg", rating: 3.8, reviews: 256 },
    { id: "e28", subcategory: "Game Consoles & Accessories", name: "PS5 slim with Two gamepads", desc: "Wireless controller, White, comes with box", longDesc: "Immerse yourself in next-gen gaming with this PlayStation 5 Slim console. Comes complete in the original box with two white DualSense wireless controllers, offering lightning-fast loading, haptic feedback, and breathtaking 4K graphics.", price: 600000, image: "images/ps5.jpg", rating: 4.9, reviews: 678 },
    { id: "e29", subcategory: "Mobile Phones & Accessories", name: "Apple iPhone 8", desc: "64GB, UK available", longDesc: "A budget-friendly entry into the iOS ecosystem. This Apple iPhone 8 has 64GB storage,but functions perfectly with the capable A10 Bionic chip.", price: 110000, image: "images/iphone 8.jpg", rating: 3.1, reviews: 190 },

    // MEN's FASHION
    { id: "m1", subcategory: "Clothing", name: "Classic Oxford Shirt", desc: "100% cotton button-down shirt.", longDesc: "Elevate your wardrobe with our Classic Oxford Shirt. Woven from 100% premium cotton, this button-down features a tailored fit, reinforced stitching, and a breathable design that easily transitions from the office to casual weekend wear.", price: 45.00, image: "https://picsum.photos/seed/m1/400/400", rating: 4.5, reviews: 120 },
    // WOMEN's FASHION
    { id: "w1", subcategory: "Clothing", name: "Floral Summer Dress", desc: "Lightweight midi dress.", longDesc: "Embrace the warm weather in this beautiful Floral Summer Dress. This lightweight midi features a flattering silhouette, vibrant floral prints, and soft, airy fabric that keeps you cool and comfortable all day long.", price: 48.00, image: "https://picsum.photos/seed/w1/400/400", rating: 4.7, reviews: 205 },
    // HOME & KITCHEN
    { id: "h1", subcategory: "Kitchen & Dining", name: "Ninja Professional Blender", desc: "1000-watt power crushing technology.", longDesc: "The Ninja Professional Blender features 1000 watts of professional power to easily crush ice, blend smoothies, and puree ingredients. Its large capacity pitcher is perfect for making drinks for the whole family.", price: 89.99, image: "https://picsum.photos/seed/h1/400/400", rating: 4.8, reviews: 3400 },
      // ... your previous products ...
    { id: "h6", subcategory: "Vacuums & Floor Care", name: "Robot Vacuum Cleaner", desc: "Smart navigation auto-charging.", longDesc: "Keep your floors spotless with zero effort. This Robot Vacuum Cleaner utilizes smart navigation to effortlessly map your home, tackle dirt and pet hair, and automatically return to its dock to recharge when the battery runs low.", price: 249.99, image: "https://picsum.photos/seed/h6/400/400", rating: 4.4, reviews: 890 },
    // 1. FIX: Close the string and the array properly
    { id: "h7", subcategory: "Home Décor", name: "Essential Oil Diffuser", desc: "Aromatherapy diffuser with LED lights.", longDesc: "Transform your living space into a calming oasis. This elegant Essential Oil Diffuser features whisper-quiet ultrasonic technology, auto shut-off, and soothing color-changing LED lights to enhance your home's ambiance and promote relaxation.", price: 25.00, image: "https://picsum.photos/seed/h7/400/400", rating: 4.6, reviews: 560 }
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

        // Generate Tiny Star Ratings HTML
        let ratingHtml = '';
        if (product.rating && product.reviews) {
            let stars = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="#fbbf24"/><stop offset="50%" stop-color="var(--border-color)"/></linearGradient></defs></svg>';
            for (let i = 1; i <= 5; i++) {
                if (product.rating >= i) {
                    stars += '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                } else if (product.rating >= i - 0.5) {
                    stars += '<svg width="14" height="14" viewBox="0 0 24 24" fill="url(#halfGrad)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                } else {
                    stars += '<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--border-color)"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                }
            }
            ratingHtml = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 2px; margin-bottom: 6px; font-size: 12px; color: var(--text-sub);">
                    ${stars}
                    <span style="margin-left:4px; font-weight:bold; color:var(--text-main);">${product.rating}</span>
                    <span style="margin-left:2px;">(${product.reviews})</span>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <h4 onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-secondary)'" onmouseout="this.style.color='inherit'">${product.name}</h4>
            <span class="description">${product.desc}</span>
            <div class="price">₦${Math.round(product.price).toLocaleString('en-NG')}</div>
            ${ratingHtml}
            
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
renderProducts('all');
updateCartUI();
updateNotificationUI();