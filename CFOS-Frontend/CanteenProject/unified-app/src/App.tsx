import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { getSessionUser, clearSession } from "@furniture/api/auth.api";

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
    path: "/login",
    element: <Navigate to="/furniture/login" replace />,
  },
  {
    path: "/register",
    element: <Navigate to="/furniture/register" replace />,
  },
  {
    path: "/menu",
    element: <Navigate to="/furniture/menu" replace />,
  },
  {
    path: "/profile",
    element: <Navigate to="/furniture/profile" replace />,
  },
  {
    path: "/orders",
    element: <Navigate to="/furniture/orders" replace />,
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

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decodedPayload = JSON.parse(jsonPayload);
    const exp = decodedPayload.exp;
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}

export function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem("canteen_token");
  const user = getSessionUser();
  const expired = isTokenExpired(token);

  if (expired) {
    if (token || user) {
      clearSession();
    }
    if (path.startsWith("/admin") || path.startsWith("/superadmin")) {
      window.location.replace("/furniture");
      return null;
    }
  } else if (user) {
    const role = user.role?.toLowerCase();
    if (role === "admin" || role === "superadmin") {
      if (!path.startsWith("/admin")) {
        window.location.replace("/admin");
        return null;
      }
    } else if (role === "manager") {
      if (!path.startsWith("/superadmin")) {
        window.location.replace("/superadmin");
        return null;
      }
    } else {
      if (path === "/" || path.startsWith("/admin") || path.startsWith("/superadmin")) {
        window.location.replace("/furniture");
        return null;
      }
    }
  } else {
    if (path.startsWith("/admin") || path.startsWith("/superadmin")) {
      window.location.replace("/furniture");
      return null;
    }
  }

  // Admin panel - separate router with basename '/admin'
  if (path.startsWith("/admin")) {
    return (
      <FurnitureProviders>
        <RouterProvider router={AdminRouter} />
      </FurnitureProviders>
    );
  }

  // SuperAdmin panel - separate router with basename '/superadmin'
  if (path.startsWith("/superadmin")) {
    return (
      <FurnitureProviders>
        <RouterProvider router={SuperAdminRouter} />
      </FurnitureProviders>
    );
  }

  // Root and Furniture
  return <RouterProvider router={rootRouter} />;
}
