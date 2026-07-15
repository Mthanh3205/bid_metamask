const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contractAddress: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    minimumIncrement: { type: Number, required: true }, 
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
        type: String, 
        enum: ['Upcoming', 'Active', 'Ended', 'Cancelled'], 
        default: 'Upcoming' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);