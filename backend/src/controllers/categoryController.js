const Category = require('../models/Category');
const mongoose = require('mongoose');

// [GET] Lấy danh sách categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
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