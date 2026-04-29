import { createBrowserRouter, Navigate } from 'react-router';
import { LandingPage } from './features/LandingPage';
import { Login } from './features/Login';
import { ServerDashboard } from './features/server/ServerDashboard';
import { KitchenDashboard } from './features/kitchen/KitchenDashboard';
import { CashierDashboard } from './features/cashier/CashierDashboard';
import { HostDashboard } from './features/host/HostDashboard';
import { ManagerDashboard } from './features/manager/ManagerDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { ApiTestPage } from './features/test/ApiTestPage';
import { Unauthorized } from './features/Unauthorized';
import { RootLayout } from './components/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/test',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ApiTestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'server',
        element: (
          <ProtectedRoute allowedRoles={['server', 'admin']}>
            <ServerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chef',
        element: (
          <ProtectedRoute allowedRoles={['chef', 'admin']}>
            <KitchenDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cashier',
        element: (
          <ProtectedRoute allowedRoles={['cashier', 'admin']}>
            <CashierDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'host',
        element: (
          <ProtectedRoute allowedRoles={['host', 'admin']}>
            <HostDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager',
        element: (
          <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <ManagerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);