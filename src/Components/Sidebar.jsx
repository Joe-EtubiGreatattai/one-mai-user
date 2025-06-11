import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from "../assets/MAI.png";
import { 
  FiHome,
  FiUsers,
  FiUser,
  FiBell,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiCalendar,
  FiFileText,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { IoMdPerson } from 'react-icons/io';
import useAuthStore from '../Store/Auth';

function Sidebar() {
  const { user } = useAuthStore();
  const userRole = user?.userType || 'normal';
  const isAffiliate = userRole === 'affiliate';
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const NavItem = ({ to, icon, text }) => (
    <NavLink 
      to={to}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => 
        `flex items-center p-3 rounded-lg transition-colors ${isActive ? 
          'bg-indigo-50 text-indigo-600 font-medium' : 
          'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`
      }
      end
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="ml-3 text-sm">{text}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-[276px] shadow-lg flex-col z-40 border-r border-gray-200 bg-white dark:bg-gray-900">
        {/* Logo */}
        <div className="flex justify-center items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
          <img src={Logo} alt="MAI Logo" className="h-12" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {isAffiliate ? (
            <>
              <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" />
              <NavItem to="/refearals" icon={<FiUsers size={20} />} text="Referrals" />
              <NavItem to="/notification" icon={<FiBell size={20} />} text="Notifications" />
              <NavItem to="/profile" icon={<IoMdPerson size={20} />} text="Profile" />
            </>
          ) : (
            <>
              <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" />
              <NavItem to="/group" icon={<FiUsers size={20} />} text="Groups" />
              <NavItem to="/notification" icon={<FiBell size={20} />} text="Notifications" />
              <NavItem to="/profile" icon={<FiUser size={20} />} text="Profile" />
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem to="/profile" icon={<FiSettings size={20} />} text="Settings" />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-30 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="w-72 h-full bg-white dark:bg-gray-900 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Mobile Header */}
          <div className="flex justify-between items-center h-20 p-4 border-b border-gray-200 dark:border-gray-700">
            <img src={Logo} alt="MAI Logo" className="h-12" />
            <button
              onClick={toggleMobileMenu}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close menu"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {isAffiliate ? (
              <>
                <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" />
                <NavItem to="/refearals" icon={<FiUsers size={20} />} text="Referrals" />
                <NavItem to="/notification" icon={<FiBell size={20} />} text="Notifications" />
                <NavItem to="/profile" icon={<IoMdPerson size={20} />} text="Profile" />
              </>
            ) : (
              <>
                <NavItem to="/dashboard" icon={<FiHome size={20} />} text="Home" />
                <NavItem to="/group" icon={<FiUsers size={20} />} text="Groups" />
                <NavItem to="/notification" icon={<FiBell size={20} />} text="Notifications" />
                <NavItem to="/profile" icon={<FiUser size={20} />} text="Profile" />
              </>
            )}
          </nav>

          {/* Mobile Bottom Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <NavItem to="/profile" icon={<FiSettings size={20} />} text="Settings" />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
}

export default Sidebar;