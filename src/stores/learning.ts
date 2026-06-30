import { create } from "zustand";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface LearningSummary {
  total_lessons: number;
  active_lessons: number;
  hidden_lessons: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  imageUrl: string;
  image_url: string;
  status: "active" | "hidden";
  totalLessons: number;
  total_lesson: number;
  createdAt: string;
  created_at: string;
}

export interface LearningLesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url?: string;
  duration_minutes?: number;
  sequence_order?: number;
  status: "active" | "hidden";
  created_at: string;
}

interface LearningState {
  modules: LearningModule[];
  summary: LearningSummary | null;
  selectedModule: (LearningModule & { lessons: LearningLesson[] }) | null;
  selectedLesson: LearningLesson | null;
  loading: boolean;
  selectedIds: string[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };

  fetchModules: (params?: any) => Promise<void>;
  fetchSummary: () => Promise<void>;
  createModule: (data: any) => Promise<void>;
  getModuleDetails: (id: string) => Promise<void>;
  updateModule: (id: string, data: any) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  activateModule: (id: string) => Promise<void>;
  hideModule: (id: string) => Promise<void>;

  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkDeleteModules: (ids: string[]) => Promise<void>;

  createLesson: (data: any) => Promise<void>;
  getLessonDetails: (id: string) => Promise<void>;
  updateLesson: (id: string, data: any) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;

  clearSelected: () => void;
  exportLearning: (params: { startDate: string; endDate: string }) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  modules: [],
  summary: null,
  selectedModule: null,
  selectedLesson: null,
  loading: false,
  selectedIds: [],
  pagination: { total: 0, page: 1, totalPages: 1 },

  fetchModules: async (params) => {
    set({ loading: true });
    try {
      const res = await api.get("/admin/learning/modules", { 
        params: { limit: 10, ...params } 
      });

      const { data, total, current_page, last_page } = res.data.data;
      set({
        modules: data,
        pagination: { total, page: current_page, totalPages: last_page },
      });
    } catch (error) {
      toast.error("Failed to load learning modules");
    } finally {
      set({ loading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const res = await api.get("/admin/learning/summary");
      set({ summary: res.data.data });
    } catch (error) {
      console.error("Summary fetch failed", error);
    }
  },

  createModule: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post("/admin/learning/modules", data);
      toast.success("Learning module created");
      get().fetchModules();
      get().fetchSummary();
      return res.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create module");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getModuleDetails: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/admin/learning/modules/${id}`);

      set({ selectedModule: res.data.data });
    } catch (error) {
      toast.error("Failed to load module details");
    } finally {
      set({ loading: false });
    }
  },

  updateModule: async (id, data) => {
    try {
      const res = await api.patch(`/admin/learning/modules/${id}`, data);

      set({ selectedModule: { ...get().selectedModule!, ...res.data.data } });
      toast.success("Module updated");
      get().fetchModules();
    } catch (error) {
      toast.error("Update failed");
    }
  },

  deleteModule: async (id) => {
    try {
      await api.delete(`/admin/learning/modules/${id}`);
      toast.success("Module deleted");
      set({ modules: get().modules.filter((m) => m.id !== id) });
      get().fetchSummary();
    } catch (error) {
      toast.error("Deletion failed");
    }
  },

  activateModule: async (id) => {
    try {
      const res = await api.post(`/admin/learning/modules/${id}/activate`);
      toast.success("Module activated successfully");
      
      // Update modules list
      set({
        modules: get().modules.map((m) => 
          m.id === id ? { ...m, status: "active" } : m
        )
      });

      // Update selected module if it matches
      if (get().selectedModule?.id === id) {
        set({
          selectedModule: { ...get().selectedModule!, status: "active" }
        });
      }

      get().fetchSummary();
      return res.data.data;
    } catch (error) {
      toast.error("Activation failed");
    }
  },

  hideModule: async (id) => {
    try {
      const res = await api.post(`/admin/learning/modules/${id}/hide`);
      toast.success("Module hidden successfully");

      // Update modules list
      set({
        modules: get().modules.map((m) => 
          m.id === id ? { ...m, status: "hidden" } : m
        )
      });

      // Update selected module if it matches
      if (get().selectedModule?.id === id) {
        set({
          selectedModule: { ...get().selectedModule!, status: "hidden" }
        });
      }

      get().fetchSummary();
      return res.data.data;
    } catch (error) {
      toast.error("Hide failed");
    }
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    set({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    });
  },

  selectAll: () => {
    set({ selectedIds: get().modules.map((m) => m.id) });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  bulkDeleteModules: async (ids) => {
    try {
      await api.post(`/admin/learning/modules/bulk-delete`, { ids });
      toast.success(`${ids.length} modules moved to trash`);
      get().fetchModules();
      get().fetchSummary();
      set({ selectedIds: [] });
    } catch (error) {
      toast.error("Bulk deletion failed");
    }
  },

  createLesson: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post("/admin/learning/lessons", data);
      toast.success("Lesson created");
      if (data.moduleId) get().getModuleDetails(data.moduleId);
      get().fetchSummary();
      return res.data.data;
    } catch (error) {
      toast.error("Failed to create lesson");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getLessonDetails: async (id) => {
    try {
      const res = await api.get(`/admin/learning/lessons/${id}`);
      set({ selectedLesson: res.data.data });
    } catch (error) {
      toast.error("Failed to load lesson");
    }
  },

  updateLesson: async (id, data) => {
    try {
      const res = await api.patch(`/admin/learning/lessons/${id}`, data);
      set({ selectedLesson: res.data.data });
      toast.success("Lesson updated");

      if (get().selectedModule)
        get().getModuleDetails(get().selectedModule!.id);
    } catch (error) {
      toast.error("Lesson update failed");
    }
  },

  deleteLesson: async (id) => {
    try {
      await api.delete(`/admin/learning/lessons/${id}`);
      toast.success("Lesson deleted");

      if (get().selectedModule) {
        set({
          selectedModule: {
            ...get().selectedModule!,
            lessons: get().selectedModule!.lessons.filter((l) => l.id !== id),
          },
        });
      }
      get().fetchSummary();
    } catch (error) {
      toast.error("Deletion failed");
    }
  },

  clearSelected: () => {
    set({ selectedModule: null, selectedLesson: null });
  },

  exportLearning: async (params) => {
    try {
      const res = await api.get("/admin/learning/export", { params });
      const { fileUrl, fileName } = res.data.data;
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Learning data exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  },
}));
