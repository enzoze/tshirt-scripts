// price-enhancer.js

const priceCache = {};
async function fetchRealPrices(productId) {
  if (priceCache[productId]) return priceCache[productId];
  try {
    const res = await fetch(`/store-api/products/${productId}`);
    const data = await res.json();
    const price = data?.PriceFormatted || "";
    priceCache[productId] = price;
    return price;
  } catch {
    return "";
  }
}

function enhanceProductCards() {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(async card => {
    if (card.dataset.enhanced === "true") return;
    card.dataset.enhanced = "true";

    const productId = card.id?.match(/\d+/)?.[0];
    const priceEl = card.querySelector(".product-price");

    if (productId && priceEl) {
      const price = await fetchRealPrices(productId);
      if (price) {
        priceEl.innerHTML = price;
        priceEl.style.visibility = "visible";
      }
    }

    const swatches = card.querySelectorAll(".color-swatch");
    if (swatches.length > 5) {
      swatches.forEach((el, i) => { if (i >= 5) el.style.display = "none"; });
    }
  });
}

window.enhanceProductCards = enhanceProductCards;
