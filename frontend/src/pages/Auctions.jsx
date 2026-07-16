import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEthereum, FaSearch, FaFilter } from 'react-icons/fa';

// Mock data: Danh sách sản phẩm đầy đủ hơn kèm theo Danh mục (Category)
const mockAuctions = [
  {
    id: '1',
    title: 'Đồng hồ Rolex Submariner',
    category: 'Trang sức & Đồng hồ',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop',
    currentBid: 2.5,
    endTime: '2h 15m left',
    status: 'Active'
  },
  {
    id: '2',
    title: 'Bức tranh kỹ thuật số NFT #1024',
    category: 'Nghệ thuật (NFT)',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop',
    currentBid: 0.8,
    endTime: '5h 30m left',
    status: 'Active'
  },
  {
    id: '3',
    title: 'MacBook Pro M3 Max 64GB',
    category: 'Đồ công nghệ',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    currentBid: 1.2,
    endTime: '12h 45m left',
    status: 'Active'
  },
  {
    id: '4',
    title: 'Tai nghe Sony WH-1000XM5',
    category: 'Đồ công nghệ',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop',
    currentBid: 0.1,
    endTime: '1 ngày left',
    status: 'Active'
  },
  {
    id: '5',
    title: 'Nhẫn kim cương 1.5 Carat',
    category: 'Trang sức & Đồng hồ',
    image: 'https://images.unsplash.com/photo-1605100804763-247f6612148e?q=80&w=600&auto=format&fit=crop',
    currentBid: 3.0,
    endTime: 'Upcoming',
    status: 'Upcoming'
  },
];

const categories = ['Tất cả', 'Đồ công nghệ', 'Trang sức & Đồng hồ', 'Nghệ thuật (NFT)', 'Đồ cổ'];

const Auctions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // Logic lọc sản phẩm dựa trên từ khóa tìm kiếm và danh mục
  const filteredAuctions = mockAuctions.filter((auction) => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || auction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khám Phá Đấu Giá</h1>
          <p className="text-gray-600">Tìm kiếm và tham gia đấu giá những vật phẩm giá trị được bảo đảm bằng Blockchain.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Bộ lọc (Sidebar bên trái trên màn lớn, nằm trên cùng ở màn nhỏ) */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  <FaSearch /> Tìm kiếm
                </h3>
                <input
                  type="text"
                  placeholder="Tên sản phẩm..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  <FaFilter /> Danh mục
                </h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === category
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Danh sách lưới sản phẩm (Bên phải) */}
          <div className="w-full lg:w-3/4">
            {filteredAuctions.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
                <p className="text-gray-500 text-lg">Không tìm thấy phiên đấu giá nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAuctions.map((auction) => (
                  <div key={auction.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100 flex flex-col">
                    <div className="h-56 overflow-hidden relative">
                      <img src={auction.image} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                      
                      {/* Badge trạng thái thời gian */}
                      <div className={`absolute top-3 right-3 text-xs font-bold px-3 py-1.5 rounded-full text-white ${
                        auction.status === 'Active' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {auction.endTime}
                      </div>
                      
                      {/* Badge Category */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                        {auction.category}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-3 text-gray-800 line-clamp-2">{auction.title}</h3>
                      
                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-500 text-sm">Giá hiện tại</span>
                          <span className="text-xl font-bold text-blue-600 flex items-center gap-1">
                            <FaEthereum /> {auction.currentBid} ETH
                          </span>
                        </div>
                        <Link
                          to={`/auction/${auction.id}`}
                          className={`block w-full text-center font-semibold py-2.5 rounded-lg transition duration-200 ${
                            auction.status === 'Active' 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
                          }`}
                        >
                          {auction.status === 'Active' ? 'Vào Đấu Giá' : 'Sắp Diễn Ra'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auctions;