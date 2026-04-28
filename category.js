(function () {
  let allProducts = [];
  let filteredProducts = [];
  let currentCategory = document.body.dataset.category || 'tents';
  let activeFilters = {
    price: [],
    size: [],
    capacity: []
  };

   // Load product data from global variable (injected by products-data.js)
   function loadProducts() {
     try {
       if (typeof window.productsData === 'undefined') {
         throw new Error('productsData not loaded. Include products-data.js before category.js');
       }
       allProducts = window.productsData.products || [];
       applyFilters();
       return true;
     } catch (error) {
       console.error('Error loading products:', error);
       return false;
     }
   }

  // Filter products by category
  function filterByCategory(category) {
    currentCategory = category;
    activeFilters = { price: [], size: [], capacity: [] };
    clearCheckboxes();

    // If category is 'tents', show all tents
    filteredProducts = allProducts.filter(p => p.category === category);
    renderProducts();
    updateProductCount();
  }

  // Clear all filter checkboxes
  function clearCheckboxes() {
    document.querySelectorAll('.filter-group-body input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
  }

  // Map price to checkbox values
  function getPriceFilterValue(price) {
    if (price < 200) return 'under200';
    if (price < 400) return '200-400';
    if (price < 600) return '400-600';
    return 'over600';
  }

  // Map capacity to filter value
  function getCapacityFilterValue(capacity) {
    if (!capacity) return null;
    const num = parseInt(capacity);
    if (num === 1) return '1';
    if (num === 2) return '2';
    if (num === 4) return '4';
    if (num >= 6) return '6';
    return null;
  }

  // Map size to filter value (derived from capacity)
  function getSizeFilterValue(capacity) {
    if (!capacity) return null;
    const num = parseInt(capacity);
    if (num <= 2) return 'small';
    if (num <= 4) return 'medium';
    return 'large';
  }

  // Apply all active filters
  function applyFilters() {
    filteredProducts = allProducts.filter(p => {
      if (p.category !== currentCategory) return false;

      // Price filter
      if (activeFilters.price.length > 0) {
        const priceValue = getPriceFilterValue(p.price);
        if (!activeFilters.price.includes(priceValue)) return false;
      }

      // Capacity filter
      if (activeFilters.capacity.length > 0) {
        const capacityValue = getCapacityFilterValue(p.capacity);
        if (!activeFilters.capacity.includes(capacityValue)) return false;
      }

      // Size filter
      if (activeFilters.size.length > 0) {
        const sizeValue = getSizeFilterValue(p.capacity);
        if (!activeFilters.size.includes(sizeValue)) return false;
      }

      return true;
    });

    renderProducts();
    updateProductCount();
  }

  // Render product cards
  function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (filteredProducts.length === 0) {
      grid.innerHTML = '<div class="no-results">No products match your filters.</div>';
      return;
    }

    grid.innerHTML = filteredProducts.map(p => {
      const hasDetailPage = p.hasDetailPage && p.detailPageUrl;
      const detailUrl = hasDetailPage ? p.detailPageUrl : '#';
      const capacityDisplay = p.capacity ? p.capacity.replace('P', '') + 'P' : '';

      return `
        <div class="product-card" data-product-card
          data-product-id="${p.id}"
          data-product-name="${p.name}"
          data-product-price="${p.price}"
          data-product-image="${p.image}"
          data-product-description="${p.description || ''}"
          data-product-url="${hasDetailPage ? p.detailPageUrl : ''}">

          ${hasDetailPage ? `<a href="${detailUrl}">` : '<div>'}
            <img src="${p.image}" alt="${p.name}" />
          ${hasDetailPage ? '</a>' : '</div>'}

          <div class="product-info">
            ${hasDetailPage ?
              `<a href="${detailUrl}" class="product-title-link"><h3>${p.name}</h3></a>` :
              `<h3>${p.name}</h3>`
            }
            <p>${p.description || ''}</p>
            <div class="product-meta">
              ${capacityDisplay ? `<span class="capacity">${capacityDisplay}</span>` : '<span></span>'}
              <span class="price">$${p.price.toFixed(2)}</span>
            </div>
            <div class="product-actions">
              ${hasDetailPage ?
                `<a href="${detailUrl}" class="view-product-link">View Details</a>` :
                `<span class="view-product-link disabled-link">In Collection</span>`
              }
              <button type="button" class="grid-cart-btn" data-add-to-cart>ADD TO CART</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Update wishlist button states for newly rendered products
    if (typeof window.CPSWishlist !== 'undefined') {
      window.CPSWishlist.updateWishlistButtons();
    }
  }

  // Update product count display
  function updateProductCount() {
    // Optional: could add a product count element
    console.log(`Showing ${filteredProducts.length} products`);
  }

  // Initialize filter checkboxes and accordion
  function initFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-group-body input[type="checkbox"]');

    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const filterType = checkbox.dataset.filter;
        const filterValue = checkbox.value;

        if (checkbox.checked) {
          if (!activeFilters[filterType].includes(filterValue)) {
            activeFilters[filterType].push(filterValue);
          }
        } else {
          activeFilters[filterType] = activeFilters[filterType].filter(v => v !== filterValue);
        }

        applyFilters();
      });
    });

    // Accordion toggle for filter groups
    document.querySelectorAll('.filter-group-header').forEach(button => {
      button.addEventListener('click', () => {
        const body = button.nextElementSibling;
        const isOpen = body.classList.toggle('open');
        button.classList.toggle('open', isOpen);
        button.setAttribute('aria-expanded', isOpen);
      });
    });
  }

  // Initialize page
  function init() {
    loadProducts();
    initFilters();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use if needed
  window.CPSCategory = {
    loadProducts,
    applyFilters,
    filterByCategory
  };
})();
