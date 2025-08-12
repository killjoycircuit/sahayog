import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Header = () => {
  // State to manage the mobile menu's visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left - Sahayog Brand Link */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors">
              Sahayog
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-md font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-md font-medium transition-colors">
                About Us
              </Link>
            </div>
          </div>

          {/* Right - Login & Signup Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-teal-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Sign Up
            </Link>
          </div>

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

        {/* Mobile menu - Conditionally displayed based on state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
              Home
            </Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left">
              About Us
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3 space-x-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-teal-600 px-3 py-2 rounded-md text-base font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-teal-700 text-white hover:bg-teal-900 px-3 py-2 rounded-md text-base font-medium">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
