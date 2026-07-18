import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import api from '../services/api';
import { createAuctionOnChain } from '../services/contract';
import { Loader2 } from 'lucide-react';

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
    durationHours: '1',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Lỗi lấy danh mục:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer) return alert('Vui lòng kết nối MetaMask!');
    if (!form.categoryId) return alert('Vui lòng chọn danh mục!');
    if (!form.productName.trim()) return alert('Vui lòng nhập tên sản phẩm!');

    setLoading(true);
    try {
      // BƯỚC 1: Tạo Product
      setStep(1);
      const { data: productRes } = await api.post('/products', {
        productName: form.productName,
        categoryId: form.categoryId,
        condition: form.condition,
        description: form.description,
        estimatedPrice: parseFloat(form.estimatedPrice) || 0
      });
      
      const product = productRes.product;
      if (!product?._id) throw new Error('Tạo sản phẩm thất bại!');

      // BƯỚC 2: Tạo Auction trên Blockchain
      setStep(2);
      const now = new Date();
      const safeStartTime = new Date(now.getTime() + 2 * 60 * 1000); // +2 phút buffer
      const endTime = new Date(safeStartTime.getTime() + parseFloat(form.durationHours) * 3600 * 1000);

      const { auctionId, txHash } = await createAuctionOnChain(signer, {
        productId: product._id.toString(),
        startingPrice: form.startingPrice,
        minIncrement: form.minimumIncrement,
        startTime: safeStartTime,
        endTime: endTime
      });

      if (!auctionId) throw new Error('Không lấy được auctionId từ blockchain');

      // BƯỚC 3: Lưu vào Backend
      setStep(3);
      const { data: auctionRes } = await api.post('/auctions', {
        productId: product._id,
        scAuctionId: auctionId,
        contractAddress: '0x2E9Ea2062A5E92057371e1A592385f30cF64D126',
        startingPrice: parseFloat(form.startingPrice),
        minimumIncrement: parseFloat(form.minimumIncrement),
        startTime: safeStartTime.toISOString(),
        endTime: endTime.toISOString()
      });
      
      const auction = auctionRes.auction;
      navigate(`/auctions/${auction._id}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.reason || err.message || 'Không xác định'));
    } finally {
      setLoading(false);
      setStep(1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-2 text-purple-300">
          {step === 2 ? '🚀 Đang tạo trên Blockchain...' : step === 3 ? '💾 Đang lưu dữ liệu...' : '➕ Tạo phiên đấu giá mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Tên sản phẩm *</label>
            <input type="text" required className="input-field"
              value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Danh mục *</label>
              <select required className="input-field" value={form.categoryId} 
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">Chọn danh mục...</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.categoryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tình trạng</label>
              <select className="input-field" value={form.condition} 
                onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                <option value="New">Mới</option>
                <option value="Used">Đã qua sử dụng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả</label>
            <textarea rows={3} className="input-field resize-none"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Giá khởi điểm (ETH) *</label>
              <input type="number" step="0.001" required className="input-field"
                value={form.startingPrice} onChange={e => setForm(p => ({ ...p, startingPrice: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Bước giá (ETH) *</label>
              <input type="number" step="0.001" required className="input-field"
                value={form.minimumIncrement} onChange={e => setForm(p => ({ ...p, minimumIncrement: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Thời lượng (giờ) *</label>
              <input type="number" min="0.1" step="0.1" required className="input-field"
                value={form.durationHours} onChange={e => setForm(p => ({ ...p, durationHours: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Giá ước tính (ETH)</label>
            <input type="number" step="0.001" className="input-field"
              value={form.estimatedPrice} onChange={e => setForm(p => ({ ...p, estimatedPrice: e.target.value }))} />
          </div>

          <button type="submit" disabled={loading || !signer} 
            className="w-full btn-primary flex items-center justify-center gap-2 text-lg">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🚀 Tạo đấu giá'}
          </button>
          {!signer && <p className="text-xs text-center text-red-400">⚠️ Kết nối MetaMask trước</p>}
        </form>
      </div>
    </div>
  );
}