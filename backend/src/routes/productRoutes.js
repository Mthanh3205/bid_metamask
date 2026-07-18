const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isSeller, isAdmin } = require('../middlewares/authMiddleware');

// Route Seller đăng sản phẩm (Yêu cầu đăng nhập + Phải là Seller)
router.post('/', verifyToken, productController.createProduct);

// Route Admin xem danh sách chờ duyệt (Yêu cầu đăng nhập + Phải là Admin)
router.get('/pending', verifyToken, isAdmin, productController.getPendingProducts);

// Route Admin duyệt/từ chối sản phẩm (Yêu cầu đăng nhập + Phải là Admin)
router.put('/:id/status', verifyToken, isAdmin, productController.updateProductStatus);

module.exports = router;