import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@furniture/components/auth/ProtectedRoute";
import RootLayout from "@furniture/layouts/RootLayout";
import HomePage from "@furniture/pages/HomePage";
import MenuPage from "@furniture/pages/MenuPage";
import ReviewsPage from "@furniture/pages/ReviewsPage";
import ContactPage from "@furniture/pages/ContactPage";
import NotFoundPage from "@furniture/pages/NotFoundPage";
import ProfilePage from "@furniture/pages/ProfilePage";
import OrdersPage from "@furniture/pages/OrdersPage";
import LoginPage from "@furniture/pages/auth/LoginPage";
import RegisterPage from "@furniture/pages/auth/RegisterPage";

export function FurnitureRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
