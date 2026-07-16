import React, { useState } from 'react';
import { FaUser, FaGavel, FaMoneyCheckAlt, FaBell, FaEthereum, FaCheckCircle, FaTimesCircle, FaCamera } from 'react-icons/fa';

// Mock data: Thông tin User (Bổ sung Avatar theo CSDL) [cite: 208]
const mockUser = {
  userName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0912345678',
  address: 'Quận 1, TP. Hồ Chí Minh',
  walletAddress: '0x71C...976F',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
  role: 'Buyer',
  status: 'Active'
};

// Mock data: Lịch sử tham gia đấu giá [cite: 217-218]
const mockMyBids = [
  { id: '1', productName: 'Đồng hồ Rolex Submariner', myBid: 2.5, currentHighest: 2.5, status: 'Winning', endTime: '2h 15m left' },
  { id: '2', productName: 'MacBook Pro M3 Max', myBid: 1.0, currentHighest: 1.2, status: 'Outbid', endTime: '12h 45m left' },
  { id: '3', productName: 'Bức tranh kỹ thuật số NFT #1024', myBid: 0.8, currentHighest: 0.8, status: 'Won', endTime: 'Ended' },
];

// Mock data: Lịch sử giao dịch & Thanh toán [cite: 219-220]
const mockTransactions = [
  { id: 'tx1', auctionName: 'Bức tranh kỹ thuật số NFT #1024', amount: 0.8, date: '2026-07-15', status: 'Completed', txHash: '0xabc...123' },
];

// Mock data: Thông báo [cite: 221-222]
const mockNotifications = [
  { id: 'n1', title: 'Bị vượt giá!', content: 'Có người đã đặt giá cao hơn bạn cho Đồng hồ Rolex Submariner. Hãy đặt lại giá ngay!', isRead: false, createAt: '10 phút trước' },
  { id: 'n2', title: 'Chiến thắng!', content: 'Chúc mừng bạn đã thắng phiên đấu giá Bức tranh NFT #1024.', isRead: true, createAt: '1 ngày trước' },
  { id: 'n3', title: 'Phiên đấu giá sắp bắt đầu', content: 'Sản phẩm Nhẫn kim cương bạn quan tâm sắp bắt đầu đấu giá.', isRead: true, createAt: '2 ngày trước' },
];

const BuyerDashboard = () => {
  // Quản lý trạng thái các tab: profile, bids, transactions, notifications
  const [activeTab, setActiveTab] = useState('profile'); 
  
  // Quản lý form cập nhật thông tin
  const [profileForm, setProfileForm] = useState(mockUser);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('Đã cập nhật thông tin thành công!');
    // Logic gọi API update thông tin user lên DB sẽ nằm ở đây
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Điều hướng */}
        <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit sticky top-24">
          <div className="p-6 border-b border-gray-100 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img src={mockUser.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-blue-50" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{mockUser.userName}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">{mockUser.walletAddress}</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaUser /> Hồ sơ cá nhân
            </button>
            <button 
              onClick={() => setActiveTab('bids')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'bids' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaGavel /> Lịch sử đấu giá
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'transactions' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FaMoneyCheckAlt /> Lịch sử giao dịch
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition font-medium ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3"><FaBell /> Thông báo</div>
              {/* Badge đếm số thông báo chưa đọc */}
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">1</span>
            </button>
          </div>
        </div>

        {/* Nội dung chính (Thay đổi theo Tab) */}
        <div className="w-full md:w-3/4">
          
          {/* TAB 1: HỒ SƠ CÁ NHÂN */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Cập nhật Hồ sơ cá nhân</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="flex flex-col sm:flex-row gap-8 mb-8">
                  {/* Upload Avatar */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 group">
                      <img src={profileForm.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium cursor-pointer">Đổi ảnh đại diện</span>
                  </div>

                  {/* Fields */}
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={profileForm.userName} onChange={(e) => setProfileForm({...profileForm, userName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể sửa)</label>
                      <input type="email" disabled className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed" value={profileForm.email} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Ví MetaMask (Dùng để nhận/trả coin)</label>
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50">
                        <FaEthereum className="text-gray-500" />
                        <input type="text" className="w-full bg-transparent outline-none font-mono text-sm text-gray-600" value={profileForm.walletAddress} onChange={(e) => setProfileForm({...profileForm, walletAddress: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition shadow-md w-full sm:w-auto">
                  Lưu thay đổi
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ ĐẤU GIÁ */}
          {activeTab === 'bids' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Lịch sử tham gia đấu giá</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm tracking-wider">
                      <th className="py-4 px-4 font-medium rounded-tl-lg">Sản phẩm</th>
                      <th className="py-4 px-4 font-medium">Giá bạn đặt</th>
                      <th className="py-4 px-4 font-medium">Giá cao nhất</th>
                      <th className="py-4 px-4 font-medium">Thời gian</th>
                      <th className="py-4 px-4 font-medium rounded-tr-lg">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockMyBids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4 font-medium text-gray-800">{bid.productName}</td>
                        <td className="py-4 px-4 text-blue-600 font-semibold">{bid.myBid} ETH</td>
                        <td className="py-4 px-4 text-gray-600">{bid.currentHighest} ETH</td>
                        <td className="py-4 px-4 text-gray-500 text-sm">{bid.endTime}</td>
                        <td className="py-4 px-4">
                          {bid.status === 'Winning' && <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 w-max"><FaCheckCircle /> Đang dẫn đầu</span>}
                          {bid.status === 'Outbid' && <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 w-max"><FaTimesCircle /> Bị vượt giá</span>}
                          {bid.status === 'Won' && (
                            <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition">
                              Thanh toán ngay
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

          {/* TAB 3: LỊCH SỬ GIAO DỊCH */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Lịch sử giao dịch & Thanh toán</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm tracking-wider">
                      <th className="py-4 px-4 font-medium rounded-tl-lg">Mã Giao Dịch (TxHash)</th>
                      <th className="py-4 px-4 font-medium">Sản phẩm</th>
                      <th className="py-4 px-4 font-medium">Số tiền</th>
                      <th className="py-4 px-4 font-medium">Ngày thanh toán</th>
                      <th className="py-4 px-4 font-medium rounded-tr-lg">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-mono text-sm">{tx.txHash}</a>
                        </td>
                        <td className="py-4 px-4 text-gray-800 font-medium">{tx.auctionName}</td>
                        <td className="py-4 px-4 text-blue-600 font-semibold">{tx.amount} ETH</td>
                        <td className="py-4 px-4 text-gray-500 text-sm">{tx.date}</td>
                        <td className="py-4 px-4">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Thành công</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: THÔNG BÁO */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Thông báo của bạn</h2>
              <div className="flex flex-col gap-4">
                {mockNotifications.map((noti) => (
                  <div key={noti.id} className={`p-4 rounded-xl border ${noti.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'} transition hover:shadow-sm`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold ${noti.isRead ? 'text-gray-700' : 'text-blue-800'}`}>
                        {noti.title}
                      </h3>
                      <span className="text-xs text-gray-400">{noti.createAt}</span>
                    </div>
                    <p className={`text-sm ${noti.isRead ? 'text-gray-500' : 'text-blue-600'}`}>
                      {noti.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;