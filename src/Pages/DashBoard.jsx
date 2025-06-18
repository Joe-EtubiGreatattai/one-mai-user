import React, { useEffect, useState, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import useAuthStore from "../Store/Auth";
import useWalletStore from "../Store/useWalletStore";
import useBankStore from "../Store/useBankStore";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function DashBoard({ welcomeOnly = undefined }) {
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const toastShownRef = useRef(false); // <-- Add this line

  // Store hooks
  const { user } = useAuthStore();
  const {
    balance,
    currency = "USD",
    initializeWallet,
    error: walletError,
  } = useWalletStore();
  const { bankDetails, fetchBankDetails } = useBankStore();

  // // User details
  // const userRole = user?.userType || "user";
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const profileCompletion = bankDetails?.data ? 100 : 75;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        await Promise.all([initializeWallet(), fetchBankDetails()]);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data");
        if (!toastShownRef.current) {
          toast.error("Failed to load dashboard data");
          toastShownRef.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      loadData();
    }
  }, [user?._id, location.key, initializeWallet, fetchBankDetails]);

  useEffect(() => {
    if (walletError) {
      toast.error(walletError);
    }
  }, [walletError]);

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-gray-200 rounded-lg p-6 mb-6 h-48"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          Error: {error}. Please refresh the page or contact support.
        </div>
      </div>
    );
  }

  if (welcomeOnly) {
    return (
      <div className=" flex items-center gap-1.5">
        <div className="flex items-center cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          {/* {user?.image ? (
            <img
              src={
                user.image.startsWith("/uploads/")
                  ? `https://api.joinonemai.com${user.image}`
                  : user.image
              }
              alt="Profile"
              className="h-10 w-10 rounded-full object-cover border-2 border-blue-100 dark:border-gray-600"
            />
          ) : (
            <FaUserCircle className="h-8 w-8 text-gray-400 dark:text-gray-300" />
          )} */}
        </div>
        <div>
          <h3 className="text-[#1E1E1E] text-2xl mb-2 font-semibold dark:text-[#E1E1E1]">
            Dashboard
          </h3>
          <p className="text-xs md:text-sm font-normal text-[#767676] dark:text-[#A1A1A1]">
            Welcome Back, {firstName} {lastName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto ">
      {/* Current Balance Card */}
      <div className="bg-black/90 text-white p-4 sm:p-6 rounded-lg shadow-md ">
        <div className="flex flex-col gap-2 items-start">
          <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
            Current Balance
          </h3>
          <div className="flex items-center justify-between w-full">
            <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              {balanceVisible ? formatCurrency(balance) : "••••••"}
            </p>
            <button
              onClick={toggleBalanceVisibility}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
        </div>

        <div className="mb-2 sm:mb-4">
          <div className="flex flex-col gap-2 mb-1">
            <span className="text-gray-300 text-sm sm:text-base">
              Your Profile is not complete, Please Setup Bank Details
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                <div
                  className="bg-[#3390d5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <span className="text-white text-sm sm:text-base">
                {profileCompletion}%
              </span>
            </div>
          </div>

          <Link
            to="/profile"
            className="text-blue flex items-center gap-1.5"
          >
            <span>Complete Profile</span>
            <svg
              width="5"
              height="10"
              viewBox="0 0 5 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.990783 9.80211L4.87327 5.36939C4.91935 5.31662 4.95192 5.25945 4.97097 5.19789C4.99032 5.13632 5 5.07036 5 5C5 4.92964 4.99032 4.86368 4.97097 4.80211C4.95192 4.74055 4.91935 4.68338 4.87327 4.63061L0.990783 0.184697C0.883256 0.0615655 0.748847 0 0.587557 0C0.426267 0 0.288018 0.0659631 0.172811 0.197889C0.0576034 0.329815 0 0.483729 0 0.659631C0 0.835532 0.0576034 0.989446 0.172811 1.12137L3.55991 5L0.172811 8.87863C0.0652843 9.00176 0.0115204 9.15339 0.0115204 9.33351C0.0115204 9.51398 0.0691242 9.67019 0.184331 9.80211C0.299539 9.93404 0.433948 10 0.587557 10C0.741167 10 0.875576 9.93404 0.990783 9.80211Z"
                fill="#3390d5"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
