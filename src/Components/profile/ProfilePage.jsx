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
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage to match Layout component
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const walletLoadedRef = useRef(false);
  const bankLoadedRef = useRef(false);

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

  // Sync with localStorage and document class changes from Layout
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      const newDarkMode = saved ? JSON.parse(saved) : false;
      setDarkMode(newDarkMode);
    };

    // Listen for storage changes (when Layout updates localStorage)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for document class changes as a fallback
    const observer = new MutationObserver(() => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setDarkMode(hasDarkClass);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Initial sync
    const saved = localStorage.getItem('darkMode');
    const initialDarkMode = saved ? JSON.parse(saved) : false;
    setDarkMode(initialDarkMode);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

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

  const loadTabData = useCallback(
    async (tab) => {
      if (!user || isLoading) return;

      setIsLoading(true);
      setLocalError(null);

      try {
        if (tab === "bank" && !bankLoadedRef.current) {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTabData(activeTab);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, loadTabData]);

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

  // Mobile scroll to content
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const contentEl = document.getElementById("profile-content-scroll");
    if (contentEl) {
      setTimeout(() => {
        contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [activeTab]);

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

  // Updated toggle function to sync with Layout's approach
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Apply dark mode to document (same as Layout)
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen w-full transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      {(localError || success) && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 pr-10 rounded-lg shadow-none md:shadow-lg w-[90vw] max-w-xs md:max-w-md ${
            localError ? "bg-red-500" : "bg-green-500"
          } text-white`}
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

      <div className="md:hidden p-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-lg font-bold">Profile Settings</h1>
        <button
          onClick={toggleDarkMode}
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
        toggleDarkMode={toggleDarkMode}
        handleLogout={logout}
        isLoading={isLoading}
      />

      <main className="flex-1 p-3 md:p-6 lg:p-8 w-full transition-all duration-300">
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