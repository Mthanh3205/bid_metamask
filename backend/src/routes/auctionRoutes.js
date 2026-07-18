const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/my-auctions', verifyToken, auctionController.getMyAuctions);
router.get('/my-bids', verifyToken, auctionController.getMyBids);

// Public routes
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);

// Protected routes
router.post('/', verifyToken, auctionController.createAuction);

module.exports = router;