// price-enhancer.js

function enhanceProductCards() {
  const productCards = document.querySelectorAll(".product-list-item");

  productCards.forEach(card => {
    const link = card.querySelector("a");
    const priceEl = card.querySelector(".product-price");

    if (!link || !priceEl || priceEl.dataset.enhanced === "true") return;

    const productUrl = link.getAttribute("href");
    const productIdMatch = productUrl.match(/product\/(\d+)/);
    if (!productIdMatch) return;

    const productId = productIdMatch[1];
    priceEl.dataset.enhanced = "true";

    fetch(`/store-api/products/${productId}`)
      .then(res => res.ok ? res.json() : Promise.reject("API error"))
      .then(data => {
        if (data?.PriceFormatted) {
          priceEl.innerHTML = data.PriceFormatted;
          priceEl.style.visibility = "visible";
        }
      })
      .catch(err => console.warn("Price fetch failed:", err));
  });
}

// Tooltip for swatches
function enableSwatchTooltips() {
  const swatches = document.querySelectorAll(".swatch-container .swatch");

  swatches.forEach(swatch => {
    const name = swatch.getAttribute("title") || swatch.getAttribute("aria-label");
    if (name) {
      swatch.setAttribute("data-tooltip", name);
    }
  });
}

window.enhanceProductCards = function () {
  enhanceProductCards();
  enableSwatchTooltips();
};

document.addEventListener("route:changed", () => {
  setTimeout(() => window.enhanceProductCards(), 500);
});
