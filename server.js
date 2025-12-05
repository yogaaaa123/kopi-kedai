const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database (simple solution without native dependencies)
let categories = [];
let products = [];
let orders = [];
let promos = [];
let nextCategoryId = 1;
let nextProductId = 1;
let nextOrderId = 1;
let nextPromoId = 1;

// Initialize data
function initData() {
    categories = [
        { id: 1, name: 'Kopi', description: 'Berbagai jenis kopi pilihan', icon: '' },
        { id: 2, name: 'Teh', description: 'Teh premium dari berbagai daerah', icon: '' },
        { id: 3, name: 'Makanan Ringan', description: 'Snack dan cemilan lezat', icon: '' },
        { id: 4, name: 'Makanan Berat', description: 'Menu utama yang mengenyangkan', icon: '' },
        { id: 5, name: 'Dessert', description: 'Hidangan penutup manis', icon: '' },
        { id: 6, name: 'Minuman Dingin', description: 'Minuman segar dan menyegarkan', icon: '' }
    ];
    nextCategoryId = 7;

    products = [
        // Kopi (10 produk)
        { id: 1, name: 'Espresso', description: 'Espresso klasik dengan crema sempurna', price: 25000, category_id: 1, image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 2, name: 'Cappuccino', description: 'Espresso dengan steamed milk dan foam lembut', price: 35000, category_id: 1, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 3, name: 'Latte', description: 'Espresso dengan susu hangat dan sedikit foam', price: 38000, category_id: 1, image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 4, name: 'Americano', description: 'Espresso dengan air panas', price: 28000, category_id: 1, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', is_featured: 0, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 5, name: 'Mocha', description: 'Espresso dengan cokelat dan susu', price: 42000, category_id: 1, image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 6, name: 'Caramel Macchiato', description: 'Espresso dengan vanilla dan caramel', price: 45000, category_id: 1, image: 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 7, name: 'Flat White', description: 'Double shot espresso dengan microfoam', price: 40000, category_id: 1, image: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=400', is_featured: 0, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 8, name: 'Affogato', description: 'Espresso shot dengan vanilla ice cream', price: 48000, category_id: 1, image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400', is_featured: 1, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 9, name: 'Vietnamese Coffee', description: 'Kopi Vietnam dengan susu kental manis', price: 32000, category_id: 1, image: 'https://images.unsplash.com/photo-1559496417-e7f25c0f2065?w=400', is_featured: 0, is_available: 1, category_name: 'Kopi', category_icon: '' },
        { id: 10, name: 'Kopi Tubruk', description: 'Kopi tradisional Indonesia', price: 20000, category_id: 1, image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400', is_featured: 0, is_available: 1, category_name: 'Kopi', category_icon: '' },

        // Teh (10 produk)
        { id: 11, name: 'Green Tea Latte', description: 'Teh hijau premium dengan susu', price: 35000, category_id: 2, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400', is_featured: 1, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 12, name: 'Earl Grey', description: 'Teh hitam dengan aroma bergamot', price: 28000, category_id: 2, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400', is_featured: 0, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 13, name: 'Chamomile Tea', description: 'Teh herbal menenangkan', price: 30000, category_id: 2, image: 'https://images.unsplash.com/photo-1597318170143-f379f2b90835?w=400', is_featured: 0, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 14, name: 'Jasmine Tea', description: 'Teh hijau dengan bunga melati', price: 32000, category_id: 2, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', is_featured: 1, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 15, name: 'Thai Tea', description: 'Teh Thailand dengan susu', price: 35000, category_id: 2, image: 'https://images.unsplash.com/photo-1583468323330-9032ad490fed?w=400', is_featured: 1, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 16, name: 'Lemon Tea', description: 'Teh hitam dengan lemon segar', price: 28000, category_id: 2, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', is_featured: 0, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 17, name: 'Teh Tarik', description: 'Teh susu Malaysia yang kental', price: 30000, category_id: 2, image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400', is_featured: 1, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 18, name: 'Oolong Tea', description: 'Teh oolong premium', price: 35000, category_id: 2, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', is_featured: 0, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 19, name: 'Mint Tea', description: 'Teh hijau dengan mint segar', price: 30000, category_id: 2, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', is_featured: 0, is_available: 1, category_name: 'Teh', category_icon: '' },
        { id: 20, name: 'Matcha Latte', description: 'Matcha premium Jepang dengan susu', price: 42000, category_id: 2, image: 'https://images.unsplash.com/photo-1536013082576-4077eef57de1?w=400', is_featured: 1, is_available: 1, category_name: 'Teh', category_icon: '' },

        // Makanan Ringan (10 produk)
        { id: 21, name: 'Croissant', description: 'Croissant butter renyah dari oven', price: 25000, category_id: 3, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 22, name: 'French Fries', description: 'Kentang goreng crispy dengan saus', price: 22000, category_id: 3, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 23, name: 'Chicken Wings', description: 'Sayap ayam pedas manis', price: 35000, category_id: 3, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 24, name: 'Nachos', description: 'Nachos dengan keju dan salsa', price: 32000, category_id: 3, image: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 25, name: 'Spring Rolls', description: 'Lumpia Vietnam dengan saus kacang', price: 28000, category_id: 3, image: 'https://images.unsplash.com/photo-1529928520614-7781e7f89c5b?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 26, name: 'Onion Rings', description: 'Cincin bawang crispy', price: 25000, category_id: 3, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 27, name: 'Bruschetta', description: 'Roti panggang dengan tomat segar', price: 30000, category_id: 3, image: 'https://images.unsplash.com/photo-1572695157166-38a5e7f07b00?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 28, name: 'Mozzarella Sticks', description: 'Stik keju mozzarella goreng', price: 35000, category_id: 3, image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 29, name: 'Garlic Bread', description: 'Roti bawang putih dengan keju', price: 20000, category_id: 3, image: 'https://images.unsplash.com/photo-1573140401552-388e6d4bb70f?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },
        { id: 30, name: 'Potato Wedges', description: 'Kentang wedges dengan sour cream', price: 28000, category_id: 3, image: 'https://images.unsplash.com/photo-1585109649139-8c5e8e067f8c?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Ringan', category_icon: '' },

        // Makanan Berat (10 produk)
        { id: 31, name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan telur dan ayam', price: 45000, category_id: 4, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 32, name: 'Spaghetti Carbonara', description: 'Pasta dengan saus krim dan bacon', price: 55000, category_id: 4, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 33, name: 'Beef Burger', description: 'Burger daging sapi dengan keju', price: 52000, category_id: 4, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 34, name: 'Chicken Katsu', description: 'Ayam katsu dengan nasi dan salad', price: 48000, category_id: 4, image: 'https://images.unsplash.com/photo-1604908815928-4f5c70d87969?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 35, name: 'Nasi Ayam Geprek', description: 'Ayam goreng geprek pedas dengan nasi', price: 42000, category_id: 4, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 36, name: 'Spaghetti Bolognese', description: 'Pasta dengan saus daging cincang', price: 50000, category_id: 4, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 37, name: 'Chicken Steak', description: 'Steak ayam dengan saus mushroom', price: 55000, category_id: 4, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 38, name: 'Mie Goreng Seafood', description: 'Mie goreng dengan seafood segar', price: 48000, category_id: 4, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', is_featured: 0, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 39, name: 'Beef Rendang Rice', description: 'Nasi dengan rendang sapi empuk', price: 58000, category_id: 4, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },
        { id: 40, name: 'Grilled Salmon', description: 'Salmon panggang dengan sayuran', price: 75000, category_id: 4, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', is_featured: 1, is_available: 1, category_name: 'Makanan Berat', category_icon: '' },

        // Dessert (10 produk)
        { id: 41, name: 'Tiramisu', description: 'Tiramisu klasik Italia', price: 45000, category_id: 5, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', is_featured: 1, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 42, name: 'Chocolate Lava Cake', description: 'Kue cokelat dengan lelehan cokelat', price: 42000, category_id: 5, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', is_featured: 1, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 43, name: 'Cheesecake', description: 'Cheesecake New York klasik', price: 40000, category_id: 5, image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400', is_featured: 1, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 44, name: 'Brownie Ice Cream', description: 'Brownie hangat dengan es krim', price: 38000, category_id: 5, image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400', is_featured: 0, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 45, name: 'Panna Cotta', description: 'Puding Italia dengan saus berry', price: 40000, category_id: 5, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', is_featured: 0, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 46, name: 'Red Velvet Cake', description: 'Kue red velvet dengan cream cheese', price: 42000, category_id: 5, image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400', is_featured: 1, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 47, name: 'Mango Sticky Rice', description: 'Ketan mangga Thailand', price: 35000, category_id: 5, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', is_featured: 0, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 48, name: 'Apple Pie', description: 'Pai apel dengan es krim vanilla', price: 38000, category_id: 5, image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400', is_featured: 0, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 49, name: 'Creme Brulee', description: 'Custard dengan karamel renyah', price: 45000, category_id: 5, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', is_featured: 1, is_available: 1, category_name: 'Dessert', category_icon: '' },
        { id: 50, name: 'Gelato Trio', description: 'Tiga rasa gelato pilihan', price: 42000, category_id: 5, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', is_featured: 0, is_available: 1, category_name: 'Dessert', category_icon: '' },

        // Minuman Dingin (10 produk)
        { id: 51, name: 'Mango Smoothie', description: 'Smoothie mangga segar', price: 35000, category_id: 6, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', is_featured: 1, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 52, name: 'Strawberry Smoothie', description: 'Smoothie strawberry segar', price: 35000, category_id: 6, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', is_featured: 1, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 53, name: 'Ice Chocolate', description: 'Cokelat dingin dengan whipped cream', price: 32000, category_id: 6, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400', is_featured: 0, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 54, name: 'Iced Lemon Tea', description: 'Teh lemon dingin segar', price: 25000, category_id: 6, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', is_featured: 0, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 55, name: 'Avocado Juice', description: 'Jus alpukat dengan susu', price: 32000, category_id: 6, image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400', is_featured: 1, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 56, name: 'Orange Juice', description: 'Jus jeruk segar', price: 28000, category_id: 6, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', is_featured: 0, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 57, name: 'Watermelon Juice', description: 'Jus semangka segar', price: 28000, category_id: 6, image: 'https://images.unsplash.com/photo-1589476218723-7744eb49725d?w=400', is_featured: 0, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 58, name: 'Iced Caramel Latte', description: 'Latte caramel dingin', price: 42000, category_id: 6, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', is_featured: 1, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 59, name: 'Milkshake Vanilla', description: 'Milkshake vanilla dengan whipped cream', price: 38000, category_id: 6, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', is_featured: 0, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' },
        { id: 60, name: 'Blue Ocean', description: 'Minuman soda biru segar', price: 30000, category_id: 6, image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400', is_featured: 1, is_available: 1, category_name: 'Minuman Dingin', category_icon: '' }
    ];
    nextProductId = 61;

    promos = [
        {
            id: 1,
            code: 'WELCOME10',
            discount_percent: 10,
            discount_amount: null,
            min_order: 50000,
            is_active: 1,
            max_uses: null,
            current_uses: 0,
            expires_at: null,
            duration_hours: null,
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            code: 'KOPI20',
            discount_percent: 20,
            discount_amount: null,
            min_order: 100000,
            is_active: 1,
            max_uses: null,
            current_uses: 0,
            expires_at: null,
            duration_hours: null,
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            code: 'HEMAT15',
            discount_percent: 15,
            discount_amount: null,
            min_order: 75000,
            is_active: 1,
            max_uses: null,
            current_uses: 0,
            expires_at: null,
            duration_hours: null,
            created_at: new Date().toISOString()
        }
    ];
    nextPromoId = 4;
}

initData();

// Categories
app.get('/api/categories', (req, res) => res.json(categories));
app.get('/api/categories/:id', (req, res) => {
    const cat = categories.find(c => c.id == req.params.id);
    cat ? res.json(cat) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/categories', (req, res) => {
    const cat = { id: nextCategoryId++, ...req.body };
    categories.push(cat);
    res.status(201).json(cat);
});
app.put('/api/categories/:id', (req, res) => {
    const idx = categories.findIndex(c => c.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    categories[idx] = { ...categories[idx], ...req.body, id: categories[idx].id };
    res.json(categories[idx]);
});
app.delete('/api/categories/:id', (req, res) => {
    const idx = categories.findIndex(c => c.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    categories.splice(idx, 1);
    res.json({ message: 'Deleted' });
});

// Products
app.get('/api/products', (req, res) => {
    let result = products;
    if (req.query.category) result = result.filter(p => p.category_id == req.query.category);
    if (req.query.featured === 'true') result = result.filter(p => p.is_featured === 1);
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
    }
    res.json(result);
});
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    product.reviews = [];
    res.json(product);
});
app.post('/api/products', (req, res) => {
    const cat = categories.find(c => c.id == req.body.category_id);
    const product = {
        id: nextProductId++,
        ...req.body,
        is_featured: Number(req.body.is_featured) || 0,
        is_available: Number(req.body.is_available) || 1,
        category_name: cat?.name || '',
        category_icon: cat?.icon || ''
    };
    products.push(product);
    res.status(201).json(product);
});
app.put('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const cat = categories.find(c => c.id == req.body.category_id);
    products[idx] = {
        ...products[idx],
        ...req.body,
        id: products[idx].id,
        category_name: cat?.name || products[idx].category_name,
        category_icon: cat?.icon || products[idx].category_icon
    };
    res.json(products[idx]);
});
app.delete('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    products.splice(idx, 1);
    res.json({ message: 'Deleted' });
});

// Orders
app.get('/api/orders', (req, res) => {
    let result = orders;
    if (req.query.status) result = result.filter(o => o.status === req.query.status);
    res.json(result);
});
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id == req.params.id);
    order ? res.json(order) : res.status(404).json({ error: 'Not found' });
});
app.post('/api/orders', (req, res) => {
    let total = 0;
    const items = req.body.items || [];
    items.forEach(item => {
        const p = products.find(pr => pr.id == item.product_id);
        if (p) total += p.price * item.quantity;
    });

    let discount = 0;
    let usedPromo = null;
    if (req.body.promo_code) {
        const promo = promos.find(pr => pr.code === req.body.promo_code && pr.is_active);
        if (promo) {
            // Check expiration and usage
            const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
            const isExhausted = promo.max_uses && promo.current_uses >= promo.max_uses;

            if (!isExpired && !isExhausted && total >= promo.min_order) {
                if (promo.discount_percent) discount = total * (promo.discount_percent / 100);
                else if (promo.discount_amount) discount = promo.discount_amount;

                // Increment usage count
                promo.current_uses = (promo.current_uses || 0) + 1;
                usedPromo = promo.code;
            }
        }
    }

    const order = {
        id: nextOrderId++,
        customer_name: req.body.customer_name,
        table_number: req.body.table_number,
        total_amount: total - discount,
        status: 'pending',
        notes: req.body.notes,
        promo_code: usedPromo,
        items: items.map(item => {
            const p = products.find(pr => pr.id == item.product_id);
            return {
                product_id: item.product_id,
                product_name: p?.name || '',
                product_image: p?.image || '',
                quantity: item.quantity,
                price: p?.price || 0
            };
        }),
        created_at: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
});
app.put('/api/orders/:id', (req, res) => {
    const idx = orders.findIndex(o => o.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    orders[idx] = { ...orders[idx], ...req.body, id: orders[idx].id };
    res.json(orders[idx]);
});
app.delete('/api/orders/:id', (req, res) => {
    const idx = orders.findIndex(o => o.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    orders.splice(idx, 1);
    res.json({ message: 'Deleted' });
});

// Promos
app.get('/api/promos', (req, res) => res.json(promos));

// Get active limited promos (for customer banner)
app.get('/api/promos/active', (req, res) => {
    const now = new Date();
    const activePromos = promos.filter(p => {
        if (!p.is_active) return false;
        if (p.expires_at && new Date(p.expires_at) < now) return false;
        if (p.max_uses && p.current_uses >= p.max_uses) return false;
        return (p.max_uses !== null || p.expires_at !== null);
    }).map(p => {
        const remaining = p.max_uses ? p.max_uses - p.current_uses : null;
        const timeLeft = p.expires_at ? new Date(p.expires_at) - now : null;
        return { ...p, remaining_uses: remaining, time_left_ms: timeLeft };
    });
    res.json(activePromos);
});

app.post('/api/promos/validate', (req, res) => {
    const promo = promos.find(p => p.code === req.body.code && p.is_active);
    if (!promo) return res.status(404).json({ error: 'Kode promo tidak valid' });

    // Check expiration
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Promo sudah kadaluarsa' });
    }

    // Check usage limit
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        return res.status(400).json({ error: 'Kuota promo sudah habis' });
    }

    if (req.body.total < promo.min_order) {
        return res.status(400).json({ error: `Minimum order Rp ${promo.min_order.toLocaleString('id-ID')}` });
    }

    let discount = 0;
    if (promo.discount_percent) discount = req.body.total * (promo.discount_percent / 100);
    else if (promo.discount_amount) discount = promo.discount_amount;

    res.json({ valid: true, discount, promo });
});
app.post('/api/promos', (req, res) => {
    const promo = {
        id: nextPromoId++,
        ...req.body,
        is_active: 1,
        current_uses: 0,
        created_at: new Date().toISOString()
    };

    // Auto-calculate expires_at from duration_hours
    if (req.body.duration_hours) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + req.body.duration_hours);
        promo.expires_at = expiresAt.toISOString();
    }

    promos.push(promo);
    res.status(201).json(promo);
});
app.put('/api/promos/:id', (req, res) => {
    const idx = promos.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    promos[idx] = { ...promos[idx], ...req.body, id: promos[idx].id };
    res.json(promos[idx]);
});
app.delete('/api/promos/:id', (req, res) => {
    const idx = promos.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    promos.splice(idx, 1);
    res.json({ message: 'Deleted' });
});

// Stats
app.get('/api/stats', (req, res) => {
    res.json({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        todayOrders: 0,
        topProducts: []
    });
});

// Reviews
app.post('/api/reviews', (req, res) => res.status(201).json({ id: 1, ...req.body }));
app.delete('/api/reviews/:id', (req, res) => res.json({ message: 'Deleted' }));

app.listen(PORT, () => {
    console.log(' Server running on http://localhost:' + PORT);
    console.log(' Frontend: http://localhost:' + PORT);
    console.log(' Admin: http://localhost:' + PORT + '/admin.html');
});
