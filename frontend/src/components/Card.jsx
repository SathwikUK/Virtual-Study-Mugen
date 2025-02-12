import React from "react";

const Card = ({ title, subtitle, image, onView, onEdit, onDelete }) => {
  return (
    <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 
      hover:border-purple-500/50 transition-all duration-500 shadow-xl hover:shadow-purple-500/25 
      transform hover:-translate-y-2 group overflow-hidden">
      
      {/* Glowing Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-700/20 to-pink-500/10 opacity-50 
        group-hover:opacity-80 transition-opacity duration-500 blur-xl -z-10" />

      <div className="relative flex flex-col items-center space-y-6">
        {/* Image Container with Neon Border */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 
          shadow-lg shadow-purple-600/40 transition-transform duration-500 group-hover:scale-105">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-700 
              flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{title?.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white tracking-wide">{title}</h3>
          <p className="text-gray-400 text-sm tracking-wide">{subtitle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onView}
            className="px-5 py-2 rounded-lg font-medium text-white shadow-md transition-all 
            duration-300 transform hover:-translate-y-1 hover:shadow-lg 
            bg-gradient-to-r from-purple-600 via-pink-500 to-pink-900 
            hover:shadow-purple-500/50"
          >
            View
          </button>
          <button
            onClick={onEdit}
            className="px-5 py-2 rounded-lg font-medium text-white shadow-md transition-all 
            duration-300 transform hover:-translate-y-1 hover:shadow-lg 
            bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-900 
            hover:shadow-blue-500/50"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-5 py-2 rounded-lg font-medium text-white shadow-md transition-all 
            duration-300 transform hover:-translate-y-1 hover:shadow-lg 
            bg-gradient-to-r from-red-600 to-red-800 hover:shadow-red-500/50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
