import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Dashboard } from "../pages/Dashboard";
import { Profile } from "../pages/Profile";
import Menu from "../pages/Menu";
import OrderLists from "../pages/OrderLists";
import Categories from "../pages/Categories";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <OrderLists /> },
      { path: "menu", element: <Menu /> },
      { path: "categories", element: <Categories /> },
      { path: "reviews", element: <div className="p-6 font-sans"><h1 className="text-xl font-bold text-gray-900">Reviews Management</h1><p className="text-xs text-gray-500 mt-2">Manage customer feedback and ratings.</p></div> },
      { path: "profile", element: <Profile /> },
      { path: "branches", element: <div className="p-6 font-sans"><h1 className="text-xl font-bold text-gray-900">Canteen Branches</h1><p className="text-xs text-gray-500 mt-2">Configure physical canteen branch listings.</p></div> },
      { path: "reports", element: <div className="p-6 font-sans"><h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1><p className="text-xs text-gray-500 mt-2">View system audit logs and business statistics.</p></div> },
    ],
  },
], { basename: '/superadmin' });