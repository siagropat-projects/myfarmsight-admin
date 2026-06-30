import { useEffect, useRef } from "react";
import { 
  X, 
  CheckCheck, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  BellOff
} from "lucide-react";
import { useNotificationStore, type Notification } from "../../stores/notifications";

interface NotificationsProps {
  onClose: () => void;
}

export default function Notifications({ onClose }: NotificationsProps) {
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    deleteAllNotifications,
    pagination 
  } = useNotificationStore();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success": return <CheckCircle2 className="text-green-500" size={18} />;
      case "warning": return <AlertTriangle className="text-yellow-500" size={18} />;
      case "error": return <AlertCircle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div 
      ref={modalRef}
      className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-50 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => markAllAsRead()}
            className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
          <button 
            onClick={() => deleteAllNotifications()}
            className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[450px] overflow-y-auto custom-scrollbar bg-gray-50/30">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand" size={24} />
            <p className="text-xs text-gray-500 font-medium">Fetching notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <BellOff size={28} className="text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-500 mt-1">No new notifications at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`p-4 flex gap-4 cursor-pointer transition-all hover:bg-white relative group ${!n.is_read ? "bg-brand/[0.02]" : "bg-transparent"}`}
              >
                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />
                )}
                <div className="shrink-0 mt-1">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-sm font-bold truncate ${!n.is_read ? "text-gray-900" : "text-gray-500"}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                      {getTimeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${!n.is_read ? "text-gray-600" : "text-gray-400"}`}>
                    {n.message}
                  </p>
                  {n.user && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase">
                        {n.user.full_name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">{n.user.full_name}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Load More */}
      {pagination.last_page > pagination.current_page && (
        <div className="p-3 bg-white border-t border-gray-50 text-center">
          <button 
            onClick={() => fetchNotifications(pagination.current_page + 1)}
            disabled={isLoading}
            className="text-[11px] font-bold text-brand hover:underline disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "View older notifications"}
          </button>
        </div>
      )}
    </div>
  );
}
