import React from "react";
import {
  FiClock,
  FiUsers,
  FiDownload,
  FiBell,
} from "react-icons/fi";
import { FaCrown, FaEuroSign } from 'react-icons/fa';

export const getNotificationIcon = (type) => {
  const iconSize = 18;
  const baseClasses = "p-2 rounded-full flex items-center justify-center";
  
  const iconConfig = {
    "payment-reminder": {
      icon: <FiClock size={iconSize} aria-hidden="true" />,
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      ariaLabel: "Payment reminder"
    },
    "payment-confirmation": {
      icon: <FaEuroSign size={iconSize} aria-hidden="true" />,
      bg: "bg-green-100",
      text: "text-green-600",
      ariaLabel: "Payment confirmation"
    },
    "group-update": {
      icon: <FiUsers size={iconSize} aria-hidden="true" />,
      bg: "bg-[#3390d5]",
      text: "text-[#3390d5]",
      ariaLabel: "Group update"
    },
    "app-update": {
      icon: <FiDownload size={iconSize} aria-hidden="true" />,
      bg: "bg-purple-100",
      text: "text-purple-600",
      ariaLabel: "App update"
    },
    default: {
      icon: <FiBell size={iconSize} aria-hidden="true" />,
      bg: "bg-gray-100",
      text: "text-gray-600",
      ariaLabel: "Notification"
    }
  };

  const config = iconConfig[type] || iconConfig.default;

  return (
    <div 
      className={`${baseClasses} ${config.bg} ${config.text}`}
      aria-label={config.ariaLabel}
      role="img"
    >
      {config.icon}
    </div>
  );
};

export const getNotificationColor = (type) => {
  const colorMap = {
    "payment-reminder": "yellow",
    "payment-confirmation": "green",
    "group-update": "blue",
    "app-update": "purple",
  };
  
  return colorMap[type] || "gray";
};

// Responsive version with size variants
export const NotificationIcon = ({ type, size = "md" }) => {
  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg"
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  const iconConfig = {
    "payment-reminder": {
      icon: FiClock,
      bg: "bg-yellow-100",
      text: "text-yellow-600",
    },
    "payment-confirmation": {
      icon: FaEuroSign,
      bg: "bg-green-100",
      text: "text-green-600",
    },
    "group-update": {
      icon: FiUsers,
      bg: "bg-[#3390d5]",
      text: "text-[#3390d5]",
    },
    "app-update": {
      icon: FiDownload,
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
    default: {
      icon: FiBell,
      bg: "bg-gray-100",
      text: "text-gray-600",
    }
  };

  const config = iconConfig[type] || iconConfig.default;
  const IconComponent = config.icon;
  const iconSize = iconSizes[size];

  return (
    <div 
      className={`rounded-full flex items-center justify-center ${config.bg} ${config.text} ${sizeClasses[size]}`}
      aria-label={`${type || 'notification'} icon`}
      role="img"
    >
      <IconComponent size={iconSize} aria-hidden="true" />
    </div>
  );
};