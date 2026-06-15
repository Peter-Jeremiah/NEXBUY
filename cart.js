// ============================================================
//   CART PAGE JS
// ============================================================

const cartContainer = document.getElementById('cart-container');
const summaryItems = document.getElementById('summary-items');
const summaryTotal = document.getElementById('summary-total');
const cartItemCount = document.getElementById('cart-item-count');

// Load cart and product database from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// storeProducts is now globally available via data.js

function getProductDetails(id) {
    // Search the master array for the matching product
    const product = storeProducts.find(p => p.id === id);
    
    if (product) {
        return product;
    } else {
        return { id: id, name: "Unknown Item", price: 0, image: "" };
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ... Keep your existing renderCart() function exactly as it is below this line! ...

function renderCart() {
    const cartKeys = Object.keys(cart);
    
    // Empty State
    if (cartKeys.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 0; color: var(--text-sub);">
                <svg viewBox="0 0 24 24" style="width: 60px; height: 60px; fill: currentColor; margin-bottom: 10px;">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <h2>Your cart is empty</h2>
                <a href="index.html" style="color: var(--accent); text-decoration: none; margin-top: 10px; display: inline-block;">Continue Shopping</a>
            </div>`;
        
        cartItemCount.innerText = 'Shopping Cart';
        summaryItems.innerText = '0';
        
        // FIX: Change $0.00 to ₦0.00 here
        summaryTotal.innerText = '₦0.00'; 
        
        return;
    }

    let html = '';
    let totalAmount = 0;
    let totalItems = 0;

    // Render each item
    cartKeys.forEach(id => {
        const product = getProductDetails(id);
        const qty = cart[id];
        
        totalAmount += (product.price * qty);
        totalItems += qty;

        html += `
            <div class="cart-item">
                <img src="${product.image}" class="cart-img" style="object-fit: cover; background-color: #fff;">
                <div class="cart-details">
                    <div class="cart-title">${product.name}</div>
                    <div class="cart-price">₦${Math.round(product.price).toLocaleString('en-NG')}</div>
                    
                    <div class="cart-actions">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty('${id}', -1)">−</button>
                            <span class="qty-display">${qty}</span>
                            <button class="qty-btn" onclick="updateQty('${id}', 1)">+</button>
                        </div>
                        <button class="delete-btn" onclick="removeItem('${id}')">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });

    // Update the DOM (create element to prevent XSS)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    cartContainer.replaceChildren(...tempDiv.childNodes);
    cartItemCount.textContent = `Shopping Cart (${totalItems} items)`;
    summaryItems.textContent = totalItems;
    
    // UPDATE THIS LINE:
    summaryTotal.textContent = `₦${Math.round(totalAmount).toLocaleString('en-NG')}`;
}

// Control Functions
window.updateQty = function(id, change) {
    cart[id] += change;
    if (cart[id] <= 0) {
        delete cart[id];
    }
    saveCart();
    renderCart();
};

window.removeItem = function(id) {
    delete cart[id];
    saveCart();
    renderCart();
};

// Initial Render
renderCart();