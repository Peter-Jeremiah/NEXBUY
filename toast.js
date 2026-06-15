// Inject the CSS required for the toasts
const style = document.createElement('style');
style.innerHTML = `
    #toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
    .toast { background: var(--bg-card, #ffffff); color: var(--text-main, #1a1a2a); padding: 16px 24px; border-radius: 8px; font-size: 14.5px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); opacity: 0; transform: translateX(100%); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--border-color, #e2e5ec); border-left: 4px solid #10b981; }
    .toast.toast-error { border-left-color: #ef4444; }
    .toast.show { opacity: 1; transform: translateX(0); }
`;
document.head.appendChild(style);

// Expose the global showToast function
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10); // Animate in
    setTimeout(() => {
        toast.classList.remove('show'); // Animate out
        setTimeout(() => toast.remove(), 300); // Remove from DOM safely
    }, 3000); // Life span
};