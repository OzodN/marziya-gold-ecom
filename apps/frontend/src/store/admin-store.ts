import { create } from "zustand";
import type { AdminLoginRequestDto, AdminUserDto } from "@/types/api";
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  getNewInquiriesCount,
  playInquiryNotificationChime,
} from "@/lib/admin-api";

interface AdminState {
  user: AdminUserDto | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  newInquiriesCount: number;
  lastPolledAt: string | null;
  isPolling: boolean;

  // Actions
  checkAuth: () => Promise<AdminUserDto | null>;
  login: (credentials: AdminLoginRequestDto) => Promise<AdminUserDto>;
  logout: () => Promise<void>;
  pollNewCount: () => Promise<number>;
  setNewInquiriesCount: (count: number) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  newInquiriesCount: 0,
  lastPolledAt: null,
  isPolling: false,

  checkAuth: async () => {
    set({ isLoadingAuth: true });
    try {
      const user = await getAdminMe();
      if (user) {
        set({ user, isAuthenticated: true, isLoadingAuth: false });
        // Trigger initial count check
        get().pollNewCount();
        return user;
      }
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      return null;
    } catch {
      set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      return null;
    }
  },

  login: async (credentials: AdminLoginRequestDto) => {
    const user = await adminLogin(credentials);
    set({ user, isAuthenticated: true, isLoadingAuth: false });
    // After login, poll inquiries count
    get().pollNewCount();
    return user;
  },

  logout: async () => {
    try {
      await adminLogout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoadingAuth: false,
        newInquiriesCount: 0,
        lastPolledAt: null,
      });
    }
  },

  pollNewCount: async () => {
    const prevCount = get().newInquiriesCount;
    set({ isPolling: true });
    try {
      const { newCount } = await getNewInquiriesCount();
      const updatedTime = new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Play chime if there are genuinely new inquiries detected since last check
      if (prevCount > 0 && newCount > prevCount) {
        playInquiryNotificationChime();
      }

      set({
        newInquiriesCount: newCount,
        lastPolledAt: updatedTime,
        isPolling: false,
      });
      return newCount;
    } catch {
      set({ isPolling: false });
      return prevCount;
    }
  },

  setNewInquiriesCount: (count: number) => {
    set({ newInquiriesCount: count });
  },
}));
