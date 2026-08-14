import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@user/components/auth/ProtectedRoute";
import RootLayout from "@user/layouts/RootLayout";
import HomePage from "@user/pages/HomePage";
import MenuPage from "@user/pages/MenuPage";
import ReviewsPage from "@user/pages/ReviewsPage";
import ContactPage from "@user/pages/ContactPage";
import NotFoundPage from "@user/pages/NotFoundPage";
import ProfilePage from "@user/pages/ProfilePage";
import OrdersPage from "@user/pages/OrdersPage";
import LoginPage from "@user/pages/auth/LoginPage";
import RegisterPage from "@user/pages/auth/RegisterPage";

export function userRoutes() {
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
