import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Dashboard } from '../pages/Dashboard';
import { KitchenAdmins } from '../pages/KitchenAdmins';
import { Users } from '../pages/Users';
import { AdminProfile } from '../pages/AdminProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'kitchen-admin',
        element: <KitchenAdmins />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'profile',
        element: <AdminProfile />,
      },
    ],
  },
], { basename: '/admin' });