const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [POST] Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    let { userName, email, password, phone, address, walletAddress, role } = req.body;

    // ⚠️ FIX: Chuyển chuỗi rỗng thành null để tránh lỗi unique index
    if (!walletAddress || walletAddress.trim() === '') {
      walletAddress = null;
    }

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng!' });
    }

    // Kiểm tra walletAddress đã tồn tại chưa (nếu có nhập)
    if (walletAddress) {
      const walletExists = await User.findOne({ walletAddress });
      if (walletExists) {
        return res.status(400).json({ message: 'Địa chỉ ví đã được sử dụng!' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user
    const user = await User.create({
      userName,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      walletAddress, // null nếu không nhập
      role: role || 'Buyer',
    });

    // Tạo token luôn để tự động đăng nhập sau khi đăng ký
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Đăng ký thành công!',
      token, // ← trả token để frontend tự động login
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
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

// [GET] Lấy profile user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

// [PUT] Cập nhật địa chỉ ví
exports.updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    // Kiểm tra ví đã có ai dùng chưa (trừ chính mình)
    const exists = await User.findOne({ walletAddress, _id: { $ne: req.user.id } });
    if (exists) {
      return res.status(400).json({ message: 'Địa chỉ ví đã được sử dụng!' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress: walletAddress || null },
      { new: true }
    ).select('-password');

    res.status(200).json({ 
      message: 'Cập nhật ví thành công!', 
      walletAddress: user.walletAddress 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};
