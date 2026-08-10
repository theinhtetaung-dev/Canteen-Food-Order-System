import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { NotificationBell } from "@furniture/components/layout/NotificationBell";
import { useDebounce } from "@furniture/hooks/useDebounce";
import { useAuth } from "@furniture/hooks/useAuth";

export function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Only trigger this automatic debounced search for the authenticated layout search bar.
    if (!isAuthenticated) return;

    if (debouncedSearch.trim()) {
      const newSearch = `?search=${encodeURIComponent(debouncedSearch.trim())}`;
      if (location.pathname !== "/furniture/menu" || location.search !== newSearch) {
        navigate(`/furniture/menu${newSearch}`, { replace: true });
      }
    } else if (location.pathname === "/furniture/menu" && location.search) {
      // Only navigate to clear the search params if there ARE search params to clear
      navigate(`/furniture/menu`, { replace: true });
    }
  }, [debouncedSearch, navigate, location.pathname, location.search, isAuthenticated]);

  const isHomePage = location.pathname === "/furniture" || location.pathname === "/furniture/";
  const isMenuPage = location.pathname === "/furniture/menu" || location.pathname === "/furniture/menu/";

  if (!isAuthenticated) {
    return (
      <header className="flex h-20 w-full items-center justify-between bg-brand-light px-8 lg:px-12 shrink-0">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/furniture" className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            <UtensilsCrossed className="h-5 w-5 text-brand" />
            <span className="font-bold text-brand">MIIT Canteen</span>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/furniture" className={`text-sm font-bold ${isHomePage ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Home
          </Link>
          <Link to="/furniture/menu" className={`text-sm font-bold ${location.pathname.includes('/menu') ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Menu
          </Link>
          <Link to="/furniture/reviews" className={`text-sm font-bold ${location.pathname.includes('/reviews') ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Reviews
          </Link>
          <Link to="/furniture/contact" className={`text-sm font-bold ${location.pathname.includes('/contact') ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">

          <Link to="/furniture/cart" className="text-gray-600 hover:text-brand transition-colors">
            <ShoppingCart className="h-5 w-5" />
          </Link>

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/furniture/login" className="text-sm font-bold text-gray-600 hover:text-brand transition-colors">
                Log In
              </Link>
              <Link to="/furniture/register" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-brand shadow-sm hover:bg-gray-50 transition-colors">
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link to="/furniture/profile" className="text-sm font-bold text-gray-600 hover:text-brand transition-colors">
                Profile
              </Link>
            </div>
          )}
        </div>
      </header>
    );
  }

  // Authenticated users logic
  if (isHomePage) return null;

  return (
    <header className="sticky top-0 z-30 hidden w-full items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:flex shrink-0">
      <div className="flex w-full max-w-xl items-center">
        {isMenuPage && (
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 pl-11 text-sm text-gray-700 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 pl-4">
        <NotificationBell className="text-gray-500 hover:text-brand" />
      </div>
    </header>
  );
}
