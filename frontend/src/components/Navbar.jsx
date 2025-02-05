import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Import icons
import logo from "../assets/vsmlogo.png"; // Your logo path

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-4 right-4 bg-gradient-to-r from-purple-700 via-pink-500 to-pink-900 bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-2xl z-50">
      <div className="container mx-auto flex justify-between items-center p-3">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-xl font-bold text-white futuristic-text">
            VSM
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/"
            className="text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] transition duration-300"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] transition duration-300"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] transition duration-300"
          >
            Contact
          </Link>
          <Link
            to="/login"
            className="px-4 py-1 bg-white text-teal-900 font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-1 bg-teal-500 text-white font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none hover:text-purple-500" // Add hover effect for icon color
          >
            {menuOpen ? (
              <X size={28} className="hover:text-purple-500" /> // Apply hover effect here
            ) : (
              <Menu size={28} className="hover:text-purple-500" /> // Apply hover effect here
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Items */}
      {menuOpen && (
        <div className="md:hidden bg-teal-800 bg-opacity-90 rounded-2xl text-center p-4 space-y-4">
          <Link
            to="/"
            className="block text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block text-white text-lg  hover:text-teal-400 hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.8)] hover:shadow-lg transition-all duration-300"
          >
            Contact
          </Link>
          <Link
            to="/login"
            className="block px-4 py-1 bg-white text-teal-900 font-bold rounded-full shadow-md"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block px-4 py-1 bg-teal-500 text-white font-bold rounded-full shadow-md"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
