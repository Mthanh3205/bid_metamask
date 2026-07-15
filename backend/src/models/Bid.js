const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bidAmount: { type: Number, required: true },
    txHash: { type: String, required: true },
    blockNumber: { type: Number },
    gasFee: { type: Number }
}, { timestamps: { createdAt: 'createAt', updatedAt: false } }); 

module.exports = mongoose.model('Bid', bidSchema);