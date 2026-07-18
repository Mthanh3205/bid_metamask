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
    role: 'Buyer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Vui lòng cài đặt MetaMask!');
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setForm(prev => ({ ...prev, walletAddress: accounts[0] }));
    } catch (err) {
      alert('Không thể kết nối ví.');
    }
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
      
      // ⚠️ FIX: Không gửi walletAddress nếu rỗng
      if (!dataToSubmit.walletAddress || dataToSubmit.walletAddress.trim() === '') {
        delete dataToSubmit.walletAddress;
      }

      await register(dataToSubmit);
      navigate('/'); // Đăng ký thành công → vào trang chủ
    } catch (err) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message 
        || err.response?.data?.error 
        || 'Đăng ký thất bại';
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
              onChange={e => setForm(prev => ({ ...prev, userName: e.target.value }))}
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
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Số điện thoại"
                className="input-field pl-10"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
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
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Wallet className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Địa chỉ ví MetaMask (tùy chọn)"
                className="input-field pl-10 font-mono text-xs"
                value={form.walletAddress}
                onChange={e => setForm(prev => ({ ...prev, walletAddress: e.target.value }))}
              />
            </div>
            <button
              type="button"
              onClick={connectWallet}
              className="bg-slate-700 hover:bg-slate-600 px-4 rounded-xl text-xs text-white whitespace-nowrap"
            >
              🔗 Kết nối
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                required
                className="input-field pl-10"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
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
                onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-6 py-2">
            <label className="flex items-center text-slate-300 text-sm cursor-pointer">
              <input
                type="radio"
                name="role"
                value="Buyer"
                checked={form.role === 'Buyer'}
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
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
                onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
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