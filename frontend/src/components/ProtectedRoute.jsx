import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireSeller = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="flex justify-center p-20">Đang tải...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (requireSeller && user?.role !== 'Seller' && user?.role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return children;
}