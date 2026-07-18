import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // ⚠️ FIX: Bọc try-catch, không throw ra ngoài
  const updateWallet = async (walletAddress) => {
    try {
      if (!walletAddress) return { success: false, error: 'Không có địa chỉ ví' };
      
      const { data } = await api.put('/auth/wallet', { walletAddress });
      setUser(prev => ({ ...prev, walletAddress: data.walletAddress }));
      return { success: true, walletAddress: data.walletAddress };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật ví';
      console.warn('Update wallet failed:', msg);
      // Không throw → app không crash
      return { success: false, error: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateWallet, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);