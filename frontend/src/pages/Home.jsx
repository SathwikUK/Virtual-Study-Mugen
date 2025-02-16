// Home.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar"; // Adjust path as needed
import img from "../assets/vsmhome.png"; // Hero image

// Import the About and Contact components
import About from "../components/About"; // Adjust path as needed
import Contact from "../components/Contact"; // Adjust path as needed

const Home = () => {
  return (
    <>
      {/* Global Styles with Smooth Scrolling */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        .input-neon {
          background: transparent;
          border: 2px solid #8a2be2;
          color: #fff;
          padding: 12px;
          outline: none;
          border-radius: 4px;
          transition: all 0.3s ease;
        }
        .input-neon::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        .input-neon:focus {
          box-shadow: 0 0 10px #8a2be2;
          border-color: #fff;
        }
        .neon-button {
          background: linear-gradient(45deg, #8a2be2, #00ffff);
          color: #fff;
          padding: 14px 28px;
          border: none;
          border-radius: 9999px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 10px #8a2be2;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .neon-button:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px #00ffff;
        }
        .form-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .glow {
          position: absolute;
          inset: 0;
          border-radius: 4px;
          pointer-events: none;
          box-shadow: 0 0 20px #8a2be2;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .form-group:focus-within .glow {
          opacity: 1;
        }
        .status-message {
          margin-top: 1rem;
          font-weight: bold;
        }
        .status-message.success {
          color: #00ff00;
          text-shadow: 0 0 10px #00ff00;
        }
        .status-message.error {
          color: #ff073a;
          text-shadow: 0 0 10px #ff073a;
        }
        .status-message.loading {
          color: #ffff00;
          text-shadow: 0 0 10px #ffff00;
        }
        .image-neon {
          max-width: 100%;
          border: 4px solid #8a2be2;
          border-radius: 8px;
          box-shadow: 0 0 20px #00ffff;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .image-neon:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px #00ffff;
        }
        @keyframes slideDown {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .slide-down {
          animation: slideDown 1.5s ease-out forwards;
        }
        .neon-text {
          text-shadow: 
            0 0 5px #fff,
            0 0 10px #fff,
            0 0 20px #ff00ff,
            0 0 30px #ff00ff,
            0 0 40px #ff00ff;
        }
      `}</style>

      <Navbar />

      {/* HERO SECTION */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center bg-gray-1000 text-center px-8 md:px-16 relative overflow-hidden pt-20"
      >
        {/* Glow Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-800 rounded-full blur-3xl opacity-40"></div>

        {/* Hero Content */}
        <div className="flex flex-col md:flex-row items-center w-full max-w-7xl z-10">
          {/* Text Content */}
          <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6 mt-18">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-wide transition duration-500 hover:scale-105 hover:text-yellow-300 mt-12">
              Welcome to Virtual Study Group
            </h1>
            <p className="text-white text-lg md:text-xl mt-4 max-w-md md:max-w-lg font-roboto">
              Collaborate with students, share notes, chat in real-time, and
              enhance your learning experience.
            </p>
            <div className="mt-6">
              <a
                href="/signup"
                className="bg-gradient-to-r from-purple-700 via-pink-500 to-pink-900 text-white mt-4 px-8 py-3 rounded-lg shadow-xl transition transform hover:scale-110 hover:border-t-green-500 font-roboto hover:text-white-500 hover:shadow-[0_0_10px_#fff,0_0_15px_#fff,0_0_25px_#fff]"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
            <img
              src={img}
              alt="Study Group"
              className="max-w-full h-auto rounded-lg shadow-2xl transition md:ml-20 md:mt-20 ml-0 mt-0 transform hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <About />

      {/* CONTACT SECTION */}
      <Contact />
    </>
  );
};

export default Home;
