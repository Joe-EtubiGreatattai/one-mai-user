import React, { useState, useEffect, useCallback } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiDownload,
  FiFilter,
  FiTrash2,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiUserPlus,
  FiUserMinus,
  FiCheck,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import useAuthStore from "../Store/Auth";
import useNotificationStore from "../Store/getUserNotifications";
import useGroupStore from "../Store/group";
import { toast } from "react-hot-toast";
import {
  getNotificationColor,
  getNotificationIcon,
} from "../Components/GetNotificationIcon";
import { format } from "date-fns";
import axios from "../Api/axios";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { accessToken, user } = useAuthStore();
  const { notifications, loading, fetchNotifications, markAsRead } =
    useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const tabOptions = [
    "all",
    "payment_reminder",
    "payment_confirmation",
    "group_update",
    "other",
  ];

  const fetchNotificationsWithRetry = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchNotifications(accessToken);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [accessToken, fetchNotifications]);

  useEffect(() => {
    fetchNotificationsWithRetry();

    const { socket } = useGroupStore.getState();
    if (!socket) return;

    const handleNewNotification = () => fetchNotificationsWithRetry();
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [fetchNotificationsWithRetry]);

  const filteredNotifications = useCallback(() => {
    const tabFilters = {
      all: () => true,
      payment_reminder: (n) => n.type === "payment_reminder",
      payment_confirmation: (n) => n.type === "payment_confirmation",
      group_update: (n) =>
        [
          "group_update",
          "added_to_group",
          "removed_from_group",
          "settings_change",
          "payout_scheduled",
          "member_change",
        ].includes(n.type),
      other: (n) => n.type === "other",
    };

    return notifications.filter(tabFilters[activeTab] || tabFilters.all);
  }, [activeTab, notifications]);

  const handleMemberAction = async (notificationId, action) => {
    const notification = notifications.find((n) => n._id === notificationId);
    if (!notification?.group) return;

    try {
      const endpoint =
        action === "accept"
          ? `/api/group/${notification.group._id}/members`
          : `/api/group/${notification.group._id}/decline-invite`;

      await axios.put(
        endpoint,
        {
          memberId: notification.sender._id,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success(
        action === "accept"
          ? `Joined ${notification.group.name}`
          : `Declined invitation to ${notification.group.name}`
      );

      await fetchNotificationsWithRetry();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || `Failed to ${action} invitation`
      );
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch {
      return "Just now";
    }
  };

  const renderNotificationActions = (notification) => {
    const actions = {
      member_change: (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => handleMemberAction(notification._id, "accept")}
            className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <FiCheck className="mr-1 sm:mr-2" size={14} /> Accept
          </button>
          <button
            onClick={() => handleMemberAction(notification._id, "decline")}
            className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm"
          >
            <FiXCircle className="mr-1 sm:mr-2" size={14} /> Decline
          </button>
        </div>
      ),
      payment_reminder: (
        <button className="mt-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
          Make Payment Now
        </button>
      ),
    };

    return !notification.isRead && actions[notification.type];
  };

  const LoadingState = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="p-4 sm:p-5 rounded-xl bg-white border border-gray-200 animate-pulse"
        >
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-full mt-1 sm:mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl text-blue-600">
            <FiBell size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount !== 1 ? "s" : ""
                  }`
                : "All caught up"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 self-end sm:self-auto">
          <button
            onClick={fetchNotificationsWithRetry}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 "
            aria-label="Refresh"
          >
            <FiRefreshCw
              className={`sm:w-5 sm:h-5 ${isRefreshing ? "animate-spin" : ""}`}
              size={16}
              // className="sm:w-5 sm:h-5"
            />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block mb-6 sm:mb-8`}
      >
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {tab
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && !isRefreshing ? (
        <LoadingState />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications().length > 0 ? (
            filteredNotifications().map((notification) => (
              <div
                key={notification._id}
                className={`p-4 sm:p-5 rounded-xl transition-all ${
                  notification.isRead
                    ? "bg-white border border-gray-200"
                    : "bg-blue-50 border-l-4 border-blue-500"
                } shadow-xs hover:shadow-sm`}
              >
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div
                    className={`p-2 sm:p-3 rounded-lg ${
                      notification.isRead
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-100 text-blue-500"
                    }`}
                  >
                    {getNotificationIcon(notification.type, {
                      className: "w-4 h-4 sm:w-5 sm:h-5",
                    })}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                      <h3
                        className={`text-sm sm:text-base font-medium ${
                          notification.isRead
                            ? "text-gray-700"
                            : "text-gray-900"
                        }`}
                      >
                        {notification.message}
                      </h3>
                      <time className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>

                    {notification.group && (
                      <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                        <FiUsers className="mr-1 sm:w-3.5 sm:h-3.5" size={12} />
                        <span className="truncate">
                          {notification.group.name}
                        </span>
                      </div>
                    )}

                    {renderNotificationActions(notification)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-200">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <FiBell className="text-gray-400 sm:w-6 sm:h-6" size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1">
                {activeTab === "all" ? "All caught up!" : "No notifications"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-2">
                {activeTab === "all"
                  ? "You don't have any notifications at this time."
                  : `No ${tabOptions
                      .find((t) => t === activeTab)
                      ?.split("_")
                      .join(" ")} notifications found.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
