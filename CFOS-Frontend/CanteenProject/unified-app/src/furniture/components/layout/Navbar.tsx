import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Package, Search, ShoppingCart, User, UtensilsCrossed, X } from "lucide-react";
import { NotificationBell } from "@furniture/components/layout/NotificationBell";
import { UserMenu } from "@furniture/components/layout/UserMenu";
import { useAuth } from "@furniture/hooks/useAuth";
import { useCart } from "@furniture/hooks/useCart";
import { useDebounce } from "@furniture/hooks/useDebounce";
import { cn } from "@furniture/lib/utils";

const navLinks = [
  { name: "Home", path: "/furniture" },
  { name: "Menu", path: "/furniture/menu" },
  { name: "Reviews", path: "/furniture/reviews" },
  { name: "Contact", path: "/furniture/contact" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (!debouncedSearch.trim() || location.pathname !== "/furniture/menu") return;
    const params = new URLSearchParams(location.search);
    const current = params.get("search") ?? "";
    if (current !== debouncedSearch.trim()) {
      navigate(`/furniture/menu?search=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  }, [debouncedSearch, location.pathname, location.search, navigate]);

  const isActive = (path: string) => {
    if (path === "/furniture" && (location.pathname === "/furniture" || location.pathname === "/furniture/")) return true;
    if (path !== "/furniture" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/furniture/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/30 bg-brand/40 shadow-md backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link to="/furniture" className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md md:px-4">
              <UtensilsCrossed className="h-5 w-5 text-brand" />
              <span className="text-sm font-bold text-brand-dark md:text-base">
                MIT Canteen
              </span>
            </div>
          </Link>

          <div className="hidden items-center space-x-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-semibold transition-all duration-300",
                  isActive(link.path)
                    ? "text-brand-dark underline decoration-2 underline-offset-4"
                    : "text-white hover:text-brand-light",
                )}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/furniture/orders"
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-semibold transition-all duration-300",
                  isActive("/furniture/orders")
                    ? "text-brand-dark underline decoration-2 underline-offset-4"
                    : "text-white hover:text-brand-light",
                )}
              >
                Orders
              </Link>
            )}
          </div>

          <div className="hidden items-center space-x-3 md:flex">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 rounded-full bg-white/90 px-4 py-2 text-sm text-gray-700 transition-all duration-300 placeholder-gray-400 focus:w-56 focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            <NotificationBell />

            <button
              type="button"
              onClick={openCart}
              className="relative text-white transition-colors hover:text-brand-light"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <UserMenu />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-white"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              className="p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="animate-fadeIn pb-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-semibold",
                  isActive(link.path)
                    ? "bg-white/20 text-brand-dark"
                    : "text-white hover:bg-white/10",
                )}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/furniture/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
                <Link
                  to="/furniture/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate("/furniture");
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/furniture/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/furniture/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-white hover:bg-white/10"
                >
                  Register
                </Link>
              </>
            )}

            <div className="mt-3 px-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-white/90 px-4 py-2 text-sm text-gray-700 focus:outline-none"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
