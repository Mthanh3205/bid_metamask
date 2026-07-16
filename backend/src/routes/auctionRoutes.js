const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { verifyToken, isSeller } = require('../middlewares/authMiddleware');

router.get('/', auctionController.getAllAuctions);
router.post('/', verifyToken, isSeller, auctionController.createAuction);

module.exports = router;