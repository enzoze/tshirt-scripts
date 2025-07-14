
// ========================================
// IMPROVED FILTER PERSISTENCE SYSTEM
// ========================================
  // Define our 7 base colors and their RGB ranges
const baseColors = {
    "Red": { min: [150, 0, 0], max: [255, 100, 100] },
    "Blue": { min: [0, 0, 150], max: [100, 100, 255] },
    "Green": { min: [0, 150, 0], max: [100, 255, 100] },
    "Yellow": { min: [200, 150, 0], max: [255, 255, 100] },
    "Orange": { min: [200, 100, 0], max: [255, 165, 50] },
    "Purple": { min: [100, 0, 100], max: [200, 50, 200] },
    "Pink": { min: [255, 150, 150], max: [255, 200, 200] },
    "Black": { min: [0, 0, 0], max: [50, 50, 50] },
    "White": { min: [200, 200, 200], max: [255, 255, 255] },
    "Gray": { min: [100, 100, 100], max: [200, 200, 200] },
    "Brown": { min: [100, 50, 0], max: [150, 100, 50] },
    "Teal": { min: [0, 100, 100], max: [50, 150, 150] },
    "Navy": { min: [0, 0, 80], max: [50, 50, 150] }
};


// Store filter state globally
const filterState = {
    type: [],
    price: [],
    color: [],
    material: [],
    size: [],
    fit: [],
    weight: []
};

// Track if we're currently applying filters to prevent loops
let isApplyingFilters = false;

// Save filter state to sessionStorage
function saveFilterState() {
    sessionStorage.setItem('filterState', JSON.stringify(filterState));
}

// Load filter state from sessionStorage
function loadFilterState() {
    const savedState = sessionStorage.getItem('filterState');
    if (savedState) {
        Object.assign(filterState, JSON.parse(savedState));
    }
}

// Apply saved filter state to UI
function applySavedFilterState() {
    if (isApplyingFilters) return;
    isApplyingFilters = true;
    
    try {
        // Apply checkbox states
        for (const [filterType, values] of Object.entries(filterState)) {
            const selector = filterType === 'color' ? 
                `.filter-section h4:contains("Color")` :
                `.${filterType}-filter input[type="checkbox"], .${filterType}-enhanced-filter input[type="checkbox"]`;
            
            document.querySelectorAll(selector).forEach(checkbox => {
                checkbox.checked = values.includes(checkbox.value);
            });
        }
        
        // Run all filters
        runCombinedFilters();
    } catch (e) {
    } finally {
        isApplyingFilters = false;
    }
}

// Update filter state when checkboxes change
function updateFilterState(filterType, value, isChecked) {
    if (isApplyingFilters) return;
    
    if (isChecked) {
        if (!filterState[filterType].includes(value)) {
            filterState[filterType].push(value);
        }
    } else {
        filterState[filterType] = filterState[filterType].filter(v => v !== value);
    }
    
    saveFilterState();
}

// ========================================
// ENHANCED FILTER FUNCTIONS
// ========================================
const FIXED_SIZES = ["Youth", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
const FIXED_MATERIALS = ["Cotton", "Cotton/Polyester", "Polyester", "Nylon", "Others"];
const FIXED_FITS = ["Relaxed", "Slim", "OverSize", "Loose", "Athletic", "Others"];
const FIXED_WEIGHTS = ["Light", "Medium", "Heavy"];
const FIXED_TYPES = ["Men", "Women", "Kid", "Youth"];
const FIXED_PRICES = ["$", "$$", "$$$"];
const FIXED_COLORS = [
    "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink",
    "Black", "White", "Gray", "Brown", "Teal", "Navy"
];
const getWeightCategory = (oz) => {
    if (oz < 6) return "Light";
    if (oz <= 7) return "Medium";
    return "Heavy";
};

const normalizeMaterial = (text) => {
    const t = text.toLowerCase();
    if (t.includes('cotton') && t.includes('polyester')) return 'Cotton/Polyester';
    if (t.includes('cotton')) return 'Cotton';
    if (t.includes('polyester')) return 'Polyester';
    if (t.includes('nylon')) return 'Nylon';
    return 'Others';
};

const extractFit = (text) => {
    const fitsFound = [];
    const lowerText = text.toLowerCase();

    for (const fit of FIXED_FITS) {
        if (fit === "Others") continue;
        if (lowerText.includes(fit.toLowerCase())) fitsFound.push(fit);
    }

    if (fitsFound.length === 0) fitsFound.push("Others");
    return [...new Set(fitsFound)];
};

const waitForCards = () =>
    new Promise((res) => {
        const check = () => {
            const cards = document.querySelectorAll('[id^="productCard-"]');
            if (cards.length) res(cards);
            else setTimeout(check, 1000);
        };
        check();
    });
  
function buildEnhancedFilters() {
    const sidebar = document.querySelector('.category-list.m-t-2.r14');
    if (!sidebar) return;

    // Add CSS for transitions (only once)
    const style = document.createElement('style');
    style.textContent = `
        .enhanced-filter .filter-content {
            overflow: hidden;
            transition: 
                max-height 0.9s ease-out,  /* Slower & smoother when expanding */
                opacity 0.9s ease-out,
                padding-top 0.9s ease;
            max-height: 1000px; /* Start expanded */
            opacity: 1;
        }
        .enhanced-filter .filter-content.collapsed {
            max-height: 0;
            opacity: 0;
            padding-top: 0 !important;
            transition: 
                max-height 0.7s ease-in,  /* Faster when collapsing */
                opacity 0.7s ease-in,
                padding-top 0.7s ease;
        }
    `;
    document.head.appendChild(style);

    const existingFilterTitles = [...sidebar.querySelectorAll('.filter-section h4')].map(h4 => h4.textContent);
    
    const addEnhancedFilter = (title, options, key) => {
        if (existingFilterTitles.some(t => t.includes(title.trim()))) return;
        
        if (key === 'color') {
            createColorFilter();
            return;
        }
        
        const section = document.createElement('div');
        section.className = 'filter-section enhanced-filter';
        section.style.marginBottom = '20px';

        const h4 = document.createElement('h4');
        h4.textContent = title;
        h4.style.cssText = 'font-size:16px;font-weight:bold;margin-bottom:8px;border-bottom:1px solid #ddd;padding-bottom:5px;display:flex;justify-content:space-between;align-items:center;cursor:pointer;';
        
        const toggleSpan = document.createElement('span');
        toggleSpan.textContent = '-'; // Starts as "-" because it's open by default
        toggleSpan.style.cssText = 'float:right;cursor:pointer;font-size:18px;';
        h4.appendChild(toggleSpan);

        const wrapper = document.createElement('div');
        wrapper.className = `filter-content ${key}-enhanced-filter`;
        wrapper.style.paddingTop = '10px'; // Padding animates smoothly when collapsing

        options.forEach(opt => {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex;gap:10px;font-size:16px;cursor:pointer;line-height:22px;margin-bottom:8px;';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = opt;
            cb.style.cssText = 'width:20px;height:20px;cursor:pointer;';

            cb.addEventListener('change', (e) => {
                updateFilterState(key, opt, e.target.checked);
                runCombinedFilters();
            });

            if (filterState[key] && filterState[key].includes(opt)) {
                cb.checked = true;
            }

            label.appendChild(cb);
            label.appendChild(document.createTextNode(opt));
            wrapper.appendChild(label);
        });

        h4.addEventListener('click', () => {
            const isCollapsed = wrapper.classList.contains('collapsed');
            wrapper.classList.toggle('collapsed', !isCollapsed);
            toggleSpan.textContent = isCollapsed ? '-' : '+'; // Toggle between - and +
        });

        section.appendChild(h4);
        section.appendChild(wrapper);
        sidebar.appendChild(section);
    };

    // Add all fixed filters
    addEnhancedFilter('Size', FIXED_SIZES, 'size');
    addEnhancedFilter('Price', [ '$', '$$' , '$$$' ], 'price');
    addEnhancedFilter('Type', FIXED_TYPES, 'type');
    addEnhancedFilter('Fit', FIXED_FITS, 'fit');
    addEnhancedFilter('Material', FIXED_MATERIALS, 'material');
    addEnhancedFilter('Weight', FIXED_WEIGHTS, 'weight');
    
    createColorFilter();
}
 
function getEnhancedChecked(key) {
    return [...document.querySelectorAll(`.${key}-enhanced-filter input:checked`)].map(cb => cb.value.toLowerCase());
}

// NEW FUNCTION: Reorder visible products to top
function reorderVisibleProducts() {
    const productsContainer = document.querySelector('.products-container') || document.querySelector('.grid-x.grid-padding-x.align-left');
    if (!productsContainer) return;

    const cards = Array.from(document.querySelectorAll('.product-card'));
    cards.forEach(card => {
        if (card.style.display !== 'none') {
            card.classList.add('shift-up');
            productsContainer.appendChild(card); // Move visible cards to end (which puts them first in flex)
        } else {
            card.classList.remove('shift-up');
        }
    });
}

function runCombinedFilters() {
    if (isApplyingFilters) return;
    
    const products = document.querySelectorAll('[id^="productCard-"]');
    if (products.length === 0) {
        setTimeout(runCombinedFilters, 500);
        return;
    }
    isApplyingFilters = true;
    
    try {
        // Get all current filter selections
        const selected = {
            size: getEnhancedChecked('size'),
            material: getEnhancedChecked('material'),
            weight: getEnhancedChecked('weight'),
            fit: getEnhancedChecked('fit'),
            type: getEnhancedChecked('type'),
            price: getEnhancedChecked('price'),
            color: filterState.color || []
        };

        // Filter products
        products.forEach(card => {
            const cardType = card.getAttribute('data-type') || 'men';
            const cardPrice = parseFloat(card.getAttribute('data-price')) || 0;
            const cardSizes = (card.getAttribute('data-sizes') || '').toLowerCase();
            const cardMaterial = (card.getAttribute('data-material') || '').toLowerCase();
            const cardWeight = (card.getAttribute('data-weight') || '').toLowerCase();
            const cardFit = (card.getAttribute('data-fit') || '').toLowerCase();
            
            // Check TYPE filter
            const matchesType = selected.type.length === 0 || 
                               selected.type.includes(cardType);
            
            // Improved PRICE filter - check both exact price and range
            const matchesPrice = selected.price.length === 0 || 
                                selected.price.some(p => {
                                    if (p === '$') return cardPrice > 0 && cardPrice <= 10;
                                    if (p === '$$') return cardPrice > 10 && cardPrice <= 29;
                                    if (p === '$$$') return cardPrice >= 30;
                                    // Also check the pre-calculated range
                                    return p === cardPriceRange;
                                });
            
            // Check COLOR filter
            let matchesColor = true;
            if (selected.color.length > 0) {
                const colorSwatches = card.querySelectorAll('.swatch-wrap .color-swatch');
                matchesColor = Array.from(colorSwatches).some(swatch => {
                    const bgColor = window.getComputedStyle(swatch).backgroundColor;
                    if (!bgColor) return false;
                    
                    const rgbMatch = bgColor.match(/\d+/g);
                    if (!rgbMatch || rgbMatch.length < 3) return false;
                    
                    const [r, g, b] = rgbMatch.map(Number);
                    
                    return selected.color.some(colorName => {
                        const colorRange = baseColors[colorName];
                        if (!colorRange) return false;
                        
                        return r >= colorRange.min[0] && r <= colorRange.max[0] &&
                               g >= colorRange.min[1] && g <= colorRange.max[1] &&
                               b >= colorRange.min[2] && b <= colorRange.max[2];
                    });
                });
            }
            
            // Check other filters
            const matchesOtherFilters =
                (selected.size.length === 0 || selected.size.some(s => cardSizes.includes(s))) &&
                (selected.material.length === 0 || selected.material.includes(cardMaterial)) &&
                (selected.weight.length === 0 || selected.weight.includes(cardWeight)) &&
                (selected.fit.length === 0 || selected.fit.some(f => cardFit.includes(f)));
            
            card.style.display = (matchesType && matchesPrice && matchesColor && matchesOtherFilters) ? 'block' : 'none';
        });

             // Mobile-specific adjustments
        if (window.innerWidth < 768) {
            adjustMobileProductLayout();
        }
        reorderVisibleProducts();
    } catch (e) {
    } finally {
        isApplyingFilters = false;
    }
} 

function adjustMobileProductLayout() {
    const productsContainer = document.querySelector('.products-container') || 
                            document.querySelector('.grid-x.grid-padding-x.align-left');
    
    if (!productsContainer) return;
    
    // Reset any grid styles that might be affecting mobile view
    productsContainer.style.display = 'block';
    productsContainer.style.flexWrap = 'nowrap';
    productsContainer.style.flexDirection = 'column';
    
    // Adjust individual product cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.style.display !== 'none') {
            card.style.width = '100%';
            card.style.marginBottom = '20px';
            card.style.flex = 'none';
            
            // Ensure images are properly sized
            const imgContainer = card.querySelector('.product-image-container');
            if (imgContainer) {
                imgContainer.style.height = 'auto';
                imgContainer.style.paddingBottom = '100%';
                imgContainer.style.position = 'relative';
            }
            
            const img = card.querySelector('.product-image');
            if (img) {
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
            }
        }
    });
}
async function processEnhancedProducts() {
    const cards = await waitForCards();

    for (const card of cards) {
        const idMatch = card.id.match(/productCard-(\d+)/);
        if (!idMatch) continue;

        const productId = idMatch[1];
        try {
            // Extract TYPE from product card name
            const productName = card.querySelector('.product-name')?.textContent || '';
            const nameLower = productName.toLowerCase();
            let type = 'Men'; // Default to Men
            if (nameLower.includes('women')) type = 'Women';
            if (nameLower.includes('kid') || nameLower.includes('youth')) type = 'Youth';
            card.setAttribute('data-type', type.toLowerCase());

            // Extract PRICE from hidden price element
            const priceElement = card.querySelector('.product-price');
            let price = 0;
            if (priceElement) {
                const priceText = priceElement.textContent.replace(/[^0-9.]/g, '');
                price = parseFloat(priceText) || 0;
            }
            card.setAttribute('data-price', price);

           // Extract COLORS from swatches - ensure this uses the correct selector
            const colorSwatches = card.querySelectorAll('.swatch-wrap .color-swatch');
            const colors = [];
            colorSwatches.forEach(swatch => {
                const bgColor = window.getComputedStyle(swatch).backgroundColor;
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
                    colors.push(bgColor);
                }
            });
            card.setAttribute('data-colors', colors.join(','));

            // Other attributes from API
            const res = await fetch(`https://cdn.inksoft.com/tshirt_source/Api2/GetProduct?ProductID=${productId}`);
            const data = await res.json();
            const description = data?.Data?.LongDescription || '';
            const styles = data?.Data?.Styles || [];
            
            let allSizes = [];
            let totalWeight = 0;
            let sizeCount = 0;

            styles.forEach(style => {
                if (style.Sizes) {
                    style.Sizes.forEach(s => {
                        const sizeName = (s.Name || "").toUpperCase();
                        allSizes.push(sizeName);
                        const w = parseFloat(s.Weight);
                        if (!isNaN(w)) {
                            totalWeight += w;
                            sizeCount++;
                        }
                    });
                }
            });

            const uniqueSizes = [...new Set(allSizes)];
            card.setAttribute('data-sizes', uniqueSizes.map(s => s.toLowerCase()).join(','));

            if (totalWeight && sizeCount) {
                const avgWeight = totalWeight / sizeCount;
                const label = getWeightCategory(avgWeight);
                card.setAttribute('data-weight', label.toLowerCase());
            }

            const material = normalizeMaterial(description);
            card.setAttribute('data-material', material.toLowerCase());

            const fitsExtracted = extractFit(description);
            card.setAttribute('data-fit', fitsExtracted.map(f => f.toLowerCase()).join(', '));

        } catch (e) {
            // Set defaults if API fails
            card.setAttribute('data-sizes', '');
            card.setAttribute('data-weight', '');
            card.setAttribute('data-material', 'others');
            card.setAttribute('data-fit', 'others');
            card.setAttribute('data-price', '0');
            card.setAttribute('data-type', 'men');
            card.setAttribute('data-colors', '');
        }
    }

    buildEnhancedFilters();
    applySavedFilterState();
}

// ========================================
// CORE FILTER FUNCTIONS
// ========================================
function createColorFilter() {
    const sidebar = document.querySelector('.category-list.m-t-2.r14');
    if (!sidebar) {
        setTimeout(createColorFilter, 500);
        return;
    }

    // Check if color filter section already exists
    let colorFilterSection = [...sidebar.querySelectorAll('.filter-section h4')].find(h4 => 
        h4.innerText.includes("Color")
    );

    if (!colorFilterSection) {
        // Create the color filter section if it doesn't exist
        const section = document.createElement('div');
        section.className = 'filter-section';
        
        const h4 = document.createElement('h4');
        h4.textContent = 'Color';
        h4.style.cssText = 'font-size:16px;font-weight:bold;margin-bottom:8px;border-bottom:1px solid #ddd;padding-bottom:5px;display:flex;justify-content:space-between;align-items:center;';
        
        const toggleSpan = document.createElement('span');
        toggleSpan.textContent = '-';
        toggleSpan.style.cssText = 'float:right;cursor:pointer;font-size:18px;';
        h4.appendChild(toggleSpan);

        const content = document.createElement('div');
        content.className = 'filter-content';
        content.style.cssText = 'display:block;padding-top:10px;';

        h4.addEventListener('click', () => {
            const isVisible = content.style.display === 'block';
            content.style.display = isVisible ? 'none' : 'block';
            toggleSpan.textContent = isVisible ? '+' : '-';
        });

        section.appendChild(h4);
        section.appendChild(content);
        
        // Insert at the top of the sidebar
        if (sidebar.firstChild) {
            sidebar.insertBefore(section, sidebar.firstChild);
        } else {
            sidebar.appendChild(section);
        }
        
        colorFilterSection = h4;
    }

    const colorFilterContainer = colorFilterSection.parentNode.querySelector('.filter-content');
    colorFilterContainer.innerHTML = '';
    
    // Create color selector UI
    const colorWrapper = document.createElement('div');
    colorWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;padding-bottom:15px;';
    
    // Add color options for each base color
    Object.keys(baseColors).forEach(colorName => {
        const colorButton = document.createElement('button');
        colorButton.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #ccc;
            cursor: pointer;
            background-color: ${getColorHex(colorName)};
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        colorButton.title = colorName;
        colorButton.dataset.color = colorName;
        
        // Add checkmark for selected colors
        if (filterState.color && filterState.color.includes(colorName)) {
colorButton.innerHTML = '✓'; // With this HTML entity:
colorButton.innerHTML = '&#10003;'; // This will ensure the checkmark renders            colorButton.style.color = getContrastColor(getColorHex(colorName));
            colorButton.style.fontWeight = 'bold';
            colorButton.style.borderColor = '#333';
              colorButton.style.color = '#00FF00'; // Bright green

        }

        colorButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isSelected = filterState.color && filterState.color.includes(colorName);
            
            if (isSelected) {
                filterState.color = filterState.color.filter(c => c !== colorName);
                colorButton.innerHTML = '';
                colorButton.style.borderColor = '#ccc';
            } else {
                if (!filterState.color) filterState.color = [];
                filterState.color.push(colorName);
colorButton.innerHTML = '✓'; // With this HTML entity:
colorButton.innerHTML = '&#10003;'; // This will ensure the checkmark renders                colorButton.style.color = getContrastColor(getColorHex(colorName));
                colorButton.style.borderColor = '#333';
                  colorButton.style.color = '#00FF00'; // Bright green

            }
            
            saveFilterState();
            runCombinedFilters();
        });
        
        colorWrapper.appendChild(colorButton);
    });
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = "Reset Colors";
    resetButton.style.cssText = `
        padding: 8px 15px;
        margin-top: 12px;
        cursor: pointer;
        border: none;
        background-color: darkred;
        color: white;
        font-size: 14px;
        border-radius: 5px;
        width: 100%;
    `;
    resetButton.addEventListener('click', () => {
        filterState.color = [];
        saveFilterState();
        runCombinedFilters();
        colorWrapper.querySelectorAll('button').forEach(btn => {
            btn.innerHTML = '';
            btn.style.borderColor = '#ccc';
        });
    });
    
    colorFilterContainer.appendChild(colorWrapper);
    colorFilterContainer.appendChild(resetButton);
}

// Helper function to get hex color for swatches
function getColorHex(colorName) {
    const colorMap = {
        'Red': '#ff0000',
        'Blue': '#0000ff',
        'Green': '#008000',
        'Yellow': '#ffff00',
        'Orange': '#ffa500',
        'Purple': '#800080',
        'Pink': '#ffc0cb',
        'Black': '#000000',
        'White': '#ffffff',
        'Gray': '#808080',
        'Brown': '#a52a2a',
        'Teal': '#008080',
        'Navy': '#000080'
    };
    return colorMap[colorName] || '#cccccc';
}

// Helper function to get contrasting text color
function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
} 


function extractSwatchColors() {
    let colorElements = document.querySelectorAll('.swatch-wrap .color-swatch');
    let colors = new Set();
    
    colorElements.forEach(el => {
        let bgColor = window.getComputedStyle(el).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            colors.add(bgColor);
        }
    });
    
    return Array.from(colors);
}



function createFilter(titleText, existingContent = null) {
    let wrapper = document.createElement('div');
    wrapper.className = 'filter-section';
    
    let title = document.createElement('h4');
    title.innerHTML = `${titleText}<span style="float: right; cursor: pointer; font-size: 18px;">-</span>`;
    title.style.cssText = `    transition: background 0.3s ease-in-out, color 0.3s ease-in-out;font-size:16px!important;font-weight:bold!important;margin-bottom:8px!important;cursor:pointer!important;border-bottom:1px solid#ddd!important;padding-bottom:5px!important;display:flex!important;justify-content:space-between!important;align-items:center!important;`;
    
    let content = document.createElement('div');
    content.className = 'filter-content';
    content.style.cssText = `display:block!important;padding-top:10px!important;`;
    
    if (existingContent) {
        content.appendChild(existingContent);
    }

    title.addEventListener('click', () => {
        let isVisible = content.style.display === 'block';
        content.style.display = isVisible ? 'none' : 'block';
        title.innerHTML = `${titleText}<span style="float: right; cursor: pointer; font-size: 18px;">${isVisible ? '+' : '-'}</span>`;
    });
    
    wrapper.appendChild(title);
    wrapper.appendChild(content);
    return wrapper;
}

function moveBrandList() {
    let brandList = document.querySelector('.category-list.m-t-2.r14 ul.ng-star-inserted');
    let brandFilter = [...document.querySelectorAll('.filter-section h4')].find(h4 => h4.innerText.includes("Brand"))?.parentNode?.querySelector('.filter-content');
    
    if (brandList && brandFilter) {
        brandFilter.appendChild(brandList);
    } else {
        setTimeout(moveBrandList, 500);
    }
}

function extractSwatchColors() {
    let colorElements = document.querySelectorAll('.swatch-wrap .color-swatch');
    let colors = new Set();
    
    colorElements.forEach(el => {
        let bgColor = window.getComputedStyle(el).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            colors.add(bgColor);
        }
    });
    
    return Array.from(colors);
}

// Update the price extraction function to handle more cases
function extractHiddenPrices() {
    let products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        // Try multiple selectors for price
        let priceElement = product.querySelector('.product-price') || 
                          product.querySelector('.price') || 
                          product.querySelector('.product-card-price');
        
        if (priceElement) {
            // Handle both visible and hidden price text
            let priceText = priceElement.textContent || priceElement.innerText;
            
            // Extract all numbers including decimals (handles $12.34, 12.34, etc.)
            let priceMatch = priceText.match(/(\d+\.\d{2})|(\d+)/);
            if (priceMatch) {
                let price = parseFloat(priceMatch[0]);
                if (!isNaN(price)) {
                    product.setAttribute('data-price', price.toFixed(2));
                    // Also set price range category
                    let priceRange = '$';
                    if (price > 10 && price <= 29) priceRange = '$$';
                    if (price >= 30) priceRange = '$$$';
                    product.setAttribute('data-price-range', priceRange);
                }
            }
        }
    });
}


function filterByCategory() {
    let selectedCategories = [...document.querySelectorAll('.category-filter input:checked')].map(cb => cb.value);
    let products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        let category = product.getAttribute('data-category') || '';
        
        if (selectedCategories.length === 0) {
            product.style.display = 'block';
            return;
        }

        let showProduct = selectedCategories.includes(category);
        product.style.display = showProduct ? 'block' : 'none';
    });
    reorderVisibleProducts();
}




// ========================================
// PERSISTENT FILTERS INITIALIZATION
// ========================================

let filterObserver = null;

async function forceSidebarFilters() {
    let sidebar = document.querySelector('.category-list.m-t-2.r14');
    
    if (sidebar) {
        let existingFilters = document.querySelectorAll('.filter-section');
        
        if (existingFilters.length === 0) {
            const loadingMsg = document.createElement('div');
            sidebar.appendChild(loadingMsg);
            
            try {
                let categoryContent = document.createElement('div');
                while (sidebar.firstChild) {
                    categoryContent.appendChild(sidebar.firstChild);
                }
                
                let filters = [
                    { name: 'Categories', content: categoryContent },
                    { name: 'Brand', content: null }
                ];
                
                filters.forEach(({ name, content }) => {
                    let filterElement = createFilter(name, content);
                    sidebar.appendChild(filterElement);
                });
                
                moveBrandList();
                setTimeout(createColorFilter, 1000);
                
                // Initialize enhanced filters
                await processEnhancedProducts();
                   // Move brand and categories to bottom
                 moveBrandAndCategoriesToBottom();
                loadingMsg.remove();
            } catch (e) {
                loadingMsg.textContent = 'Failed to load filters. Please refresh the page.';
            }
        } else {
            // If filters already exist, just initialize the enhanced ones
            await processEnhancedProducts();
        }
    } else {
        setTimeout(forceSidebarFilters, 500);
    }
}


function moveBrandAndCategoriesToBottom() {
    const sidebar = document.querySelector('.category-list.m-t-2.r14');
    if (!sidebar) return;

    // Get all filter sections
    const filterSections = Array.from(sidebar.querySelectorAll('.filter-section'));
    
    // Find Brand and Categories sections
    const brandSection = filterSections.find(section => 
        section.querySelector('h4')?.textContent.includes('Brand'));
    const categoriesSection = filterSections.find(section => 
        section.querySelector('h4')?.textContent.includes('Categories'));
    
    if (brandSection && categoriesSection) {
        // Remove them from current position
        brandSection.remove();
        categoriesSection.remove();
        
        // Add them back at the bottom
        sidebar.appendChild(categoriesSection);
        sidebar.appendChild(brandSection);
        
        // Make sure they're visible
        categoriesSection.style.display = 'block';
        brandSection.style.display = 'block';
        
        // Ensure their content is visible
        const categoriesContent = categoriesSection.querySelector('.filter-content');
        const brandContent = brandSection.querySelector('.filter-content');
        if (categoriesContent) categoriesContent.style.display = 'block';
        if (brandContent) brandContent.style.display = 'block';
    }
}
