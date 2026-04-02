import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
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
import { useRestaurant } from '../store/RestaurantContext';
import { authService } from '../services/auth.service';

// Session timeout: 30 minutes of inactivity
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 2 * 60 * 1000; // Warn 2 minutes before timeout

export const SessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useRestaurant();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    // Only run session management if user is logged in
    if (!currentUser) return;

    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      setLastActivity(Date.now());
      
      // Clear existing timers
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      // Set warning timer (2 min before logout)
      warningTimer = setTimeout(() => {
        setShowWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set auto-logout timer
      logoutTimer = setTimeout(() => {
        handleAutoLogout();
      }, INACTIVITY_TIMEOUT);
    };

    const handleAutoLogout = () => {
      authService.logout();
      setCurrentUser(null);
      setShowWarning(false);
      navigate('/login');
      toast.error('Session expired', {
        description: 'You have been logged out due to inactivity',
      });
    };

    const handleActivity = () => {
      if (showWarning) {
        setShowWarning(false);
      }
      resetTimers();
    };

    // Activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timers
    resetTimers();

    // Cleanup
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, showWarning, navigate, setCurrentUser]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    setLastActivity(Date.now());
    toast.success('Session extended', {
      description: 'Your session has been extended',
    });
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowWarning(false);
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return (
    <>
      {children}
      
      {/* Session Timeout Warning Dialog - Only show if user is logged in */}
      {currentUser && (
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
              <AlertDialogDescription>
                Your session will expire in 2 minutes due to inactivity.
                Would you like to stay logged in?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleLogout}>
                Logout Now
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleStayLoggedIn}>
                Stay Logged In
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};