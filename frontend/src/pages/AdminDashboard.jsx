import React, { useState } from 'react';
import { FaChartPie, FaUsers, FaBoxOpen, FaTags, FaCheck, FaTimes, FaBan, FaUnlock } from 'react-icons/fa';

// Mock data: Thống kê tổng quan
const mockStats = {
  totalUsers: 156,
  activeAuctions: 42,
  totalVolume: 850.5, // ETH
  pendingProducts: 5,
};

// Mock data: Danh sách người dùng 
const mockUsers = [
  { id: 'u1', userName: 'Nguyễn Văn A', email: 'a@example.com', role: 'Buyer', status: 'Active', walletAddress: '0x71C...976F' },
  { id: 'u2', userName: 'Trần Thị B', email: 'b@example.com', role: 'Seller', status: 'Active', walletAddress: '0x99B...442A' },
  { id: 'u3', userName: 'Lê Văn C', email: 'c@example.com', role: 'Buyer', status: 'Blocked', walletAddress: '0x33A...881C' },
];

// Mock data: Danh sách sản phẩm chờ duyệt 
const mockPendingProducts = [
  { id: 'p1', sellerName: 'Trần Thị B', productName: 'Đồng hồ Hublot Classic Fusion', category: 'Trang sức & Đồng hồ', condition: 'Used', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200' },
  { id: 'p2', sellerName: 'Trần Thị B', productName: 'Bức tranh phong cảnh', category: 'Nghệ thuật (NFT)', condition: 'New', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, products, categories

  const handleApprove = (id) => {
    alert(`Đã DUYỆT (Approve) sản phẩm ID: ${id}`);
    // Gọi API cập nhật status = 'Approved' 
  };

  const handleReject = (id) => {
    alert(`Đã TỪ CHỐI (Reject) sản phẩm ID: ${id}`);
    // Gọi API cập nhật status = 'Rejected' 
  };

  const toggleUserStatus = (id, currentStatus) => {
    const action = currentStatus === 'Active' ? 'KHÓA (Block)' : 'MỞ KHÓA (Active)';
    alert(`Đã ${action} người dùng ID: ${id}`);
    // Gọi API cập nhật status User 
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 lg:px-16 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 flex-grow">
        
        {/* Sidebar Quản trị viên */}
        <div className="w-full md:w-1/4 bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden h-fit sticky top-24">
          <div className="p-6 border-b border-gray-800 text-center">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-3 font-bold shadow-lg">
              AD
            </div>
            <h2 className="text-xl font-bold text-white">Quản Trị Viên</h2>
            <p className="text-xs text-blue-400 mt-1 uppercase tracking-wider">System Admin</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaChartPie /> Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaUsers /> Quản lý Người dùng
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition font-medium ${activeTab === 'products' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <div className="flex items-center gap-3"><FaBoxOpen /> Duyệt Sản phẩm</div>
              {mockStats.pendingProducts > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{mockStats.pendingProducts}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <FaTags /> Quản lý Danh mục
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="w-full md:w-3/4">
          
          {/* TAB 1: TỔNG QUAN (DASHBOARD) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thống kê Hệ thống</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <div className="text-blue-500 text-3xl mb-2"><FaUsers /></div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{mockStats.totalUsers}</h3>
                  <p className="text-sm text-gray-500 font-medium">Người dùng đăng ký</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <div className="text-green-500 text-3xl mb-2"><FaBoxOpen /></div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{mockStats.activeAuctions}</h3>
                  <p className="text-sm text-gray-500 font-medium">Phiên đấu giá Active</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <div className="text-purple-500 text-3xl mb-2 font-bold">ETH</div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{mockStats.totalVolume}</h3>
                  <p className="text-sm text-gray-500 font-medium">Tổng giao dịch</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <div className="text-red-500 text-3xl mb-2"><FaCheck /></div>
                  <h3 className="text-3xl font-extrabold text-gray-800">{mockStats.pendingProducts}</h3>
                  <p className="text-sm text-gray-500 font-medium">Sản phẩm chờ duyệt</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Quản lý Tài khoản (Users)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm tracking-wider">
                      <th className="py-4 px-4 font-medium rounded-tl-lg">Tên / Email</th>
                      <th className="py-4 px-4 font-medium">Vai trò</th>
                      <th className="py-4 px-4 font-medium">Ví MetaMask</th>
                      <th className="py-4 px-4 font-medium">Trạng thái</th>
                      <th className="py-4 px-4 font-medium rounded-tr-lg text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-800">{user.userName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'Seller' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500 font-mono text-sm">{user.walletAddress}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {user.status === 'Active' ? (
                            <button onClick={() => toggleUserStatus(user.id, user.status)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Khóa tài khoản">
                              <FaBan size={18} />
                            </button>
                          ) : (
                            <button onClick={() => toggleUserStatus(user.id, user.status)} className="text-green-500 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition" title="Mở khóa tài khoản">
                              <FaUnlock size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DUYỆT SẢN PHẨM */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Sản phẩm chờ duyệt (Pending)</h2>
              {mockPendingProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Không có sản phẩm nào cần duyệt lúc này.</div>
              ) : (
                <div className="space-y-4">
                  {mockPendingProducts.map((product) => (
                    <div key={product.id} className="flex flex-col sm:flex-row bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                      <img src={product.image} alt={product.productName} className="w-full sm:w-40 h-40 object-cover" />
                      <div className="p-5 flex-grow flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-gray-900">{product.productName}</h3>
                        <p className="text-sm text-gray-500 mb-2">Đăng bởi: <span className="font-semibold text-gray-700">{product.sellerName}</span></p>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">{product.category}</span>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">Tình trạng: {product.condition}</span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-row sm:flex-col gap-3 justify-center items-center bg-white border-l border-gray-200">
                        <button onClick={() => handleApprove(product.id)} className="w-full bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm">
                          <FaCheck /> Duyệt
                        </button>
                        <button onClick={() => handleReject(product.id)} className="w-full bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-sm">
                          <FaTimes /> Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: QUẢN LÝ DANH MỤC */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Quản lý Danh mục (Categories)</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm">
                  + Thêm danh mục
                </button>
              </div>
              <ul className="space-y-3">
                {['Đồ công nghệ', 'Trang sức & Đồng hồ', 'Nghệ thuật (NFT)', 'Đồ cổ'].map((cat, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-50 px-5 py-4 rounded-xl border border-gray-200">
                    <span className="font-semibold text-gray-800">{cat}</span>
                    <div className="flex gap-3 text-sm">
                      <button className="text-blue-600 hover:underline">Sửa</button>
                      <button className="text-red-600 hover:underline">Xóa</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;