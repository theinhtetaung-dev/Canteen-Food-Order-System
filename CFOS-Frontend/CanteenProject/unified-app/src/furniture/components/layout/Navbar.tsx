import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu as MenuIcon, Package, Star, Phone, Utensils, User, UtensilsCrossed, X } from "lucide-react";
import { NotificationBell } from "@furniture/components/layout/NotificationBell";
import { UserMenu } from "@furniture/components/layout/UserMenu";
import { useAuth } from "@furniture/hooks/useAuth";
import { cn } from "@furniture/lib/utils";

const navLinks = [
  { name: "Menu", path: "/furniture/menu", icon: Utensils },
  { name: "Reviews", path: "/furniture/reviews", icon: Star },
  { name: "Contact", path: "/furniture/contact", icon: Phone },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/furniture" && (location.pathname === "/furniture" || location.pathname === "/furniture/")) return true;
    if (path !== "/furniture" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isHomePage = location.pathname === "/furniture" || location.pathname === "/furniture/";

  if (isHomePage) {
    return null;
  }

  return (
    <>
      {/* Mobile Top Nav */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm md:hidden">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/furniture" className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2">
                <UtensilsCrossed className="h-5 w-5 text-brand" />
                <span className="text-sm font-bold text-gray-900">
                  MIIT Canteen
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <NotificationBell className="text-gray-600" />
              <button
                type="button"
                className="p-2 text-gray-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="animate-fadeIn pb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive(link.path)
                        ? "bg-brand/10 text-brand"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/furniture/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive("/furniture/orders")
                        ? "bg-brand/10 text-brand"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <Package className="h-5 w-5" />
                    My Orders
                  </Link>
                  <Link
                    to="/furniture/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive("/furniture/profile")
                        ? "bg-brand/10 text-brand"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate("/furniture");
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/furniture/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/furniture/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white md:flex">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 shrink-0">
            <Link to="/furniture" className="flex items-center justify-center gap-2">
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand/5 px-4 py-3">
                <UtensilsCrossed className="h-5 w-5 text-brand" />
                <span className="text-base font-bold text-gray-900">
                  MIIT Canteen
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 flex-col space-y-2">
            <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Navigation</span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive(link.path)
                      ? "bg-brand/10 text-brand"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-gray-100" />
                <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 block">Account</span>
                <Link
                  to="/furniture/orders"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive("/furniture/orders")
                      ? "bg-brand/10 text-brand"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  to="/furniture/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive("/furniture/profile")
                      ? "bg-brand/10 text-brand"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="mt-auto flex items-center justify-end border-t border-gray-100 pt-6 shrink-0">
            <UserMenu />
          </div>
        </div>
      </aside>
    </>
  );
}
