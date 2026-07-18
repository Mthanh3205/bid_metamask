import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import api from '../services/api';
import { TrendingUp, Shield, Zap, Globe } from 'lucide-react';

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, volume: 0 });

  useEffect(() => {
    fetchAuctions();
  }, []);

  // Trong Home.jsx
  const fetchAuctions = async () => {
    try {
      const { data } = await api.get('/auctions?status=all');
      setAuctions(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-800/40 border border-purple-500/20 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h1 className="text-4xl font-bold mb-4">Đấu giá phi tập trung trên Blockchain</h1>
          <p className="text-slate-400 mb-6 max-w-lg">
            Kết nối ví MetaMask, tham gia đấu giá minh bạch với smart contract Solidity.
            Mọi giao dịch đều được ghi nhận trên blockchain.
          </p>
          <div className="flex gap-3">
            <Link to="/auctions" className="btn-primary">Khám phá</Link>
            <Link to="/create" className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-all font-medium">
              Tạo đấu giá
            </Link>
          </div>
        </div>

        <div className="rounded-2xl glass p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">📊 Thống kê</h3>
          <div className="space-y-4">
            {[
              { label: 'Tổng đấu giá', value: stats.total, color: 'text-white' },
              { label: 'Đang diễn ra', value: stats.active, color: 'text-green-400' },
              { label: 'Khối lượng ETH', value: stats.volume, color: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50">
                <span className="text-slate-400">{stat.label}</span>
                <span className={`font-bold text-xl ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, title: 'Minh bạch', desc: 'Mọi giao dịch trên blockchain' },
          { icon: Zap, title: 'Tức thì', desc: 'Xác nhận bid real-time' },
          { icon: Globe, title: 'Toàn cầu', desc: 'Không giới hạn địa lý' },
          { icon: TrendingUp, title: 'An toàn', desc: 'Smart contract tự động' }
        ].map((f, i) => (
          <div key={i} className="glass p-5 rounded-xl text-center">
            <f.icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
            <h4 className="font-semibold mb-1">{f.title}</h4>
            <p className="text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Featured Auctions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔥 Đấu giá nổi bật</h2>
          <Link to="/auctions" className="text-purple-400 hover:text-purple-300">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      </div>
    </div>
  );
}