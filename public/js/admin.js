'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const API = '/api';

    const statsGrid = document.querySelector('.stats-grid');
    const categoryTable = document.getElementById('category-table');
    const categoryForm = document.getElementById('category-form');
    const productTable = document.getElementById('product-table');
    const productForm = document.getElementById('product-form');
    const productCategorySelect = document.getElementById('product-category');
    const orderTable = document.getElementById('order-table');
    const orderFilter = document.getElementById('order-filter');
    const historyTable = document.getElementById('history-table');
    const historyDate = document.getElementById('history-date');
    const filterTodayBtn = document.getElementById('filter-today-btn');
    const dailyVisitors = document.getElementById('daily-visitors');
    const dailyRevenue = document.getElementById('daily-revenue');
    const dailyCompleted = document.getElementById('daily-completed');
    const promoTable = document.getElementById('promo-table');
    const promoForm = document.getElementById('promo-form');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');

    // Navigation handler
    const showSection = (sectionId) => {
        // Jika overview, categories, atau products dipilih, tampilkan ketiganya sekaligus
        if (sectionId === 'overview' || sectionId === 'categories' || sectionId === 'products') {
            sections.forEach(section => {
                const shouldShow = section.id === 'overview' || section.id === 'categories' || section.id === 'products';
                section.style.display = shouldShow ? 'block' : 'none';
            });
        }
        // Untuk section lain, tampilkan hanya section itu
        else {
            sections.forEach(section => {
                section.style.display = section.id === sectionId ? 'block' : 'none';
            });
        }

        // Update active state pada navigation
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === sectionId);
        });

        // Reset badge when viewing orders
        if (sectionId === 'orders') {
            const badge = document.getElementById('new-order-badge');
            if (badge) badge.style.display = 'none';
        }

        // Scroll ke section yang dipilih jika bukan overview
        if (sectionId === 'categories') {
            document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionId === 'products') {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionId === 'overview') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });

    const categoryFields = {
        id: document.getElementById('category-id'),
        name: document.getElementById('category-name'),
        description: document.getElementById('category-description'),
        icon: document.getElementById('category-icon'),
    };

    const productFields = {
        id: document.getElementById('product-id'),
        name: document.getElementById('product-name'),
        description: document.getElementById('product-description'),
        price: document.getElementById('product-price'),
        category: document.getElementById('product-category'),
        image: document.getElementById('product-image'),
        featured: document.getElementById('product-featured'),
        available: document.getElementById('product-available'),
    };

    const promoFields = {
        id: document.getElementById('promo-id'),
        code: document.getElementById('promo-code'),
        percent: document.getElementById('promo-percent'),
        amount: document.getElementById('promo-amount'),
        min: document.getElementById('promo-min'),
        active: document.getElementById('promo-active'),
        duration: document.getElementById('promo-duration'),
        maxUses: document.getElementById('promo-max-uses'),
    };

    let categories = [];
    let products = [];
    let orders = [];
    let promos = [];
    let lastOrderCount = 0;
    let pollingInterval = null;

    /* Helpers */
    const request = async (endpoint, options = {}) => {
        const res = await fetch(`${API}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Terjadi kesalahan' }));
            throw new Error(err.error || 'Terjadi kesalahan');
        }
        return res.json();
    };

    const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    const showToast = (msg, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 2500);
    };

    /* Stats */
    const loadStats = async () => {
        const stats = await request('/stats');
        const items = [
            { label: 'Total Produk', value: stats.totalProducts },
            { label: 'Total Pesanan', value: stats.totalOrders },
            { label: 'Revenue', value: formatCurrency(stats.totalRevenue) },
            { label: 'Pending', value: stats.pendingOrders },
        ];
        statsGrid.innerHTML = items.map((item) => `
            <div class="stat-card">
                <h3>${item.label}</h3>
                <strong>${item.value}</strong>
            </div>
        `).join('');
    };

    /* Categories */
    const loadCategories = async () => {
        categories = await request('/categories');
        renderCategories();
        populateCategorySelect();
    };

    const renderCategories = () => {
        categoryTable.innerHTML = categories.map((cat) => `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.description || '-'}</td>
                <td>${cat.icon || '☕'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" data-id="${cat.id}" data-type="edit">Edit</button>
                        <button class="btn-delete" data-id="${cat.id}" data-type="delete">Hapus</button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    const populateCategorySelect = () => {
        productCategorySelect.innerHTML = categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join('');
    };

    categoryTable?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.dataset.type === 'edit') {
            const category = categories.find((c) => c.id === id);
            Object.assign(categoryFields, {
                id: categoryFields.id.value = category.id,
                name: categoryFields.name.value = category.name,
                description: categoryFields.description.value = category.description || '',
                icon: categoryFields.icon.value = category.icon || '☕',
            });
        } else if (btn.dataset.type === 'delete') {
            if (confirm('Hapus kategori ini?')) {
                await request(`/categories/${id}`, { method: 'DELETE' });
                showToast('Kategori dihapus');
                await loadCategories();
            }
        }
    });

    categoryForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: categoryFields.name.value,
            description: categoryFields.description.value,
            icon: categoryFields.icon.value,
        };
        try {
            if (categoryFields.id.value) {
                await request(`/categories/${categoryFields.id.value}`, { method: 'PUT', body: JSON.stringify(payload) });
                showToast('Kategori diperbarui');
            } else {
                await request('/categories', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Kategori ditambahkan');
            }
            categoryForm.reset();
            categoryFields.id.value = '';
            // Real-time update: langsung load categories tanpa refresh
            await Promise.all([loadCategories(), loadStats()]);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('new-category-btn')?.addEventListener('click', () => {
        categoryForm.reset();
        categoryFields.id.value = '';
    });

    /* Products */
    const loadProducts = async () => {
        products = await request('/products');
        renderProducts();
    };

    const renderProducts = () => {
        productTable.innerHTML = products.map((product) => `
            <tr>
                <td>${product.name}</td>
                <td>${product.category_name || '-'}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.is_featured ? 'Ya' : 'Tidak'}</td>
                <td>${product.is_available ? 'Tersedia' : 'Habis'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" data-id="${product.id}" data-type="edit">Edit</button>
                        <button class="btn-delete" data-id="${product.id}" data-type="delete">Hapus</button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    productTable?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.dataset.type === 'edit') {
            const product = products.find((p) => p.id === id);
            productFields.id.value = product.id;
            productFields.name.value = product.name;
            productFields.description.value = product.description || '';
            productFields.price.value = product.price;
            productFields.category.value = product.category_id;
            productFields.image.value = product.image || '';
            productFields.featured.value = product.is_featured;
            productFields.available.value = product.is_available;
        } else if (btn.dataset.type === 'delete') {
            if (confirm('Hapus produk ini?')) {
                await request(`/products/${id}`, { method: 'DELETE' });
                showToast('Produk dihapus');
                await Promise.all([loadProducts(), loadOverviewProducts(), loadStats()]);
            }
        }
    });

    productForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: productFields.name.value,
            description: productFields.description.value,
            price: Number(productFields.price.value),
            category_id: Number(productFields.category.value),
            image: productFields.image.value,
            is_featured: Number(productFields.featured.value),
            is_available: Number(productFields.available.value),
        };
        try {
            if (productFields.id.value) {
                await request(`/products/${productFields.id.value}`, { method: 'PUT', body: JSON.stringify(payload) });
                showToast('Produk diperbarui');
            } else {
                await request('/products', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Produk ditambahkan');
            }
            productForm.reset();
            productFields.id.value = '';
            // Real-time update: langsung load products dan overview tanpa refresh
            await Promise.all([loadProducts(), loadOverviewProducts(), loadStats()]);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('new-product-btn')?.addEventListener('click', () => {
        productForm.reset();
        productFields.id.value = '';
    });

    /* Orders */
    const loadOrders = async (status = '') => {
        let query = status ? `?status=${status}` : '';
        // Hanya load pesanan pending dan processing untuk tab "Pesanan Aktif"
        if (!status) {
            orders = await request('/orders');
            orders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
        } else {
            orders = await request(`/orders${query}`);
        }
        renderOrders();
    };

    const renderOrders = () => {
        orderTable.innerHTML = orders.map((order) => `
            <tr>
                <td>#${String(order.id).padStart(4, '0')}</td>
                <td>
                    <strong>${order.customer_name}</strong><br>
                    <small>Meja: ${order.table_number || '-'}</small>
                </td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td>
                    <select data-id="${order.id}" class="order-status">
                        ${['pending', 'processing', 'completed', 'cancelled'].map((status) => `
                            <option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>
                        `).join('')}
                    </select>
                </td>
                <td>${new Date(order.created_at).toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn-delete" data-id="${order.id}" data-type="delete">Hapus</button>
                </td>
            </tr>
        `).join('');
    };

    orderTable?.addEventListener('change', async (e) => {
        const select = e.target.closest('.order-status');
        if (!select) return;
        const id = Number(select.dataset.id);
        const newStatus = select.value;
        await request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
        showToast('Status pesanan diubah');

        // Jika status berubah jadi completed/cancelled, reload kedua tab
        if (newStatus === 'completed' || newStatus === 'cancelled') {
            await loadOrders(orderFilter.value);
            await loadHistory();
        }
        await loadStats();
    });

    orderTable?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.dataset.type === 'delete' && confirm('Hapus pesanan ini?')) {
            await request(`/orders/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Pesanan dihapus');
            await loadOrders(orderFilter.value);
            await loadStats();
        }
    });

    orderFilter?.addEventListener('change', () => loadOrders(orderFilter.value));

    /* History - Riwayat Pesanan Selesai */
    const loadHistory = async (date = null) => {
        const allOrders = await request('/orders');
        let completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

        // Filter by date jika ada
        if (date) {
            completedOrders = completedOrders.filter(o => {
                const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                return orderDate === date;
            });
        }

        renderHistory(completedOrders);
        calculateDailyStats(completedOrders);
    };

    const renderHistory = (completedOrders) => {
        if (!completedOrders.length) {
            historyTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Belum ada pesanan selesai</td></tr>';
            return;
        }

        historyTable.innerHTML = completedOrders.map((order) => `
            <tr>
                <td>#${String(order.id).padStart(4, '0')}</td>
                <td>${order.customer_name}</td>
                <td>${order.table_number || '-'}</td>
                <td>${formatCurrency(order.total_amount)}</td>
                <td>
                    <span style="padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.85rem; 
                        background: ${order.status === 'completed' ? 'rgba(64, 183, 126, 0.15)' : 'rgba(240, 84, 84, 0.15)'};
                        color: ${order.status === 'completed' ? '#40b77e' : '#f05454'};">
                        ${order.status}
                    </span>
                </td>
                <td>${new Date(order.created_at).toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    };

    const calculateDailyStats = (completedOrders) => {
        const completedOnly = completedOrders.filter(o => o.status === 'completed');
        const totalVisitors = completedOnly.length;
        const totalRevenue = completedOnly.reduce((sum, o) => sum + o.total_amount, 0);

        dailyVisitors.textContent = totalVisitors;
        dailyRevenue.textContent = formatCurrency(totalRevenue);
        dailyCompleted.textContent = completedOnly.length;
    };

    historyDate?.addEventListener('change', (e) => {
        loadHistory(e.target.value);
    });

    filterTodayBtn?.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        historyDate.value = today;
        loadHistory(today);
    });

    /* Promos */
    const loadPromos = async () => {
        promos = await request('/promos');
        renderPromos();
    };

    const renderPromos = () => {
        promoTable.innerHTML = promos.map((promo) => {
            const now = new Date();
            const expiresAt = promo.expires_at ? new Date(promo.expires_at) : null;
            const isExpired = expiresAt && expiresAt < now;
            const isExhausted = promo.max_uses && promo.current_uses >= promo.max_uses;

            let timerText = '∞ Unlimited';
            if (expiresAt) {
                if (isExpired) {
                    timerText = '⏰ Kadaluarsa';
                } else {
                    const diff = expiresAt - now;
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    timerText = `⏱️ ${hours}j ${minutes}m`;
                }
            }

            let quotaText = '∞';
            if (promo.max_uses) {
                const remaining = promo.max_uses - (promo.current_uses || 0);
                quotaText = `${promo.current_uses || 0}/${promo.max_uses} (${remaining} sisa)`;
            }

            const statusClass = (isExpired || isExhausted) ? 'status-cancelled' : (promo.is_active ? 'status-completed' : 'status-pending');
            const statusText = (isExpired || isExhausted) ? 'Habis' : (promo.is_active ? 'Aktif' : 'Nonaktif');

            return `
                <tr>
                    <td><strong>${promo.code}</strong></td>
                    <td>${promo.discount_percent ? promo.discount_percent + '%' : formatCurrency(promo.discount_amount)}</td>
                    <td>${formatCurrency(promo.min_order)}</td>
                    <td><span class="promo-timer" data-expires="${promo.expires_at || ''}">${timerText}</span></td>
                    <td>${quotaText}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-edit" data-id="${promo.id}" data-type="edit">Edit</button>
                            <button class="btn-delete" data-id="${promo.id}" data-type="delete">Hapus</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Start timer updates
        startPromoTimers();
    };

    promoTable?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        if (btn.dataset.type === 'edit') {
            const promo = promos.find((p) => p.id === id);
            promoFields.id.value = promo.id;
            promoFields.code.value = promo.code;
            promoFields.percent.value = promo.discount_percent || '';
            promoFields.amount.value = promo.discount_amount || '';
            promoFields.min.value = promo.min_order || 0;
            promoFields.active.value = promo.is_active;
            promoFields.duration.value = promo.duration_hours || '';
            promoFields.maxUses.value = promo.max_uses || '';
        } else if (btn.dataset.type === 'delete') {
            if (confirm('Hapus promo ini?')) {
                await request(`/promos/${id}`, { method: 'DELETE' });
                showToast('Promo dihapus');
                await loadPromos();
            }
        }
    });

    promoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            code: promoFields.code.value,
            discount_percent: promoFields.percent.value ? Number(promoFields.percent.value) : null,
            discount_amount: promoFields.amount.value ? Number(promoFields.amount.value) : null,
            min_order: Number(promoFields.min.value || 0),
            is_active: Number(promoFields.active.value),
            duration_hours: promoFields.duration.value ? Number(promoFields.duration.value) : null,
            max_uses: promoFields.maxUses.value ? Number(promoFields.maxUses.value) : null,
        };
        try {
            if (promoFields.id.value) {
                await request(`/promos/${promoFields.id.value}`, { method: 'PUT', body: JSON.stringify(payload) });
                showToast('Promo diperbarui');
            } else {
                await request('/promos', { method: 'POST', body: JSON.stringify(payload) });
                showToast('Promo ditambahkan');
            }
            promoForm.reset();
            promoFields.id.value = '';
            await loadPromos();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('new-promo-btn')?.addEventListener('click', () => {
        promoForm.reset();
        promoFields.id.value = '';
    });

    /* Navigation highlight */
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            navLinks.forEach((l) => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    /* Logout Handler */
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Yakin ingin logout?')) {
            sessionStorage.removeItem('adminAuth');
            sessionStorage.removeItem('adminUser');
            window.location.href = 'login.html';
        }
    });

    /* Refresh */
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        Promise.all([loadStats(), loadCategories(), loadProducts(), loadOrders(orderFilter.value), loadHistory(), loadPromos()])
            .then(() => showToast('Data diperbarui'))
            .catch((err) => showToast(err.message, 'error'));
    });

    /* Real-time Order Polling */
    const checkNewOrders = async () => {
        try {
            const allOrders = await request('/orders');
            const activeOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'processing');
            const currentCount = activeOrders.length;

            // Jika ada pesanan baru
            if (currentCount > lastOrderCount) {
                const newOrdersCount = currentCount - lastOrderCount;
                const badge = document.getElementById('new-order-badge');

                if (badge) {
                    badge.textContent = newOrdersCount;
                    badge.style.display = 'inline-block';
                }

                // Show notification (kecuali saat pertama kali load)
                if (lastOrderCount !== 0) {
                    showToast(`🔔 ${newOrdersCount} pesanan baru masuk!`, 'success');
                }

                // PENTING: Auto reload orders table LANGSUNG tanpa cek section
                await loadOrders(orderFilter.value);
                await loadStats();
            }

            lastOrderCount = currentCount;
        } catch (error) {
            console.error('Polling error:', error);
        }
    };

    // Start polling setiap 2 detik (lebih cepat)
    const startPolling = () => {
        if (pollingInterval) clearInterval(pollingInterval);
        // Check immediately
        checkNewOrders();
        // Then poll every 2 seconds
        pollingInterval = setInterval(checkNewOrders, 2000);
    };

    /* Init */
    (async () => {
        try {
            await loadStats();
            await loadCategories();
            await loadProducts();
            await loadOrders();
            await loadHistory();
            await loadPromos();

            // Set initial order count
            const allOrders = await request('/orders');
            lastOrderCount = allOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;

            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            historyDate.value = today;

            // Show overview section by default (includes categories & products)
            showSection('overview');

            // Load overview products
            loadOverviewProducts();

            // Start real-time polling
            startPolling();
        } catch (error) {
            showToast(error.message, 'error');
        }
    })();

    /* ===== OVERVIEW PRODUCTS WITH EDIT/DELETE ===== */
    const overviewGrid = document.getElementById('overview-products-grid');
    const editModal = document.getElementById('edit-modal');
    const editModalClose = document.getElementById('edit-modal-close');
    const editCancelBtn = document.getElementById('edit-cancel');
    const editForm = document.getElementById('edit-product-form');

    const editFields = {
        id: document.getElementById('edit-product-id'),
        name: document.getElementById('edit-product-name'),
        desc: document.getElementById('edit-product-desc'),
        price: document.getElementById('edit-product-price'),
        category: document.getElementById('edit-product-category'),
        image: document.getElementById('edit-product-image'),
        featured: document.getElementById('edit-product-featured'),
        available: document.getElementById('edit-product-available')
    };

    async function loadOverviewProducts() {
        try {
            const prods = await request('/products');
            const cats = await request('/categories');

            // Populate category select in edit modal
            editFields.category.innerHTML = cats.map(c =>
                `<option value="${c.id}">${c.name}</option>`
            ).join('');

            overviewGrid.innerHTML = prods.map(p => `
                <div class="product-card">
                    <img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                         alt="${p.name}" 
                         class="product-card-image">
                    <div class="product-card-body">
                        <span class="product-card-category">${p.category_name || 'Uncategorized'}</span>
                        <h4 class="product-card-title">${p.name}</h4>
                        <p class="product-card-desc">${p.description || 'Tidak ada deskripsi'}</p>
                        <div class="product-card-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                        <div class="product-card-actions">
                            <button class="btn-edit" onclick="editProduct(${p.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-delete" onclick="deleteProduct(${p.id}, '${p.name}')">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            showToast('Gagal memuat produk', 'error');
        }
    }

    window.editProduct = async function (id) {
        try {
            const product = await request(`/products/${id}`);
            editFields.id.value = product.id;
            editFields.name.value = product.name;
            editFields.desc.value = product.description || '';
            editFields.price.value = product.price;
            editFields.category.value = product.category_id;
            editFields.image.value = product.image || '';
            editFields.featured.value = product.is_featured || 0;
            editFields.available.value = product.is_available !== undefined ? product.is_available : 1;

            editModal.classList.add('show');
        } catch (error) {
            showToast('Gagal memuat data produk', 'error');
        }
    };

    window.deleteProduct = async function (id, name) {
        if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) return;

        try {
            await request(`/products/${id}`, { method: 'DELETE' });
            showToast('Produk berhasil dihapus');
            await Promise.all([loadOverviewProducts(), loadProducts(), loadStats()]);
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editFields.id.value;
        const payload = {
            name: editFields.name.value,
            description: editFields.desc.value,
            price: Number(editFields.price.value),
            category_id: Number(editFields.category.value),
            image: editFields.image.value,
            is_featured: Number(editFields.featured.value),
            is_available: Number(editFields.available.value)
        };

        try {
            await request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            showToast('Produk berhasil diperbarui');
            editModal.classList.remove('show');
            await Promise.all([loadOverviewProducts(), loadProducts(), loadStats()]);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    editModalClose?.addEventListener('click', () => editModal.classList.remove('show'));
    editCancelBtn?.addEventListener('click', () => editModal.classList.remove('show'));
    editModal?.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.remove('show');
    });

    // Realtime promo timer updates
    let promoTimerInterval = null;
    const startPromoTimers = () => {
        if (promoTimerInterval) clearInterval(promoTimerInterval);

        promoTimerInterval = setInterval(() => {
            const timers = document.querySelectorAll('.promo-timer');
            timers.forEach(timer => {
                const expiresAt = timer.dataset.expires;
                if (!expiresAt) return;

                const now = new Date();
                const expiry = new Date(expiresAt);
                const diff = expiry - now;

                if (diff <= 0) {
                    timer.textContent = '⏰ Kadaluarsa';
                    timer.style.color = '#f05454';
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    timer.textContent = `⏱️ ${hours}j ${minutes}m ${seconds}d`;

                    // Color based on urgency
                    if (diff < 30 * 60 * 1000) { // < 30 min
                        timer.style.color = '#f05454';
                    } else if (diff < 60 * 60 * 1000) { // < 1 hour
                        timer.style.color = '#d29c5c';
                    } else {
                        timer.style.color = '#40b77e';
                    }
                }
            });
        }, 1000);
    };
});

/* Toast style */
const adminToastStyle = document.createElement('style');
adminToastStyle.textContent = `
.admin-toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 0.8rem 1.4rem;
    border-radius: 999px;
    background: rgba(12, 12, 12, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
}
.admin-toast.show {
    opacity: 1;
    transform: translateY(0);
}
.admin-toast-success { border-color: rgba(64, 183, 126, 0.6); }
.admin-toast-error { border-color: rgba(240, 84, 84, 0.6); }
`;
document.head.appendChild(adminToastStyle);
