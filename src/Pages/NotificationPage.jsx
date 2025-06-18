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
  FiSearch,
  FiMoreVertical,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { accessToken, user } = useAuthStore();
  const { notifications, loading, fetchNotifications, markAsRead } =
    useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const tabOptions = [
    { key: "all", label: "All", icon: FiBell },
    { key: "payment_reminder", label: "Payment Reminders", icon: FiClock },
    { key: "payment_confirmation", label: "Payments", icon: FiDollarSign },
    { key: "group_update", label: "Groups", icon: FiUsers },
    { key: "other", label: "Other", icon: FiMoreVertical },
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

    let filtered = notifications.filter(tabFilters[activeTab] || tabFilters.all);
    
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.group?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, notifications, searchQuery]);

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
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleMemberAction(notification._id, "accept")}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <FiCheck className="mr-2" size={16} /> Accept
          </button>
          <button
            onClick={() => handleMemberAction(notification._id, "decline")}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <FiXCircle className="mr-2" size={16} /> Decline
          </button>
        </div>
      ),
      payment_reminder: (
        <button className="mt-4 px-4 py-2 bg-gradient-to-r from-[#3390d5] to-[#2980b9] text-white rounded-lg text-sm font-medium hover:from-[#2980b9] hover:to-[#2471a3] transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
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
          className="p-6 rounded-2xl bg-white border border-gray-100 animate-pulse shadow-sm"
        >
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-full mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getTabCount = (tabKey) => {
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
    
    return notifications.filter(tabFilters[tabKey] || tabFilters.all).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl text-[#3390d5] shadow-sm">
                <FiBell size={24} />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Notifications
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  {unreadCount > 0 ? (
                    <>
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="text-green-500" size={16} />
                      All caught up
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotificationsWithRetry}
                disabled={isRefreshing}
                className="p-3 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                aria-label="Refresh"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 md:hidden shadow-sm"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3390d5] focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className={`${mobileMenuOpen ? "block" : "hidden"} md:block mb-8`}>
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-1">
              {tabOptions.map((tab) => {
                const Icon = tab.icon;
                const count = getTabCount(tab.key);
                const isActive = activeTab === tab.key;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#3390d5] to-[#2980b9] text-white shadow-md transform scale-105"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.key.split('_')[0]}</span>
                    {count > 0 && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive 
                          ? "bg-white/20 text-white" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        {loading && !isRefreshing ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            {filteredNotifications().length > 0 ? (
              filteredNotifications().map((notification, index) => (
                <div
                  key={notification._id}
                  className={`group p-6 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-1 ${
                    notification.isRead
                      ? "bg-white border border-gray-100 shadow-sm hover:shadow-lg"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#3390d5] shadow-md hover:shadow-xl"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex gap-4 items-start">
                    <div className="relative">
                      <div
                        className={`p-3 rounded-xl transition-all duration-200 ${
                          notification.isRead
                            ? "bg-gray-100 text-gray-400"
                            : "bg-gradient-to-br from-blue-100 to-blue-200 text-[#3390d5] shadow-sm"
                        }`}
                      >
                        {getNotificationIcon(notification.type, {
                          className: "w-5 h-5",
                        })}
                      </div>
                      {!notification.isRead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#3390d5] rounded-full animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3
                          className={`text-base font-medium leading-relaxed ${
                            notification.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.message}
                        </h3>
                        <time className="text-sm text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-lg">
                          {formatDate(notification.createdAt)}
                        </time>
                      </div>

                      {notification.group && (
                        <div className="flex items-center mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                          <FiUsers className="mr-2 w-4 h-4 text-gray-400" />
                          <span className="font-medium">{notification.group.name}</span>
                        </div>
                      )}

                      {renderNotificationActions(notification)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <FiBell className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === "all" ? "All caught up!" : "No notifications"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  {activeTab === "all"
                    ? "You don't have any notifications at this time. We'll let you know when something important happens."
                    : `No ${tabOptions
                        .find((t) => t.key === activeTab)
                        ?.label.toLowerCase()} notifications found.`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationPage;