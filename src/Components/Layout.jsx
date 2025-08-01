// Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import Logo from "../assets/MAI.png";
import {
  FiHome,
  FiUsers,
  FiUser,
  FiBell,
  FiSettings,
  FiMenu,
  FiX,
  FiPlus,
  FiSearch,
  FiLogOut,
  FiCreditCard, // Transaction icon
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import useAuthStore from "../Store/Auth";

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const tabletSidebarRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const tabletToggleRef = useRef(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideTablet =
        mobileMenuOpen &&
        tabletSidebarRef.current &&
        !tabletSidebarRef.current.contains(event.target);
      const isToggleButton =
        (mobileToggleRef.current &&
          mobileToggleRef.current.contains(event.target)) ||
        (tabletToggleRef.current &&
          tabletToggleRef.current.contains(event.target));
      if (isOutsideTablet && !isToggleButton) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
     
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 shadow-lg border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" />
          <NavItem to="/group" icon={<FiUsers size={20} />} text="Groups" />
          <NavItem to="/transaction" icon={<FiCreditCard size={20} />} text="Transaction" />
          <NavItem to="/profile" icon={<FiUser size={20} />} text="Profile" />
        </nav>
      </div>

      <div
        ref={tabletSidebarRef}
        className={`hidden md:block lg:hidden fixed inset-y-0 left-0 z-30 w-64 shadow-lg border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
          <button onClick={toggleMobileMenu} className="p-2 text-gray-500 dark:text-gray-400">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" onClick={toggleMobileMenu} />
          <NavItem to="/notification" icon={<FiBell size={20} />} text="Notifications" onClick={toggleMobileMenu} />
          <NavItem to="/group" icon={<FiUsers size={20} />} text="Groups" onClick={toggleMobileMenu} />
          <NavItem to="/profile" icon={<FiUser size={20} />} text="Profile" onClick={toggleMobileMenu} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                ref={tabletToggleRef}
                onClick={toggleMobileMenu}
                className="p-2 text-gray-500 dark:text-gray-400 md:block lg:hidden"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
              
              <Link to="/notification" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <FiBell className="h-5 w-5 relative" />
              </Link>
              
              <div className="relative">
                <div ref={profileButtonRef} onClick={toggleDropdown} className="cursor-pointer">
                  {user?.image ? (
                    <img 
                      src={user.image.startsWith("/uploads/") ? `https://api.joinonemai.com${user.image}` : user.image} 
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" 
                      alt="Profile"
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                {showDropdown && (
                  <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <NavLink 
                      to="/profile" 
                      onClick={() => setShowDropdown(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUser className="inline mr-2" /> Profile
                    </NavLink>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="inline mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-16 pb-16">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 sm:hidden">
        <MobileTab to="/dashboard" icon={<FiHome size={20} />} label="Home" />
        <MobileTab to="/transaction" icon={<FiCreditCard size={20} />} label="Transactions" />
        <MobileTab to="/group" icon={<FiUsers size={20} />} label="Groups" />
        <MobileTab to="/profile" icon={<FiUser size={20} />} label="Profile" />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, text, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center p-3 rounded-lg transition-colors relative ${
        isActive
          ? "bg-blue-50 text-[#3390d5] font-medium dark:bg-gray-700 dark:text-white"
          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
      }`
    }
    end
  >
    <span className="flex-shrink-0">{icon}</span>
    <span className="ml-3 text-sm">{text}</span>
  </NavLink>
);

const MobileTab = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center text-xs ${
        isActive ? "text-[#3390d5] dark:text-white" : "text-gray-500 dark:text-gray-300"
      }`
    }
  >
    {icon}
    <span className="text-[11px] mt-1">{label}</span>
  </NavLink>
);

export default Layout;