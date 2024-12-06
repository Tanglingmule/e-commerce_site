// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
const categoryFilter = document.getElementById('categoryFilter');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const themeToggle = document.getElementById('themeToggle');
const cartCount = document.getElementById('cartCount');
const wishlistCount = document.getElementById('wishlistCount');
const cartSidebar = document.getElementById('cart');
const wishlistSidebar = document.getElementById('wishlist');

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let filteredProducts = [...products];

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Initialize theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Product Display
function displayProducts(products) {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>£${product.price.toFixed(2)}</p>
                <div class="star-rating" data-rating="${product.rating}">
                    ${generateStars(product.rating)}
                </div>
                <p>${product.reviews} reviews</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
                <button onclick="toggleWishlist(${product.id})">
                    <i class="fas fa-heart ${wishlist.includes(product.id) ? 'active' : ''}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Star Rating System
function generateStars(rating) {
    return Array.from({ length: 5 }, (_, i) => `
        <span class="star ${i < Math.floor(rating) ? 'active' : ''}"
              data-value="${i + 1}">★</span>
    `).join('');
}

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length > 0) {
        const suggestions = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        displaySuggestions(suggestions);
    } else {
        searchSuggestions.style.display = 'none';
    }
});

function displaySuggestions(suggestions) {
    searchSuggestions.innerHTML = suggestions.map(product => `
        <div class="suggestion" onclick="selectProduct(${product.id})">
            ${product.name} - £${product.price.toFixed(2)}
        </div>
    `).join('');
    searchSuggestions.style.display = 'block';
}

function selectProduct(id) {
    const product = products.find(p => p.id === id);
    showProductModal(product);
    searchSuggestions.style.display = 'none';
    searchInput.value = '';
}

// Filtering
categoryFilter.addEventListener('change', filterProducts);
priceRange.addEventListener('input', filterProducts);

function filterProducts() {
    const category = categoryFilter.value;
    const maxPrice = parseInt(priceRange.value);
    priceValue.textContent = `£0 - £${maxPrice}`;

    filteredProducts = products.filter(product => 
        (category === 'all' || product.category === category) &&
        product.price <= maxPrice
    );
    displayProducts(filteredProducts);
}

// Cart Functions
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    updateCart();
    showSuccessMessage('Item added to cart!');
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    updateCartSidebar();
}

function updateCartSidebar() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.getElementById('cartTotal');
    let total = 0;

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" width="50">
                <div>
                    <h4>${product.name}</h4>
                    <p>£${product.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = `£${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Wishlist Functions
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
        showSuccessMessage('Item added to wishlist!');
    } else {
        wishlist.splice(index, 1);
        showSuccessMessage('Item removed from wishlist!');
    }
    updateWishlist();
}

function updateWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    wishlistCount.textContent = wishlist.length;
    updateWishlistSidebar();
}

function updateWishlistSidebar() {
    const wishlistItems = document.querySelector('.wishlist-items');
    wishlistItems.innerHTML = wishlist.map(id => {
        const product = products.find(p => p.id === id);
        return `
            <div class="wishlist-item">
                <img src="${product.image}" alt="${product.name}" width="50">
                <div>
                    <h4>${product.name}</h4>
                    <p>£${product.price.toFixed(2)}</p>
                </div>
                <button onclick="toggleWishlist(${id})">Remove</button>
            </div>
        `;
    }).join('');
}

// Success Message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
}

// Carousel
let currentSlide = 0;
const featuredProducts = products.slice(0, 4); // Show first 4 products in carousel

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.querySelector('.prev').addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + featuredProducts.length) % featuredProducts.length;
    updateCarousel();
});

document.querySelector('.next').addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % featuredProducts.length;
    updateCarousel();
});

// Initialize
displayProducts(products);
updateCart();
updateWishlist();

// Product Modal
function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h2>${product.name}</h2>
                <p class="price">£${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <div class="star-rating" data-rating="${product.rating}">
                    ${generateStars(product.rating)}
                </div>
                <p>${product.reviews} reviews</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
                <button onclick="toggleWishlist(${product.id})">
                    <i class="fas fa-heart ${wishlist.includes(product.id) ? 'active' : ''}"></i>
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
};
