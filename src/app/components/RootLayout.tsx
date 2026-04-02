import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useRestaurant } from '../store/RestaurantContext';
import { Navbar } from './Navbar';
import { SessionManager } from './SessionManager';

export const RootLayout: React.FC = () => {
  const { currentUser } = useRestaurant();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <SessionManager>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Outlet />
      </div>
    </SessionManager>
  );
};