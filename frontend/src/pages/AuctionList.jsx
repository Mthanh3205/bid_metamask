import { useEffect, useState } from 'react';
import AuctionCard from '../components/AuctionCard';
import api from '../services/api';
import { Search, Filter } from 'lucide-react';

export default function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [filters, setFilters] = useState({ status: 'Active', category: '', search: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const { data } = await api.get(`/auctions?${params}`);
      setAuctions(data.auctions || []);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">🔨 Danh sách đấu giá</h1>
      
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
          <option value="Active">Đang diễn ra</option>
          <option value="Upcoming">Sắp diễn ra</option>
          <option value="Ended">Đã kết thúc</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {auctions.map(auction => (
          <AuctionCard key={auction._id} auction={auction} />
        ))}
      </div>
      
      {auctions.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy đấu giá nào</p>
        </div>
      )}
    </div>
  );
}