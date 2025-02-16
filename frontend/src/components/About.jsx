// About.jsx
import React from "react";
import abvsm from "../assets/abvsm.png"; // About image

const About = () => {
  return (
    <section
      id="about"
      className="min-h-screen relative flex flex-col md:flex-row bg-gradient-to-br from-black via-gray-800 to-purple-900"
    >
      {/* Mobile Background Image */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: `url(${abvsm})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
        }}
      ></div>

      {/* Desktop Image Container */}
      <div className="hidden md:flex md:w-1/2 mt-16 justify-center items-center p-6">
        <img
          src={abvsm}
          alt="About"
          className="max-w-full h-auto rounded-lg shadow-2xl transition md:ml-20 md:mt-20 ml-0 mt-0 transform hover:scale-105"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center p-6 overflow-hidden mt-10">
        <div className="slide-down mt-10">
          <h1 className="text-5xl font-bold neon-text mt-2 mb-6">About Us</h1>
          <p className="text-xl text-gray-200 leading-relaxed mb-8">
            Welcome to our futuristic space where art meets technology. Dive
            into a world of neon dreams and innovative design. We blend modern
            CSS with advanced effects to deliver an immersive visual experience.
          </p>
          <a
            href="download.pdf"
            download
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold rounded-full shadow-[0_0_10px_rgba(138,43,226,0.7)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(138,43,226,1)]"
          >
            Download PDF
          </a>
        </div>
      </div>
    </section>
  );
};

export default About;
