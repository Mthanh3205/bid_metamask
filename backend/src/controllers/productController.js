const Product = require('../models/Product');
const Category = require('../models/Category');  
const mongoose = require('mongoose');

// [POST] Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        let { productName, categoryId, condition, description, estimatedPrice } = req.body;

        if (!categoryId || categoryId.trim() === '') {
            return res.status(400).json({ message: 'Vui lòng chọn danh mục!' });
        }

        let finalCategoryId = categoryId;
        
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            let cat = await Category.findOne({ categoryName: categoryId });
            if (!cat) {
                cat = await Category.create({ categoryName: categoryId });
            }
            finalCategoryId = cat._id;
        }

        const product = await Product.create({
            productName,
            categoryId: finalCategoryId,
            condition,
            description,
            estimatedPrice,
            sellerId: req.user._id
        });

        res.status(201).json({ message: 'Tạo sản phẩm thành công!', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
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