import { create } from 'zustand';
import { toast } from 'sonner';
import { api } from "../utils/api";

export type SupportStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface SupportMessage {
    id: string;
    ticket_id: string;
    content: string;
    sender: 'user' | 'admin';
    admin_id?: string;
    created_at: string;
}

export interface SupportTicket {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    subject: string;
    description: string;
    status: SupportStatus;
    priority: 'low' | 'medium' | 'high';
    messages: SupportMessage[];
    created_at: string;
    updated_at: string;
}

interface SupportState {
    tickets: {
        data: SupportTicket[];
        currentPage: number;
        totalPages: number;
        totalRecords: number;
    };
    selectedTicket: SupportTicket | null;
    loading: boolean;
    error: string | null;

    fetchTickets: (page?: number, search?: string) => Promise<void>;
    fetchTicketById: (id: string) => Promise<void>;
    updateTicketStatus: (id: string, status: SupportStatus) => Promise<void>;
    sendResponse: (ticketId: string, message: string) => Promise<void>;
    setSelectedTicket: (ticket: SupportTicket | null) => void;
}

export const useSupportStore = create<SupportState>((set, get) => ({
    tickets: {
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    },
    selectedTicket: null,
    loading: false,
    error: null,

    fetchTickets: async (page = 1, search = '') => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/admin/support', {
                params: { page, search, limit: 10 }
            });

            const { data, currentPage, totalPages, totalRecords } = response.data.data;

            set({
                tickets: {
                    data,
                    currentPage,
                    totalPages,
                    totalRecords
                },
                loading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch support tickets';
            set({ error: message, loading: false });
            toast.error(message);
        }
    },

    fetchTicketById: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/admin/support/${id}`);

            set({
                selectedTicket: response.data.data,
                loading: false
            });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch ticket details';
            set({ error: message, loading: false });
            toast.error(message);
        }
    },

    updateTicketStatus: async (id: string, status: SupportStatus) => {
        try {
            const response = await api.patch(`/admin/support/${id}`, { status });
            const updatedTicket = response.data.data;

            set(state => ({
                tickets: {
                    ...state.tickets,
                    data: state.tickets.data.map(t => t.id === id ? { ...t, ...updatedTicket } : t)
                }
            }));

            if (get().selectedTicket?.id === id) {
                set({ selectedTicket: { ...get().selectedTicket!, ...updatedTicket } });
            }

            toast.success(`Status updated to ${status}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    },

    sendResponse: async (ticketId: string, message: string) => {
        set({ loading: true });
        try {
            const response = await api.post(`/admin/support/${ticketId}/messages`, {
                content: message
            });

            const newMessage = response.data.data;

            set(state => {
                const updatedTicketsData = state.tickets.data.map(t =>
                    t.id === ticketId
                        ? { ...t, messages: t.messages ? [...t.messages, newMessage] : [newMessage], updated_at: new Date().toISOString() }
                        : t
                );

                const updatedSelected = state.selectedTicket?.id === ticketId
                    ? { 
                        ...state.selectedTicket, 
                        messages: state.selectedTicket.messages ? [...state.selectedTicket.messages, newMessage] : [newMessage],
                        updated_at: new Date().toISOString()
                      }
                    : state.selectedTicket;

                return {
                    tickets: {
                        ...state.tickets,
                        data: updatedTicketsData
                    },
                    selectedTicket: updatedSelected,
                    loading: false
                };
            });

            toast.success('Response sent');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send response';
            set({ loading: false });
            toast.error(errorMessage);
        }
    },

    setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
}));