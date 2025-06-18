import React from "react";
import { FiEdit, FiLogOut, FiHelpCircle, FiSun, FiMoon } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { MdOutlineSecurity } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { AiFillBank } from "react-icons/ai";
import { FaWallet } from "react-icons/fa";

const ProfileSidebar = ({
  user,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  handleLogout,
  isLoading,
}) => {
  const menuItems = [
    {
      title: "Account Settings",
      items: [
        { tab: "profile", label: "Profile Information", icon: <CgProfile /> },
        {
          tab: "security",
          label: "Password & Security",
          icon: <MdOutlineSecurity />,
        },
        {
          tab: "notifications",
          label: "Notifications",
          icon: <IoIosNotifications />,
        },
      ],
    },
    {
      title: "Payout and Settings",
      items: [
        { tab: "bank", label: "Bank Details", icon: <AiFillBank /> },
        { tab: "wallet", label: "Wallet", icon: <FaWallet /> },
      ],
    },
    {
      title: "Others",
      items: [
        { type: "darkMode", label: "Dark Mode" },
        { type: "faq", label: "FAQ" },
        { type: "logout", label: "Logout" },
      ],
    },
  ];

  const renderMenuItem = (item) => {
    if (item.type === "darkMode") {
      return (
        <li
          key="darkMode"
          className="flex justify-between items-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            toggleDarkMode;
          }}
        >
          <span
            className={`flex items-center ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {darkMode ? (
              <FiMoon className="mr-2 h-4 w-4" />
            ) : (
              <FiSun className="mr-2 h-4 w-4" />
            )}
            {item.label}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={toggleDarkMode}
              aria-label="Toggle dark mode"
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                darkMode
                  ? "bg-gray-700 peer-checked:bg-[#3390d5] after:border-gray-600"
                  : "bg-gray-200 peer-checked:bg-[#3390d5] after:border-gray-300"
              }`}
            ></div>
          </label>
        </li>
      );
    }

    if (item.type === "faq") {
      return (
        <li
          key="faq"
          className={`flex items-center cursor-pointer ${
            darkMode
              ? "text-gray-300 hover:text-[#3390d5]"
              : "text-gray-700 hover:text-[#3390d5]"
          }`}
        >
          <FiHelpCircle className="mr-2 h-4 w-4" />
          {item.label}
        </li>
      );
    }

    if (item.type === "logout") {
      return (
        <li
          key="logout"
          className={`flex items-center cursor-pointer ${
            darkMode
              ? "text-gray-300 hover:text-red-400"
              : "text-gray-700 hover:text-red-500"
          }`}
          onClick={handleLogout}
        >
          <FiLogOut className="mr-2 h-4 w-4" />
          {item.label}
        </li>
      );
    }

    return (
      <li
        key={item.tab}
        className={`flex items-center cursor-pointer transition-colors ${
          activeTab === item.tab
            ? "text-[#3390d5]"
            : darkMode
            ? "text-gray-300 hover:text-[#3390d5]"
            : "text-gray-700 hover:text-[#3390d5]"
        }`}
        onClick={() => !isLoading && setActiveTab(item.tab)}
      >
        <div className="flex-center gap-2">
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      </li>
    );
  };
  const profileImg = user?.image;
  return (
    <aside
      className={`w-full md:w-64 lg:w-72 xl:w-80 p-4 md:p-6 rounded-lg shadow-md transition-colors duration-300 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* User Profile Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative group">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {profileImg ? (
              <img
                src={
                  profileImg.startsWith("/uploads/")
                    ? `https://api.joinonemai.com${profileImg}`
                    : profileImg
                }
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border-2 border-blue-100 group-hover:border-blue-200 transition-colors duration-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://randomuser.me/api/portraits/men/1.jpg";
                }}
              />
            ) : (
              <FaUserCircle className="h-8 w-8 text-gray-400 group-hover:text-gray-500 transition-colors duration-200" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate dark:text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          <p
            className={`text-sm truncate ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {user?.email}
          </p>
        </div>
        <button
          className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            darkMode ? "text-[#3390d5]" : "text-[#3390d5]"
          }`}
          onClick={() => setActiveTab("profile")}
          aria-label="Edit profile"
          disabled={isLoading}
        >
          <FiEdit className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3
              className={`text-xs uppercase mb-3 tracking-wider ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {section.title}
            </h3>
            <ul className="space-y-3 pl-1">
              {section.items.map(renderMenuItem)}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
