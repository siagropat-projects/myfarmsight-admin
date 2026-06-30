import { useState, useEffect, useCallback } from "react";
import { Bell, Clock } from "lucide-react";
import Notifications from "./Notifications";
import { useNotificationStore } from "../../stores/notifications";
import { useAuth } from "../../stores/auth";

export default function Headbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const { user } = useAuth();

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll for new notifications every minute
        const interval = setInterval(() => fetchNotifications(), 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleCloseNotifications = useCallback(() => {
        setShowNotifications(false);
    }, []);

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div></div>
            {/* Right Actions */}
            <div className="flex items-center gap-6">

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    <Clock size={18} className="text-gray-400" />
                    <span className="text-sm font-medium">Logged in: {new Date(user?.logged_in || '').toLocaleString() || 'N/A'}</span>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 transition-all rounded-full ${showNotifications ? 'bg-gray-100 text-brand' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <Notifications onClose={handleCloseNotifications} />
                    )}
                </div>
            </div>
        </header>
    );
}