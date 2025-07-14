// menu.js

// Mega menu toggle functionality
function initializeMegaMenu() {
  const toggle = document.querySelector(".menu-toggle-icon");
  const menu = document.querySelector(".custom-mega-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isVisible = menu.classList.toggle("show");
    window.menuState.megaMenuVisible = isVisible;
    window.saveMenuState();
  });

  // Restore menu state on load
  if (window.menuState.megaMenuVisible) {
    menu.classList.add("show");
  }
}

// Account menu toggle functionality
function initializeAccountMenu() {
  const toggle = document.querySelector(".account-toggle-icon");
  const menu = document.querySelector(".account-mega-menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isVisible = menu.classList.toggle("show");
    window.menuState.accountMenuVisible = isVisible;
    window.saveMenuState();
  });

  // Restore account menu state on load
  if (window.menuState.accountMenuVisible) {
    menu.classList.add("show");
  }
}

// Expose globally for lazy init
window.initializeMegaMenu = function () {
  initializeMegaMenu();
  initializeAccountMenu();
};

document.addEventListener("route:changed", window.initializeMegaMenu);
