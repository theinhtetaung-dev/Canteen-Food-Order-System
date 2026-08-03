import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Dashboard } from "../pages/Dashboard";
import { Profile } from "../pages/Profile";
import Menu from "../pages/Menu";
import OrderLists from "../pages/OrderLists"; // 1. Removed .tsx extension

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "orders", element: <OrderLists /> },
      { path: "menu", element: <Menu /> },
      { path: "reviews", element: <div>Reviews Page</div> },
      { path: "profile", element: <Profile /> },
    ],
  },
], { basename: '/superadmin' });