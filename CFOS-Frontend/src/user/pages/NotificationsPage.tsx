import { useOrders } from "@user/hooks/useOrders";
import { cn } from "@user/lib/utils";
import { CheckCheck, Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useOrders();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            You have {unreadCount} unread messages
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand bg-brand-light/20 rounded-lg hover:bg-brand-light/30 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "p-6 transition-colors cursor-pointer hover:bg-gray-50 flex items-start gap-4",
                  !n.read ? "bg-brand-light/10" : "bg-white"
                )}
              >
                <div className={cn(
                  "w-2 h-2 mt-2 rounded-full shrink-0",
                  !n.read ? "bg-brand" : "bg-transparent"
                )} />
                <div className="flex-1">
                  <h4 className={cn(
                    "text-sm",
                    !n.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                  )}>
                    {n.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
