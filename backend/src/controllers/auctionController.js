const Auction = require('../models/Auction');
const Product = require('../models/Product');

// [POST] Seller: Lưu phiên đấu giá vào DB sau khi đã deploy Smart Contract thành công
exports.createAuction = async (req, res) => {
    try {
        const { productId, contractAddress, startingPrice, minimumIncrement, startTime, endTime } = req.body;

        // 1. Kiểm tra sản phẩm có tồn tại và đã được duyệt chưa [cite: 211-212]
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        if (product.status !== 'Approved') return res.status(400).json({ message: 'Sản phẩm chưa được duyệt!' });
        if (product.sellerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Bạn không phải chủ sản phẩm này!' });

        // 2. Tạo record Auction [cite: 215-216]
        const auction = await Auction.create({
            productId,
            sellerId: req.user._id,
            contractAddress,
            startingPrice,
            minimumIncrement,
            startTime,
            endTime,
            status: 'Upcoming'
        });

        // 3. Cập nhật trạng thái sản phẩm thành Auctioning
        product.status = 'Auctioning';
        await product.save();

        res.status(201).json({ message: 'Tạo phiên đấu giá thành công!', auction });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo phiên đấu giá!', error: error.message });
    }
};

// [GET] Public: Lấy danh sách các phiên đấu giá đang Active hoặc Upcoming
exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find({ status: { $in: ['Active', 'Upcoming'] } })
            .populate('productId', 'productName image description condition')
            .populate('sellerId', 'userName walletAddress');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đấu giá!', error: error.message });
    }
};