import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../Api/axios";
import toast from "react-hot-toast";

const ERROR_TOAST_ID = "global-error-toast"; // <-- Add this line

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      otpData: null,
      tempUser: null,
      rehydrated: false,

      handleError: (error, defaultMessage) => {
        let errorMessage = defaultMessage;
        if (error.response) {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            defaultMessage;
        } else if (error.request) {
          errorMessage = "No response from server";
        }
        return errorMessage;
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          throw new Error("NO_REFRESH_TOKEN");
        }

        try {
          const response = await axios.post(
            "/api/auth/refresh",
            {
              refreshToken,
            },
            {
              _noRetry: true,
            }
          );

          set({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken || refreshToken,
          });

          return response.data.accessToken;
        } catch (error) {
          get().logout();
          throw error;
        }
      },
      // twoFactorAuthentication: async (pin) => {
      //   try {
      //     const response = await axios.post('/api/auth/verify/twoFactor', {
      //       email: otpData.email,
      //       pin
      //     });

      //     const responseData = response.data?.data || response.data;
      //     const userData = {
      //       _id: responseData.id,
      //       firstName: responseData.firstName,
      //       lastName: responseData.lastName,
      //       email: responseData.email,
      //       userType: responseData.userType,
      //       phoneNumber: responseData.phone,
      //       image: responseData.image,
      //       mydata: responseData
      //     };

      //     set({
      //       user: userData,
      //       accessToken: responseData.accessToken,
      //       refreshToken: responseData.refreshToken,
      //       loading: false,
      //       otpData: null, // Clear OTP data after success
      //     });

      //     toast.success('Two-factor authentication successful!', { id: loadingToast });
      //     return responseData;
      //   } catch (error) {
      //     const errorMessage = get().handleError(error, 'Invalid 2FA code or expired');
      //     set({
      //       error: errorMessage,
      //       loading: false,
      //       // Keep otpData for retry
      //     });
      //     toast.error(errorMessage, { id: loadingToast });
      //     throw error;
      //   }
      // },

      logout: async () => {
        set({ loading: true, error: null });

        try {
          // Always clear local state first
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            loading: false,
            error: null,
            otpData: null,
            tempUser: null,
          });
          // Clear persisted storage
          const persistor = useAuthStore.persist;
          await persistor.clearStorage();
        } catch (error) {
          toast.error("Error during logout");
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put("/api/auth/profile", data, {
            headers: {
              "Content-Type":
                data instanceof FormData
                  ? "multipart/form-data"
                  : "application/json",
            },
          });

          // Handle different response structures
          const responseData = response.data?.data || response.data;
          const updatedUser = responseData.user || responseData;
          const updatedTokens = {
            accessToken: responseData.accessToken || get().accessToken,
            refreshToken: responseData.refreshToken || get().refreshToken,
          };

          set({
            user: {
              ...get().user, // Preserve existing user data
              ...updatedUser, // Merge with updated fields
            },
            ...updatedTokens,
            loading: false,
          });

          toast.success("Profile updated successfully");
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "Failed to update profile"
          );
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage, { id: ERROR_TOAST_ID }); // <-- Use toast ID
          throw error;
        }
      },

      initiateSignup: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/signup/initiate", {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phone || data.phoneNumber,
            userType: data.userType,
          });

          set({
            otpData: {
              phone: data.phoneNumber,
              email: data.email,
              otpId: response.data.data.otpId,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              via: response.data.data.via,
              purpose: "signup",
            },
            loading: false,
          });

          toast.success(
            `OTP sent to your ${
              response.data.data.via === "email" ? "email" : "phone"
            }`
          );
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "Signup initiation failed"
          );
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      resendOtp: async (email, purpose = undefined) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/resendOtp", {
            email,
            purpose: purpose ? purpose : "signup",
            userType: "normal",
          });

          set({
            otpData: {
              // phone: phoneNumber,
              email: email,
              otpId: response.data.data.otpId,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              via: response.data.data.via,
              purpose: "signup",
            },
            loading: false,
          });

          if (purpose == "reset")
            toast.success(`OTP sent to your ${email ? "email" : "phone"}`);
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(error, "Failed to resend OTP");
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage, { id: ERROR_TOAST_ID }); // <-- Use toast ID
          throw error;
        }
      },

      resetPassword: async ({ email, otp, newPassword }) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/password/reset", {
            email,
            otp,
            newPassword,
            userType: "normal",
          });
          set({ loading: false });
          toast.success("Password reset successful!");
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "Failed to reset password"
          );
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage, { id: ERROR_TOAST_ID }); // <-- Use toast ID
          throw error;
        }
      },

      verifySignup: async (data) => {
        set({ loading: true, error: null });

        try {
          const response = await axios.post("/api/auth/signup/verify", {
            phoneNumber: data.phoneNumber,
            otp: data.otp,
            password: data.password,
            referralCode: data.referralCode,
            userType: data.userType || "normal",
          });

          if (
            !response.data.data?.userId ||
            !response.data.data?.accessToken ||
            !response.data.data?.refreshToken
          ) {
            throw new Error("Invalid response from server");
          }

          set({
            tempUser: {
              userId: response.data.data.userId,
              accessToken: response.data.data.accessToken,
              refreshToken: response.data.data.refreshToken,
              requiresPinCreation: true,
            },
            loading: false,
          });

          toast.success("Account created successfully! Please set your PIN");
          return response.data;
        } catch (error) {
          let errorMessage = "OTP verification failed";

          if (error.response?.data?.message?.includes("expired")) {
            errorMessage = "OTP expired. Please request a new one.";
          } else if (error.response?.data?.message?.includes("Invalid")) {
            errorMessage = "Invalid OTP. Please try again.";
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            loading: false,
            tempUser: null,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      createPin: async (pin) => {
        set({ loading: true, error: null });

        try {
          const { tempUser } = get();
          if (!tempUser) throw new Error("No temporary user found");

          const response = await axios.post(
            "/api/auth/pin/create",
            { pin },
            {
              headers: {
                Authorization: `Bearer ${tempUser.accessToken}`,
              },
            }
          );

          set({
            user: response.data.data.user,
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
            tempUser: null,
            loading: false,
          });

          toast.success("PIN created successfully!");
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(error, "PIN creation failed");
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      verifyPin: async (pin) => {
        set({ loading: true, error: null });
        try {
          const { tempUser } = get();
          const response = await axios.post(
            "/api/auth/pin/verify",
            { pin },
            {
              headers: {
                Authorization: `Bearer ${tempUser?.accessToken}`,
              },
            }
          );

          const responseData = response.data?.data || response.data;
          console.log("am verifying", responseData);

          set({
            user: {
              _id: responseData.id,
              firstName: responseData.firstName,
              lastName: responseData.lastName,
              email: responseData.email,
              userType: responseData.userType,
              phoneNumber: responseData.phone,
              image: responseData.image,
              mydata: responseData,
            },
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            tempUser: null,
            loading: false,
          });

          toast.success("PIN verified successfully!");
          return responseData;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "PIN verification failed"
          );
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      initiateLoginWithOTP: async (phoneNumber, userType) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/login/otp/initiate", {
            phoneNumber,
            userType,
          });
          set({
            otpData: {
              phone: phoneNumber,
              otpId: response.data.data.otpId,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              purpose: "login",
            },
            loading: false,
          });
          toast.success(`OTP sent to ${phoneNumber}`);
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "Failed to initiate OTP login"
          );
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      verifyLoginWithOTP: async (phoneNumber, otp) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/login/otp/verify", {
            phoneNumber,
            otp,
          });

          if (response.data.data.twoFactor) {
            set({
              tempUser: {
                userId: response.data.data.userId,
                accessToken: response.data.data.accessToken,
                refreshToken: response.data.data.refreshToken,
              },
              loading: false,
            });
            toast.success("OTP verified. Please enter your PIN");
          } else {
            set({
              user: response.data.data.user,
              accessToken: response.data.data.accessToken,
              refreshToken: response.data.data.refreshToken,
              loading: false,
            });
            toast.success("Login successful!");
          }
          return response.data;
        } catch (error) {
          const errorMessage = get().handleError(
            error,
            "OTP verification failed"
          );
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // In your auth store
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/auth/login", credentials);
          const responseData = response.data?.data || response.data;

          if (responseData.twoFactor) {
            set({
              tempUser: {
                accessToken: responseData.accessToken,
                refreshToken: responseData.refreshToken,
                userId: responseData.userId,
                twoFactor: responseData.twoFactor,
              },
              loading: false,
            });
            return { requiresPinVerification: true };
          }

          const userData = {
            _id: responseData.id,
            firstName: responseData.firstName,
            lastName: responseData.lastName,
            email: responseData.email,
            userType: responseData.userType,
            phoneNumber: responseData.phone,
            image: responseData.image,
            mydata: responseData,
            twoFactor: responseData.twoFactor,
          };

          set({
            user: userData,
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            loading: false,
          });

          toast.success("Login successful!");
          return userData;
        } catch (error) {
          const errorMessage = get().handleError(error, "Invalid credentials");
          set({ error: errorMessage, loading: false });

          if (error.response?.status === 401) {
            toast.error("Invalid email or password", { id: ERROR_TOAST_ID }); // <-- Use toast ID
          } else {
            toast.error(errorMessage, { id: ERROR_TOAST_ID }); // <-- Use toast ID
          }

          throw error;
        }
      },

      toggleTwoFactor: async () => {
        try {
          const response = await axios.put("/api/auth/enable/twoFactor"); // Call your API endpoint
          if (response.data.success) {
            // Update the twoFactor state based on the response
            set({ twoFactor: response.data.data.twoFactor });
          }
        } catch (error) {
          console.error("Error toggling two-factor authentication:", error);
        }
      },

      clearError: () => set({ error: null }),

      resetAuthState: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
          error: null,
          otpData: null,
          tempUser: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      version: 1,
      onRehydrateStorage: () => () => {
        set({ rehydrated: true });
      },
    }
  )
);
let sessionExpiredToastShown = false;
// Configure axios interceptors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip retry if _noRetry flag is set
    if (originalRequest?._noRetry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        if (!sessionExpiredToastShown) {
          sessionExpiredToastShown = true;
          toast.error("Your session has expired. Please login again.", {
            duration: 5000,
            position: "top-center",
            id: ERROR_TOAST_ID, // <-- Use toast ID
          });
        }
        return Promise.reject(error);
      }
    }

    // Show error toast for server errors
    if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.", {
        duration: 5000,
        position: "top-center",
        id: ERROR_TOAST_ID, // <-- Use toast ID
      });
    }

    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && !config._noAuth) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default useAuthStore;
