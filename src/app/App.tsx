import { RouterProvider } from 'react-router';
import { RestaurantProvider } from './store/RestaurantContext';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <RestaurantProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </RestaurantProvider>
  );
}