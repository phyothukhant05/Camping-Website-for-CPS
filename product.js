(function () {
  let products = [];
  let currentProduct = null;

  // Load product data from global variable
  function loadProducts() {
    if (typeof window.productsData === 'undefined') {
      console.error('productsData not loaded. Include products-data.js before product.js');
      return false;
    }
    products = window.productsData.products || [];
    return true;
  }

  // Get product by ID
  function getProductById(id) {
    return products.find(p => p.id === id);
  }

  // Get related products
  function getRelatedProducts(product) {
    if (!product || !product.related) return [];
    return product.related
      .map(relatedId => getProductById(relatedId))
      .filter(p => p && p.id !== product.id);
  }

  // Render product detail page
  function renderProductDetail(product) {
    const container = document.getElementById('product-container');
    if (!container) return;

    // Update page title
    document.getElementById('page-title').textContent = product.name;

    // Render main product section
    container.innerHTML = `
      <section class="product-detail-section" data-product-card
        data-product-id="${product.id}"
        data-product-name="${product.name}"
        data-product-price="${product.price}"
        data-product-image="${product.image}"
        data-product-description="${product.description || ''}"
        data-product-url="product.html?id=${product.id}">

        <!-- LEFT IMAGE -->
        <div class="product-image-box">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <!-- RIGHT DETAILS -->
        <div class="product-info-box">
          <h1>${product.name}</h1>

          <div class="reviews">
            ★★★★★ <span>3 Reviews</span>
          </div>

          <div class="price">$${product.price.toFixed(2)}</div>

          <!-- Quantity + Cart -->
          <div class="purchase-row">
            <div class="quantity-box">
              <button onclick="window.productChangeQty(-1)">−</button>
              <span id="productQty">1</span>
              <button onclick="window.productChangeQty(1)">+</button>
            </div>

            <button type="button" class="cart-btn" data-add-to-cart data-qty-target="productQty">ADD TO CART</button>
          </div>

          <!-- Wishlist -->
          <button type="button" class="wishlist" data-add-to-wishlist>
            <i class="fa-regular fa-heart"></i>
            <span>ADD TO WISHLIST</span>
          </button>

          <!-- Product Info Box -->
          <div class="info-card">
            <p><strong>74,995</strong> Life Value Points</p>
            <p><strong>${Math.floor(product.price * 0.25)}</strong> CPS Reward Points</p>

            <div class="info-links">
              <a href="#">Join the Program</a>
              <a href="vip.html">Learn More</a>
            </div>
          </div>
        </div>

      </section>
    `;

    // Render accordion section if product has details
    renderAccordion(product);

    // Render related products
    renderRelatedProducts(product);
  }

  function renderAccordion(product) {
    const relatedContainer = document.getElementById('related-container');
    if (!relatedContainer) return;

    const hasDetails = product.details || product.included || product.specs || product.features;

    if (!hasDetails) {
      relatedContainer.innerHTML = '';
      return;
    }

    relatedContainer.innerHTML = `
      <section class="product-extra-section">
        <div class="product-accordion">
          ${product.details ? `
            <div class="accordion-item">
              <button class="accordion-btn">DETAILS <span>⌄</span></button>
              <div class="accordion-content">
                ${product.details}
              </div>
            </div>
          ` : ''}

          ${product.included ? `
            <div class="accordion-item">
              <button class="accordion-btn">INCLUDED <span>⌄</span></button>
              <div class="accordion-content">
                ${product.included}
              </div>
            </div>
          ` : ''}

          ${product.specs ? `
            <div class="accordion-item">
              <button class="accordion-btn">SPECS <span>⌄</span></button>
              <div class="accordion-content">
                ${product.specs}
              </div>
            </div>
          ` : ''}

          ${product.features ? `
            <div class="accordion-item">
              <button class="accordion-btn">FEATURES <span>⌄</span></button>
              <div class="accordion-content">
                ${product.features}
              </div>
            </div>
          ` : ''}
        </div>

        ${renderRelatedProductsSection(product)}
      </section>
    `;
  }

  function renderRelatedProductsSection(product) {
    const related = getRelatedProducts(product);
    if (related.length === 0) return '';

    return `
      <div class="related-products">
        <h2>RELATED PRODUCTS</h2>

        ${related.map(p => `
          <div class="related-item" data-product-card
            data-product-id="${p.id}"
            data-product-name="${p.name}"
            data-product-price="${p.price}"
            data-product-image="${p.image}"
            data-product-description="${p.description || ''}">
            <img src="${p.image}" alt="${p.name}">
            <div class="related-info">
              <h3>${p.name}</h3>
              <p>$${p.price.toFixed(2)}</p>
              <button type="button" data-add-to-cart>ADD TO CART</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderRelatedProducts(product) {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = renderProductReviews(product);
  }

  function renderProductReviews(product) {
    return `
      <section class="customer-reviews-section">
        <div class="reviews-container">
          <div class="reviews-header">
            <h2 class="serif-title">Customer Reviews</h2>
            <div class="rating-summary-row">
              <div class="avg-rating">4.8</div>
              <div class="rating-meta">
                <div class="stars-gold">★★★★★</div>
                <p>Based on 3 reviews</p>
              </div>
              <button class="write-review-btn">Write A Review</button>
            </div>
          </div>

          <hr class="section-divider">

          <div class="reviews-controls">
            <div class="controls-left">
              <div class="custom-dropdown_for_reviews" id="ratingDropdown">
                <button class="dropdown-trigger">
                  <span>Rating</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </button>

                <div class="dropdown-menu_for_reviews">
                  <div class="dropdown-item active">
                    <span>All ratings</span>
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div class="dropdown-item"><i class="fa-solid fa-star"></i> <span>5 stars</span></div>
                  <div class="dropdown-item"><i class="fa-solid fa-star"></i> <span>4 stars</span></div>
                  <div class="dropdown-item"><i class="fa-solid fa-star"></i> <span>3 stars</span></div>
                  <div class="dropdown-item"><i class="fa-solid fa-star"></i> <span>2 stars</span></div>
                  <div class="dropdown-item"><i class="fa-solid fa-star"></i> <span>1 star</span></div>
                </div>
              </div>

              <button type="button" class="media-toggle">
                <span>With media</span>
                <span class="toggle-icon"></span>
              </button>
            </div>

            <div class="controls-right">
              <label>Sort by :</label>
              <div class="custom-dropdown_for_reviews" id="sortDropdown">
                <button class="dropdown-trigger">
                  <span>Most recent</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </button>

                <div class="dropdown-menu_for_reviews">
                  <div class="dropdown-item active">
                    <span>Most recent</span>
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <div class="dropdown-item"><span>With media</span></div>
                  <div class="dropdown-item"><span>Verified purchase</span></div>
                  <div class="dropdown-item"><span>Highest rating</span></div>
                  <div class="dropdown-item"><span>Lowest rating</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="review-list">
            <div class="review-card">
              <div class="review-meta-top">
                <div class="reviewer-info">
                  <strong>Yisim L. us</strong>
                  <span class="verified-tag">Verified Buyer</span>
                </div>
                <span class="review-date">03/23/26</span>
              </div>

              <h3 class="review-title serif-title">Fantastic shelter!</h3>
              <div class="stars-black">★★★★★</div>

              <p class="review-body">
                For the price point and the construction it's a fantastic shelter. And can fit in small cars.
                It gives a lot of space, but still can pack down small. It definitely can be used by a family of
                4 or 2.
                Or you can put up another inner tent, to make the make whole shelter sleeping quarters.
                It sets up very quickly.
              </p>

              <div class="review-footer">
                <div class="helpful-container">
                  <span>Was this review helpful?</span>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-up"></i> 0</button>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-down"></i> 0</button>
                </div>
              </div>
            </div>
          </div>

          <div class="review-list">
            <div class="review-card">
              <div class="review-meta-top">
                <div class="reviewer-info">
                  <strong>Yisim L. us</strong>
                  <span class="verified-tag">Verified Buyer</span>
                </div>
                <span class="review-date">03/23/26</span>
              </div>

              <h3 class="review-title serif-title">Fantastic shelter!</h3>
              <div class="stars-black">★★★★★</div>

              <p class="review-body">
                For the price point and the construction it's a fantastic shelter. And can fit in small cars.
                It gives a lot of space, but still can pack down small. It definitely can be used by a family of
                4 or 2.
                Or you can put up another inner tent, to make the make whole shelter sleeping quarters.
                It sets up very quickly.
              </p>

              <div class="review-footer">
                <div class="helpful-container">
                  <span>Was this review helpful?</span>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-up"></i> 0</button>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-down"></i> 0</button>
                </div>
              </div>
            </div>
          </div>

          <div class="review-list">
            <div class="review-card">
              <div class="review-meta-top">
                <div class="reviewer-info">
                  <strong>Yisim L. us</strong>
                  <span class="verified-tag">Verified Buyer</span>
                </div>
                <span class="review-date">03/23/26</span>
              </div>

              <h3 class="review-title serif-title">Fantastic shelter!</h3>
              <div class="stars-black">★★★★★</div>

              <p class="review-body">
                For the price point and the construction it's a fantastic shelter. And can fit in small cars.
                It gives a lot of space, but still can pack down small. It definitely can be used by a family of
                4 or 2.
                Or you can put up another inner tent, to make the make whole shelter sleeping quarters.
                It sets up very quickly.
              </p>

              <div class="review-footer">
                <div class="helpful-container">
                  <span>Was this review helpful?</span>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-up"></i> 0</button>
                  <button class="vote-btn"><i class="fa-regular fa-thumbs-down"></i> 0</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Initialize accordion functionality
  function initAccordion() {
    document.querySelectorAll('.accordion-btn').forEach(button => {
      button.addEventListener('click', function () {
        const content = this.nextElementSibling;
        if (content.style.display === 'block') {
          content.style.display = 'none';
          this.querySelector('span').textContent = '⌄';
        } else {
          content.style.display = 'block';
          this.querySelector('span').textContent = '⌃';
        }
      });
    });
  }

  // Initialize review dropdowns
  function initReviewDropdowns() {
    function setupDropdown(dropdownId) {
      const dropdown = document.getElementById(dropdownId);
      if (!dropdown) return;

      const trigger = dropdown.querySelector('.dropdown-trigger');
      const items = dropdown.querySelectorAll('.dropdown-item');

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.custom-dropdown_for_reviews').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
      });

      items.forEach(item => {
        item.addEventListener('click', function () {
          items.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
          trigger.querySelector('span').textContent = this.querySelector('span').textContent;
          dropdown.classList.remove('open');
        });
      });
    }

    setupDropdown('ratingDropdown');
    setupDropdown('sortDropdown');

    // Media toggle
    const mediaToggle = document.querySelector('.media-toggle');
    if (mediaToggle) {
      mediaToggle.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-dropdown_for_reviews').forEach(d => d.classList.remove('open'));
    });
  }

  // Initialize review modal
  function initReviewModal() {
    const modal = document.getElementById('reviewModal');
    const openBtn = document.querySelector('.write-review-btn');
    const closeBtn = document.getElementById('closeModal');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    // Star rating
    document.querySelectorAll('.star-input i').forEach(star => {
      star.addEventListener('click', function () {
        const val = this.getAttribute('data-value');
        document.querySelectorAll('.star-input i').forEach(s => {
          const sVal = s.getAttribute('data-value');
          s.classList.toggle('active', sVal <= val);
          s.classList.toggle('fa-solid', sVal <= val);
          s.classList.toggle('fa-regular', sVal > val);
        });
      });
    });

    // Recommend buttons
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        this.parentElement.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  }

  // Main initialization
  function init() {
    if (!loadProducts()) {
      showError('Unable to load product data.');
      return;
    }

    const productId = getProductIdFromUrl();

    if (!productId) {
      showError('No product specified. Please use a URL like <code>product.html?id=alpha-breeze-tent</code>');
      return;
    }

    currentProduct = getProductById(productId);

    if (!currentProduct) {
      showError(`Product with ID "${productId}" not found.`);
      return;
    }

    renderProductDetail(currentProduct);

    // Initialize all dynamic functionality
    initAccordion();
    initReviewDropdowns();
    initReviewModal();

    // Update cart/wishlist UI
    if (typeof window.CPSCart !== 'undefined') {
      window.CPSCart.updateCartBadge();
    }
    if (typeof window.CPSWishlist !== 'undefined') {
      window.CPSWishlist.updateWishlistButtons();
    }
  }

  function showError(message) {
    const container = document.getElementById('product-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align:center; padding: 60px 20px; max-width: 600px; margin: 100px auto; font-size: 18px; line-height: 1.6;">
          <h2>Product Not Available</h2>
          <p>${message}</p>
          <p><a href="Tent_Cat.html">Browse all products</a></p>
        </div>
      `;
    }
  }

  // Make changeQty available globally
  window.productChangeQty = changeQty;
  window.getProductIdFromUrl = getProductIdFromUrl;

  // Start initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
