import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';
import { BrowserProvider } from 'ethers';
import api from '../utils/api'; // Khai báo api call

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    walletAddress: '',
    role: 'Buyer', // Giá trị mặc định
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const connectAndGetWallet = async () => {
    if (!window.ethereum) {
      alert('Vui lòng cài đặt ví MetaMask!');
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setFormData({
        ...formData,
        walletAddress: accounts[0],
      });
      alert('Đã liên kết địa chỉ ví thành công vào form!');
    } catch (error) {
      alert('Không thể kết nối ví.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // GỌI API ĐĂNG KÝ THỰC TẾ XUỐNG BACKEND
      const response = await api.post('/auth/register', formData);

      alert(response.data.message || 'Đăng ký tài khoản thành công!');
      navigate('/login'); // Đăng ký xong chuyển sang trang Đăng nhập
    } catch (error) {
      alert(error.response?.data?.message || 'Đăng ký thất bại. Email đã tồn tại hoặc thông tin không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
          <p className="text-gray-500">Tham gia sàn đấu giá phi tập trung an toàn, minh bạch</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaUser /></span>
              <input type="text" name="userName" required value={formData.userName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Nguyễn Văn A" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaEnvelope /></span>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="name@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaPhone /></span>
                <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0912345678" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaLock /></span>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaMapMarkerAlt /></span>
              <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Số nhà, Tên đường..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ ví MetaMask</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaWallet /></span>
                <input type="text" name="walletAddress" value={formData.walletAddress} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-mono" placeholder="0x..." />
              </div>
              <button type="button" onClick={connectAndGetWallet} className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition">
                Lấy địa chỉ ví
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bạn muốn tham gia với vai trò?</label>
            <div className="flex gap-6">
              <label className="inline-flex items-center cursor-pointer">
                <input type="radio" name="role" value="Buyer" checked={formData.role === 'Buyer'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700 font-medium">Người Mua (Buyer)</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input type="radio" name="role" value="Seller" checked={formData.role === 'Seller'} onChange={handleInputChange} className="w-4 h-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-700 font-medium">Người Bán (Seller)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition text-sm mt-4 disabled:bg-blue-400">
            {isLoading ? 'Đang khởi tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;