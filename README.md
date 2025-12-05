# Kedai Kopi Nusantara - Premium Coffee Shop Website

Website kedai kopi premium dengan backend lengkap dan UI responsif super premium.

## 🌟 Fitur

### Frontend
- **Design Premium**: UI modern dengan animasi smooth dan layout responsif
- **Kategori Lengkap**: 6 kategori menu (Kopi, Teh, Makanan Ringan, Makanan Berat, Dessert, Minuman Dingin)
- **125+ Menu Items**: Berbagai pilihan produk lengkap
- **Shopping Cart**: Keranjang belanja dengan localStorage
- **Promo Code**: System kode promo dengan validasi
- **Product Modal**: Detail produk dengan reviews
- **Search Function**: Pencarian produk real-time
- **Checkout Flow**: Form checkout lengkap
- **Mobile Responsive**: Optimized untuk semua device
- **Admin Dashboard**: Panel admin untuk manage data

### Backend (Express.js + SQLite)
- **Full CRUD Operations**: Create, Read, Update, Delete untuk semua resource
- **Categories API**: Manajemen kategori menu
- **Products API**: CRUD produk dengan filter & search
- **Orders API**: Sistem pemesanan lengkap dengan order items
- **Reviews API**: Rating dan review produk
- **Promo Codes API**: Manajemen dan validasi promo
- **Statistics API**: Dashboard analytics
- **Auto Seeding**: Database otomatis terisi data sample

## 📦 Database Schema

- **categories**: Kategori menu (6 categories)
- **products**: Produk menu (125+ items)
- **orders**: Data pesanan
- **order_items**: Detail item pesanan
- **reviews**: Review produk
- **promo_codes**: Kode promo diskon

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server
```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

### 3. Akses Website
- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin.html
- **API Endpoint**: http://localhost:3000/api

## 📱 Struktur Menu

### ☕ Kopi (25 items)
- Espresso, Cappuccino, Latte, Americano
- Mocha, Affogato, Cold Brew, Vietnamese Coffee
- Flat White, Macchiato, Cortado, Piccolo Latte
- Caramel Macchiato, Hazelnut Latte, Vanilla Latte
- Iced Latte, Iced Americano, Iced Mocha
- Kopi Susu Gula Aren, Es Kopi Susu Tetangga
- Spanish Latte, Dirty Coffee, dan lainnya

### 🍵 Teh (15 items)
- Green Tea Latte, Earl Grey, Thai Tea, Matcha Latte
- Teh Tarik, Jasmine Tea, English Breakfast
- Lemon Tea, Peach Tea, Oolong Tea
- Teh Susu Karamel, Mint Tea, dan lainnya

### 🍪 Makanan Ringan (20 items)
- Croissant, Pain au Chocolat, Almond Croissant
- Muffins (Chocolate, Blueberry)
- Cinnamon Roll, Scone, Danish Pastry
- Waffle, Pancake, French Toast
- Churros, Donut, Pretzel, dan lainnya

### 🍽️ Makanan Berat (25 items)
- Nasi Goreng, Nasi Rendang, Nasi Ayam Geprek
- Pasta (Carbonara, Bolognese, Aglio Olio, Alfredo)
- Burger (Beef Premium, Chicken)
- Steak (Beef, Chicken)
- Pizza (Margherita, Pepperoni)
- Fish and Chips, Caesar Salad, dan lainnya

### 🍰 Dessert (20 items)
- Tiramisu, Cheesecake, Chocolate Lava Cake
- Brownies, Panna Cotta, Creme Brulee
- Red Velvet Cake, Carrot Cake, Lemon Tart
- Apple Pie, Banana Split, Gelato Trio
- Profiterole, Eclair, dan lainnya

### 🧊 Minuman Dingin (20 items)
- Fresh Juice (Orange, Watermelon, Apple, Pineapple)
- Smoothie (Mango, Mixed Berry, Banana, Green)
- Milkshake (Strawberry, Chocolate, Vanilla, Oreo)
- Avocado Juice, Mojito Non-Alcoholic
- Ice Tea varieties, dan lainnya

## 🔧 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product with reviews
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Reviews
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review

### Promo Codes
- `GET /api/promos` - Get all promos
- `POST /api/promos/validate` - Validate promo code
- `POST /api/promos` - Create promo
- `PUT /api/promos/:id` - Update promo
- `DELETE /api/promos/:id` - Delete promo

### Statistics
- `GET /api/stats` - Get dashboard statistics

## 💳 Sample Promo Codes

- **WELCOME10**: 10% discount (min order Rp 50,000)
- **KOPI20**: 20% discount (min order Rp 100,000)
- **HEMAT15**: 15% discount (min order Rp 75,000)

## 🎨 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Google Fonts (Playfair Display, Poppins)
- Font Awesome Icons
- LocalStorage for cart persistence

### Backend
- Node.js
- Express.js
- SQLite3 (better-sqlite3)
- Multer (file uploads)
- CORS enabled

## 📂 Project Structure

```
kedai-kopi/
├── public/
│   ├── css/
│   │   ├── style.css         # Main frontend styles
│   │   └── admin.css         # Admin dashboard styles
│   ├── js/
│   │   ├── app.js           # Main frontend logic
│   │   └── admin.js         # Admin dashboard logic
│   ├── index.html           # Main website
│   └── admin.html           # Admin dashboard
├── uploads/                  # Uploaded images
├── server.js                 # Express backend
├── package.json
├── kedaikopi.db             # SQLite database (auto-created)
└── README.md
```

## 🔒 Security Notes

⚠️ **PENTING**: Admin dashboard tidak dilindungi authentication. Untuk production:
1. Tambahkan authentication/authorization
2. Gunakan environment variables untuk sensitive data
3. Implement rate limiting
4. Add HTTPS
5. Validate all user inputs

## 🚀 Deployment

### Untuk deploy ke production:
1. Set environment variable `PORT`
2. Gunakan process manager (PM2)
3. Setup reverse proxy (Nginx/Apache)
4. Configure firewall
5. Enable HTTPS dengan Let's Encrypt

## 📝 License

MIT License - Free to use for personal and commercial projects

## 👨‍💻 Developer

Dibuat dengan ❤️ untuk Kopi Nusantara

---

**Happy Coding! ☕**
