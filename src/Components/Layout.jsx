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
  FiSearch,
  FiLogOut,
} from "react-icons/fi";
import { IoMdPerson } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import useAuthStore from "../Store/Auth";

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const mobileSidebarRef = useRef(null);
  const tabletSidebarRef = useRef(null);
  const mobileToggleRef = useRef(null);
  const tabletToggleRef = useRef(null);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideMobile =
        mobileMenuOpen &&
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(event.target);
      const isOutsideTablet =
        mobileMenuOpen &&
        tabletSidebarRef.current &&
        !tabletSidebarRef.current.contains(event.target);
      const isToggleButton =
        (mobileToggleRef.current &&
          mobileToggleRef.current.contains(event.target)) ||
        (tabletToggleRef.current &&
          tabletToggleRef.current.contains(event.target));
      if ((isOutsideMobile || isOutsideTablet) && !isToggleButton) {
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

  const NavItem = ({ to, icon, text, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-colors relative ${
          isActive
            ? "bg-indigo-50 text-indigo-600 font-medium dark:bg-gray-700 dark:text-white"
            : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        }`
      }
      end
    >
      {({ isActive }) => (
        <>
          <span className="flex-shrink-0">{icon}</span>
          <span className="ml-3 text-sm">{text}</span>
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-md"></div>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Visible on lg screens and up */}
      <div
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 w-64 shadow-lg border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${
          mobileMenuOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            to="/dashboard"
            icon={<FiHome size={20} />}
            text="Home"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/notification"
            icon={<FiBell size={20} />}
            text="Notifications"
            onClick={toggleMobileMenu}
          />
          {/* <NavItem
            to="/profile"
            icon={<IoMdPerson size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          /> */}
          <NavItem
            to="/group"
            icon={<FiUsers size={20} />}
            text="Groups"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/profile"
            icon={<FiUser size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          />
        </nav>

        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem
            to="/profile"
            icon={<FiSettings size={20} />}
            text="Settings"
          />
        </div> */}
      </div>

      {/* Tablet Sidebar - Visible on md screens */}
      <div
        ref={tabletSidebarRef}
        className={`hidden md:block lg:hidden fixed inset-y-0 left-0 z-30 w-64 shadow-lg border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            to="/dashboard"
            icon={<FiHome size={20} />}
            text="Home"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/notification"
            icon={<FiBell size={20} />}
            text="Notifications"
            onClick={toggleMobileMenu}
          />
          {/* <NavItem
            to="/profile"
            icon={<IoMdPerson size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          /> */}
          <NavItem
            to="/group"
            icon={<FiUsers size={20} />}
            text="Groups"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/profile"
            icon={<FiUser size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          />
        </nav>

        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem
            to="/profile"
            icon={<FiSettings size={20} />}
            text="Settings"
            onClick={toggleMobileMenu}
          />
        </div> */}
      </div>

      {/* Mobile Sidebar - Visible on sm screens and down */}
      <div
        ref={mobileSidebarRef}
        className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem
            to="/dashboard"
            icon={<FiHome size={20} />}
            text="Home"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/notification"
            icon={<FiBell size={20} />}
            text="Notifications"
            onClick={toggleMobileMenu}
          />
          {/* <NavItem
            to="/profile"
            icon={<IoMdPerson size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          /> */}
          <NavItem
            to="/group"
            icon={<FiUsers size={20} />}
            text="Groups"
            onClick={toggleMobileMenu}
          />
          <NavItem
            to="/profile"
            icon={<FiUser size={20} />}
            text="Profile"
            onClick={toggleMobileMenu}
          />
        </nav>

        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem
            to="/profile"
            icon={<FiSettings size={20} />}
            text="Settings"
            onClick={toggleMobileMenu}
          />
        </div> */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Navbar */}
        <header className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiMenu className="h-5 w-5" ref={mobileToggleRef} />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="hidden md:block lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiMenu className="h-5 w-5" ref={tabletToggleRef} />
              </button>
              <h1 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <FiSearch className="h-5 w-5" />
              </button>
              <Link to="notification">
                <button className="cursor-pointer p-2 rounded-full text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 relative">
                  <FiBell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </Link>

              <div className="relative">
                <div
                  ref={profileButtonRef}
                  onClick={toggleDropdown}
                  className="flex items-center cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {user?.image ? (
                    <img
                      src={
                        user.image.startsWith("/uploads/")
                          ? `https://api.joinonemai.com${user.image}`
                          : user.image
                      }
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-indigo-100 dark:border-gray-600"
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                  )}
                </div>

                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <NavLink
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiUser className="mr-3" size={16} />
                      Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="mr-3" size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto pt-16 transition-all duration-300 ${
            mobileMenuOpen ? "md:ml-64" : "ml-0"
          }`}
        >
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
