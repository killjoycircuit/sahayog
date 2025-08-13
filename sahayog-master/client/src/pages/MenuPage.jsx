import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext.js';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Target, 
  Settings 
} from 'lucide-react';

const MenuPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setUser(null);
      navigate('/');
    }
  };

  // Handle navigation
  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  // Get user initials for avatar fallback
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!user) {
    return null; // Don't render anything if user is not logged in
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-1"
      >
        {/* Profile Image/Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#008080] flex items-center justify-center flex-shrink-0">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </span>
          )}
        </div>

        {/* User Name */}
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-gray-500">
            @{user.username}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <div className="flex-shrink-0">
          {isDropdownOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#008080] flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={() => handleNavigation('/profile')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <User className="h-4 w-4 mr-3 text-gray-500" />
              <span>View Profile</span>
            </button>

            {/* My Contributions */}
            <button
              onClick={() => handleNavigation('/my-contributions')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <Heart className="h-4 w-4 mr-3 text-gray-500" />
              <span>My Contributions</span>
            </button>

            {/* My Campaigns */}
            <button
              onClick={() => handleNavigation('/my-campaigns')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <Target className="h-4 w-4 mr-3 text-gray-500" />
              <span>My Campaigns</span>
            </button>

            {/* Settings (Optional) */}
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              <span>Settings</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;