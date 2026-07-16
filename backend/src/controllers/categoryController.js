const Category = require('../models/Category');

// [GET] Public: Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh mục!', error: error.message });
    }
};

// [POST] Admin: Tạo danh mục mới
exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        const newCategory = await Category.create({ categoryName, description });
        res.status(201).json({ message: 'Tạo danh mục thành công!', category: newCategory });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo danh mục!', error: error.message });
    }
};