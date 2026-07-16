import React from 'react';
import { Link } from 'react-router-dom';
import { FaEthereum, FaGavel, FaShieldAlt } from 'react-icons/fa';

// Mock data: Dữ liệu giả lập cho các phiên đấu giá đang diễn ra
const mockAuctions = [
  {
    id: '1',
    title: 'Đồng hồ Rolex Submariner',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop',
    currentBid: 2.5,
    endTime: '2h 15m left',
  },
  {
    id: '2',
    title: 'Bức tranh kỹ thuật số NFT #1024',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    currentBid: 0.8,
    endTime: '5h 30m left',
  },
  {
    id: '3',
    title: 'MacBook Pro M3 Max (Used)',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    currentBid: 1.2,
    endTime: '12h 45m left',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Đấu Giá Minh Bạch Tích Hợp <span className="text-blue-400">Blockchain</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              Trải nghiệm nền tảng đấu giá tài sản trực tuyến an toàn, minh bạch và không thể sửa đổi. Thanh toán nhanh chóng và bảo mật qua ví MetaMask.
            </p>
            <div className="flex gap-4">
              <Link
                to="/auctions"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300"
              >
                Khám Phá Ngay
              </Link>
              <Link
                to="/create-auction"
                className="bg-transparent border border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Tạo Phiên Đấu Giá
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Có thể thay bằng một ảnh vector/3D liên quan đến blockchain */}
            <div className="w-72 h-72 bg-blue-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-400">
              <FaEthereum className="text-9xl text-gray-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">Tại sao chọn hệ thống của chúng tôi?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
            <FaShieldAlt className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Minh Bạch Tuyệt Đối</h3>
            <p className="text-gray-600">Lịch sử đặt giá được lưu trữ trên Blockchain, đảm bảo không ai có thể can thiệp hoặc sửa đổi.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
            <FaEthereum className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Thanh Toán Bằng ETH</h3>
            <p className="text-gray-600">Sử dụng tiền điện tử và ví MetaMask để giao dịch nhanh chóng, an toàn và hoàn toàn phi tập trung.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
            <FaGavel className="text-5xl text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">Smart Contract</h3>
            <p className="text-gray-600">Hợp đồng thông minh tự động xác định người thắng và chuyển quyền sở hữu mà không cần bên thứ ba.</p>
          </div>
        </div>
      </section>

      {/* Active Auctions Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Phiên Đấu Giá Nổi Bật</h2>
            <Link to="/auctions" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
              Xem tất cả &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockAuctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {auction.endTime}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800 truncate">{auction.title}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 text-sm">Giá hiện tại</span>
                    <span className="text-xl font-bold text-blue-600 flex items-center gap-1">
                      <FaEthereum /> {auction.currentBid} ETH
                    </span>
                  </div>
                  <Link
                    to={`/auction/${auction.id}`}
                    className="block w-full text-center bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 rounded-lg transition duration-200"
                  >
                    Tham gia ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;