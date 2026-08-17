import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "@user/components/layout/NotificationBell";
import { useAuth } from "@user/hooks/useAuth";
import brandLogo from "../../../assets/logo.png";

export function GlobalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const isHomePage = location.pathname === "/user" || location.pathname === "/user/";
  const isMenuPage = location.pathname === "/user/menu" || location.pathname === "/user/menu/";

  if (!isAuthenticated) {
    return (
      <header className="flex h-20 w-full items-center justify-between bg-brand-light px-8 lg:px-12 shrink-0">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/user" className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
            <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-200">
              <img src={brandLogo} alt="MIIT Canteen" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-brand text-sm">MIIT Canteen</span>
          </Link>
        </div>

        {/* Center Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/user" className={`text-sm font-bold ${isHomePage ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Home
          </Link>
          <Link to="/user/menu" className={`text-sm font-bold ${location.pathname.includes('/menu') ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Menu
          </Link>
          <Link to="/user/reviews" className={`text-sm font-bold ${location.pathname.includes('/reviews') ? 'text-brand underline decoration-brand decoration-2 underline-offset-8' : 'text-gray-600 hover:text-brand transition-colors'}`}>
            Reviews
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">

          {!user ? (
            <div className="flex items-center gap-4">
              <Link to="/user/login" className="text-sm font-bold text-gray-600 hover:text-brand transition-colors">
                Log In
              </Link>
              <Link to="/user/register" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-brand shadow-sm hover:bg-gray-50 transition-colors">
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link to="/user/profile" className="text-sm font-bold text-gray-600 hover:text-brand transition-colors">
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
      <div className="flex w-full max-w-xl items-center" />

      <div className="flex items-center gap-5 pl-4">
        <NotificationBell className="text-gray-500 hover:text-brand" />
      </div>
    </header>
  );
}
