import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { getAuctionInfo, placeBid, listenToEvents } from '../services/contract';
import CountdownTimer from '../components/CountdownTimer';
import { ethers } from 'ethers';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AuctionDetail() {
  const { id } = useParams();
  const { account, signer, provider, connectWallet } = useWeb3();
  const { isAuthenticated } = useAuth();
  
  const [auction, setAuction] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [message, setMessage] = useState(null);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    fetchAuctionDetail();
  }, [id]);

  useEffect(() => {
    if (auction?.contractAddress && provider) {
      fetchContractInfo();
      const cleanup = listenToEvents(auction.contractAddress, provider, {
        onBid: (bid) => {
          setBids(prev => [bid, ...prev]);
          fetchContractInfo(); // Refresh highest bid
        }
      });
      return cleanup;
    }
  }, [auction, provider]);

  const fetchAuctionDetail = async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      setAuction(data);
      // Fetch bid history từ backend
      const { data: bidData } = await api.get(`/auctions/${id}/bids`);
      setBids(bidData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractInfo = async () => {
    if (!auction?.contractAddress || !provider) return;
    try {
      const info = await getAuctionInfo(auction.contractAddress, provider);
      setContractInfo(info);
    } catch (err) {
      console.error('Lỗi đọc contract:', err);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!account) {
      await connectWallet();
      return;
    }
    
    if (!signer) {
      setMessage({ type: 'error', text: 'Vui lòng kết nối MetaMask' });
      return;
    }

    const minBid = contractInfo 
      ? parseFloat(contractInfo.highestBid) + parseFloat(contractInfo.minimumIncrement)
      : auction.startingPrice;

    if (parseFloat(bidAmount) < minBid) {
      setMessage({ type: 'error', text: `Giá đặt phải >= ${minBid} ETH` });
      return;
    }

    setBidding(true);
    setMessage(null);

    try {
      // 1. Gọi smart contract
      const receipt = await placeBid(auction.contractAddress, signer, bidAmount);
      
      // 2. Lưu vào backend
      await api.post('/auctions/bid', {
        auctionId: id,
        bidAmount: parseFloat(bidAmount),
        txHash: receipt.hash
      });

      setMessage({ type: 'success', text: 'Đặt giá thành công! 🎉' });
      setBidAmount('');
      fetchContractInfo();
      fetchAuctionDetail();
    } catch (err) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.reason || err.message || 'Đặt giá thất bại' 
      });
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!auction) return <div className="text-center py-20">Không tìm thấy đấu giá</div>;

  const currentPrice = contractInfo?.highestBid || auction.currentPrice;
  const minNextBid = contractInfo 
    ? parseFloat(contractInfo.highestBid) + parseFloat(contractInfo.minimumIncrement)
    : auction.startingPrice;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{auction.productId?.productName}</h1>
                <p className="text-slate-400">Người bán: {auction.sellerId?.userName}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                auction.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20'
              }`}>
                {auction.status}
              </span>
            </div>
            
            <div className="aspect-video rounded-xl bg-slate-800/50 flex items-center justify-center text-6xl mb-4">
              🎨
            </div>
            
            <div className="prose prose-invert">
              <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
              <p className="text-slate-400">{auction.productId?.description || 'Không có mô tả'}</p>
            </div>
          </div>

          {/* Bid History */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">📜 Lịch sử đặt giá</h3>
            <div className="space-y-3">
              {bids.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Chưa có lượt đặt giá nào</p>
              ) : (
                bids.map((bid, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-sm">
                        {bid.bidderId?.userName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{bid.bidderId?.userName || 'Unknown'}</p>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${bid.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:underline"
                        >
                          {bid.txHash?.slice(0, 10)}...{bid.txHash?.slice(-8)}
                        </a>
                      </div>
                    </div>
                    <span className="font-bold text-purple-400">{bid.bidAmount} ETH</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Bid Panel */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400 mb-1">Giá hiện tại</p>
              <p className="text-4xl font-bold text-purple-400">{currentPrice} ETH</p>
              {auction.status === 'Active' && (
                <p className="text-sm text-slate-400 mt-2">
                  Kết thúc sau: <CountdownTimer endTime={auction.endTime} />
                </p>
              )}
            </div>

            {auction.status === 'Active' && (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                    message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Giá đặt (tối thiểu {minNextBid} ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="input-field pr-16"
                      placeholder="0.0"
                      required
                    />
                    <span className="absolute right-4 top-3.5 text-slate-500 font-medium">ETH</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bidding}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {bidding ? <Loader2 className="w-5 h-5 animate-spin" /> : '💰 Đặt giá ngay'}
                </button>

                {!account && (
                  <p className="text-xs text-center text-slate-500">
                    Bạn cần kết nối MetaMask để đặt giá
                  </p>
                )}
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Giá khởi điểm</span>
                <span>{auction.startingPrice} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bước giá tối thiểu</span>
                <span>{auction.minimumIncrement} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contract</span>
                <a 
                  href={`https://sepolia.etherscan.io/address/${auction.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline font-mono"
                >
                  {auction.contractAddress?.slice(0, 6)}...{auction.contractAddress?.slice(-4)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}