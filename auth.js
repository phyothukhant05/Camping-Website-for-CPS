// Authentication System
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.checkAuthOnLoad();
    }

    createModal() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="authModal">
                <div class="auth-modal">
                    <div class="auth-modal-icon">
                        <i class="fa-regular fa-user"></i>
                    </div>
                    <h2 id="modalTitle">Account Required</h2>
                    <p id="modalMessage">You need to create an account to access this feature.</p>
                    <div class="auth-modal-actions">
                        <a href="login.html" class="auth-modal-btn primary" id="modalPrimaryBtn">Create Account</a>
                        <button class="auth-modal-btn secondary" id="modalSecondaryBtn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('authModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.modalPrimaryBtn = document.getElementById('modalPrimaryBtn');
        this.modalSecondaryBtn = document.getElementById('modalSecondaryBtn');
    }

    bindEvents() {
        // Close modal on secondary button click
        this.modalSecondaryBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    checkAuthOnLoad() {
        // Update account button behavior based on auth status
        const accountBtns = document.querySelectorAll('a[href="account.html"]');
        accountBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAccountClick(e));
        });
    }

    isAuthenticated() {
        return localStorage.getItem('currentUser') !== null;
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    handleAccountClick(e) {
        if (!this.isAuthenticated()) {
            e.preventDefault();
            this.showModal('login', 'Login Required', 'Please login or create an account to access your profile.');
        }
    }

    showModal(type, title, message) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        
        // Update primary button based on type
        if (type === 'login') {
            this.modalPrimaryBtn.textContent = 'Login / Sign Up';
            this.modalPrimaryBtn.href = 'login.html';
        } else if (type === 'checkout') {
            this.modalPrimaryBtn.textContent = 'Create Account';
            this.modalPrimaryBtn.href = 'login.html';
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    requireAuth(callback, type = 'login') {
        if (this.isAuthenticated()) {
            callback();
        } else {
            this.showModal(type, 'Account Required', 'You need to create an account to continue.');
            // Store the callback to be executed after login
            this.pendingCallback = callback;
        }
    }

    executePendingCallback() {
        if (this.pendingCallback) {
            this.pendingCallback();
            this.pendingCallback = null;
        }
    }

    logout() {
        // Clear user data from localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('returnTo');
        
        // Show logout confirmation modal
        this.showModal('login', 'Logged Out Successfully', 'You have been logged out. You can create a new account or login again.');
        
        // Update UI elements that depend on authentication
        this.updateAuthUI();
    }

    updateAuthUI() {
        // This method can be called to update UI elements after logout
        // For example, update navbar, show/hide authenticated content, etc.
        const accountBtns = document.querySelectorAll('a[href="account.html"]');
        accountBtns.forEach(btn => {
            btn.classList.remove('authenticated');
        });
    }

    initLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            });
        }
    }
}

// Checkout protection
class CheckoutProtection {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.init();
    }

    init() {
        // Check if we're on checkout page
        if (window.location.pathname.includes('checkout.html')) {
            this.protectCheckout();
        }

        // Protect checkout links
        this.protectCheckoutLinks();
    }

    protectCheckout() {
        if (!this.authSystem.isAuthenticated()) {
            // Redirect to login with checkout return
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `login.html?return=${currentUrl}`;
        }
    }

    protectCheckoutLinks() {
        const checkoutLinks = document.querySelectorAll('a[href="checkout.html"]');
        checkoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.authSystem.isAuthenticated()) {
                    e.preventDefault();
                    this.authSystem.showModal('checkout', 'Account Required', 'Please create an account to proceed with checkout.');
                }
            });
        });
    }
}

// Initialize the auth system
document.addEventListener('DOMContentLoaded', () => {
    const authSystem = new AuthSystem();
    const checkoutProtection = new CheckoutProtection(authSystem);
    
    // Make authSystem globally accessible
    window.authSystem = authSystem;
    
    // Initialize logout button if it exists
    authSystem.initLogoutButton();
    
    // Check for return URL after login
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('return');
    
    if (returnTo && window.location.pathname.includes('login.html')) {
        // Store return URL for after login
        localStorage.setItem('returnTo', returnTo);
    }
    
    // Handle successful login redirect
    if (window.location.pathname.includes('account.html')) {
        const returnUrl = localStorage.getItem('returnTo');
        if (returnUrl) {
            localStorage.removeItem('returnTo');
            // Redirect back to original page after a short delay
            setTimeout(() => {
                window.location.href = returnUrl;
            }, 2000);
        }
    }
});
