
// ==========================================
// SHOPEASE - LUXURY BOUTIQUE
// ==========================================

// API and application data
const API_URL = "https://fakestoreapi.com/products";

let products = [];
let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
let selectedCategory = "all";

// ==========================================
// HTML ELEMENTS
// ==========================================

const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("searchInput");

const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartButton = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const shippingElement = document.getElementById("shipping");
const totalElement = document.getElementById("total");

const checkoutButton = document.getElementById("checkoutButton");
const checkoutModal = document.getElementById("checkoutModal");
const closeModalButton = document.getElementById("closeModal");

const orderForm = document.getElementById("orderForm");
const orderConfirmation = document.getElementById("orderConfirmation");

const continueShoppingButton = document.getElementById("continueShopping");

// Product details modal
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");


// ==========================================
// FETCH PRODUCTS FROM FAKESTORE API
// ==========================================

async function fetchProducts() {

    try {

        productContainer.innerHTML = "<p>Loading products...</p>";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Product loading error:", error);

        productContainer.innerHTML =
            "<p>Sorry, products could not be loaded. Please refresh the page.</p>";

    }

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {

        productContainer.innerHTML =
            "<p>No products found.</p>";

        return;

    }

    productList.forEach(product => {

        const productCard = document.createElement("div");

        productCard.classList.add("product-card");

        // Product badges
        let badge = "";

        if (product.id <= 4) {

            badge = `<span class="product-tag">NEW</span>`;

        } else if (product.rating && product.rating.rate >= 4.5) {

            badge = `<span class="product-tag bestseller">BESTSELLER</span>`;

        }

        const rating = product.rating ? product.rating.rate : 0;
        const reviews = product.rating ? product.rating.count : 0;

        productCard.innerHTML = `

            <div class="product-image-container">

                ${badge}

                <img
                    src="${product.image}"
                    alt="${product.title}"
                    class="product-image"
                >

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3 class="product-title">
                    ${product.title}
                </h3>

                <p class="product-rating">
                    ★ ${rating} (${reviews} reviews)
                </p>

                <p class="product-price">
                    $${product.price.toFixed(2)}
                </p>

                <div class="product-actions">

                    <button
                        class="view-details-btn"
                        data-id="${product.id}"
                    >
                        View Details
                    </button>

                    <button
                        class="add-to-cart-btn"
                        data-id="${product.id}"
                    >
                        ADD TO CART
                    </button>

                </div>

            </div>

        `;

        productContainer.appendChild(productCard);

    });

}


// ==========================================
// PRODUCT CARD BUTTONS
// ==========================================

productContainer.addEventListener("click", function(event) {

    const detailsButton = event.target.closest(".view-details-btn");
    const addButton = event.target.closest(".add-to-cart-btn");

    if (detailsButton) {

        const productId = Number(detailsButton.dataset.id);

        openProductDetails(productId);

    }

    if (addButton) {

        const productId = Number(addButton.dataset.id);

        addToCart(productId);

    }

});


// ==========================================
// CATEGORY FILTERS
// ==========================================

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedCategory = this.dataset.category;

        filterProducts();

    });

});


// ==========================================
// SEARCH PRODUCTS
// ==========================================

if (searchInput) {

    searchInput.addEventListener("input", filterProducts);

}


function filterProducts() {

    const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const filteredProducts = products.filter(product => {

        const matchesCategory =
            selectedCategory === "all" ||
            product.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch =
            product.title.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;

    });

    displayProducts(filteredProducts);

}


// ==========================================
// PRODUCT DETAILS MODAL
// ==========================================

function openProductDetails(productId) {

    const product = products.find(item => item.id === productId);

    if (!product || !productModal) return;

    document.getElementById("detailImage").src = product.image;

    document.getElementById("detailCategory").textContent =
        product.category;

    document.getElementById("detailTitle").textContent =
        product.title;

    document.getElementById("detailRating").textContent =
        `★ ${product.rating.rate} (${product.rating.count} reviews)`;

    document.getElementById("detailPrice").textContent =
        `$${product.price.toFixed(2)}`;

    document.getElementById("detailDescription").textContent =
        product.description;

    const detailAddButton =
        document.getElementById("detailAddToCart");

    detailAddButton.onclick = function() {

        addToCart(product.id);

        productModal.classList.remove("show");

    };

    productModal.classList.add("show");

}


if (closeProductModal) {

    closeProductModal.addEventListener("click", function() {

        productModal.classList.remove("show");

    });

}


if (productModal) {

    productModal.addEventListener("click", function(event) {

        if (event.target === productModal) {

            productModal.classList.remove("show");

        }

    });

}


// ==========================================
// SAVE CART TO LOCAL STORAGE
// ==========================================

function saveCart() {

    localStorage.setItem("shoppingCart", JSON.stringify(cart));

}


// ==========================================
// ADD PRODUCT TO CART
// ==========================================


function addToCart(productId) {

    const product = products.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
    openCart(); // Automatically opens the cart drawer
}



// ==========================================
// REMOVE PRODUCT FROM CART
// ==========================================

function removeFromCart(productId) {

    cart = cart.filter(item => item.id !== productId);

    saveCart();

    updateCartCount();

    renderCart();

}


// ==========================================
// UPDATE PRODUCT QUANTITY
// ==========================================

function updateQuantity(productId, change) {

    const item = cart.find(product => product.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }

    saveCart();

    updateCartCount();

    renderCart();

}


// ==========================================
// UPDATE CART BADGE
// ==========================================

function updateCartCount() {

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

}


// ==========================================
// DISPLAY CART ITEMS
// ==========================================

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p class='empty-cart'>Your cart is currently empty.</p>";

    }

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.title}"
                class="cart-item-image"
            >

            <div class="cart-item-details">

                <h4>${item.title}</h4>

                <p>$${item.price.toFixed(2)}</p>

                <div class="quantity-controls">

                    <button
                        class="quantity-btn decrease"
                        data-id="${item.id}"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        class="quantity-btn increase"
                        data-id="${item.id}"
                    >+</button>

                </div>

                <button
                    class="remove-item-btn"
                    data-id="${item.id}"
                >
                    Remove
                </button>

            </div>

        `;

        cartItems.appendChild(cartItem);

    });

    calculateTotal();

}


// Cart quantity and remove buttons
cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const productId = Number(button.dataset.id);

    if (button.classList.contains("increase")) {

        updateQuantity(productId, 1);

    }

    if (button.classList.contains("decrease")) {

        updateQuantity(productId, -1);

    }

    if (button.classList.contains("remove-item-btn")) {

        removeFromCart(productId);

    }

});


// ==========================================
// CALCULATE CART TOTALS
// ==========================================

function calculateTotal() {

    const subtotal = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const tax = subtotal * 0.15;

    const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 5;

    const total = subtotal + tax + shipping;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

    taxElement.textContent = `$${tax.toFixed(2)}`;

    shippingElement.textContent =
        shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;

    totalElement.textContent = `$${total.toFixed(2)}`;

}


// ==========================================
// OPEN AND CLOSE CART
// ==========================================

function openCart() {

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("show");

}


function closeCart() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("show");

}


if (cartButton) {

    cartButton.addEventListener("click", openCart);

}


if (closeCartButton) {

    closeCartButton.addEventListener("click", closeCart);

}


if (cartOverlay) {

    cartOverlay.addEventListener("click", closeCart);

}


// ==========================================
// OPEN CHECKOUT
// ==========================================

function renderCheckoutSummary() {

    const summary = document.getElementById("checkoutOrderSummary");

    if (!summary) return;

    summary.innerHTML = "";

    cart.forEach(function(item) {

        const itemElement = document.createElement("div");

        itemElement.className = "checkout-summary-item";

        itemElement.innerHTML = `
            <span>${item.title} × ${item.quantity}</span>
            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        `;

        summary.appendChild(itemElement);

    });

}

if (checkoutButton) {

    checkoutButton.addEventListener("click", function() {

        if (cart.length === 0) {

            alert("Your cart is empty. Please add products first.");

            return;

        }

        closeCart();

        checkoutModal.classList.add("show");
        renderCheckoutSummary();
        document.getElementById("checkoutTotal").textContent =
          document.getElementById("total").textContent;

        orderForm.classList.remove("hidden");

        orderConfirmation.classList.add("hidden");

    });

}


// ==========================================
// CLOSE CHECKOUT
// ==========================================

if (closeModalButton) {

    closeModalButton.addEventListener("click", function() {

        checkoutModal.classList.remove("show");

    });

}


// ==========================================
// PLACE ORDER
// ==========================================

if (orderForm) {

    orderForm.addEventListener("submit", function(event) {

        event.preventDefault();

        if (cart.length === 0) return;

        const customerName =
            document.getElementById("customerName").value;

        const customerEmail =
            document.getElementById("customerEmail").value;

        const customerAddress =
            document.getElementById("customerAddress").value;

        const orderNumber =
            "SH" + Date.now().toString().slice(-8);

        const orderTotal = totalElement.textContent;

        console.log("New ShopEase Order");

        console.log("Order Number:", orderNumber);

        console.log("Customer:", customerName);

        console.log("Email:", customerEmail);

        console.log("Address:", customerAddress);

        console.log("Items:", cart);

        console.log("Total:", orderTotal);

        document.getElementById("orderNumber").textContent =
            orderNumber;

        orderForm.classList.add("hidden");

        orderConfirmation.classList.remove("hidden");

        // Empty cart after successful demo order
        cart = [];

        saveCart();

        updateCartCount();

        renderCart();

    });

}


// ==========================================
// CONTINUE SHOPPING
// ==========================================

if (continueShoppingButton) {

    continueShoppingButton.addEventListener("click", function() {

        checkoutModal.classList.remove("show");

        closeCart();

        window.scrollTo({
            top: document.getElementById("products").offsetTop,
            behavior: "smooth"
        });

    });

}


// ==========================================
// INITIALISE SHOP
// ==========================================

fetchProducts();

updateCartCount();

renderCart();
