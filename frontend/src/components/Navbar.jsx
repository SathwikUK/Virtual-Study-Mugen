import { useState } from "react";
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
          <a
            href="#hero"
            className="text-white text-lg hover:text-teal-400 transition duration-300"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-white text-lg hover:text-teal-400 transition duration-300"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-white text-lg hover:text-teal-400 transition duration-300"
          >
            Contact
          </a>
          {/* If these routes lead to separate pages, you can keep them as Links */}
          <a
            href="/login"
            className="px-4 py-1 bg-white text-teal-900 font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-1 bg-teal-500 text-white font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Sign Up
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none hover:text-purple-500"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Items */}
      {menuOpen && (
        <div className="md:hidden bg-teal-800 bg-opacity-90 rounded-2xl text-center p-4 space-y-4">
          <a
            href="#hero"
            className="block text-white text-lg hover:text-teal-400 transition duration-300"
          >
            Home
          </a>
          <a
            href="#about"
            className="block text-white text-lg hover:text-teal-400 transition duration-300"
          >
            About
          </a>
          <a
            href="#contact"
            className="block text-white text-lg hover:text-teal-400 transition duration-300"
          >
            Contact
          </a>
          <a
            href="/login"
            className="block px-4 py-1 bg-white text-teal-900 font-bold rounded-full shadow-md"
          >
            Login
          </a>
          <a
            href="/signup"
            className="block px-4 py-1 bg-teal-500 text-white font-bold rounded-full shadow-md"
          >
            Sign Up
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
