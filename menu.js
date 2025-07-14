// menu.js

function initializeMegaMenu() {
  if (document.querySelector(".custom-mega-menu")) return;

  const menuLink = Array.from(document.querySelectorAll(".nav-bar a"))
    .find(el => el.textContent.trim().toLowerCase().includes("products"));

  if (!menuLink) return;

  const menu = document.createElement("div");
  menu.classList.add("custom-mega-menu");
  menu.innerHTML = `
    <div class="column">
      <h4>T-Shirts</h4>
      <a href="/products/short-sleeve">Short Sleeve</a>
      <a href="/products/long-sleeve">Long Sleeve</a>
    </div>
    <div class="column">
      <h4>Fleece</h4>
      <a href="/products/hoodies">Hoodies</a>
      <a href="/products/crewnecks">Crewnecks</a>
    </div>
    <div class="column">
      <h4>Outerwear</h4>
      <a href="/products/jackets">Jackets</a>
    </div>
  `;
  menuLink.parentNode.appendChild(menu);

  if (menuState.megaMenuVisible) menu.classList.add("show");

  menuLink.addEventListener("mouseenter", () => {
    menu.classList.add("show");
    window.menuState.megaMenuVisible = true;
    saveMenuState();
  });
  menu.addEventListener("mouseleave", () => {
    menu.classList.remove("show");
    window.menuState.megaMenuVisible = false;
    saveMenuState();
  });
}

function initializeAccountMegaMenu() {
  if (document.querySelector(".account-mega-menu")) return;

  const accountBtn = document.querySelector("#myAccountDropdown");
  if (!accountBtn) return;

  const menu = document.createElement("div");
  menu.classList.add("account-mega-menu");
  menu.innerHTML = `
    <a href="/account/profile">Profile</a>
    <a href="/account/orders">Orders</a>
    <a href="/account/logout">Logout</a>
  `;
  accountBtn.parentNode.appendChild(menu);

  if (menuState.accountMenuVisible) menu.classList.add("show");

  accountBtn.addEventListener("mouseenter", () => {
    menu.classList.add("show");
    window.menuState.accountMenuVisible = true;
    saveMenuState();
  });
  menu.addEventListener("mouseleave", () => {
    menu.classList.remove("show");
    window.menuState.accountMenuVisible = false;
    saveMenuState();
  });
}

window.initializeMegaMenu = function () {
  initializeMegaMenu();
  initializeAccountMegaMenu();
};
