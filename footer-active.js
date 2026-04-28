// Footer Active Link Management
class FooterActiveManager {
    constructor() {
        this.init();
    }

    init() {
        this.setActiveLinks();
    }

    setActiveLinks() {
        // Get current page filename
        const currentPath = window.location.pathname.split('/').pop() || 'home.html';
        
        // Define page mappings
        const pageMappings = {
            'home.html': {
                navLinks: [],
                helpLinks: []
            },
            'account.html': {
                navLinks: [],
                helpLinks: []
            },
            'cart.html': {
                navLinks: [],
                helpLinks: []
            },
            'checkout.html': {
                navLinks: [],
                helpLinks: []
            },
            'login.html': {
                navLinks: [],
                helpLinks: []
            },
            'policies.html': {
                navLinks: [],
                helpLinks: this.getPoliciesActiveLinks()
            },
            'about_us.html': {
                navLinks: [],
                helpLinks: []
            },
            'Tent_Cat.html': {
                navLinks: [],
                helpLinks: []
            },
            'news.html': {
                navLinks: [],
                helpLinks: []
            },
            'tent1.html': {
                navLinks: [],
                helpLinks: []
            },
            'wishlist.html': {
                navLinks: [],
                helpLinks: []
            },
            'contactus.html': {
                navLinks: [],
                helpLinks: []
            }
        };

        // Get current page configuration
        const pageConfig = pageMappings[currentPath] || pageMappings['home.html'];
        
        // Clear all existing active classes
        document.querySelectorAll('.active-link').forEach(link => {
            link.classList.remove('active-link');
        });
        
        document.querySelectorAll('.active-section').forEach(link => {
            link.classList.remove('active-section');
        });

        // Set active nav links
        pageConfig.navLinks.forEach(selector => {
            const link = document.querySelector(selector);
            if (link) {
                link.classList.add('active-link');
            }
        });

        // Set active help links (for policies page, check hash)
        pageConfig.helpLinks.forEach(selector => {
            const link = document.querySelector(selector);
            if (link) {
                link.classList.add('active-link');
            }
        });
    }

    getPoliciesActiveLinks() {
        // Get current hash for policies page
        const hash = window.location.hash.substring(1); // Remove # from hash
        
        const policyHashes = {
            'shipping-policy': 'a[href="policies.html#shipping-policy"]',
            'returns-refunds': 'a[href="policies.html#returns-refunds"]',
            'product-care': 'a[href="policies.html#product-care"]',
            'warranty-repair': 'a[href="policies.html#warranty-repair"]',
            'faq': 'a[href="policies.html#faq"]',
            'privacy': 'a[href="policies.html#privacy"]',
            'terms-service': 'a[href="policies.html#terms-service"]',
            'terms-conditions': 'a[href="policies.html#terms-conditions"]'
        };

        return policyHashes[hash] ? [policyHashes[hash]] : [];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FooterActiveManager();
});

// Handle hash changes for policies page
window.addEventListener('hashchange', () => {
    if (window.location.pathname.includes('policies.html')) {
        const manager = new FooterActiveManager();
    }
});
