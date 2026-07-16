import React, { useState } from 'react';
import { FaBoxOpen, FaGavel, FaPlus, FaList, FaEdit, FaTrash, FaCheckCircle, FaClock } from 'react-icons/fa';

// Mock data: Danh sách sản phẩm của người bán
const mockProducts = [
  { id: 'p1', title: 'Đồng hồ Hublot Classic Fusion', category: 'Trang sức & Đồng hồ', condition: 'Used', status: 'Approved', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=200' },
  { id: 'p2', title: 'Tranh sơn dầu phong cảnh', category: 'Đồ cổ', condition: 'New', status: 'Pending', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=200' },
];

// Mock data: Danh sách phiên đấu giá do người bán tạo
const mockSellerAuctions = [
  { id: 'a1', productId: 'p1', title: 'Đồng hồ Hublot Classic Fusion', startPrice: 1.5, currentPrice: 2.8, status: 'Active', endTime: '2026-10-20' },
];

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // products, auctions, create-product
  
  // State cho form tạo sản phẩm mới
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Đồ công nghệ',
    condition: 'New',
    description: '',
    image: '',
  });

  const handleCreateProduct = (e) => {
    e.preventDefault();
    // Logic gọi API backend để lưu sản phẩm vào MongoDB [cite: 89-93, 117]
    alert(`Đã gửi yêu cầu đăng sản phẩm: ${productForm.title}. Vui lòng chờ Admin duyệt!`);
    setActiveTab('products');
  };

  const handleCreateAuction = (productId) => {
    // Logic gọi Smart Contract ethers.js ( createAuction() ) [cite: 98, 133]
    alert(`Chuyển sang giao diện thiết lập giá và tạo Smart Contract cho sản phẩm ID: ${productId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Điều hướng cho Seller */}
        <div className="w-full md:w-1/4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 text-center bg-gray-900 text-white">
            <h2 className="text-xl font-bold mb-1">Khu Vực Người Bán</h2>
            <p className="text-sm text-gray-400 font-mono">0x123...ABCD</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'products' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaBoxOpen /> Quản lý Sản phẩm
            </button>
            <button 
              onClick={() => setActiveTab('create-product')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'create-product' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaPlus /> Đăng Sản phẩm mới
            </button>
            <button 
              onClick={() => setActiveTab('auctions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'auctions' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaGavel /> Quản lý Đấu giá
            </button>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="w-full md:w-3/4">
          
          {/* TAB: QUẢN LÝ SẢN PHẨM */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaList className="text-blue-500" /> Danh sách sản phẩm của bạn
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {mockProducts.map((product) => (
                  <div key={product.id} className="flex flex-col sm:flex-row bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                    <img src={product.image} alt={product.title} className="w-full sm:w-32 h-32 object-cover" />
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-500">{product.category} • Tình trạng: {product.condition}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {product.status === 'Approved' ? (
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium"><FaCheckCircle /> Đã duyệt</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium"><FaClock /> Đang chờ duyệt</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 justify-center bg-white border-l border-gray-200">
                      {product.status === 'Approved' && (
                        <button 
                          onClick={() => handleCreateAuction(product.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition shadow flex items-center justify-center gap-2"
                        >
                          <FaGavel /> Tạo Đấu Giá
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg transition"><FaEdit className="mx-auto" /></button>
                        <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg transition"><FaTrash className="mx-auto" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TẠO SẢN PHẨM MỚI */}
          {activeTab === 'create-product' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Đăng sản phẩm mới</h2>
              <form onSubmit={handleCreateProduct} className="space-y-5 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={productForm.title} onChange={(e) => setProductForm({...productForm, title: e.target.value})} placeholder="VD: MacBook Pro 2023" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}>
                      <option>Đồ công nghệ</option>
                      <option>Trang sức & Đồng hồ</option>
                      <option>Nghệ thuật (NFT)</option>
                      <option>Đồ cổ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng *</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={productForm.condition} onChange={(e) => setProductForm({...productForm, condition: e.target.value})}>
                      <option value="New">Mới (New)</option>
                      <option value="Used">Đã sử dụng (Used)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Mô tả tình trạng, nguồn gốc, thông số kỹ thuật..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh (hoặc Upload IPFS/Cloudinary)</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={productForm.image} onChange={(e) => setProductForm({...productForm, image: e.target.value})} placeholder="https://..." />
                </div>

                <button type="submit" className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow transition mt-4 w-full md:w-auto">
                  Gửi yêu cầu duyệt sản phẩm
                </button>
              </form>
            </div>
          )}

          {/* TAB: QUẢN LÝ ĐẤU GIÁ */}
          {activeTab === 'auctions' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Các phiên đấu giá của bạn</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm tracking-wider">
                      <th className="py-4 px-4 font-medium rounded-tl-lg">Sản phẩm</th>
                      <th className="py-4 px-4 font-medium">Giá khởi điểm</th>
                      <th className="py-4 px-4 font-medium">Giá hiện tại</th>
                      <th className="py-4 px-4 font-medium">Kết thúc</th>
                      <th className="py-4 px-4 font-medium rounded-tr-lg">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockSellerAuctions.map((auction) => (
                      <tr key={auction.id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-4 font-medium text-gray-800">{auction.title}</td>
                        <td className="py-4 px-4 text-gray-600">{auction.startPrice} ETH</td>
                        <td className="py-4 px-4 text-blue-600 font-bold">{auction.currentPrice} ETH</td>
                        <td className="py-4 px-4 text-gray-500 text-sm">{auction.endTime}</td>
                        <td className="py-4 px-4">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">Đang diễn ra</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;