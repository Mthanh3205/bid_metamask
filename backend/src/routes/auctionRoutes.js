const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, auctionController.createAuction);
router.get('/my', verifyToken, auctionController.getMyAuctions);
router.get('/my-bids', verifyToken, auctionController.getMyBids);
router.post('/bid', verifyToken, auctionController.placeBid);        
router.get('/', auctionController.getAllAuctions);

router.get('/:id', auctionController.getAuctionById);
router.get('/:id/bids', auctionController.getAuctionBids);    
router.put('/:id/status', verifyToken, auctionController.updateAuctionStatus);

module.exports = router;