import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import api from '../services/api';
import {
  getAuctionInfo, placeBid, withdrawFunds, endAuction,
  getPendingReturn, listenToMarketplaceEvents, MARKETPLACE_ADDRESS
} from '../services/contract';
import CountdownTimer from '../components/CountdownTimer';

export default function AuctionDetail() {
  const { id } = useParams();
  const { account, signer, provider } = useWeb3();

  const [auction, setAuction] = useState(null);
  const [chainInfo, setChainInfo] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [message, setMessage] = useState(null);
  const [pendingReturn, setPendingReturn] = useState('0');
  const [bids, setBids] = useState([]);

  // Fetch từ backend
  useEffect(() => {
    fetchAuctionDetail();
  }, [id]);

  const fetchAuctionDetail = async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      setAuction(data);

      // Bọc try-catch để không crash nếu chưa có bids
      try {
        const { data: bidData } = await api.get(`/auctions/${id}/bids`);
        setBids(bidData);
      } catch (err) {
        setBids([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch từ blockchain
  const refreshChainData = useCallback(async () => {
    if (!auction?.scAuctionId || !provider) return;
    try {
      const info = await getAuctionInfo(provider, auction.scAuctionId);
      setChainInfo(info);

      if (account) {
        const pending = await getPendingReturn(provider, account);
        setPendingReturn(pending);
      }
    } catch (err) {
      console.error('Chain read error:', err);
    }
  }, [auction, provider, account]);

  useEffect(() => {
    refreshChainData();
    if (!provider || !auction?.scAuctionId) return;

    const cleanup = listenToMarketplaceEvents(provider, {
      onBid: (data) => {
        if (data.auctionId === auction.scAuctionId) refreshChainData();
      },
      onEnd: (data) => {
        if (data.auctionId === auction.scAuctionId) refreshChainData();
      }
    });

    return cleanup;
  }, [refreshChainData, provider, auction]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!signer || !account) return alert('Kết nối MetaMask!');

    // Dùng startingPrice nếu chưa có bid nào
    const minBid = chainInfo?.highestBid && parseFloat(chainInfo.highestBid) > 0
      ? parseFloat(chainInfo.highestBid) + parseFloat(chainInfo.minIncrement)
      : parseFloat(auction.startingPrice);

    if (parseFloat(bidAmount) < minBid) {
      return setMessage({ type: 'error', text: `Giá đặt phải >= ${minBid.toFixed(4)} ETH` });
    }

    setBidding(true);
    setMessage(null);

    try {
      const receipt = await placeBid(signer, auction.scAuctionId, bidAmount);

      await api.post('/auctions/bid', {
        auctionId: id,
        bidAmount: parseFloat(bidAmount),
        txHash: receipt.hash
      });

      setMessage({ type: 'success', text: 'Đặt giá thành công! 🎉' });
      setBidAmount('');
      refreshChainData();
      fetchAuctionDetail();
    } catch (err) {
      console.error(err);
      const reason = err.reason || err.shortMessage || err.message || 'Đặt giá thất bại';
      setMessage({ type: 'error', text: reason });
    } finally {
      setBidding(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer) return;
    try {
      await withdrawFunds(signer);
      setMessage({ type: 'success', text: 'Rút tiền hoàn trả thành công!' });
      refreshChainData();
    } catch (err) {
      setMessage({ type: 'error', text: err.reason || 'Rút tiền thất bại' });
    }
  };

  const handleEndAuction = async () => {
    if (!signer) return;
    try {
        await endAuction(signer, auction.scAuctionId);
        
        await api.put(`/auctions/${id}/status`, { status: 'Ended' });
        
        setMessage({ type: 'success', text: 'Đã kết thúc phiên đấu giá!' });
        refreshChainData();
        fetchAuctionDetail(); // Refresh để cập nhật status mới
    } catch (err) {
        setMessage({ type: 'error', text: err.reason || 'Không thể kết thúc' });
    }
};

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!auction) return <div className="text-center py-20">Không tìm thấy</div>;

  // Hiển thị giá đúng
  const currentPrice = chainInfo?.highestBid && parseFloat(chainInfo.highestBid) > 0
    ? chainInfo.highestBid
    : auction.startingPrice;

  const minNextBid = chainInfo?.highestBid && parseFloat(chainInfo.highestBid) > 0
    ? (parseFloat(chainInfo.highestBid) + parseFloat(chainInfo.minIncrement || auction.minimumIncrement)).toFixed(4)
    : auction.startingPrice;

  // Cho phép đặt giá khi Upcoming hoặc Active (contract sẽ tự reject nếu chưa start)
  const canBid = auction.status === 'Upcoming' || auction.status === 'Active';

  const isSeller = account && auction.sellerId?.walletAddress?.toLowerCase() === account.toLowerCase();
  const canEnd = isSeller && auction.status === 'Active';

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h1 className="text-3xl font-bold mb-2">{auction.productId?.productName}</h1>
            <p className="text-slate-400">Người bán: {auction.sellerId?.userName}</p>
            <div className="aspect-video rounded-xl bg-slate-800/50 flex items-center justify-center text-6xl my-4">🎨</div>
            <p className="text-slate-400">{auction.productId?.description}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">📜 Lịch sử đặt giá</h3>
            <div className="space-y-3">
              {bids.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Chưa có lượt đặt giá nào</p>
              ) : (
                bids.map((bid, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/50 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{bid.bidderId?.userName || 'Unknown'}</p>
                      <a href={`https://sepolia.etherscan.io/tx/${bid.txHash}`} target="_blank" className="text-xs text-purple-400 hover:underline">
                        {bid.txHash?.slice(0, 10)}...
                      </a>
                    </div>
                    <span className="font-bold text-purple-400">{bid.bidAmount} ETH</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400">Giá hiện tại</p>
              <p className="text-4xl font-bold text-purple-400">{currentPrice} ETH</p>
              <p className="text-sm text-slate-400 mt-2">
                Trạng thái: <span className={auction.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>
                  {auction.status}
                </span>
              </p>
              {auction.endTime && (
                <p className="text-sm text-slate-400 mt-1">
                  {auction.status === 'Active' ? 'Còn: ' : 'Bắt đầu sau: '}
                  <CountdownTimer
                    endTime={new Date(
                      auction.status === 'Active' ? auction.endTime : auction.startTime
                    )}
                  />
                </p>
              )}
            </div>

            {parseFloat(pendingReturn) > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-400">Bạn có {parseFloat(pendingReturn).toFixed(4)} ETH đang chờ rút</p>
                <button onClick={handleWithdraw} className="mt-2 w-full py-2 rounded-lg bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 text-sm">
                  💸 Rút tiền về ví
                </button>
              </div>
            )}

            {canBid && (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Giá đặt (tối thiểu {minNextBid} ETH)
                  </label>
                  <input type="number" step="0.001" required className="input-field"
                    value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
                </div>
                <button type="submit" disabled={bidding} className="w-full btn-primary">
                  {bidding ? 'Đang xử lý...' : '💰 Đặt giá'}
                </button>
                {auction.status === 'Upcoming' && (
                  <p className="text-xs text-center text-yellow-400">
                    ⚠️ Phiên đấu giá chưa bắt đầu. Contract sẽ tự động từ chối nếu đặt quá sớm.
                  </p>
                )}
              </form>
            )}

            {canEnd && (
              <button onClick={handleEndAuction} className="w-full mt-4 py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30">
                🔒 Kết thúc đấu giá & Chuyển tiền
              </button>
            )}

            <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Auction ID</span>
                <span className="font-mono">#{auction.scAuctionId !== undefined ? auction.scAuctionId : '?'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giá khởi điểm</span>
                <span>{auction.startingPrice} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bước giá</span>
                <span>{auction.minimumIncrement} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contract</span>
                <a href={`https://sepolia.etherscan.io/address/${MARKETPLACE_ADDRESS}`} target="_blank" className="text-purple-400 font-mono hover:underline">
                  {MARKETPLACE_ADDRESS.slice(0, 6)}...
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}