import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { getSessionUser, clearSession } from "@user/api/auth.api";

// User
import { AppProviders as UserProviders } from "@user/app/providers";
import { userRoutes as UserRoutes } from "@user/app/router";

// Admin
import { router as AdminRouter } from "@admin/route/router";

// Super Admin
import { router as SuperAdminRouter } from "@superadmin/routes/router";

// Redirect / to /user
const RedirectTouser = () => <Navigate to="/user" replace />;

// Root router - / redirects to /user by default
const rootRouter = createBrowserRouter([
  {
    path: "/",
    element: <RedirectTouser />,
  },
  {
    path: "/login",
    element: <Navigate to="/user/login" replace />,
  },
  {
    path: "/register",
    element: <Navigate to="/user/register" replace />,
  },
  {
    path: "/menu",
    element: <Navigate to="/user/menu" replace />,
  },
  {
    path: "/profile",
    element: <Navigate to="/user/profile" replace />,
  },
  {
    path: "/orders",
    element: <Navigate to="/user/orders" replace />,
  },
  {
    path: "/user/*",
    element: (
      <UserProviders>
        <UserRoutes />
      </UserProviders>
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
      window.location.replace("/user");
      return null;
    }
  } else if (user) {
    const role = user.role?.toLowerCase();
    if (role === "superadmin") {
      if (!path.startsWith("/superadmin")) {
        window.location.replace("/superadmin");
        return null;
      }
    } else if (role === "admin" || role === "manager") {
      if (!path.startsWith("/admin")) {
        window.location.replace("/admin");
        return null;
      }
    } else {
      if (path === "/" || path.startsWith("/admin") || path.startsWith("/superadmin")) {
        window.location.replace("/user");
        return null;
      }
    }
  } else {
    if (path.startsWith("/admin") || path.startsWith("/superadmin")) {
      window.location.replace("/user");
      return null;
    }
  }

  // Admin panel - separate router with basename '/admin'
  if (path.startsWith("/admin")) {
    return (
      <UserProviders>
        <RouterProvider router={AdminRouter} />
      </UserProviders>
    );
  }

  // SuperAdmin panel - separate router with basename '/superadmin'
  if (path.startsWith("/superadmin")) {
    return (
      <UserProviders>
        <RouterProvider router={SuperAdminRouter} />
      </UserProviders>
    );
  }

  // Root and user
  return <RouterProvider router={rootRouter} />;
}
