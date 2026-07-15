const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    imageUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductImage', productImageSchema);