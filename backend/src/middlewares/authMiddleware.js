const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Hàm kiểm tra xem người dùng đã đăng nhập (có Token hợp lệ) chưa
exports.verifyToken = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập!' });
    }

    try {
        // Giải mã token để lấy id người dùng
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Tìm user trong DB và gán vào req.user (loại bỏ field password)
        req.user = await User.findById(decoded.id).select('-password');
        next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// 2. Hàm kiểm tra quyền Seller
exports.isSeller = (req, res, next) => {
    if (req.user && req.user.role === 'Seller') {
        next();
    } else {
        res.status(403).json({ message: 'Chỉ Người bán (Seller) mới có quyền thực hiện hành động này!' });
    }
};

// 3. Hàm kiểm tra quyền Admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Chỉ Quản trị viên (Admin) mới có quyền thực hiện hành động này!' });
    }
};