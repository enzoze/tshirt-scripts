// core.js

function waitForElement(selector, callback, interval = 300, maxAttempts = 50) {
  let attempts = 0;
  const check = () => {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    if (attempts++ < maxAttempts) setTimeout(check, interval);
  };
  check();
}

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

window.loadMenuState();

let lastPathname = location.pathname;
function handleNavigationChange() {
  if (location.pathname !== lastPathname) {
    lastPathname = location.pathname;
    document.dispatchEvent(new Event("route:changed"));
  }
}
function checkForNavigation() {
  requestAnimationFrame(() => {
    handleNavigationChange();
    checkForNavigation();
  });
}
checkForNavigation();
