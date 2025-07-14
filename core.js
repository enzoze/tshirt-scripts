// core.js

// Utility to wait for an element to appear
function waitForElement(selector, callback, interval = 300, maxAttempts = 50) {
  let attempts = 0;
  const check = () => {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    if (attempts++ < maxAttempts) {
      setTimeout(check, interval);
    }
  };
  check();
}

// Global state management
window.menuState = {
  megaMenuVisible: false,
  accountMenuVisible: false
};

window.saveMenuState = function () {
  try {
    sessionStorage.setItem("menuState", JSON.stringify(window.menuState));
  } catch (e) {
    console.warn("Failed to save menu state", e);
  }
};

window.loadMenuState = function () {
  try {
    const saved = sessionStorage.getItem("menuState");
    if (saved) Object.assign(window.menuState, JSON.parse(saved));
  } catch (e) {
    console.warn("Failed to load menu state", e);
  }
};

// Load stored state immediately
window.loadMenuState();

// Helper: Debounce function
window.debounce = function (func, wait = 200) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// MutationObserver for route changes (SPA-like InkSoft behavior)
window.routeObserver = new MutationObserver(() => {
  document.dispatchEvent(new Event("route:changed"));
});

waitForElement("main", (main) => {
  window.routeObserver.observe(main, { childList: true, subtree: true });
});

// Polyfill for passive event listeners (performance boost)
try {
  const noop = () => {};
  window.addEventListener("test", noop, { passive: true });
} catch (err) {
  EventTarget.prototype.addEventListener = function (type, fn, options) {
    if (typeof options === "object") options.passive = true;
    else options = { passive: true };
    EventTarget.prototype.addEventListener.call(this, type, fn, options);
  };
}
