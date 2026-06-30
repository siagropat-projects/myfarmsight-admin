import { create } from "zustand";
import { api } from "../utils/api";

export interface Notification {
  id: string;
  user_id: string;
  user?: {
    full_name: string;
    email: string;
  };
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  is_read: boolean;
  related_entity_id?: string;
  related_entity_type?: string;
  created_at: string;
}

interface Pagination {
  total: number;
  current_page: number;
  last_page: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: Pagination;
  isLoading: boolean;

  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pagination: {
    total: 0,
    current_page: 1,
    last_page: 1,
  },
  isLoading: false,

  fetchNotifications: async (page = 1) => {
    set({ isLoading: true });
    try {
      const res = await api.get("/admin/notifications", { params: { page, limit: 10 } });
      const { data, total, current_page, last_page, unread_count } = res.data.data;
      
      set({
        notifications: data,
        unreadCount: unread_count,
        pagination: { total, current_page, last_page },
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      const updatedNotifications = get().notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      set({
        notifications: updatedNotifications,
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      const updatedNotifications = get().notifications.map((n) => ({ ...n, is_read: true }));
      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      const updatedNotifications = get().notifications.filter((n) => n.id !== id);
      const wasUnread = get().notifications.find(n => n.id === id)?.is_read === false;
      set({
        notifications: updatedNotifications,
        unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  deleteAllNotifications: async () => {
    try {
      await api.delete("/admin/notifications/all");
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  },
}));
