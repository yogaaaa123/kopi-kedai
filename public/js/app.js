'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Use JSON files for GitHub Pages (static hosting)
    const API_BASE = window.location.hostname === 'localhost' ? '/api' : '/kopi-kedai/public/data';
    const USE_STATIC = window.location.hostname !== 'localhost';

    const preloader = document.getElementById('preloader');
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartBtn = document.getElementById('cart-btn');
    const cartClose = document.getElementById('cart-close');
    const cartItemsEl = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartDiscount = document.getElementById('cart-discount');
    const discountAmountEl = document.getElementById('discount-amount');
    const promoInput = document.getElementById('promo-input');
    const applyPromoBtn = document.getElementById('apply-promo');
    const loadMoreBtn = document.getElementById('load-more');
    const menuGrid = document.getElementById('menu-grid');
    const featuredGrid = document.getElementById('featured-grid');
    const menuFilters = document.getElementById('menu-filters');
    const categoriesGrid = document.getElementById('categories-grid');
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const productModal = document.getElementById('product-modal');
    const productModalClose = document.getElementById('modal-close');
    const productModalBody = document.getElementById('modal-body');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutModalClose = document.getElementById('checkout-modal-close');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSubtotal = document.getElementById('checkout-subtotal');
    const checkoutDiscountRow = document.getElementById('checkout-discount-row');
    const checkoutDiscount = document.getElementById('checkout-discount');
    const checkoutTotal = document.getElementById('checkout-total');
    const successModal = document.getElementById('success-modal');
    const successClose = document.getElementById('success-close');
    const successOrderId = document.getElementById('order-id');
    const backToTop = document.getElementById('back-to-top');
    const trackBtn = document.getElementById('track-btn');
    const navTrackLink = document.getElementById('nav-track-link');
    const trackModal = document.getElementById('track-modal');
    const trackModalClose = document.getElementById('track-modal-close');
    const trackInput = document.getElementById('track-input');
    const trackSubmitBtn = document.getElementById('track-submit-btn');
    const trackResult = document.getElementById('track-result');
    const trackError = document.getElementById('track-error');
    const cartBackdrop = document.getElementById('cart-backdrop');

    let categories = [];
    let products = [];
    let featuredProducts = [];
    let filteredProducts = [];
    let displayCount = 8;
    let cart = JSON.parse(localStorage.getItem('kopi_cart') || '[]');
    let appliedPromo = null;

    /* ----------------- Helpers ----------------- */
    const formatCurrency = (value) => `Rp ${value?.toLocaleString('id-ID') ?? 0}`;

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    const closeModal = (modalEl) => modalEl?.classList.remove('show');
    const openModal = (modalEl) => modalEl?.classList.add('show');

    const saveCart = () => localStorage.setItem('kopi_cart', JSON.stringify(cart));

    const getCartTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = appliedPromo?.discount || 0;
        const total = Math.max(subtotal - discount, 0);
        return { subtotal, discount, total };
    };

    /* ----------------- Navigation ----------------- */
    navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu?.classList.add('show');
    });

    navClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        navMenu?.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
        if (navMenu?.classList.contains('show') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('show');
        }
    });

    // Smooth scroll untuk semua nav links
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Close mobile menu
                navMenu?.classList.remove('show');

                // Smooth scroll
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    /* ----------------- Scroll Events ----------------- */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop?.classList.add('show');
        } else {
            backToTop?.classList.remove('show');
        }
    });

    backToTop?.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ----------------- Search ----------------- */
    searchBtn?.addEventListener('click', () => openModal(searchModal));
    searchClose?.addEventListener('click', () => closeModal(searchModal));

    searchInput?.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        if (!keyword) {
            searchResults.innerHTML = '<p>Masukkan kata kunci.</p>';
            return;
        }
        const matches = products.filter((product) =>
            product.name.toLowerCase().includes(keyword) ||
            product.description?.toLowerCase().includes(keyword)
        );
        renderSearchResults(matches);
    });

    const renderSearchResults = (items) => {
        if (!items.length) {
            searchResults.innerHTML = '<p>Tidak ada hasil.</p>';
            return;
        }
        searchResults.innerHTML = items.slice(0, 5).map((item) => `
            <div class="search-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>${formatCurrency(item.price)}</p>
                </div>
            </div>
        `).join('');
    };

    searchResults?.addEventListener('click', (e) => {
        const card = e.target.closest('.search-item');
        if (!card) return;
        closeModal(searchModal);
        openProductModal(card.dataset.id);
    });

    /* ----------------- Fetch Data ----------------- */
    const fetchData = async (endpoint) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`);
            if (!res.ok) throw new Error('Gagal memuat data');
            return await res.json();
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
            return [];
        }
    };

    const loadInitialData = async () => {
        if (USE_STATIC) {
            // Load from JSON files for GitHub Pages
            const [categoryData, productData] = await Promise.all([
                fetch(`${API_BASE}/categories.json`).then(r => r.json()),
                fetch(`${API_BASE}/products.json`).then(r => r.json()),
            ]);

            categories = categoryData;
            products = productData;
            featuredProducts = products.filter(p => p.is_featured);
        } else {
            // Load from API for local development
            const [categoryData, productData, featuredData] = await Promise.all([
                fetchData('/categories'),
                fetchData('/products'),
                fetchData('/products?featured=true'),
            ]);

            categories = categoryData;
            products = productData;
            featuredProducts = featuredData;
        }

        filteredProducts = [...products];

        renderCategories();
        renderFilterButtons();
        renderProducts();
        renderFeatured();
        renderCart();
        renderPromoTimer();

        preloader?.classList.add('hide');
        setTimeout(() => preloader?.remove(), 600);
    };

    const renderCategories = () => {
        categoriesGrid.innerHTML = categories.map((cat) => `
            <div class="category-card" data-id="${cat.id}">
                <div class="category-icon">${cat.icon || '☕'}</div>
                <h4>${cat.name}</h4>
                <p>${cat.description || ''}</p>
            </div>
        `).join('');
    };

    categoriesGrid?.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (!card) return;
        const categoryId = Number(card.dataset.id);
        filterProducts(categoryId);
        window.scrollTo({ top: document.getElementById('menu').offsetTop - 80, behavior: 'smooth' });
    });

    const renderFilterButtons = () => {
        const buttons = ['all', ...categories.map((c) => c.id)];
        menuFilters.innerHTML = buttons.map((id) => {
            const label = id === 'all' ? 'Semua' : categories.find((c) => c.id === id)?.name;
            return `<button class="filter-btn ${id === 'all' ? 'active' : ''}" data-id="${id}">${label}</button>`;
        }).join('');
    };

    menuFilters?.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        menuFilters.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        filterProducts(btn.dataset.id === 'all' ? 'all' : Number(btn.dataset.id));
    });

    const filterProducts = (categoryId = 'all') => {
        filteredProducts = categoryId === 'all'
            ? [...products]
            : products.filter((product) => product.category_id === categoryId);
        displayCount = 8;
        renderProducts();
    };

    const renderProducts = () => {
        if (!filteredProducts.length) {
            menuGrid.innerHTML = '<p>Tidak ada menu pada kategori ini.</p>';
            return;
        }
        const visibleItems = filteredProducts.slice(0, displayCount);
        menuGrid.innerHTML = visibleItems.map((product) => `
            <article class="menu-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <div class="menu-card-body">
                    <span class="menu-category">${product.category_name || ''}</span>
                    <h3>${product.name}</h3>
                    <p>${product.description || ''}</p>
                    <div class="menu-card-footer">
                        <span class="price-tag">${formatCurrency(product.price)}</span>
                        <button class="add-cart-btn" data-id="${product.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        loadMoreBtn.style.display = filteredProducts.length > displayCount ? 'inline-flex' : 'none';
    };

    loadMoreBtn?.addEventListener('click', () => {
        displayCount += 8;
        renderProducts();
    });

    menuGrid?.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-cart-btn');
        const card = e.target.closest('.menu-card');
        if (addBtn) {
            addToCart(Number(addBtn.dataset.id));
        } else if (card) {
            openProductModal(card.dataset.id);
        }
    });

    const renderFeatured = () => {
        featuredGrid.innerHTML = featuredProducts.map((product) => `
            <article class="featured-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="menu-card-footer">
                    <span class="price-tag">${formatCurrency(product.price)}</span>
                    <button class="btn btn-outline" data-id="${product.id}">Pesan</button>
                </div>
            </article>
        `).join('');
    };

    featuredGrid?.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        const card = e.target.closest('.featured-card');
        if (btn) {
            addToCart(Number(btn.dataset.id));
        } else if (card) {
            openProductModal(card.dataset.id);
        }
    });

    /* ----------------- Product Modal ----------------- */
    const openProductModal = async (id) => {
        const product = await fetchData(`/products/${id}`);
        if (!product?.id) return;
        productModalBody.innerHTML = `
            <div class="product-detail">
                <div>
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div>
                    <h2>${product.name}</h2>
                    <div class="product-meta">
                        <span>${product.category_name || ''}</span>
                        <span>${product.is_available ? 'Tersedia' : 'Habis'}</span>
                    </div>
                    <p>${product.description || ''}</p>
                    <h3>${formatCurrency(product.price)}</h3>
                    <button class="btn btn-primary" data-id="${product.id}" id="modal-add-btn">
                        <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                    </button>
                    <div class="review-list">
                        <h4>Testimoni</h4>
                        ${product.reviews?.length ? product.reviews.map((review) => `
                            <div class="review-item">
                                <strong>${review.customer_name}</strong>
                                <span> ${'★'.repeat(review.rating)}</span>
                                <p>${review.comment || ''}</p>
                            </div>
                        `).join('') : '<p>Belum ada review.</p>'}
                    </div>
                </div>
            </div>
        `;
        const modalAddBtn = document.getElementById('modal-add-btn');
        modalAddBtn?.addEventListener('click', () => addToCart(product.id));
        openModal(productModal);
    };

    productModalClose?.addEventListener('click', () => closeModal(productModal));

    /* ----------------- Cart ----------------- */
    const addToCart = (id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return;
        const existing = cart.find((item) => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
        }
        saveCart();
        renderCart();
        showToast(`${product.name} ditambahkan ke keranjang.`);
    };

    const updateQuantity = (id, delta) => {
        const item = cart.find((cartItem) => cartItem.id === id);
        if (!item) return;
        item.quantity = Math.max(1, item.quantity + delta);
        saveCart();
        renderCart();
    };

    const removeFromCart = (id) => {
        cart = cart.filter((item) => item.id !== id);
        saveCart();
        renderCart();
    };

    const renderCart = () => {
        if (!cart.length) {
            cartItemsEl.innerHTML = '<p>Keranjang masih kosong.</p>';
        } else {
            cartItemsEl.innerHTML = cart.map((item) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div style="flex:1">
                        <h4>${item.name}</h4>
                        <p>${formatCurrency(item.price)}</p>
                        <div class="cart-item-actions">
                            <div class="qty-control">
                                <button class="qty-btn" data-id="${item.id}" data-action="dec">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" data-id="${item.id}" data-action="inc">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">Hapus</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totals = getCartTotals();
        cartTotal.textContent = formatCurrency(totals.total);
        if (totals.discount > 0) {
            cartDiscount.style.display = 'flex';
            discountAmountEl.textContent = `- ${formatCurrency(totals.discount)}`;
        } else {
            cartDiscount.style.display = 'none';
        }
        renderCheckoutSummary();

        // Reload available promos
        loadAvailablePromosInCart();
    };

    cartItemsEl?.addEventListener('click', (e) => {
        const btn = e.target.closest('.qty-btn');
        const removeBtn = e.target.closest('.remove-item');
        if (btn) {
            const id = Number(btn.dataset.id);
            const action = btn.dataset.action;
            updateQuantity(id, action === 'inc' ? 1 : -1);
        }
        if (removeBtn) {
            removeFromCart(Number(removeBtn.dataset.id));
        }
    });

    cartBtn?.addEventListener('click', () => {
        cartSidebar?.classList.add('show');
        cartBackdrop?.classList.add('show');
    });

    cartClose?.addEventListener('click', () => {
        cartSidebar?.classList.remove('show');
        cartBackdrop?.classList.remove('show');
    });

    cartBackdrop?.addEventListener('click', () => {
        cartSidebar?.classList.remove('show');
        cartBackdrop?.classList.remove('show');
    });

    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && e.target !== cartBtn && cartSidebar.classList.contains('show')) {
            cartSidebar.classList.remove('show');
            cartBackdrop?.classList.remove('show');
        }
    });

    /* ----------------- Promo ----------------- */
    applyPromoBtn?.addEventListener('click', async () => {
        const code = promoInput.value.trim();
        if (!code) {
            showToast('Masukkan kode promo', 'error');
            return;
        }
        const totals = getCartTotals();
        try {
            const res = await fetch(`${API_BASE}/promos/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, total: totals.subtotal }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Kode promo tidak valid');
            }
            const data = await res.json();
            appliedPromo = data;
            renderCart();
            showToast('Kode promo berhasil diterapkan! Diskon: Rp ' + data.discount.toLocaleString());
        } catch (error) {
            appliedPromo = null;
            renderCart();
            showToast(error.message, 'error');
        }
    });

    const renderPromoTimer = () => {
        const deadline = Date.now() + 5 * 24 * 60 * 60 * 1000;
        const timerEls = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
        };

        // Check if elements exist
        if (!timerEls.days || !timerEls.hours || !timerEls.minutes || !timerEls.seconds) {
            return;
        }

        const updateTimer = () => {
            const diff = Math.max(deadline - Date.now(), 0);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            if (timerEls.days) timerEls.days.textContent = String(days).padStart(2, '0');
            if (timerEls.hours) timerEls.hours.textContent = String(hours).padStart(2, '0');
            if (timerEls.minutes) timerEls.minutes.textContent = String(minutes).padStart(2, '0');
            if (timerEls.seconds) timerEls.seconds.textContent = String(seconds).padStart(2, '0');
        };
        updateTimer();
        setInterval(updateTimer, 1000);
    };

    /* ----------------- Checkout ----------------- */
    checkoutBtn?.addEventListener('click', () => {
        if (!cart.length) {
            showToast('Keranjang masih kosong', 'error');
            return;
        }
        renderCheckoutSummary();
        openModal(checkoutModal);
    });

    checkoutModalClose?.addEventListener('click', () => closeModal(checkoutModal));

    const renderCheckoutSummary = () => {
        checkoutItems.innerHTML = cart.map((item) => `
            <div class="checkout-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `).join('');
        const totals = getCartTotals();
        checkoutSubtotal.textContent = formatCurrency(totals.subtotal);
        checkoutTotal.textContent = formatCurrency(totals.total);
        if (totals.discount > 0) {
            checkoutDiscountRow.style.display = 'flex';
            checkoutDiscount.textContent = `- ${formatCurrency(totals.discount)}`;
        } else {
            checkoutDiscountRow.style.display = 'none';
        }
    };

    checkoutForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (USE_STATIC) {
            showToast('Fitur checkout hanya tersedia saat menjalankan server lokal. Silakan hubungi admin untuk pemesanan.', 'error');
            return;
        }

        if (!cart.length) {
            showToast('Keranjang kosong', 'error');
            return;
        }
        const formData = new FormData(checkoutForm);
        const payload = Object.fromEntries(formData.entries());
        payload.items = cart.map((item) => ({ product_id: item.id, quantity: item.quantity }));
        payload.promo_code = appliedPromo?.promo?.code;
        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Gagal membuat pesanan');
            }
            const data = await res.json();

            // Save order ID to localStorage for easy tracking
            localStorage.setItem('lastOrderId', data.id);

            // Display order info
            successOrderId.textContent = `#${String(data.id).padStart(5, '0')}`;
            document.getElementById('payment-name').textContent = data.customer_name;
            document.getElementById('payment-table').textContent = data.table_number;
            document.getElementById('payment-total').textContent = formatCurrency(data.total_amount);

            // Generate QR Code
            const qrData = JSON.stringify({
                orderId: data.id,
                customer: data.customer_name,
                table: data.table_number,
                total: data.total_amount,
                items: data.items,
                timestamp: data.created_at
            });

            const canvas = document.getElementById('qr-canvas');
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(canvas, qrData, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#0b0a09',
                        light: '#f7f1ea'
                    }
                }, (error) => {
                    if (error) console.error('QR Error:', error);
                });
            } else {
                console.error('QRCode library not loaded');
                showToast('Gagal membuat QR Code', 'error');
            }

            cart = [];
            appliedPromo = null;
            saveCart();
            renderCart();
            checkoutForm.reset();
            closeModal(checkoutModal);
            openModal(successModal);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    /* ----------------- Rating System (4-Star Minimum) ----------------- */
    let currentRating = 0;
    const starsContainer = document.getElementById('stars-container');
    const ratingText = document.getElementById('rating-text');

    starsContainer?.addEventListener('click', (e) => {
        const star = e.target.closest('.star');
        if (!star) return;

        let clickedRating = parseInt(star.dataset.rating);

        // Auto-adjust to 4 if clicking 1-3
        if (clickedRating <= 3) {
            clickedRating = 4;
        }

        currentRating = clickedRating;
        updateStarDisplay(currentRating);

        if (currentRating === 4) {
            ratingText.textContent = 'Rating Anda: 4 bintang - Terima kasih! 🙏';
        } else if (currentRating === 5) {
            ratingText.textContent = 'Rating Anda: 5 bintang - Sempurna! ⭐';
        }
    });

    function updateStarDisplay(rating) {
        const stars = starsContainer?.querySelectorAll('.star');
        if (!stars) return;

        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    successClose?.addEventListener('click', () => closeModal(successModal));

    /* ----------------- Offer Timer ----------------- */
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeModal(successModal);
    });

    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    /* ----------------- Init ----------------- */
    loadInitialData();
    loadActivePromos();
    loadAvailablePromosInCart();
    loadSpecialOfferPromos();

    // Auto-refresh promos every 10 seconds
    setInterval(() => {
        loadActivePromos();
        loadAvailablePromosInCart();
        loadSpecialOfferPromos();
    }, 10000);

    /* ----------------- Active Promo Banner ----------------- */
    let promoTimerInterval = null;

    async function loadActivePromos() {
        if (USE_STATIC) {
            // Hide promo banner for static hosting
            const banner = document.getElementById('promo-banner');
            if (banner) banner.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/promos/active`);
            if (!res.ok) return;

            const promos = await res.json();
            if (promos.length === 0) {
                document.getElementById('promo-banner').style.display = 'none';
                if (promoTimerInterval) clearInterval(promoTimerInterval);
                return;
            }

            // Show first active promo
            const promo = promos[0];
            displayPromoBanner(promo);
        } catch (error) {
            console.error('Failed to load promos:', error);
        }
    }

    async function loadAvailablePromosInCart() {
        if (USE_STATIC) {
            // Hide promo section for static hosting
            const container = document.getElementById('available-promos');
            if (container) container.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/promos`);
            if (!res.ok) return;

            const allPromos = await res.json();
            const now = new Date();

            // Filter active promos that are not expired and not exhausted
            const activePromos = allPromos.filter(p => {
                if (!p.is_active) return false;
                if (p.expires_at && new Date(p.expires_at) < now) return false;
                if (p.max_uses && p.current_uses >= p.max_uses) return false;
                return true;
            });

            const container = document.getElementById('available-promos');

            if (activePromos.length === 0) {
                container.innerHTML = '<div class="promo-expired-message">⚠️ Tidak ada promo aktif saat ini</div>';
                return;
            }

            // Display all active promos as clickable badges
            container.innerHTML = activePromos.map(promo => {
                const discount = promo.discount_percent ? `${promo.discount_percent}%` : formatCurrency(promo.discount_amount);
                let info = '';

                if (promo.max_uses) {
                    const remaining = promo.max_uses - (promo.current_uses || 0);
                    info = ` • ${remaining} sisa`;
                }

                if (promo.expires_at) {
                    const diff = new Date(promo.expires_at) - now;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    info += ` • ${hours}j ${minutes}m`;
                }

                return `
                    <div class="promo-badge" onclick="document.getElementById('promo-input').value='${promo.code}'">
                        <span class="promo-badge-code">${promo.code}</span>
                        <span class="promo-badge-discount">${discount}${info}</span>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load promos in cart:', error);
        }
    }

    async function loadSpecialOfferPromos() {
        if (USE_STATIC) {
            // Hide special offer promos for static hosting
            const container = document.getElementById('offer-promos');
            const timerContainer = document.getElementById('offer-timer');
            if (container) container.innerHTML = '<p style="color: var(--text-muted);">Hubungi kami untuk info promo terbaru!</p>';
            if (timerContainer) timerContainer.style.display = 'none';
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/promos`);
            if (!res.ok) return;

            const allPromos = await res.json();
            const now = new Date();

            // Filter active promos
            const activePromos = allPromos.filter(p => {
                if (!p.is_active) return false;
                if (p.expires_at && new Date(p.expires_at) < now) return false;
                if (p.max_uses && p.current_uses >= p.max_uses) return false;
                return true;
            });

            const container = document.getElementById('offer-promos');
            const timerContainer = document.getElementById('offer-timer');

            if (activePromos.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted);">Tidak ada promo aktif saat ini</p>';
                timerContainer.style.display = 'none';
                return;
            }

            // Display all active promos
            container.innerHTML = activePromos.map(promo => {
                const discount = promo.discount_percent ? `${promo.discount_percent}% OFF` : `Diskon ${formatCurrency(promo.discount_amount)}`;
                let info = '';

                if (promo.max_uses) {
                    const remaining = promo.max_uses - (promo.current_uses || 0);
                    info += `${remaining} kuota tersisa`;
                }

                if (promo.expires_at) {
                    const diff = new Date(promo.expires_at) - now;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    if (info) info += ' • ';
                    info += `${hours}j ${minutes}m lagi`;
                }

                return `
                    <div class="offer-promo-card" onclick="navigator.clipboard.writeText('${promo.code}').then(() => alert('Kode ${promo.code} berhasil disalin!'))">
                        <span class="offer-promo-code">${promo.code}</span>
                        <div class="offer-promo-detail">${discount}</div>
                        ${info ? `<div class="offer-promo-info">${info}</div>` : ''}
                    </div>
                `;
            }).join('');

            // Show timer for first promo with expiration
            const promoWithTimer = activePromos.find(p => p.expires_at);
            if (promoWithTimer) {
                timerContainer.style.display = 'flex';
                updateOfferTimer(promoWithTimer.expires_at);
            } else {
                timerContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to load special offer promos:', error);
        }
    }

    function updateOfferTimer(expiresAt) {
        const updateTimer = () => {
            const now = new Date();
            const expiry = new Date(expiresAt);
            const diff = expiry - now;

            if (diff <= 0) {
                document.getElementById('offer-days').textContent = '00';
                document.getElementById('offer-hours').textContent = '00';
                document.getElementById('offer-minutes').textContent = '00';
                document.getElementById('offer-seconds').textContent = '00';
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            document.getElementById('offer-days').textContent = String(days).padStart(2, '0');
            document.getElementById('offer-hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('offer-minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('offer-seconds').textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }

    function displayPromoBanner(promo) {
        const banner = document.getElementById('promo-banner');
        const code = document.getElementById('promo-banner-code');
        const discount = document.getElementById('promo-banner-discount');
        const quota = document.getElementById('promo-banner-quota');
        const timer = document.getElementById('promo-banner-timer');

        // Set promo details
        code.textContent = promo.code;
        discount.textContent = promo.discount_percent ? `${promo.discount_percent}% OFF` : formatCurrency(promo.discount_amount);

        if (promo.max_uses) {
            const remaining = promo.max_uses - (promo.current_uses || 0);
            quota.textContent = `${remaining} orang pertama`;
        } else {
            quota.textContent = 'Terbatas';
        }

        banner.style.display = 'block';

        // Start countdown timer
        if (promoTimerInterval) clearInterval(promoTimerInterval);

        if (promo.expires_at) {
            updatePromoTimer(promo.expires_at, timer);
            promoTimerInterval = setInterval(() => {
                updatePromoTimer(promo.expires_at, timer);
            }, 1000);
        } else {
            timer.parentElement.style.display = 'none';
        }
    }

    function updatePromoTimer(expiresAt, timerElement) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            timerElement.textContent = 'HABIS';
            timerElement.style.color = '#f05454';
            if (promoTimerInterval) clearInterval(promoTimerInterval);
            // Reload to check for new promos
            setTimeout(() => loadActivePromos(), 2000);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timerElement.textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Color based on urgency
        if (diff < 5 * 60 * 1000) { // < 5 minutes
            timerElement.style.color = '#ff4444';
        } else if (diff < 30 * 60 * 1000) { // < 30 minutes
            timerElement.style.color = '#ffaa00';
        } else {
            timerElement.style.color = '#ffffff';
        }
    }

    /* ----------------- Track Order ----------------- */
    const openTrackModal = () => {
        // Pre-fill with last order ID if available
        const lastOrderId = localStorage.getItem('lastOrderId');
        trackInput.value = lastOrderId || '';
        trackResult.style.display = 'none';
        trackError.style.display = 'none';
        openModal(trackModal);

        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        navMenu?.classList.remove('show-menu');
    };

    trackBtn?.addEventListener('click', openTrackModal);
    navTrackLink?.addEventListener('click', (e) => {
        e.preventDefault();
        openTrackModal();
    });

    trackModalClose?.addEventListener('click', () => closeModal(trackModal));
    trackModal?.addEventListener('click', (e) => {
        if (e.target === trackModal) closeModal(trackModal);
    });

    trackSubmitBtn?.addEventListener('click', async () => {
        const orderId = trackInput.value.trim();
        if (!orderId) {
            showToast('Masukkan Order ID', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}`);
            if (!res.ok) throw new Error('Order tidak ditemukan');

            const order = await res.json();

            // Show result
            trackResult.style.display = 'block';
            trackError.style.display = 'none';

            // Fill data
            document.getElementById('result-order-id').textContent = order.id;
            document.getElementById('result-name').textContent = order.customer_name || '-';
            document.getElementById('result-table').textContent = order.table_number || order.customer_phone || '-';
            document.getElementById('result-total').textContent = formatCurrency(order.total_amount);
            document.getElementById('result-time').textContent = new Date(order.created_at).toLocaleString('id-ID');
            document.getElementById('result-notes').textContent = order.notes || 'Tidak ada catatan';

            // Status badge
            const statusBadge = document.getElementById('result-status');
            const statusMap = {
                'pending': { text: 'Menunggu', class: 'status-pending' },
                'processing': { text: 'Diproses', class: 'status-processing' },
                'completed': { text: 'Selesai', class: 'status-completed' },
                'cancelled': { text: 'Dibatalkan', class: 'status-cancelled' }
            };
            const status = statusMap[order.status] || statusMap['pending'];
            statusBadge.textContent = status.text;
            statusBadge.className = 'status-badge ' + status.class;

            // Order items
            const itemsHtml = order.items?.map(item => `
                <div class="order-item">
                    <div class="order-item-info">
                        <div class="order-item-name">${item.product_name}</div>
                        <div class="order-item-qty">${item.quantity}x @ ${formatCurrency(item.price)}</div>
                    </div>
                    <div class="order-item-price">${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('') || '<p>Tidak ada item</p>';
            document.getElementById('result-items').innerHTML = '<h4>📦 Item Pesanan</h4>' + itemsHtml;

            // Update timeline
            document.querySelectorAll('.timeline-item').forEach(item => item.classList.remove('active'));
            if (order.status === 'pending') {
                document.getElementById('status-pending')?.classList.add('active');
            } else if (order.status === 'processing') {
                document.getElementById('status-pending')?.classList.add('active');
                document.getElementById('status-processing')?.classList.add('active');
            } else if (order.status === 'completed') {
                document.getElementById('status-pending')?.classList.add('active');
                document.getElementById('status-processing')?.classList.add('active');
                document.getElementById('status-completed')?.classList.add('active');
                // Show thank you message for completed orders
                showToast('🎉 Terima kasih! Datang lagi ya! 😊', 'success');
            } else {
                showToast('Order ditemukan!', 'success');
            }

            if (order.status !== 'completed') {
                showToast('Order ditemukan!', 'success');
            }
        } catch (error) {
            trackResult.style.display = 'none';
            trackError.style.display = 'block';
            showToast(error.message, 'error');
        }
    });

    // Enter key untuk track
    trackInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            trackSubmitBtn?.click();
        }
    });
});

/* Toast Styles */
const toastStyle = document.createElement('style');
toastStyle.textContent = `
.toast {
    position: fixed;
    top: 20px;
    right: -300px;
    padding: 0.9rem 1.4rem;
    border-radius: 999px;
    background: rgba(12, 11, 10, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    transition: transform 0.4s ease, opacity 0.4s ease;
    opacity: 0;
    z-index: 2000;
}
.toast.show {
    opacity: 1;
    transform: translateX(-320px);
}
.toast-success { border-color: rgba(64, 183, 126, 0.6); }
.toast-error { border-color: rgba(240, 84, 84, 0.6); }
.remove-item {
    background: none;
    border: none;
    color: #f05454;
    cursor: pointer;
}
`;
document.head.appendChild(toastStyle);
