(function () {
  const CART_KEY = "cps-cart";
  const WISHLIST_KEY = "cps-wishlist";

  function getStoredItems(key) {
    try {
      const storedItems = localStorage.getItem(key);
      const parsedItems = storedItems ? JSON.parse(storedItems) : [];
      return Array.isArray(parsedItems) ? parsedItems : [];
    } catch (error) {
      console.error("Unable to read stored data.", error);
      return [];
    }
  }

  function saveStoredItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
    updateCartBadge();
    updateWishlistBadge();
    renderCartPage();
    renderWishlistPage();
    renderCheckoutPage();
    updateWishlistButtons();
  }

  function getCart() {
    return getStoredItems(CART_KEY);
  }

  function getWishlist() {
    return getStoredItems(WISHLIST_KEY);
  }

  function saveCart(cart) {
    saveStoredItems(CART_KEY, cart);
  }

  function saveWishlist(wishlist) {
    saveStoredItems(WISHLIST_KEY, wishlist);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCartCount(cart) {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function getWishlistCount(wishlist) {
    return wishlist.length;
  }

  function normalizeItem(item, quantityOverride) {
    if (!item || !item.id || !item.name) {
      return null;
    }

    const price = Number(item.price);
    const quantity = Math.max(1, Number(quantityOverride ?? item.quantity) || 1);

    return {
      id: String(item.id),
      name: String(item.name),
      price: Number.isFinite(price) ? price : 0,
      quantity,
      image: item.image ? String(item.image) : "",
      description: item.description ? String(item.description) : "",
      url: item.url ? String(item.url) : ""
    };
  }

  function addItem(item) {
    const normalizedItem = normalizeItem(item);

    if (!normalizedItem) {
      return;
    }

    const cart = getCart();
    const existingItem = cart.find((cartItem) => cartItem.id === normalizedItem.id);

    if (existingItem) {
      existingItem.quantity += normalizedItem.quantity;
    } else {
      cart.push(normalizedItem);
    }

    saveCart(cart);
  }

  function addWishlistItem(item) {
    const normalizedItem = normalizeItem(item, 1);

    if (!normalizedItem) {
      return;
    }

    const wishlist = getWishlist();
    const alreadySaved = wishlist.some((wishlistItem) => wishlistItem.id === normalizedItem.id);

    if (alreadySaved) {
      return;
    }

    wishlist.push(normalizedItem);
    saveWishlist(wishlist);
  }

  function isInWishlist(id) {
    return getWishlist().some((item) => item.id === String(id));
  }

  function updateItemQuantity(id, quantity) {
    const cart = getCart();
    const nextQuantity = Math.max(0, Number(quantity) || 0);
    const itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return;
    }

    if (nextQuantity === 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = nextQuantity;
    }

    saveCart(cart);
  }

  function removeItem(id) {
    const filteredCart = getCart().filter((item) => item.id !== id);
    saveCart(filteredCart);
  }

  function removeWishlistItem(id) {
    const filteredWishlist = getWishlist().filter((item) => item.id !== id);
    saveWishlist(filteredWishlist);
  }

  function clearCart() {
    saveCart([]);
  }

  function clearWishlist() {
    saveWishlist([]);
  }

  function moveWishlistItemToCart(id) {
    const wishlist = getWishlist();
    const item = wishlist.find((wishlistItem) => wishlistItem.id === id);

    if (!item) {
      return;
    }

    addItem({ ...item, quantity: 1 });
    removeWishlistItem(id);
  }

  function moveAllWishlistToCart() {
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
      return;
    }

    // Add all wishlist items to cart
    wishlist.forEach(item => {
      addItem({ ...item, quantity: 1 });
    });

    // Clear the wishlist
    clearWishlist();
  }

  function updateCartBadge() {
    const count = getCartCount(getCart());

    document.querySelectorAll("[data-cart-count]").forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  function updateWishlistBadge() {
    const count = getWishlistCount(getWishlist());

    document.querySelectorAll("[data-wishlist-count]").forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  function getItemData(button) {
    const source = button.closest("[data-product-card]") || button;
    const quantityTarget = button.dataset.qtyTarget;
    const quantityElement = quantityTarget ? document.getElementById(quantityTarget) : null;
    const quantity = quantityElement ? Number(quantityElement.textContent.trim()) : 1;

    return {
      id: source.dataset.productId,
      name: source.dataset.productName,
      price: source.dataset.productPrice,
      image: source.dataset.productImage,
      description: source.dataset.productDescription,
      url: source.dataset.productUrl,
      quantity
    };
  }

  function showAddFeedback(button) {
    if (button.dataset.originalLabel === undefined) {
      button.dataset.originalLabel = button.textContent.trim();
    }

    button.textContent = "ADDED";
    button.classList.add("is-added");

    window.clearTimeout(button._cartFeedbackTimer);
    button._cartFeedbackTimer = window.setTimeout(() => {
      button.textContent = button.dataset.originalLabel;
      button.classList.remove("is-added");
    }, 1400);
  }

  function bindAddToCartButtons() {
    // Use event delegation - no need to rebind on new content
    // This function is kept for backwards compatibility but does nothing now
  }

  function bindAddToWishlistButtons() {
    // Use event delegation - no need to rebind on new content
    // This function is kept for backwards compatibility but does nothing now
  }

  function setWishlistButtonState(button, isSaved) {
    const label = button.querySelector("span");
    const icon = button.querySelector("i");

    if (button.dataset.originalLabel === undefined) {
      button.dataset.originalLabel = label ? label.textContent.trim() : button.textContent.trim();
    }

    if (label) {
      label.textContent = isSaved ? "IN WISHLIST" : button.dataset.originalLabel;
    } else {
      button.textContent = isSaved ? "IN WISHLIST" : button.dataset.originalLabel;
    }

    if (icon) {
      icon.classList.toggle("fa-solid", isSaved);
      icon.classList.toggle("fa-regular", !isSaved);
    }

    button.classList.toggle("is-added", isSaved);
    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
  }

  function updateWishlistButtons() {
    document.querySelectorAll("[data-add-to-wishlist]").forEach((button) => {
      const item = getItemData(button);
      const isSaved = item.id ? isInWishlist(item.id) : false;
      setWishlistButtonState(button, isSaved);
    });
  }

  function initEventDelegation() {
    // Cart button click delegation
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add-to-cart]');
      if (button) {
        addItem(getItemData(button));
        showAddFeedback(button);
      }
    });

    // Wishlist button click delegation
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add-to-wishlist]');
      if (button) {
        const item = getItemData(button);
        if (!item.id || isInWishlist(item.id)) {
          return;
        }
        addWishlistItem(item);
      }
    });
  }

  function updateProductButtons() {
    // Update button states on dynamically loaded products
    updateWishlistButtons();
  }

  function renderCartPage() {
    const cartPage = document.querySelector("[data-cart-page]");

    if (!cartPage) {
      return;
    }

    const itemsContainer = cartPage.querySelector("[data-cart-items]");
    const emptyState = cartPage.querySelector("[data-cart-empty]");
    const filledState = cartPage.querySelector("[data-cart-filled]");
    const subtotalElement = cartPage.querySelector("[data-cart-subtotal]");
    const totalElement = cartPage.querySelector("[data-cart-total]");
    const countElements = cartPage.querySelectorAll("[data-cart-count-label]");
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (!itemsContainer || !emptyState || !filledState) {
      return;
    }

    if (cart.length === 0) {
      emptyState.hidden = false;
      filledState.hidden = true;
      itemsContainer.innerHTML = "";
    } else {
      emptyState.hidden = true;
      filledState.hidden = false;
      itemsContainer.innerHTML = cart
        .map((item) => {
          const itemTotal = item.price * item.quantity;
          const itemName = escapeHtml(item.name);
          const itemDescription = escapeHtml(item.description || "Camping essential");
          const itemUrl = item.url ? escapeHtml(item.url) : "";
          const imageMarkup = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${itemName}" class="cart-item-image">`
            : `<div class="cart-item-image cart-item-image-placeholder">No image</div>`;

          return `
            <article class="cart-item" data-cart-item="${escapeHtml(item.id)}">
              <div class="cart-item-media">
                ${imageMarkup}
              </div>
              <div class="cart-item-content">
                <div class="cart-item-copy">
                  ${
                    itemUrl
                      ? `<a href="${itemUrl}" class="cart-item-name">${itemName}</a>`
                      : `<h3 class="cart-item-name">${itemName}</h3>`
                  }
                  <p class="cart-item-description">${itemDescription}</p>
                </div>
                <div class="cart-item-controls">
                  <div class="cart-qty-control">
                    <button type="button" data-cart-change="-1" data-cart-id="${escapeHtml(item.id)}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-change="1" data-cart-id="${escapeHtml(item.id)}">+</button>
                  </div>
                  <button type="button" class="cart-remove-btn" data-cart-remove="${escapeHtml(item.id)}">Remove</button>
                </div>
              </div>
              <div class="cart-item-total">${formatCurrency(itemTotal)}</div>
            </article>
          `;
        })
        .join("");
    }

    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal);
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(subtotal);
    }

    if (countElements.length) {
      const itemCount = getCartCount(cart);
      const countLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;
      countElements.forEach((element) => {
        element.textContent = countLabel;
      });
    }
  }

  function renderWishlistPage() {
    const wishlistPage = document.querySelector("[data-wishlist-page]");

    if (!wishlistPage) {
      return;
    }

    const itemsContainer = wishlistPage.querySelector("[data-wishlist-items]");
    const emptyState = wishlistPage.querySelector("[data-wishlist-empty]");
    const filledState = wishlistPage.querySelector("[data-wishlist-filled]");
    const subtotalElement = wishlistPage.querySelector("[data-wishlist-subtotal]");
    const totalElement = wishlistPage.querySelector("[data-wishlist-total]");
    const countElements = wishlistPage.querySelectorAll("[data-wishlist-count-label]");
    const wishlist = getWishlist();
    const subtotal = wishlist.reduce((total, item) => total + item.price, 0);

    if (!itemsContainer || !emptyState || !filledState) {
      return;
    }

    if (wishlist.length === 0) {
      emptyState.hidden = false;
      filledState.hidden = true;
      itemsContainer.innerHTML = "";
    } else {
      emptyState.hidden = true;
      filledState.hidden = false;
      itemsContainer.innerHTML = wishlist
        .map((item) => {
          const itemName = escapeHtml(item.name);
          const itemDescription = escapeHtml(item.description || "Camping essential");
          const itemUrl = item.url ? escapeHtml(item.url) : "";
          const imageMarkup = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${itemName}" class="cart-item-image">`
            : `<div class="cart-item-image cart-item-image-placeholder">No image</div>`;

          return `
            <article class="cart-item" data-wishlist-item="${escapeHtml(item.id)}">
              <div class="cart-item-media">
                ${imageMarkup}
              </div>
              <div class="cart-item-content">
                <div class="cart-item-copy">
                  ${
                    itemUrl
                      ? `<a href="${itemUrl}" class="cart-item-name">${itemName}</a>`
                      : `<h3 class="cart-item-name">${itemName}</h3>`
                  }
                  <p class="cart-item-description">${itemDescription}</p>
                </div>
                <div class="cart-item-controls is-wishlist">
                  <div class="cart-item-actions">
                    <button type="button" class="cart-inline-action cart-inline-action--primary" data-wishlist-move-to-cart="${escapeHtml(item.id)}">Move To Cart</button>
                    <button type="button" class="cart-remove-btn" data-wishlist-remove="${escapeHtml(item.id)}">Remove</button>
                  </div>
                </div>
              </div>
              <div class="cart-item-total">${formatCurrency(item.price)}</div>
            </article>
          `;
        })
        .join("");
    }

    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal);
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(subtotal);
    }

    if (countElements.length) {
      const itemCount = getWishlistCount(wishlist);
      const countLabel = itemCount === 1 ? "1 item" : `${itemCount} items`;
      countElements.forEach((element) => {
        element.textContent = countLabel;
      });
    }
  }

  function addBusinessDays(startDate, businessDaysToAdd) {
    const result = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let added = 0;

    while (added < businessDaysToAdd) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();

      if (day !== 0 && day !== 6) {
        added += 1;
      }
    }

    return result;
  }

  function formatCheckoutDay(date) {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  function renderCheckoutPage() {
    const checkoutPage = document.querySelector("[data-checkout-page]");

    if (!checkoutPage) {
      return;
    }

    if (checkoutPage.dataset.checkoutCompleted === "true") {
      return;
    }

    const emptyState = checkoutPage.querySelector("[data-checkout-empty]");
    const mainStack = checkoutPage.querySelector("[data-checkout-main]");
    const filledLayout = checkoutPage.querySelector("[data-checkout-filled]");
    const itemsContainer = checkoutPage.querySelector("[data-checkout-items]");
    const subtotalElement = checkoutPage.querySelector("[data-checkout-subtotal]");
    const totalElement = checkoutPage.querySelector("[data-checkout-total]");
    const deliveryHeadline = checkoutPage.querySelector("[data-checkout-delivery-headline]");
    const deliveryCopy = checkoutPage.querySelector("[data-checkout-delivery-copy]");
    const valuePointsElement = checkoutPage.querySelector("[data-checkout-value-points]");
    const rewardPointsElement = checkoutPage.querySelector("[data-checkout-reward-points]");
    const pointsHeadline = checkoutPage.querySelector("[data-checkout-points-headline]");
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cart.length === 0) {
      if (emptyState) {
        emptyState.hidden = false;
      }

      if (mainStack) {
        mainStack.hidden = true;
      }

      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    if (mainStack) {
      mainStack.hidden = false;
    }

    if (filledLayout) {
      filledLayout.hidden = false;
    }

    if (itemsContainer) {
      itemsContainer.innerHTML = cart
        .map((item) => {
          const itemName = escapeHtml(item.name);
          const imageMarkup = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="${itemName}">`
            : `<div class="checkout-mini-placeholder" aria-hidden="true">No image</div>`;

          return `
            <div class="checkout-mini-item">
              ${imageMarkup}
              <div class="checkout-mini-copy">
                <h3>${itemName}</h3>
                <p>Qty ${item.quantity} · ${formatCurrency(item.price)} each</p>
              </div>
            </div>
          `;
        })
        .join("");
    }

    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal);
    }

    if (totalElement) {
      totalElement.textContent = formatCurrency(subtotal);
    }

    const today = new Date();
    const calendarDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const shipByDay = addBusinessDays(calendarDay, 1);
    const deliveryStart = addBusinessDays(calendarDay, 4);
    const deliveryEnd = addBusinessDays(calendarDay, 6);

    if (deliveryHeadline) {
      deliveryHeadline.textContent = `${formatCheckoutDay(deliveryStart)} – ${formatCheckoutDay(deliveryEnd)}`;
    }

    if (deliveryCopy) {
      deliveryCopy.textContent = `Orders placed ${formatCheckoutDay(calendarDay)} usually ship by ${formatCheckoutDay(
        shipByDay
      )} and arrive on a weekday inside this delivery window.`;
    }

    const valuePoints = Math.floor(subtotal);
    const rewardPoints = Math.max(0, Math.floor(subtotal * 0.25));

    if (valuePointsElement) {
      valuePointsElement.textContent = String(valuePoints);
    }

    if (rewardPointsElement) {
      rewardPointsElement.textContent = String(rewardPoints);
    }

    if (pointsHeadline) {
      pointsHeadline.textContent = `${valuePoints + rewardPoints} combined points`;
    }
  }

  function bindCheckoutPageEvents() {
    const checkoutPage = document.querySelector("[data-checkout-page]");

    if (!checkoutPage || checkoutPage.dataset.checkoutEventsBound === "true") {
      return;
    }

    checkoutPage.dataset.checkoutEventsBound = "true";

    const form = checkoutPage.querySelector("[data-checkout-form]");
    const layout = checkoutPage.querySelector("[data-checkout-filled]");
    const success = checkoutPage.querySelector("[data-checkout-success]");

    if (!form) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      checkoutPage.dataset.checkoutCompleted = "true";

      if (layout) {
        layout.hidden = true;
      }

      if (success) {
        success.hidden = false;
      }

      clearCart();

      if (success) {
        success.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function bindCartPageEvents() {
    const cartPage = document.querySelector("[data-cart-page]");

    if (!cartPage || cartPage.dataset.cartEventsBound === "true") {
      return;
    }

    cartPage.dataset.cartEventsBound = "true";

    cartPage.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-cart-remove]");
      const quantityButton = event.target.closest("[data-cart-change]");
      const clearButton = event.target.closest("[data-clear-cart]");

      if (removeButton) {
        removeItem(removeButton.dataset.cartRemove);
        return;
      }

      if (quantityButton) {
        const itemId = quantityButton.dataset.cartId;
        const cart = getCart();
        const currentItem = cart.find((item) => item.id === itemId);

        if (!currentItem) {
          return;
        }

        const delta = Number(quantityButton.dataset.cartChange) || 0;
        updateItemQuantity(itemId, currentItem.quantity + delta);
        return;
      }

      if (clearButton) {
        clearCart();
      }
    });
  }

  function bindWishlistPageEvents() {
    const wishlistPage = document.querySelector("[data-wishlist-page]");

    if (!wishlistPage || wishlistPage.dataset.wishlistEventsBound === "true") {
      return;
    }

    wishlistPage.dataset.wishlistEventsBound = "true";

    wishlistPage.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-wishlist-remove]");
      const clearButton = event.target.closest("[data-clear-wishlist]");
      const moveButton = event.target.closest("[data-wishlist-move-to-cart]");
      const moveAllButton = event.target.closest("[data-move-all-to-cart]");

      if (removeButton) {
        removeWishlistItem(removeButton.dataset.wishlistRemove);
        return;
      }

      if (moveButton) {
        moveWishlistItemToCart(moveButton.dataset.wishlistMoveToCart);
        return;
      }

      if (moveAllButton) {
        moveAllWishlistToCart();
        return;
      }

      if (clearButton) {
        clearWishlist();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    updateWishlistBadge();
    initEventDelegation();
    updateWishlistButtons();
    updateProductButtons();
    renderCartPage();
    renderWishlistPage();
    renderCheckoutPage();
    bindCartPageEvents();
    bindWishlistPageEvents();
    bindCheckoutPageEvents();
  });

  window.CPSCart = {
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getCart,
    getCartCount,
    formatCurrency,
    updateCartBadge,
    updateProductButtons
  };

  window.CPSWishlist = {
    addWishlistItem,
    removeWishlistItem,
    clearWishlist,
    getWishlist,
    getWishlistCount,
    isInWishlist,
    updateWishlistButtons
  };
})();
