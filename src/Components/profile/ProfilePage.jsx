import React, { useState, useEffect, useCallback, useRef } from "react";
import ProfileSidebar from "./ProfileSidebar";
import ProfileContent from "./ProfileContent";
import useAuthStore from "../../Store/Auth";
import useBankStore from "../../Store/useBankStore";
import useWalletStore from "../../Store/useWalletStore";
import useReferralStore from "../../Store/useReferralStore";
import { FiX } from "react-icons/fi";

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const {
    accounts,
    getBankAccounts,
    walletBalance,
    getWalletBalance,
    fetchBankDetails,
    error: bankError,
    clearError: clearBankError,
  } = useBankStore();
  const {
    initializeWallet,
    userWallet,
    getTransactions,
    transactions,
    error: walletError,
    clearError: clearWalletError,
  } = useWalletStore();
  const { fetchMyReferrals } = useReferralStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") == "true" ? true : false
  );
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add refs to track if data has been loaded
  const walletLoadedRef = useRef(false);
  const bankLoadedRef = useRef(false);

  // Handle errors from all stores
  useEffect(() => {
    if (bankError) {
      setLocalError(bankError);
      clearBankError();
    }
    if (walletError) {
      setLocalError(walletError);
      clearWalletError();
    }
  }, [bankError, walletError, clearBankError, clearWalletError]);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    }
  }, []);

  // Load referral data when user is available
  useEffect(() => {
    if (user) {
      const loadReferrals = async () => {
        try {
          await fetchMyReferrals();
        } catch (err) {
          console.error("Referral load error:", err);
          setLocalError(err.message || "Failed to load referral data");
        }
      };
      loadReferrals();
    }
  }, [user, fetchMyReferrals]);

  // Throttled data loading function
  const loadTabData = useCallback(
    async (tab) => {
      if (!user || isLoading) return;

      setIsLoading(true);
      setLocalError(null);

      try {
        if (tab === "bank" && !bankLoadedRef.current) {
          // await Promise.all([getBankAccounts(), fetchBankDetails()]);
          bankLoadedRef.current = true;
        } else if (tab === "wallet" && !walletLoadedRef.current) {
          await Promise.all([
            getWalletBalance(),
            initializeWallet(),
            getTransactions(),
          ]);
          walletLoadedRef.current = true;
        }
      } catch (err) {
        console.error("Tab data load error:", err);
        if (err.response?.status === 429) {
          setLocalError("Too many requests. Please wait a moment.");
        } else {
          setLocalError(err.message || "Failed to load data");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      user,
      isLoading,
      getBankAccounts,
      fetchBankDetails,
      getWalletBalance,
      initializeWallet,
      getTransactions,
    ]
  );

  // Load data when tab changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTabData(activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, loadTabData]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // Clear messages after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localError) setLocalError(null);
      if (success) setSuccess(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [localError, success]);

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleProfileUpdate = async (formData) => {
    setIsLoading(true);
    setLocalError(null);
    setSuccess(null);

    try {
      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      setLocalError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const closeMessage = () => {
    setLocalError(null);
    setSuccess(null);
  };

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Notification Toast */}
      {(localError || success) && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 pr-10 rounded-lg shadow-lg max-w-xs md:max-w-md ${
            localError ? "bg-red-500" : "bg-green-500"
          } text-white animate-fade-in`}
        >
          {localError || success}
          <button
            onClick={closeMessage}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 focus:outline-none"
            aria-label="Close message"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mobile Header (for small screens) */}
      <div className="md:hidden p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile Settings</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <ProfileSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        handleLogout={logout}
        isLoading={isLoading}
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <ProfileContent
          activeTab={activeTab}
          user={user}
          updateProfile={handleProfileUpdate}
          darkMode={darkMode}
          setError={setLocalError}
          setSuccess={setSuccess}
          walletBalance={walletBalance}
          userWallet={userWallet}
          accounts={accounts}
          transactions={transactions}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default ProfilePage;
