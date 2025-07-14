// filter-enhancer.js

const filterState = {};
let isApplyingFilters = false;

function createFilter(titleText) {
  const container = document.createElement("div");
  container.className = "filter-block";
  const title = document.createElement("h4");
  title.textContent = titleText;
  container.appendChild(title);
  return container;
}

function processEnhancedProducts() {
  const cards = document.querySelectorAll(".product-list-item");

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.dataset.material = /cotton/.test(text) ? "Cotton" : /poly/.test(text) ? "Polyester" : "";
    card.dataset.fit = /slim/.test(text) ? "Slim" : /regular/.test(text) ? "Regular" : "";
  });
}

function applyFilters() {
  const filters = Object.entries(filterState);
  document.querySelectorAll(".product-list-item").forEach(card => {
    let visible = filters.every(([key, val]) => {
      const dataVal = card.dataset[key]?.toLowerCase();
      return dataVal?.includes(val.toLowerCase());
    });
    card.style.display = visible ? "" : "none";
  });
}

function buildEnhancedFilters() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const filterBox = document.createElement("div");
  filterBox.id = "custom-filters";

  ["Cotton", "Polyester"].forEach(mat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" onchange="filterState['material']='${mat}';applyFilters()"> ${mat}`;
    filterBox.appendChild(label);
  });

  ["Slim", "Regular"].forEach(fit => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" onchange="filterState['fit']='${fit}';applyFilters()"> ${fit}`;
    filterBox.appendChild(label);
  });

  sidebar.prepend(filterBox);
}

window.initializeFilters = function () {
  processEnhancedProducts();
  buildEnhancedFilters();
};
