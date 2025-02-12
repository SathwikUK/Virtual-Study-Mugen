import React from "react";

const SearchBar = ({ setSearchQuery }) => {
  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="text"
        placeholder="Search by name or email"
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-6 py-3 bg-gray-900/50 text-white rounded-xl 
        border border-gray-800/50 hover:border-pink-500/30 transition-all duration-300
        backdrop-blur-lg shadow-lg focus:shadow-pink-500/25 focus:outline-none
        placeholder-gray-400"
      />
      <div className="absolute inset-y-0 right-4 flex items-center">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;