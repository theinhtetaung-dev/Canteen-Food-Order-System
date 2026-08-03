import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";

// Furniture
import { AppProviders as FurnitureProviders } from "@furniture/app/providers";
import { FurnitureRoutes } from "@furniture/app/router";

// Admin
import { router as AdminRouter } from "@admin/routes/router";

// Super Admin
import { router as SuperAdminRouter } from "@superadmin/route/router";

// Redirect / to /furniture
const RedirectToFurniture = () => <Navigate to="/furniture" replace />;

// Root router - / redirects to /furniture by default
const rootRouter = createBrowserRouter([
  {
    path: "/",
    element: <RedirectToFurniture />,
  },
  {
    path: "/furniture/*",
    element: (
      <FurnitureProviders>
        <FurnitureRoutes />
      </FurnitureProviders>
    ),
  },
]);

export function App() {
  const path = window.location.pathname;

  // Admin panel - separate router with basename '/admin'
  if (path.startsWith("/admin")) {
    return <RouterProvider router={AdminRouter} />;
  }

  // SuperAdmin panel - separate router with basename '/superadmin'
  if (path.startsWith("/superadmin")) {
    return <RouterProvider router={SuperAdminRouter} />;
  }

  // Root and Furniture
  return <RouterProvider router={rootRouter} />;
}
