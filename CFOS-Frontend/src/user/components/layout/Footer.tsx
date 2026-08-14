import { Link, useLocation } from "react-router-dom";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useAuth } from "@user/hooks/useAuth";

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Menu", path: "/menu" },
  { name: "Reviews", path: "/reviews" },
  { name: "Contact", path: "/contact" },
];

export function Footer() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isHomePage = location.pathname === "/user" || location.pathname === "/user/";

  if (isHomePage && !isAuthenticated) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Fresh, affordable meals for students. Order online and pick up at
              your campus canteen.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-500 transition-colors hover:text-brand"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                09-979111501
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                info@canteen.edu.mm
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                73rd Street, Mandalay
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-brand" />
                Mon–Fri, 7:30 AM – 4:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MIIT Canteen Management. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
