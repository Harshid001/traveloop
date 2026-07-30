import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-sm font-semibold text-textMuted shadow-soft">
          <Loader2 size={18} className="animate-spin text-primary" />
          Restoring your Traveloop session
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
