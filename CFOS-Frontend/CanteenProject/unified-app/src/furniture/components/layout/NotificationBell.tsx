import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@furniture/hooks/useAuth";
import { useOrders } from "@furniture/hooks/useOrders";
import { cn } from "@furniture/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useOrders();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("relative transition-colors", className || "text-white hover:text-brand-light")}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-brand hover:text-brand-dark"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  No notifications yet
                </p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "w-full border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                      !n.read && "bg-brand-light/20",
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
