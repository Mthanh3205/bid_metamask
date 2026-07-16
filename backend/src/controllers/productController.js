const Product = require('../models/Product');

// [POST] Dành cho Seller: Đăng sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const { categoryId, productName, description, condition, estimatedPrice } = req.body;

        const product = await Product.create({
            sellerId: req.user._id, // Lấy ID từ token đã xác thực
            categoryId,
            productName,
            description,
            condition,
            estimatedPrice,
            status: 'Pending' // Mặc định chờ duyệt
        });

        res.status(201).json({ message: 'Đăng sản phẩm thành công, vui lòng chờ duyệt!', product });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng sản phẩm!', error: error.message });
    }
};

// [GET] Dành cho Admin: Lấy danh sách sản phẩm đang chờ duyệt
exports.getPendingProducts = async (req, res) => {
    try {
        // Populate giúp lấy thêm thông tin User và Category thay vì chỉ lấy ID
        const products = await Product.find({ status: 'Pending' })
            .populate('sellerId', 'userName email walletAddress')
            .populate('categoryId', 'categoryName');
            
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm!', error: error.message });
    }
};

// [PUT] Dành cho Admin: Duyệt hoặc Từ chối sản phẩm
exports.updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body; // Phải là 'Approved' hoặc 'Rejected' 
        const productId = req.params.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ!' });
        }

        const product = await Product.findByIdAndUpdate(
            productId, 
            { status }, 
            { new: true }
        );

        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });

        res.status(200).json({ message: `Đã cập nhật trạng thái sản phẩm thành ${status}!`, product });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái!', error: error.message });
    }
};