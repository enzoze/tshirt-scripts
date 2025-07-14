// filter-enhancer.js

function buildCustomFilters() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || document.querySelector("#custom-filters")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "custom-filters";
  wrapper.innerHTML = `
    <h3>Filter By</h3>
    <label><input type="checkbox" data-filter="Material:Cotton"> Cotton</label><br>
    <label><input type="checkbox" data-filter="Material:Polyester"> Polyester</label><br>
    <label><input type="checkbox" data-filter="Fit:Regular"> Regular Fit</label><br>
    <label><input type="checkbox" data-filter="Fit:Slim"> Slim Fit</label><br>
  `;

  sidebar.prepend(wrapper);

  wrapper.querySelectorAll("input[type='checkbox']").forEach(input => {
    input.addEventListener("change", applyFilters);
  });
}

function applyFilters() {
  const activeFilters = Array.from(document.querySelectorAll("#custom-filters input:checked"))
    .map(input => input.dataset.filter);

  const cards = document.querySelectorAll(".product-list-item");

  cards.forEach(card => {
    let matches = true;
    activeFilters.forEach(filter => {
      const [key, value] = filter.split(":");
      const attr = card.getAttribute(`data-${key.toLowerCase()}`);
      if (!attr || !attr.toLowerCase().includes(value.toLowerCase())) {
        matches = false;
      }
    });
    card.style.display = matches ? "" : "none";
  });
}

// Optional: Persist filters in sessionStorage
function saveFilterState() {
  const checked = Array.from(document.querySelectorAll("#custom-filters input:checked"))
    .map(input => input.dataset.filter);
  sessionStorage.setItem("activeFilters", JSON.stringify(checked));
}

function restoreFilterState() {
  const saved = JSON.parse(sessionStorage.getItem("activeFilters") || "[]");
  saved.forEach(f => {
    const input = document.querySelector(`#custom-filters input[data-filter='${f}']`);
    if (input) input.checked = true;
  });
  applyFilters();
}

window.initializeFilters = function () {
  buildCustomFilters();
  restoreFilterState();

  const inputs = document.querySelectorAll("#custom-filters input");
  inputs.forEach(input => input.addEventListener("change", saveFilterState));
};

document.addEventListener("route:changed", window.initializeFilters);
