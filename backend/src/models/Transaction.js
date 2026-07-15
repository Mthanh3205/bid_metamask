const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETH' },
    txHash: { type: String, required: true },
    blockHash: { type: String },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
    paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);