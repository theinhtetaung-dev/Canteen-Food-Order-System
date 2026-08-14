import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu as MenuIcon, Package, Star, Phone, Utensils, User, UtensilsCrossed, X } from "lucide-react";
import brandLogo from "../../../assets/logo.png";
import { NotificationBell } from "@user/components/layout/NotificationBell";
import { useAuth } from "@user/hooks/useAuth";
import { cn } from "@user/lib/utils";

const navLinks = [
  { name: "Menu", path: "/user/menu", icon: Utensils },
  { name: "Reviews", path: "/user/reviews", icon: Star },
  { name: "Contact", path: "/user/contact", icon: Phone },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/user" && (location.pathname === "/user" || location.pathname === "/user/")) return true;
    if (path !== "/user" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isHomePage = location.pathname === "/user" || location.pathname === "/user/";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Top Nav */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#e2e8d5] bg-[#f4f7ec] shadow-sm md:hidden">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/user" className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2">
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-brand/20 bg-white">
                  <img src={brandLogo} alt="Logo" className="h-full w-full object-cover" />
                </div>
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
                        ? "bg-[#e2f0c2] text-[#284208]"
                        : "text-gray-600 hover:bg-[#ebf3d8]",
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
                    to="/user/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive("/user/orders")
                        ? "bg-[#e2f0c2] text-[#284208]"
                        : "text-gray-600 hover:bg-[#ebf3d8]",
                    )}
                  >
                    <Package className="h-5 w-5" />
                    My Orders
                  </Link>
                  <Link
                    to="/user/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive("/user/profile")
                        ? "bg-[#e2f0c2] text-[#284208]"
                        : "text-gray-600 hover:bg-[#ebf3d8]",
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
                      navigate("/user");
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-[#ebf3d8]"
                  >
                    <LogOut className="h-5 w-5" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/user/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-[#ebf3d8]"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/user/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-[#ebf3d8]"
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
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto border-r border-[#e2e8d5] bg-[#f4f7ec] md:flex">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 shrink-0">
            <Link to="/user" className="flex items-center justify-center gap-2">
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e2f0c2] text-[#284208] shadow-sm px-4 py-3">
                <div className="h-7 w-7 rounded-full overflow-hidden shrink-0 shadow-sm border border-white">
                  <img src={brandLogo} alt="Logo" className="h-full w-full object-cover" />
                </div>
                <span className="text-base font-bold text-[#1c2e0a]">
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
                      ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                      : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900",
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
                  to="/user/orders"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive("/user/orders")
                      ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                      : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900",
                  )}
                >
                  <Package className="h-4 w-4" />
                  Orders
                </Link>
                <Link
                  to="/user/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive("/user/profile")
                      ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                      : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900",
                  )}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
