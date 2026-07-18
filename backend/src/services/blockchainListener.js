// services/blockchainListener.js
const { ethers } = require('ethers');
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const abi = require('../constants/AuctionMarketplaceABI.json');

const WSS_URL = process.env.SEPOLIA_WSS_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const provider = new ethers.WebSocketProvider(WSS_URL);
const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function startListening() {
  console.log('🟢 Đang lắng nghe sự kiện từ Smart Contract...');

  // 1. LẮNG NGHE TẠO ĐẤU GIÁ
  marketplaceContract.on(
    'AuctionCreated',
    async (
      auctionId,
      sellerAddress,
      productId,
      startingPrice,
      minIncrement,
      startTime,
      endTime,
      event
    ) => {
      try {
        // Tìm ObjectId của User thông qua địa chỉ ví MetaMask
        const seller = await User.findOne({ walletAddress: sellerAddress.toLowerCase() });
        if (!seller) throw new Error(`Không tìm thấy User với ví ${sellerAddress}`);

        // Vì schema của bạn dùng Number cho giá, ta convert từ Wei sang ETH
        const startPriceEth = Number(ethers.formatEther(startingPrice));
        const minIncEth = Number(ethers.formatEther(minIncrement));

        const newAuction = new Auction({
          scAuctionId: Number(auctionId), // Map với ID của Smart Contract
          productId: productId, // Chuỗi Object ID của Product bạn truyền từ UI xuống SC
          sellerId: seller._id, // Object ID của User
          contractAddress: CONTRACT_ADDRESS,
          startingPrice: startPriceEth,
          currentPrice: startPriceEth,
          minimumIncrement: minIncEth,
          startTime: new Date(Number(startTime) * 1000),
          endTime: new Date(Number(endTime) * 1000),
          status: 'Active',
        });

        await newAuction.save();

        // Cập nhật trạng thái Product thành 'Auctioning'
        await Product.findByIdAndUpdate(productId, { status: 'Auctioning' });

        console.log(`✅ Đã lưu Auction mới: SC ID ${auctionId} - Mongo ID ${newAuction._id}`);
      } catch (error) {
        console.error('❌ Lỗi khi lưu AuctionCreated:', error);
      }
    }
  );

  // 2. LẮNG NGHE ĐẶT GIÁ (BID)
  marketplaceContract.on(
    'BidPlaced',
    async (auctionId, bidderAddress, amount, timestamp, event) => {
      try {
        // 1. Tìm Auction bằng scAuctionId (ID blockchain) để lấy được ObjectId của Auction
        const auction = await Auction.findOne({ scAuctionId: Number(auctionId) });
        if (!auction) throw new Error('Không tìm thấy Auction');

        // 2. Tìm User đang bid bằng địa chỉ ví
        const bidder = await User.findOne({ walletAddress: bidderAddress.toLowerCase() });
        if (!bidder) throw new Error('Không tìm thấy Bidder');

        const bidAmountEth = Number(ethers.formatEther(amount));

        // 3. Cập nhật giá cao nhất vào bảng Auction
        auction.currentPrice = bidAmountEth;
        await auction.save();

        // 4. Lưu lịch sử vào bảng Bids (đúng theo file Bid.js của bạn)
        const newBid = new Bid({
          auctionId: auction._id, // ObjectId
          bidderId: bidder._id, // ObjectId
          bidAmount: bidAmountEth,
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber,
        });
        await newBid.save();

        console.log(`💰 Đã ghi nhận Bid ${bidAmountEth} ETH cho Auction ${auctionId}`);
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật BidPlaced:', error);
      }
    }
  );

  // 3. LẮNG NGHE KẾT THÚC ĐẤU GIÁ
  marketplaceContract.on('AuctionEnded', async (auctionId, winnerAddress, winningBid, event) => {
    try {
      const winner = await User.findOne({ walletAddress: winnerAddress.toLowerCase() });

      await Auction.findOneAndUpdate(
        { scAuctionId: Number(auctionId) },
        {
          status: 'Ended',
          winnerId: winner ? winner._id : null,
        }
      );

      console.log(`🏆 Auction ${auctionId} kết thúc. Winner: ${winnerAddress}`);

      // Gợi ý: Ở đây bạn có thể tự động tạo record trong bảng Transaction.js
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật AuctionEnded:', error);
    }
  });
}

module.exports = { startListening };
