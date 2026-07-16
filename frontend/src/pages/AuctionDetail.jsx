import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEthereum, FaWallet, FaClock, FaHistory, FaArrowLeft } from 'react-icons/fa';

// Mock data: Chi tiết một phiên đấu giá
const mockAuctionDetail = {
  id: '1',
  title: 'Đồng hồ Rolex Submariner (Phiên bản giới hạn)',
  category: 'Trang sức & Đồng hồ',
  condition: 'Mới (New)',
  sellerAddress: '0x1234...abcd',
  image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop',
  description: 'Chiếc đồng hồ Rolex Submariner nguyên bản, đi kèm hộp và giấy tờ chứng nhận. Đây là cơ hội tuyệt vời để sở hữu một tuyệt tác thời gian với tính minh bạch tuyệt đối qua Blockchain.',
  startPrice: 1.5,
  currentPrice: 2.5,
  minIncrement: 0.1,
  endTime: '2026-12-31T23:59:59', // Sẽ cần format lại khi làm thật
  status: 'Active',
};

// Mock data: Lịch sử đặt giá (Bids)
const mockBids = [
  { id: 'b1', bidder: '0x71C...976F', amount: 2.5, time: '10 phút trước', txHash: '0xabc...123' },
  { id: 'b2', bidder: '0x99B...442A', amount: 2.2, time: '1 giờ trước', txHash: '0xdef...456' },
  { id: 'b3', bidder: '0x33A...881C', amount: 1.8, time: '3 giờ trước', txHash: '0xghi...789' },
  { id: 'b4', bidder: '0x71C...976F', amount: 1.5, time: '1 ngày trước', txHash: '0xjkl...012' },
];

const AuctionDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL (VD: /auction/1)
  const [bidAmount, setBidAmount] = useState('');
  
  // State giả lập trạng thái kết nối ví MetaMask (Sau này dùng Web3Context)
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    // Logic gọi window.ethereum.request({ method: 'eth_requestAccounts' }) sẽ nằm ở đây
    setIsWalletConnected(true);
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    const minRequired = mockAuctionDetail.currentPrice + mockAuctionDetail.minIncrement;

    if (!amount || amount < minRequired) {
      alert(`Giá đặt phải lớn hơn hoặc bằng ${minRequired} ETH`);
      return;
    }

    // Logic gọi Smart Contract ethers.js ( bid() ) sẽ nằm ở đây
    alert(`Đang xử lý giao dịch đặt giá: ${amount} ETH qua MetaMask...`);
    setBidAmount('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Nút quay lại */}
        <Link to="/auctions" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition">
          <FaArrowLeft /> Quay lại danh sách
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row mb-8">
          
          {/* Cột trái: Hình ảnh sản phẩm */}
          <div className="w-full lg:w-1/2 h-96 lg:h-auto relative bg-gray-100">
            <img 
              src={mockAuctionDetail.image} 
              alt={mockAuctionDetail.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md">
              <FaClock /> Đang diễn ra
            </div>
          </div>

          {/* Cột phải: Thông tin & Đặt giá */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
            <span className="text-sm font-semibold text-blue-600 mb-2">{mockAuctionDetail.category}</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockAuctionDetail.title}</h1>
            
            <div className="flex gap-4 text-sm text-gray-600 mb-6">
              <span className="bg-gray-100 px-3 py-1 rounded-full">Tình trạng: {mockAuctionDetail.condition}</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">Người bán: {mockAuctionDetail.sellerAddress}</span>
            </div>

            <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
              {mockAuctionDetail.description}
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-500 font-medium">Giá cao nhất hiện tại</span>
                <span className="text-4xl font-extrabold text-gray-900 flex items-center gap-2">
                  <FaEthereum className="text-blue-600" /> {mockAuctionDetail.currentPrice}
                </span>
              </div>
              <p className="text-sm text-gray-500 text-right">
                Giá khởi điểm: {mockAuctionDetail.startPrice} ETH
              </p>
            </div>

            {/* Khu vực Action: Kết nối ví hoặc Đặt giá */}
            <div className="mt-auto">
              {!isWalletConnected ? (
                <button 
                  onClick={handleConnectWallet}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 flex justify-center items-center gap-3 text-lg"
                >
                  <FaWallet className="text-xl" /> Kết nối MetaMask để Đấu Giá
                </button>
              ) : (
                <form onSubmit={handlePlaceBid} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhập giá (Tối thiểu: {(mockAuctionDetail.currentPrice + mockAuctionDetail.minIncrement).toFixed(2)} ETH)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEthereum className="text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition duration-300 text-lg"
                  >
                    Xác nhận đặt giá
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Khu vực bên dưới: Lịch sử đấu giá */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaHistory className="text-blue-500" /> Lịch sử đặt giá
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="py-4 px-6 font-medium rounded-tl-lg">Người tham gia</th>
                  <th className="py-4 px-6 font-medium">Giá đặt (ETH)</th>
                  <th className="py-4 px-6 font-medium">Thời gian</th>
                  <th className="py-4 px-6 font-medium rounded-tr-lg">TxHash (Blockchain)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockBids.map((bid, index) => (
                  <tr key={bid.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {bid.bidder}
                      {index === 0 && <span className="ml-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Đang dẫn đầu</span>}
                    </td>
                    <td className="py-4 px-6 font-bold text-blue-600">{bid.amount}</td>
                    <td className="py-4 px-6 text-gray-500">{bid.time}</td>
                    <td className="py-4 px-6">
                      <a href={`#${bid.txHash}`} className="text-blue-500 hover:underline font-mono text-sm">
                        {bid.txHash}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuctionDetail;