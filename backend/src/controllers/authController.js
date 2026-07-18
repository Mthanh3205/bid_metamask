const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [POST] Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { userName, email, password, walletAddress, phone, address, role } = req.body;

    // 1. Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    // 2. Mã hóa mật khẩu (Salt: 10 vòng)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      walletAddress,
      phone,
      address,
      role, // Mặc định trong Model là 'Buyer' nếu không truyền lên
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký!', error: error.message });
  }
};

// [POST] Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại!' });
    }

    // 2. Kiểm tra tài khoản có bị khóa không
    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa!' });
    }

    // 3. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác!' });
    }

    // 4. Tạo JWT Token
    // Chuỗi token này sẽ chứa _id và role của user, tồn tại trong 7 ngày
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập!', error: error.message });
  }
};
