import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useRestaurant } from '../store/RestaurantContext';
import { Button } from '../components/ui/button';
import { authService } from '../services/auth.service';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useRestaurant();

  const handleGoToDashboard = () => {
    if (currentUser) {
      navigate(`/${currentUser.role}`);
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <ShieldAlert className="size-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600">
            You don't have permission to access this page
          </p>
        </div>

        {currentUser && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">You are logged in as:</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handleGoToDashboard}
            className="w-full"
            size="lg"
          >
            {currentUser ? `Go to ${currentUser.role} Dashboard` : 'Go to Login'}
          </Button>
          
          {currentUser && (
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Logout and Switch Role
            </Button>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Each role has access to specific features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Server: Orders & Tables</li>
            <li>• Chef: Kitchen Display</li>
            <li>• Cashier: Billing & Payments</li>
            <li>• Host: Reservations</li>
            <li>• Manager: Analytics</li>
            <li>• Admin: System Settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};