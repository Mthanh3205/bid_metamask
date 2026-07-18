// models/Auction.js
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    // THÊM TRƯỜNG NÀY: ID sinh ra từ Smart Contract (0, 1, 2...)
    scAuctionId: { type: Number, unique: true, sparse: true },

    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contractAddress: { type: String, required: true },

    // Lưu ý: Đổi thành String nếu bạn muốn lưu trực tiếp tiền Wei (tránh tràn số).
    // Nếu vẫn để Number, ta sẽ convert từ Wei sang ETH ở Listener.
    startingPrice: { type: Number, required: true },

    currentPrice: {
      type: Number,
      default: function () {
        return this.startingPrice;
      },
    },

    minimumIncrement: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Ended', 'Cancelled'],
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auction', auctionSchema);
