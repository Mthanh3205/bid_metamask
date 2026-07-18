import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const { account, balance } = useWeb3();
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);

  useEffect(() => {
    if (user) {
      fetchMyActivity();
    }
  }, [user]);

  const fetchMyActivity = async () => {
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        api.get('/auctions/my-auctions'),
        api.get('/auctions/my-bids')
      ]);
      setMyAuctions(auctionsRes.data);
      setMyBids(bidsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-4">
              {user?.userName?.[0] || '👤'}
            </div>
            <h3 className="text-xl font-bold">{user?.userName}</h3>
            <p className="text-slate-400 text-sm mb-4 capitalize">{user?.role}</p>
            <div className="w-full space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ví</span>
                <span className="font-mono text-purple-300">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Chưa kết nối'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số dư</span>
                <span className="font-bold text-green-400">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 text-purple-300">📜 Lịch sử đặt giá</h3>
            <div className="space-y-3">
              {myBids.map(bid => (
                <div key={bid._id} className="p-4 rounded-xl bg-slate-900/50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{bid.auctionId?.productId?.productName}</p>
                    <p className="text-sm text-slate-500">{new Date(bid.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <span className="font-bold text-purple-400">{bid.bidAmount} ETH</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}