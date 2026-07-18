const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid'); // ← THÊM

// [POST] Tạo đấu giá
exports.createAuction = async (req, res) => {
    try {
        const { productId, scAuctionId, contractAddress, startingPrice, minimumIncrement, startTime, endTime } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        
        if (product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không phải chủ sản phẩm này!' });
        }

        // Kiểm tra scAuctionId đã tồn tại chưa
        if (scAuctionId) {
            const exists = await Auction.findOne({ scAuctionId });
            if (exists) return res.status(400).json({ message: 'AuctionId đã tồn tại!' });
        }

        const auction = await Auction.create({
            productId,
            sellerId: req.user._id,
            scAuctionId,
            contractAddress,
            startingPrice,
            minimumIncrement,
            startTime,
            endTime,
            status: 'Upcoming'
        });

        // Cập nhật product thành Auctioning
        product.status = 'Auctioning';
        await product.save();

        res.status(201).json({ message: 'Tạo phiên đấu giá thành công!', auction });
    } catch (error) {
        console.error('Create auction error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo phiên đấu giá!', error: error.message });
    }
};

// [GET] Lấy chi tiết 1 đấu giá ← THÊM HÀM NÀY
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id)
            .populate('productId')
            .populate('sellerId', 'userName walletAddress');
        if (!auction) {
            return res.status(404).json({ message: 'Không tìm thấy đấu giá!' });
        }
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};

// [GET] Public: Lấy danh sách đấu giá
exports.getAllAuctions = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let query = {};
        
        // Nếu có filter status thì dùng, không thì lấy Active + Upcoming
        if (status && status !== 'all') {
            query.status = status;
        } else {
            query.status = { $in: ['Active', 'Upcoming'] };
        }

        let dbQuery = Auction.find(query)
            .populate('productId', 'productName image description condition')
            .populate('sellerId', 'userName walletAddress')
            .sort({ createdAt: -1 });

        // Nếu có search theo tên sản phẩm
        if (search) {
            // Cần populate trước rồi filter (hoặc dùng aggregation)
            // Đơn giản: lấy tất cả rồi filter ở frontend
        }

        const auctions = await dbQuery;
        res.status(200).json(auctions);  // ← Trả array trực tiếp
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đấu giá!', error: error.message });
    }
};

// [GET] Đấu giá của tôi
exports.getMyAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find({ sellerId: req.user._id }) // ← dùng _id
            .populate('productId', 'productName description')
            .sort({ createdAt: -1 });
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};

// [GET] Lịch sử đặt giá của tôi
exports.getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ bidderId: req.user._id }) // ← dùng _id
            .populate({
                path: 'auctionId',
                populate: { path: 'productId', select: 'productName' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};

// [GET] Lấy lịch sử đặt giá của 1 auction
exports.getAuctionBids = async (req, res) => {
    try {
        const bids = await Bid.find({ auctionId: req.params.id })
            .populate('bidderId', 'userName')
            .sort({ createdAt: -1 });
        res.status(200).json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};