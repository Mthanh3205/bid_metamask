const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env
dotenv.config();

// Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');

    // ===================== 1. XÓA DỮ LIỆU CŨ (TÙY CHỌN) =====================
    // Bỏ comment dòng dưới nếu muốn xóa toàn bộ dữ liệu cũ trước khi seed
    // await User.deleteMany({});
    // await Category.deleteMany({});
    // await Product.deleteMany({});
    // await Auction.deleteMany({});
    // await Bid.deleteMany({});

    // ===================== 2. SEED CATEGORIES =====================
    const categoriesData = [
      { categoryName: 'Nghệ thuật', description: 'Tranh, tượng, NFT nghệ thuật' },
      { categoryName: 'Bất động sản', description: 'Nhà đất, đất nền ảo' },
      { categoryName: 'Collectibles', description: 'Thẻ bài, đồ cổ, đồ sưu tầm' },
      { categoryName: 'Thời trang', description: 'Quần áo, giày dép, phụ kiện' },
      { categoryName: 'Công nghệ', description: 'Điện thoại, laptop, thiết bị số' },
    ];

    let categories = [];
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ categoryName: cat.categoryName });
      if (!existing) {
        existing = await Category.create(cat);
        console.log(`📁 Created category: ${cat.categoryName}`);
      } else {
        console.log(`📁 Category already exists: ${cat.categoryName}`);
      }
      categories.push(existing);
    }

    // ===================== 3. SEED USERS =====================
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const usersData = [
      {
        userName: 'Admin Hệ Thống',
        email: 'admin@test.com',
        password: hashedPassword,
        phone: '0900000001',
        address: 'Hà Nội',
        role: 'Admin',
        status: 'Active',
        walletAddress: null,
      },
      {
        userName: 'Nguyễn Văn Seller',
        email: 'seller@test.com',
        password: hashedPassword,
        phone: '0900000002',
        address: 'TP. Hồ Chí Minh',
        role: 'Seller',
        status: 'Active',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // địa chỉ ví giả lập
      },
      {
        userName: 'Trần Văn Buyer',
        email: 'buyer@test.com',
        password: hashedPassword,
        phone: '0900000003',
        address: 'Đà Nẵng',
        role: 'Buyer',
        status: 'Active',
        walletAddress: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', // địa chỉ ví giả lập
      },
      {
        userName: 'Lê Thị Buyer 2',
        email: 'buyer2@test.com',
        password: hashedPassword,
        phone: '0900000004',
        address: 'Hải Phòng',
        role: 'Buyer',
        status: 'Active',
        walletAddress: '0x583031D1113aD414F02576BD6afaBfb302140225',
      },
    ];

    const users = [];
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`👤 Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`👤 User already exists: ${u.email}`);
      }
      users.push(existing);
    }

    const admin = users.find(u => u.role === 'Admin');
    const seller = users.find(u => u.role === 'Seller');
    const buyer = users.find(u => u.email === 'buyer@test.com');

    // ===================== 4. SEED PRODUCTS =====================
    // Tạo sản phẩm đã Approved để seller có thể tạo auction ngay
    const productsData = [
      {
        sellerId: seller._id,
        categoryId: categories[0]._id, // Nghệ thuật
        productName: 'Bức tranh NFT Đen Vâu',
        description: 'Bức tranh kỹ thuật số độc bản của nghệ sĩ Đen Vâu',
        condition: 'New',
        estimatedPrice: 0.5,
        status: 'Approved',
      },
      {
        sellerId: seller._id,
        categoryId: categories[2]._id, // Collectibles
        productName: 'Thẻ bài Pokemon Rare',
        description: 'Thẻ bài hiếm từ bộ sưu tập 1999',
        condition: 'Used',
        estimatedPrice: 0.2,
        status: 'Approved',
      },
      {
        sellerId: seller._id,
        categoryId: categories[1]._id, // Bất động sản
        productName: 'Lô đất Metaverse #42',
        description: 'Đất ảo vị trí đẹp trong metaverse',
        condition: 'New',
        estimatedPrice: 1.5,
        status: 'Pending', // Sản phẩm chưa duyệt để test admin duyệt
      },
    ];

    const products = [];
    for (const p of productsData) {
      let existing = await Product.findOne({ productName: p.productName, sellerId: p.sellerId });
      if (!existing) {
        existing = await Product.create(p);
        console.log(`📦 Created product: ${p.productName} (${p.status})`);
      } else {
        console.log(`📦 Product already exists: ${p.productName}`);
      }
      products.push(existing);
    }

    console.log('\n🎉 SEED DATA HOÀN TẤT!');
    console.log('----------------------------------------');
    console.log('Tài khoản test:');
    console.log('  Admin : admin@test.com    | pass: 123456');
    console.log('  Seller: seller@test.com   | pass: 123456');
    console.log('  Buyer : buyer@test.com    | pass: 123456');
    console.log('  Buyer2: buyer2@test.com   | pass: 123456');
    console.log('----------------------------------------');
    console.log('Sản phẩm đã Approved (có thể tạo auction ngay):');
    products.filter(p => p.status === 'Approved').forEach(p => {
      console.log(`  - ${p.productName} (ID: ${p._id})`);
    });
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();