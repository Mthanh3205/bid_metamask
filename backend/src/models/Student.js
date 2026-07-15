const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    maSinhVien: {
      type: String,
      required: true,
      unique: true,
    },
    hoTen: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
