import { Link } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function AuctionCard({ auction }) {
  const statusColors = {
    Upcoming: 'bg-yellow-500/20 text-yellow-400',
    Active: 'bg-green-500/20 text-green-400',
    Ended: 'bg-slate-500/20 text-slate-400',
    Cancelled: 'bg-red-500/20 text-red-400'
  };

  return (
    <Link to={`/auctions/${auction._id}`} className="block">
      <div className="rounded-2xl glass p-5 hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-2xl border border-purple-500/20">
            🎨
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[auction.status]}`}>
            {auction.status === 'Active' ? '🔴' : auction.status === 'Upcoming' ? '🟡' : '⚪'} {auction.status}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
          {auction.productId?.productName || 'Không có tên'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {auction.sellerId?.userName || 'Unknown'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500">Giá hiện tại</p>
            <p className="text-xl font-bold text-purple-400">{auction.currentPrice} ETH</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Khởi điểm</p>
            <p className="font-medium text-slate-300">{auction.startingPrice} ETH</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            {auction.status === 'Active' ? (
              <CountdownTimer endTime={auction.endTime} />
            ) : (
              <span>{new Date(auction.endTime).toLocaleDateString('vi-VN')}</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm text-purple-300">
            <TrendingUp className="w-4 h-4" />
            Đặt giá →
          </span>
        </div>
      </div>
    </Link>
  );
}