import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import api from '../services/api';
import { Search, Filter, Plus } from 'lucide-react';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', category: '', search: '' });  // ← 'all' thay vì 'Active'
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [filters.status]); // ← Chỉ re-fetch khi đổi status

  const fetchAuctions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      const { data } = await api.get(`/auctions?${params}`);
      
      // ⚠️ FIX: Backend trả array trực tiếp, không phải { auctions: [...] }
      setAuctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAuctions([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter ở frontend cho search
  const filteredAuctions = auctions.filter(a => {
    const matchSearch = !filters.search || 
      (a.productId?.productName || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || 
      (a.productId?.categoryId?.toString() === filters.category);
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🔨 Danh sách đấu giá</h1>
        <Link to="/create" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all text-sm">
          <Plus className="w-4 h-4" /> Tạo đấu giá
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm đấu giá..."
            className="input-field pl-12"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.categoryName}</option>
          ))}
        </select>
        <select
          className="input-field"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Active">🔴 Đang diễn ra</option>
          <option value="Upcoming">🟡 Sắp diễn ra</option>
          <option value="Ended">⚪ Đã kết thúc</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAuctions.map(auction => (
          <AuctionCard key={auction._id} auction={auction} />
        ))}
      </div>
      
      {filteredAuctions.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">Không tìm thấy đấu giá nào</p>
          <Link to="/create" className="text-purple-400 hover:underline text-sm">
            Tạo phiên đấu giá đầu tiên →
          </Link>
        </div>
      )}
    </div>
  );
}