// Track menu state
const menuState = {
    megaMenuVisible: false,
    accountMenuVisible: false
};

// Save menu state
function saveMenuState() {
    sessionStorage.setItem('menuState', JSON.stringify(menuState));
}

// Load menu state
function loadMenuState() {
    const savedState = sessionStorage.getItem('menuState');
    if (savedState) {
        Object.assign(menuState, JSON.parse(savedState));
    }
}

// Initialize mega menu
function initializeMegaMenu() {
    // Skip if already exists
    if (document.querySelector('.custom-mega-menu')) return;
    
    const productsMenu = document.querySelector('a[href*="/shop/products/all"], a[href*="/products/all"]');
    if (!productsMenu) return;

    const megaMenu = document.createElement("div");
    megaMenu.classList.add("custom-mega-menu");
    megaMenu.innerHTML = `
        <div class="mega-menu-grid">
            <div class="mega-column">
                <h3>T-Shirts</h3>
                <a href="/tshirt_source/shop/products/t_shirts/long_sleeve">Long Sleeve<span class="popular">Popular</span></a>
                <a href="/tshirt_source/shop/products/t_shirts/short_sleeve">Short Sleeve</a>
            </div>
            <div class="mega-column">
                <h3>Fleece</h3>
                <a href="/tshirt_source/shop/products/fleece/hoodies">Hoodies</a>
                <a href="/tshirt_source/shop/products/fleece/crewneck_sweatshirt">Crewneck Sweatshirt</a>
                <h3>Hats</h3>
                <a href="/tshirt_source/shop/products/hats/trucker_hats">Trucker hat</a>
                <a href="/tshirt_source/shop/products/hats/dad_hats">Dad hat</a>
                <a href="/tshirt_source/shop/products/hats/beanies">Beanies<span class="popular">Popular</span></a>
            </div>
            <div class="mega-column">
                <h3>Jackets</h3>
                <a href="/tshirt_source/shop/products/jackets/soft_shell">Soft Shell</a>
                <a href="/tshirt_source/shop/products/jackets/windbreakers">Windbreakers</a>
            </div>
            <div class="mega-column">
                <h3>Polos</h3>
                <a href="/tshirt_source/shop/products/polos/unisex">Unisex</a>
                <a href="/tshirt_source/shop/products/polos/women">Women</a>
            </div>
        </div>`;
    
    productsMenu.parentNode.appendChild(megaMenu);
    
    // Apply saved state
    if (menuState.megaMenuVisible) {
        megaMenu.style.display = "block";
    }
    
    // Add hover events
    productsMenu.addEventListener('mouseenter', () => {
        megaMenu.style.display = "block";
        menuState.megaMenuVisible = true;
        saveMenuState();
    });
    
    megaMenu.addEventListener('mouseenter', () => {
        megaMenu.style.display = "block";
        menuState.megaMenuVisible = true;
        saveMenuState();
    });
    
    megaMenu.addEventListener('mouseleave', () => {
        megaMenu.style.display = "none";
        menuState.megaMenuVisible = false;
        saveMenuState();
    });
}

// Initialize account mega menu
function initializeAccountMegaMenu() {
    // Load menu state first
    loadMenuState();
    
    // Clear any existing observer to prevent duplicates
    if (window.accountMenuObserver) {
        window.accountMenuObserver.disconnect();
    }

    // Check if we already have a mega menu
    const existingMenu = document.querySelector('.account-mega-menu');
    if (existingMenu) {
        // Apply saved state if menu exists
        existingMenu.style.display = menuState.accountMenuVisible ? "block" : "none";
        return;
    }

    // Try multiple selectors to find the account menu
    const accountMenu = document.querySelector('#myAccountDropdown, [href*="/my-account"], .account-link');
    
    if (!accountMenu) {
        // If not found, set up an observer to watch for it
        window.accountMenuObserver = new MutationObserver((mutations) => {
            mutations.forEach(() => {
                if (document.querySelector('#myAccountDropdown, [href*="/my-account"], .account-link')) {
                    createAccountMegaMenu();
                    window.accountMenuObserver.disconnect();
                }
            });
        });

        window.accountMenuObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        return;
    }

    createAccountMegaMenu();
}

function createAccountMegaMenu() {
    const accountMenu = document.querySelector('#myAccountDropdown, [href*="/my-account"], .account-link');
    if (!accountMenu) return;

    // Remove any existing account mega menu first
    document.querySelectorAll('.account-mega-menu').forEach(menu => menu.remove());

    const accountMegaMenu = document.createElement("div");
    accountMegaMenu.classList.add("account-mega-menu");
    accountMegaMenu.innerHTML = `
        <div class="mega-menu-grid">
            <div class="mega-column">
                <h3>My Account</h3>
                <a href="/TShirt_Source/shop/my-account">Account Overview</a>
                <a href="/TShirt_Source/shop/my-account/profile">Profile</a>
                <a href="/TShirt_Source/shop/my-account/address-book">Address Book</a>
                <a href="/TShirt_Source/shop/my-account/payment-methods">Payment Methods</a>
            </div>
            <div class="mega-column">
                <h3>My Orders</h3>
                <a href="/TShirt_Source/shop/my-account/quotes-and-invoices">Quotes & Invoices</a>
                <a href="/TShirt_Source/shop/my-account/orders">Order History</a>
            </div>
            <div class="mega-column">
                <h3>My Designs</h3>
                <a href="/TShirt_Source/shop/my-account/designs">Saved Designs</a>
                <a href="/TShirt_Source/shop/my-account/uploads">Uploads</a>
            </div>
        </div>`;
    
    // Insert the mega menu in a consistent location
    const header = document.querySelector('header') || document.body;
    header.appendChild(accountMegaMenu);

    // Apply saved state
    accountMegaMenu.style.display = menuState.accountMenuVisible ? "block" : "none";

    // Use more reliable event delegation for hover handling
    document.addEventListener('mouseover', (e) => {
        const isAccountMenu = e.target.closest('#myAccountDropdown, [href*="/my-account"], .account-link');
        const isMegaMenu = e.target.closest('.account-mega-menu');
        
        if (isAccountMenu || isMegaMenu) {
            accountMegaMenu.style.display = "block";
            menuState.accountMenuVisible = true;
            saveMenuState();
        }
    });

    document.addEventListener('mouseout', (e) => {
        const related = e.relatedTarget || e.toElement;
        const isLeavingMenu = !related || 
                            (!related.closest('#myAccountDropdown, [href*="/my-account"], .account-link') && 
                             !related.closest('.account-mega-menu'));
        
        if (isLeavingMenu) {
            accountMegaMenu.style.display = "none";
            menuState.accountMenuVisible = false;
            saveMenuState();
        }
    });

    // Reinitialize after navigation
    setupAccountMenuNavigationObserver();
}

function setupAccountMenuNavigationObserver() {
    if (window.accountMenuNavObserver) {
        window.accountMenuNavObserver.disconnect();
    }
    
    window.accountMenuNavObserver = new MutationObserver(() => {
        if (!document.querySelector('.account-mega-menu')) {
            initializeAccountMegaMenu();
        }
    });
    
    window.accountMenuNavObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Watch for navigation changes and reinitialize
const menuObserver = new MutationObserver(() => {
    if (!document.querySelector('.custom-mega-menu')) {
        initializeMegaMenu();
    }
});

menuObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Export functions if needed
export { initializeMegaMenu, initializeAccountMegaMenu };
