import { create } from "zustand";
import axios from "../Api/axios";
import { toast } from "react-hot-toast";

// useNotificationStore.js
const useNotificationStore = create((set, get) => ({
  notifications: [], // Ensure this is initialized as an array
  loading: false,
  error: null,
  sendNotification: async (notificationData) => {
    try {
      const { socket } = get();
      if (socket) {
        socket.emit('sendNotification', notificationData);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  fetchNotifications: async (accessToken) => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`api/user/notifications`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Ensure we always set an array, even if response.data is null/undefined
      set({ notifications:response.data.data || response.data, loading: false });
      return response.data;

    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false, error, notifications: [] }); // Reset to empty array on error
      throw error;
    }
  },
}));

export default useNotificationStore;
