import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaWallet } from 'react-icons/fa';
import { BrowserProvider } from 'ethers';
import api from '../utils/api'; // Sử dụng instance api đã cấu hình

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 1. Logic Đăng nhập truyền thống bằng Email & Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Gọi API thật xuống Backend
      const response = await api.post('/auth/login', formData);
      
      const user = response.data.user;
      
      // Lưu Token và Thông tin User vào LocalStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      alert(response.data.message); // Báo đăng nhập thành công
      
      // ĐIỀU HƯỚNG DỰA TRÊN ROLE CỦA USER
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Seller') {
        navigate('/seller/dashboard');
      } else {
        // Mặc định là Buyer
        navigate('/buyer/dashboard');
      }
      
    } catch (error) {
      // Bắt lỗi từ BE (ví dụ: Sai mật khẩu)
      alert(error.response?.data?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Logic Đăng nhập bằng MetaMask (Web3 Authentication)
  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      alert('Vui lòng cài đặt ví MetaMask để sử dụng chức năng này!');
      return;
    }

    try {
      setIsLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const walletAddress = accounts[0];
      
      alert(`Kết nối thành công ví: ${walletAddress}. Vui lòng đăng nhập bằng Email để liên kết.`);
      // Tạm thời hiển thị địa chỉ ví, phần đăng nhập hoàn toàn bằng Web3 sẽ cần Backend xử lý ký chuỗi (Sign Message).
    } catch (error) {
      console.error(error);
      alert('Từ chối kết nối hoặc xảy ra lỗi khi xác thực qua MetaMask.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-500">Đăng nhập để tiếp tục tham gia các phiên đấu giá</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaEnvelope /></span>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm" placeholder="name@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><FaLock /></span>
              <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition text-sm" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow transition text-sm disabled:bg-blue-400">
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Hoặc</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button onClick={handleMetaMaskLogin} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow transition text-sm flex justify-center items-center gap-2 mb-6 disabled:bg-orange-400">
          <FaWallet /> Đăng nhập bằng MetaMask
        </button>

        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline font-medium">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;