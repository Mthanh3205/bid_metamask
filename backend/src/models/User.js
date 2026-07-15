const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress: { type: String, unique: true, sparse: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    role: { 
        type: String, 
        enum: ['Admin', 'Seller', 'Buyer'], 
        default: 'Buyer' 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Blocked'], 
        default: 'Active' 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('User', userSchema);