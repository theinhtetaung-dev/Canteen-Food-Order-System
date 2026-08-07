import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { NotificationBell } from "@furniture/components/layout/NotificationBell";
import { useDebounce } from "@furniture/hooks/useDebounce";

export function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Only navigate if we're on the menu page, or if the user is typing something (then force to menu)
    if (!debouncedSearch.trim() && location.pathname !== "/furniture/menu") return;
    
    if (debouncedSearch.trim()) {
      navigate(`/furniture/menu?search=${encodeURIComponent(debouncedSearch.trim())}`);
    } else if (location.pathname === "/furniture/menu") {
      navigate(`/furniture/menu`);
    }
  }, [debouncedSearch, navigate, location.pathname]);

  const isHomePage = location.pathname === "/furniture" || location.pathname === "/furniture/";
  const isMenuPage = location.pathname === "/furniture/menu" || location.pathname === "/furniture/menu/";

  if (isHomePage) return null;

  return (
    <header className="sticky top-0 z-30 hidden w-full items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] md:flex">
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
