import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {UserContext} from '../src/context/UserContext'
import { 
  User,
  LogOut,
  Heart,
  Settings,
  Target,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, setUser, ready } = useContext(UserContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // You can add axios logout call here when backend is ready
      // await axios.post('/api/logout');
      setUser(null);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      navigate('/');
    }
  };

  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false); // Close mobile menu too
    navigate(path);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Sahayog Brand Link */}
          <div className="flex-shrink-0">
            <Link
            to="/"
            className="text-3xl font-bold text-teal-800 hover:text-teal-900 transition-colors"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Sahayog
          </Link>

          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-md font-medium transition-colors">
                Home
              </Link>

              <Link to="/events" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-md font-medium transition-colors">
                Explore Projects
              </Link>

              <Link to="/about" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-md font-medium transition-colors">
                About Us
              </Link>
              
            </div>
          </div>

          {/* Right - Auth Section */}
          <div className="flex items-center space-x-4">
            {!ready ? (
              // Loading state
              <div className="w-8 h-8 border-t-2 border-b-2 border-teal-600 rounded-full animate-spin"></div>
            ) : user ? (
              // Logged in - Show profile dropdown
              <div className="relative dropdown-container">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
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
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleNavigation('/my-contributions')}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Heart className="h-4 w-4 mr-3 text-gray-500" />
                        <span>My Contributions</span>
                      </button>

                      <button
                        onClick={() => handleNavigation('/my-campaigns')}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Target className="h-4 w-4 mr-3 text-gray-500" />
                        <span>My Campaigns</span>
                      </button>

                      <button
                        onClick={() => handleNavigation('/settings')}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
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
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - Show login/signup buttons
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-teal-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {/* Conditionally render Hamburger or Close icon */}
                {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Conditionally displayed based on state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              About Us
            </Link>
            <Link 
              to="/events" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Explore Projects
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                // Mobile logged in state
                <>
                  <div className="flex items-center px-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 mr-3">
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
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600"
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/my-contributions" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600"
                  >
                    My Contributions
                  </Link>
                  <Link 
                    to="/my-campaigns" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-teal-600"
                  >
                    My Campaigns
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                // Mobile not logged in state
                <div className="flex items-center px-3 space-x-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="bg-teal-700 text-white hover:bg-teal-900 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;