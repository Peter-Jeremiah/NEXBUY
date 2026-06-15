// ============================================================
//   NEXBUY AUTHENTICATION LOGIC
// ============================================================

const authForm = document.getElementById('auth-form');
const nameGroup = document.getElementById('name-group');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');

let isLoginMode = true;

// Toggle between Sign In and Register
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        // Switch to Login UI
        nameGroup.style.display = 'none';
        fullNameInput.removeAttribute('required');
        authTitle.innerText = 'Welcome Back';
        authSubtitle.innerText = 'Sign in to continue to your account.';
        authSubmitBtn.innerText = 'Sign In';
        toggleText.innerText = "Don't have an account?";
        toggleLink.innerText = 'Register here';
    } else {
        // Switch to Register UI
        nameGroup.style.display = 'block';
        fullNameInput.setAttribute('required', 'true');
        authTitle.innerText = 'Create an Account';
        authSubtitle.innerText = 'Join NexBuy to start shopping.';
        authSubmitBtn.innerText = 'Register';
        toggleText.innerText = "Already have an account?";
        toggleLink.innerText = 'Sign in here';
    }
});

// Handle Form Submission
authForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Gather User Data
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let name = "User"; // Default fallback
    
    if (!isLoginMode) {
        name = fullNameInput.value.trim();
    } else {
        // If logging in, attempt to retrieve existing name from local storage if they registered previously
        const existingUser = JSON.parse(localStorage.getItem('nexbuy_user'));
        if (existingUser && existingUser.name) {
            name = existingUser.name;
        }
    }

    // 2. Create the Profile Setting Object
    const userProfile = {
        name: name,
        email: email,
        isAuthenticated: true,
        joinedDate: new Date().toISOString()
    };

    // 3. Save to Local Storage (Simulating a database/session setup)
    localStorage.setItem('nexbuy_user', JSON.stringify(userProfile));

    // 4. Redirect to Home Page
    window.location.href = 'home.html';
});