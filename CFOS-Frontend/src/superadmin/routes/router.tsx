import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Dashboard } from '../pages/Dashboard';
import { KitchenAdmins } from '../pages/KitchenAdmins';
import { Users } from '../pages/Users';
import { AdminProfile } from '../pages/AdminProfile';
import { Branches } from '../pages/Branches';
import { Permissions } from '../pages/Permissions';
import { UserReports } from '../pages/UserReports';

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
        path: 'branches',
        element: <Branches />,
      },
      {
        path: 'permissions',
        element: <Permissions />,
      },
      {
        path: 'user-reports',
        element: <UserReports />,
      },
      {
        path: 'profile',
        element: <AdminProfile />,
      },
    ],
  },
], { basename: '/superadmin' });
