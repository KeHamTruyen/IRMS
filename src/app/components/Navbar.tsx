import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRestaurant } from '../store/RestaurantContext';
import { toast } from 'sonner';
import { Bell, User, LogOut, ChefHat, Menu } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { authService } from '../services/auth.service';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser } = useRestaurant();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // Clear auth data
    authService.logout();
    setCurrentUser(null);
    
    // Navigate to login
    navigate('/login');
    
    // Show success message
    toast.success('Logged out successfully', {
      description: 'See you next time!',
    });
  };

  if (!currentUser) return null;

  const getRoleColor = (role: string) => {
    const colors = {
      server: 'bg-blue-500',
      chef: 'bg-orange-500',
      cashier: 'bg-green-500',
      host: 'bg-purple-500',
      manager: 'bg-red-500',
      admin: 'bg-gray-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-6">
            <Link to={`/${currentUser.role}`} className="flex items-center gap-2">
              <ChefHat className="size-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">IRMS</span>
            </Link>
            
            <div className="flex items-center gap-4 text-sm">
              <Link to={`/${currentUser.role}`} className="text-gray-600 hover:text-gray-900 font-medium">
                My Dashboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="size-5 text-gray-600" />
              <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className={`size-8 rounded-full ${getRoleColor(currentUser.role)} flex items-center justify-center text-white text-sm font-bold`}>
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 hover:bg-red-50 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
