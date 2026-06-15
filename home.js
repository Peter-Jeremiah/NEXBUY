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

const searchInput = document.querySelector('.search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = storeProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.desc.toLowerCase().includes(query) ||
            p.subcategory.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });
}

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

// --- 6. DATA HUB ---
// (storeProducts array has been abstracted and made global via data.js)


// 2. FIX: Add the missing render function
function renderProducts(filterCategoryOrArray) {
    // Clear the current grid
    productGrid.innerHTML = ''; 

    // Filter the products based on the category
    let filteredProducts;
    if (Array.isArray(filterCategoryOrArray)) {
        filteredProducts = filterCategoryOrArray;
    } else {
        filteredProducts = filterCategoryOrArray === 'all' 
            ? storeProducts 
            : storeProducts.filter(p => p.subcategory === filterCategoryOrArray);
    }

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

// Load User Profile Data
function loadUserProfile() {
    const userData = JSON.parse(localStorage.getItem('nexbuy_user'));
    const profileInitialElement = document.getElementById('home-profile-initial');
    
    if (userData && userData.name && profileInitialElement) {
        // Extract the first letter of the user's name
        const initial = userData.name.charAt(0).toUpperCase();
        profileInitialElement.innerText = initial;
    }
}

// Call it on page load
loadUserProfile();