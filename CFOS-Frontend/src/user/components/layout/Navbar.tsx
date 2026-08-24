import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu as MenuIcon, Package, Star, Utensils, User, UtensilsCrossed, X, Bell, Globe } from "lucide-react";
import brandLogo from "../../../assets/logo.png";
import { NotificationBell } from "@user/components/layout/NotificationBell";
import { useAuth } from "@user/hooks/useAuth";
import { cn } from "@user/lib/utils";
import { fetchAllUsers } from "@user/api/user.api";

const navLinks = [
  { name: "Menu", path: "/user/menu", icon: Utensils },
  { name: "Reviews", path: "/user/reviews", icon: Star },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "MM">(
    (localStorage.getItem("campus_bites_lang") as "EN" | "MM") || "EN"
  );

  const toggleLanguage = () => {
    const newLang = lang === "EN" ? "MM" : "EN";
    setLang(newLang);
    localStorage.setItem("campus_bites_lang", newLang);
  };

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("campus_bites_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || "",
          role: parsed.role || "",
          avatar: parsed.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      fullName: "",
      role: "",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    };
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem("campus_bites_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile({
            fullName: parsed.fullName || "",
            role: parsed.role || "",
            avatar: parsed.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
          });
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener("storage", handleProfileUpdate);
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleProfileUpdate);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const [dbName, setDbName] = useState("");
  const [dbRole, setDbRole] = useState("");

  useEffect(() => {
    async function loadDbUser() {
      if (!user) return;
      try {
        const allUsers = await fetchAllUsers();
        const found = allUsers.find(u => u.userName.toLowerCase() === user.rollNumber.toLowerCase());
        if (found) {
          setDbName(found.fullName || found.userName);
          setDbRole(found.roleName.toLowerCase() === 'superadmin' || found.roleName.toLowerCase() === 'admin'
            ? 'Super Admin' 
            : (found.roleName.toLowerCase() === 'manager' ? 'Canteen Manager' : 'Student'));
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadDbUser();
  }, [user]);

  const displayName = dbName || user?.name || user?.rollNumber || profile.fullName || "Student";
  const displayRole = dbRole || (user?.role === 'superadmin' ? 'Super Admin' : (user?.role === 'admin' || user?.role === 'manager' ? 'Canteen Manager' : 'Student'));

  function getInitials(name?: string, fallback = "U"): string {
    if (!name) return fallback;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const initials = getInitials(displayName, user?.rollNumber?.slice(0, 2).toUpperCase() ?? "U");

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
                    to="/user/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium",
                      isActive("/user/notifications")
                        ? "bg-[#e2f0c2] text-[#284208]"
                        : "text-gray-600 hover:bg-[#ebf3d8]",
                    )}
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
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
                    onClick={toggleLanguage}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-[#ebf3d8]"
                  >
                    <Globe className="h-5 w-5" />
                    Language: {lang === "EN" ? "English" : "Myanmar"}
                  </button>
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
        <div className="flex h-full flex-col px-4 py-6 justify-between">
          <div>
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

            <div className="flex flex-col space-y-2">
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
                    to="/user/notifications"
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                      isActive("/user/notifications")
                        ? "bg-[#e2f0c2] text-[#284208] shadow-sm"
                        : "text-gray-600 hover:bg-[#ebf3d8] hover:text-gray-900",
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Unified Bottom Profile Card Widget */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-[#dce5c7] flex flex-col gap-3 w-full shrink-0">
              <NavLink
                to="/user/profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl p-2 transition-colors ${
                    isActive ? "bg-[#e2f0c2]" : "hover:bg-[#ebf3d8]/60"
                  }`
                }
              >
                <div className="w-10 h-10 rounded-full bg-[#E1EEB4] flex items-center justify-center text-[#3B5B11] border-2 border-[#88C425] shrink-0 text-xs font-black select-none shadow-sm">
                  {initials}
                </div>
                <div className="leading-tight overflow-hidden flex-1 text-left">
                  <h4 className="text-xs font-black text-gray-900 truncate">
                    {displayName}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 truncate">
                    {displayRole}
                  </p>
                </div>
              </NavLink>
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold transition-all cursor-pointer border border-gray-200"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Language: {lang === "EN" ? "English" : "Myanmar"}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/user");
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition-all cursor-pointer border border-red-100/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
