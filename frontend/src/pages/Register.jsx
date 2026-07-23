import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Wallet, User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { BrowserProvider } from 'ethers';

export default function Register() {
  const [form, setForm] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    walletAddress: '',
    role: 'Buyer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }

    setWalletLoading(true);
    try {
      // Ép hiện popup chọn tài khoản MetaMask
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('Không có tài khoản nào được chọn');
      }

      const selectedAccount = accounts[0];
      setForm((prev) => ({ ...prev, walletAddress: selectedAccount }));
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        alert('Bạn đã từ chối chọn ví.');
      } else {
        alert('Không thể kết nối ví: ' + (err.message || 'Lỗi không xác định'));
      }
    } finally {
      setWalletLoading(false);
    }
  };

  const disconnectWallet = () => {
    setForm((prev) => ({ ...prev, walletAddress: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...dataToSubmit } = form;

      // Nếu có walletAddress thì gửi lên, không thì xóa field
      if (!dataToSubmit.walletAddress || dataToSubmit.walletAddress.trim() === '') {
        delete dataToSubmit.walletAddress;
      }

      await register(dataToSubmit);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Đăng ký thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg glass rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Tạo tài khoản mới</h2>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Họ và tên"
              required
              className="input-field pl-10"
              value={form.userName}
              onChange={(e) => setForm((prev) => ({ ...prev, userName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                required
                className="input-field pl-10"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Số điện thoại"
                className="input-field pl-10"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Địa chỉ giao hàng"
              className="input-field pl-10"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          {/* ===== PHẦN VÍ ĐÃ SỬA ===== */}
          <div className="space-y-2">
            {!form.walletAddress ? (
              // Chưa kết nối ví → Hiện nút kết nối
              <button
                type="button"
                onClick={connectWallet}
                disabled={walletLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 hover:border-purple-500 hover:bg-slate-700 transition-all text-slate-300"
              >
                {walletLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <Wallet className="w-4 h-4 text-purple-400" />
                )}
                <span className="text-sm">
                  {walletLoading ? 'Đang kết nối...' : '🔗 Kết nối MetaMask'}
                </span>
              </button>
            ) : (
              // Đã kết nối ví → Hiện địa chỉ + nút hủy
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-green-500/30">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-mono text-slate-300 flex-grow">
                  {form.walletAddress.slice(0, 10)}...{form.walletAddress.slice(-8)}
                </span>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Hủy kết nối
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 text-center">
              {!form.walletAddress
                ? 'Nhấn để mở MetaMask và chọn tài khoản'
                : 'Ví đã được kết nối và sẽ lưu khi đăng ký'}
            </p>
          </div>
          {/* ========================== */}

          <div className="grid grid-cols-2 gap-4">
            {/* ... password fields ... */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                required
                className="input-field pl-10"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Xác nhận MK"
                required
                className="input-field pl-10"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          {/* ... role selection ... */}
          <div className="flex gap-6 py-2">
            <label className="flex items-center text-slate-300 text-sm cursor-pointer">
              <input
                type="radio"
                name="role"
                value="Buyer"
                checked={form.role === 'Buyer'}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                className="mr-2"
              />
              Người mua
            </label>
            <label className="flex items-center text-slate-300 text-sm cursor-pointer">
              <input
                type="radio"
                name="role"
                value="Seller"
                checked={form.role === 'Seller'}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                className="mr-2"
              />
              Người bán
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center mt-4 text-slate-400 text-sm">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
