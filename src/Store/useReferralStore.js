import { create } from "zustand";
import axios from "../Api/axios";

const useReferralStore = create((set, get) => ({
  // Referral State
  referralData: null,
  codeValidity: null,
  loading: false,
  error: null,

  // Helper function for consistent error handling
  handleError: (error, defaultMessage) => {
    const errorData = error.response?.data;
    return (
      errorData?.message || errorData?.error || error.message || defaultMessage
    );
  },

  // Get user's referral data
  fetchMyReferrals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/user/referral/my-referrals");
      set({
        referralData: response.data.data || response.data,
        loading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = get().handleError(
        error,
        "Failed to fetch referral data"
      );
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Check referral code validity
  checkReferralCode: async (code) => {
    if (!code || typeof code !== "string") {
      set({ error: "Invalid referral code format", loading: false });
      return { valid: false };
    }

    set({ loading: true, error: null, codeValidity: null });

    try {
      const response = await axios.get(
        `/api/referral/check/${encodeURIComponent(code)}`
      );
      const validityData = response.data.data || response.data;

      set({
        codeValidity: validityData,
        loading: false,
      });

      return validityData;
    } catch (error) {
      let errorMessage;

      if (error.response?.status === 404) {
        errorMessage = "Referral code not found";
        set({ codeValidity: { valid: false }, loading: false });
        return { valid: false };
      } else {
        errorMessage = get().handleError(
          error,
          "Failed to check referral code"
        );
        set({ error: errorMessage, loading: false });
        throw error;
      }
    }
  },

  // Clear referral state
  clearReferralData: () =>
    set({
      referralData: null,
      codeValidity: null,
      error: null,
      loading: false,
    }),

  // Reset entire store
  reset: () =>
    set({
      referralData: null,
      codeValidity: null,
      loading: false,
      error: null,
    }),
}));

export default useReferralStore;
