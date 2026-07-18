import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Gavel, Wallet, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { account, balance, connectWallet, disconnectWallet, isCorrectNetwork } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gavel className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AuctionChain
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/auctions" className="text-slate-300 hover:text-white transition-colors">Đấu giá</Link>
          
          {isAuthenticated && user?.role === 'Seller' && (
            <Link to="/create" className="text-slate-300 hover:text-white transition-colors">Tạo đấu giá</Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.userName}</span>
              </Link>
              
              {account ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-mono text-slate-300">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <span className="text-xs text-purple-400">{parseFloat(balance).toFixed(4)} ETH</span>
                  {!isCorrectNetwork && (
                    <span className="text-xs text-red-400">⚠️ Sai mạng</span>
                  )}
                </div>
              ) : (
                <button onClick={connectWallet} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-all">
                  <Wallet className="w-4 h-4" />
                  Kết nối ví
                </button>
              )}

              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors">Đăng nhập</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}