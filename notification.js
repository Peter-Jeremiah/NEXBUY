/* ============================================================
   NOTIFICATION JS — OPay-style with tab filtering & dark mode
   ============================================================ */

const container      = document.getElementById('notifications-container');
const htmlElement    = document.documentElement;
const tabButtons     = document.querySelectorAll('.tab-btn');

// ---- 1. Theme Sync (reads the setting saved by home.js) ----
// We look for 'theme' to perfectly match what home.js saved
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);

// No event listeners needed here anymore since the toggle is gone!

// ---- 2. Notification Data (original content kept, categories added) ----
const notificationsData = [
    {
        category: 'transactions',
        title: 'Order Shipped',
        body: "Good news! Your order #84920 containing 'Wireless Earbuds' has been shipped and is on its way to your delivery address.",
        time: 'Today 09:12 AM'
    },
    {
        category: 'activities',
        title: 'Price Drop Alert',
        body: "An item in your wishlist just dropped in price by 15%. Grab it before it sells out!",
        time: 'Yesterday 04:30 PM'
    },
    {
        category: 'transactions',
        title: 'Payment Confirmed',
        body: "Your payment of $23.99 for 'Online Delivery — Express Pack' has been confirmed. Thank you for shopping with us!",
        time: 'Yesterday 11:05 AM'
    },
    {
        category: 'services',
        title: 'Delivery Update',
        body: "Your online delivery order is out for delivery. The rider is 2.4 km away. Expected arrival: 15–20 mins.",
        time: 'May 18, 2026  08:49 AM'
    },
    {
        category: 'services',
        title: 'New Service Available',
        body: "We now offer same-day delivery for orders placed before 12 PM. Upgrade your plan to enjoy blah blah blah premium perks!",
        time: 'May 18, 2026  07:00 AM'
    },
    {
        category: 'activities',
        title: 'Review Reminder',
        body: "You recently received 'Smart Home Speaker'. We'd love your feedback — drop a quick review to help fellow shoppers!",
        time: 'May 17, 2026  07:04 AM'
    },
    {
        category: 'transactions',
        title: 'Refund Processed',
        body: "A refund of $8.50 for your cancelled order #72304 has been processed. It will reflect in your wallet within 24 hours.",
        time: 'May 16, 2026  02:17 PM'
    },
    {
        category: 'activities',
        title: 'Flash Sale Starts Now',
        body: "Up to 40% off on electronics today only. Our online delivery blah blah blah deals are going fast — don't miss out!",
        time: 'May 15, 2026  10:00 AM'
    }
];

// ---- 3. Tab Filtering ----
let activeTab = 'all';

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        renderNotifications();
    });
});

// ---- 4. Badge label per category ----
function badgeHTML(category) {
    const labels = {
        transactions: 'Transaction',
        services:     'Service',
        activities:   'Activity'
    };
    return `<span class="notify-badge badge-${category}">${labels[category] || ''}</span>`;
}

// ---- 5. Icon SVG per category ----
function iconSVG(category) {
    const icons = {
        transactions: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.88 14.76V18h-1.75v-1.29c-1.06-.26-2.09-.98-2.18-2.38h1.55c.09.74.6 1.3 1.63 1.3 1.08 0 1.51-.56 1.51-1.14 0-.6-.36-1.13-1.63-1.44-1.65-.38-2.89-.98-2.89-2.48 0-1.13.92-1.97 2.01-2.23V7h1.75v1.36c1.16.3 1.81 1.23 1.84 2.35h-1.54c-.03-.78-.49-1.27-1.35-1.27-.81 0-1.35.42-1.35 1.06 0 .6.5 1.03 1.75 1.37 1.6.41 2.79 1.06 2.79 2.55 0 1.22-.93 2.02-2.14 2.34z"/>`,
        services:     `<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>`,
        activities:   `<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>`
    };
    return icons[category] || icons['activities'];
}

// ---- 6. Constants ----
const ANIMATION_DELAY = 0.06;

// ---- 7. Render ----
function renderNotifications() {
    const filtered = activeTab === 'all'
        ? notificationsData
        : notificationsData.filter(n => n.category === activeTab);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                <h3>No notifications here</h3>
            </div>`;
        return;
    }

    container.innerHTML = filtered.map((item, i) => `
        <div class="notify-card" style="animation-delay:${i * ANIMATION_DELAY}s">
            <div class="notify-card-header">
                <div class="notify-icon">
                    <svg viewBox="0 0 24 24">${iconSVG(item.category)}</svg>
                </div>
                <span class="notify-title">${item.title}</span>
                ${badgeHTML(item.category)}
            </div>
            <div class="notify-body">${item.body}</div>
            <div class="notify-footer">
                <span class="notify-date">${item.time}</span>
                <a href="#" class="notify-view">View</a>
            </div>
        </div>
    `).join('');
}

renderNotifications();

// ---- 7. Broadcast Count to Home Page ----
// Save the exact length of the array to localStorage
localStorage.setItem('notifCount', notificationsData.length);

// ---- 8. Update Section Counter ----
const moreBtn = document.getElementById('more-btn');
const settingsDropdown = document.getElementById('settings-dropdown');
const pushToggle = document.getElementById('push-toggle');

// Open/Close dropdown when clicking the 3 lines
moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('show');
});

// Close when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsDropdown.contains(e.target) && !moreBtn.contains(e.target)) {
        settingsDropdown.classList.remove('show');
    }
});

// Keep dropdown open when clicking the switches
settingsDropdown.addEventListener('click', (e) => e.stopPropagation());

// Load saved preferences
if (localStorage.getItem('pushEnabled') === 'false') pushToggle.checked = false;

// Save preferences when clicked
pushToggle.addEventListener('change', (e) => localStorage.setItem('pushEnabled', e.target.checked));
