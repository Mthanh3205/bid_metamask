const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    productName: { type: String, required: true },
    description: { type: String },
    condition: { 
        type: String, 
        enum: ['New', 'Used'], 
        required: true 
    },
    estimatedPrice: { type: Number },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Auctioning', 'Sold', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);