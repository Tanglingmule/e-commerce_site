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
const cartIcon = document.querySelector('.cart-icon');
const wishlistIcon = document.querySelector('.wishlist-icon');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');

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
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
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

// Carousel Functions
let currentSlide = 0;
const featuredProducts = products.filter(product => product.rating >= 4.5).slice(0, 10  );

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelector('.carousel-dots');
    
    // Update slides
    track.innerHTML = featuredProducts.map((product, index) => `
        <div class="carousel-item">
            <img src="${product.image}" alt="${product.name}">
            <div class="carousel-item-info">
                <h3>${product.name}</h3>
                <p class="price">£${product.price.toFixed(2)}</p>
                <div class="star-rating">${generateStars(product.rating)}</div>
                <button onclick="addToCart(${product.id})" class="add-to-cart-btn">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Update dots
    dots.innerHTML = featuredProducts.map((_, index) => `
        <div class="carousel-dot ${index === currentSlide ? 'active' : ''}" 
             onclick="goToSlide(${index})"></div>
    `).join('');

    // Update slide position
    track.style.transform = `translateX(-${currentSlide * 25}%)`;
}

function goToSlide(index) {
    if (index === currentSlide) return;
    currentSlide = index;
    updateCarousel();
}

function moveCarousel(direction) {
    if (direction === 'prev') {
        currentSlide = (currentSlide - 1 + featuredProducts.length) % featuredProducts.length;
    } else {
        currentSlide = (currentSlide + 1) % featuredProducts.length;
    }
    updateCarousel();
}

// Initialize carousel
updateCarousel();

// Add event listeners for carousel controls
document.querySelector('.prev').addEventListener('click', () => moveCarousel('prev'));
document.querySelector('.next').addEventListener('click', () => moveCarousel('next'));

// Auto-advance carousel with pause on hover
let carouselInterval;

function startCarouselAutoPlay() {
    carouselInterval = setInterval(() => {
        moveCarousel('next');
    }, 5000);
}

function stopCarouselAutoPlay() {
    clearInterval(carouselInterval);
}

// Add hover listeners to pause/resume autoplay
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', stopCarouselAutoPlay);
carouselContainer.addEventListener('mouseleave', startCarouselAutoPlay);

// Start autoplay initially
startCarouselAutoPlay();

// Handle touch events for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

carouselContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopCarouselAutoPlay();
});

carouselContainer.addEventListener('touchmove', (e) => {
    touchEndX = e.touches[0].clientX;
});

carouselContainer.addEventListener('touchend', () => {
    const swipeDistance = touchEndX - touchStartX;
    if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
        if (swipeDistance > 0) {
            moveCarousel('prev');
        } else {
            moveCarousel('next');
        }
    }
    startCarouselAutoPlay();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        moveCarousel('prev');
    } else if (e.key === 'ArrowRight') {
        moveCarousel('next');
    }
});

// Product Modal
function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="product-modal-content">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-details">
                <h2>${product.name}</h2>
                <p class="price">£${product.price.toFixed(2)}</p>
                <div class="star-rating">${generateStars(product.rating)}</div>
                <p class="reviews">${product.reviews} reviews</p>
                <p class="description">${product.description}</p>
                <div class="modal-buttons">
                    <button onclick="addToCart(${product.id})">Add to Cart</button>
                    <button onclick="toggleWishlist(${product.id})">
                        <i class="fas fa-heart ${wishlist.includes(product.id) ? 'active' : ''}"></i>
                        Add to Wishlist
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Sidebar Toggle
cartIcon.addEventListener('click', () => {
    cartSidebar.classList.toggle('active');
    wishlistSidebar.classList.remove('active');
});

wishlistIcon.addEventListener('click', () => {
    wishlistSidebar.classList.toggle('active');
    cartSidebar.classList.remove('active');
});

// Close sidebars when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-sidebar') && 
        !e.target.closest('.cart-icon') && 
        !e.target.closest('.wishlist-sidebar') && 
        !e.target.closest('.wishlist-icon')) {
        cartSidebar.classList.remove('active');
        wishlistSidebar.classList.remove('active');
    }
});

// Checkout Form
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showSuccessMessage('Your cart is empty!');
        return;
    }
    checkoutModal.style.display = 'block';
});

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    // Simulate order processing
    showSuccessMessage('Processing your order...');
    setTimeout(() => {
        // Clear cart
        cart = [];
        updateCart();
        
        // Close modal and show success
        checkoutModal.style.display = 'none';
        showSuccessMessage('Order placed successfully! Thank you for shopping with us.');
        
        // Reset form
        checkoutForm.reset();
    }, 2000);
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Add close button functionality for all modals
document.querySelectorAll('.close').forEach(closeButton => {
    closeButton.addEventListener('click', () => {
        const modal = closeButton.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Initialize product chart
function initializeProductChart() {
    const categoryCount = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('productChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Clothing', 'Accessories', 'Shoes'],
            datasets: [{
                data: [
                    categoryCount['clothing'] || 0,
                    categoryCount['accessories'] || 0,
                    categoryCount['shoes'] || 0
                ],
                backgroundColor: ['#4a90e2', '#f39c12', '#e74c3c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            plugins: {
                datalabels: {
                    color: '#fff',
                    anchor: 'center',
                    align: 'center',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: function(value, context) {
                        let sum = context.dataset.data.reduce((a, b) => a + b, 0);
                        let percentage = Math.round((value * 100 / sum)) + '%';
                        return value + '\n' + percentage;
                    }
                }
            }
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCart();
    updateWishlist();
    initializeProductChart();
    
    // Set initial price range value
    priceRange.value = 1000;
    priceValue.textContent = `£0 - £${priceRange.value}`;
});
