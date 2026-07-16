import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWallet, 
  FaGavel, 
  FaSignInAlt, 
  FaUserPlus, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaStore 
} from 'react-icons/fa';

const Navbar = () => {
  // Lấy thông tin user từ LocalStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-blue-900 flex items-center gap-2">
          <FaGavel className="text-blue-600" /> DApp Auction
        </Link>
        
        {/* Menu & Nút chức năng */}
        <div className="hidden md:flex space-x-6 items-center">
          
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Trang chủ</Link>
          <Link to="/auctions" className="text-gray-600 hover:text-blue-600 font-medium transition">Khám phá</Link>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          {/* Kiểm tra trạng thái đăng nhập */}
          {user ? (
            <div className="flex items-center gap-4">
              
              {/* Phân luồng Nút Dashboard theo Role */}
              {user.role === 'Admin' && (
                <Link to="/admin/dashboard" className="bg-gray-800 text-white hover:bg-gray-900 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2 shadow-sm border border-gray-700">
                  <FaCog /> Quản trị Admin
                </Link>
              )}
              {user.role === 'Seller' && (
                <Link to="/seller/dashboard" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2 border border-emerald-200">
                  <FaStore /> Kênh Người Bán
                </Link>
              )}
              {user.role === 'Buyer' && (
                <Link to="/buyer/dashboard" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2 border border-blue-200">
                  <FaUser /> Hồ sơ của tôi
                </Link>
              )}

              {/* Lời chào & Đăng xuất */}
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Chào, {user.userName.split(' ').pop()}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-red-600 font-medium transition flex items-center gap-1 text-sm"
                  title="Đăng xuất"
                >
                  <FaSignOutAlt size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition flex items-center gap-2">
                <FaSignInAlt /> Đăng nhập
              </Link>
              <Link to="/register" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2">
                <FaUserPlus /> Đăng ký
              </Link>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center gap-2 ml-2">
                <FaWallet /> Kết nối ví
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;