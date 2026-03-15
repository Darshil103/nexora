import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.userType)) {
    const store = useAuthStore.getState();
    return <Navigate to={store.getDashboardPath()} replace />;
  }
  return children;
};

export default ProtectedRoute;
