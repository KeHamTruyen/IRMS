import { Navigate } from 'react-router';
import { useRestaurant } from '../store/RestaurantContext';
import { authService } from '../services/auth.service';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser } = useRestaurant();

  // Check if user is authenticated (has JWT token)
  const isAuthenticated = authService.isAuthenticated();

  // Not logged in - redirect to login page
  if (!currentUser && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role - redirect to their correct dashboard
  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized - render the page
  return <>{children}</>;
};
