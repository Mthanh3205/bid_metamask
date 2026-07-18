import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import api from '../services/api';
import { ethers } from 'ethers';
import { Loader2, Upload } from 'lucide-react';

// ⚠️ Bạn cần thay bằng ABI và Bytecode thực tế của contract
const AUCTION_FACTORY_ABI = [
  "function createAuction(uint256 _startingPrice, uint256 _minimumIncrement, uint256 _duration) returns (address)"
];

export default function CreateAuction() {
  const { user } = useAuth();
  const { signer } = useWeb3();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    productName: '',
    categoryId: '',
    condition: 'New',
    description: '',
    estimatedPrice: '',
    startingPrice: '',
    minimumIncrement: '',
    startTime: '',
    endTime: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) {
      alert('Vui lòng kết nối MetaMask trước!');
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo Product trên backend
      const { data: product } = await api.post('/products', {
        productName: form.productName,
        categoryId: form.categoryId,
        condition: form.condition,
        description: form.description,
        estimatedPrice: parseFloat(form.estimatedPrice)
      });

      // 2. Deploy Smart Contract (hoặc gọi Factory)
      // Giả sử bạn có một AuctionFactory contract
      // const factory = new ethers.Contract(FACTORY_ADDRESS, AUCTION_FACTORY_ABI, signer);
      // const tx = await factory.createAuction(
      //   ethers.parseEther(form.startingPrice),
      //   ethers.parseEther(form.minimumIncrement),
      //   Math.floor((new Date(form.endTime) - new Date(form.startTime)) / 1000)
      // );
      // const receipt = await tx.wait();
      // const contractAddress = receipt.logs[0].address; // hoặc parse event

      // Tạm thời giả lập contract address (thay bằng logic deploy thực tế)
      const contractAddress = "0x..."; 

      // 3. Tạo Auction trên backend
      const { data: auction } = await api.post('/auctions', {
        productId: product._id,
        contractAddress,
        startingPrice: parseFloat(form.startingPrice),
        minimumIncrement: parseFloat(form.minimumIncrement),
        startTime: form.startTime,
        endTime: form.endTime
      });

      // 4. Upload ảnh (nếu có)
      // TODO: Upload ảnh lên IPFS hoặc server

      navigate(`/auctions/${auction._id}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-purple-300">➕ Tạo phiên đấu giá mới</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Tên sản phẩm *</label>
            <input
              type="text"
              required
              className="input-field"
              value={form.productName}
              onChange={e => setForm(prev => ({ ...prev, productName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Danh mục *</label>
              <select
                required
                className="input-field"
                value={form.categoryId}
                onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
              >
                <option value="">Chọn danh mục</option>
                <option value="art">Nghệ thuật</option>
                <option value="realestate">Bất động sản</option>
                <option value="collectible">Collectibles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tình trạng *</label>
              <select
                className="input-field"
                value={form.condition}
                onChange={e => setForm(prev => ({ ...prev, condition: e.target.value }))}
              >
                <option value="New">Mới</option>
                <option value="Used">Đã qua sử dụng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Giá khởi điểm (ETH) *</label>
              <input
                type="number"
                step="0.001"
                required
                className="input-field"
                value={form.startingPrice}
                onChange={e => setForm(prev => ({ ...prev, startingPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Bước giá tối thiểu (ETH) *</label>
              <input
                type="number"
                step="0.001"
                required
                className="input-field"
                value={form.minimumIncrement}
                onChange={e => setForm(prev => ({ ...prev, minimumIncrement: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={form.startTime}
                onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={form.endTime}
                onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Hình ảnh</label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition-all cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-slate-400">Kéo thả hoặc click để tải ảnh lên</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 Tạo đấu giá'}
          </button>
        </form>
      </div>
    </div>
  );
}