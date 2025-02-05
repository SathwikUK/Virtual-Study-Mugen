import React from "react";

const ViewButton = ({ onView }) => {
  return (
    <button
      onClick={onView}
      className="bg-blue-500 text-base text-white py-1 px-3 rounded lg:px-3 lg:py-1  hover:bg-blue-600 sm:py-2 hover:scale-110 hover:shadow-sm hover:shadow-blue-600 transition-transform sm:px-4 md:py-3 md:px-5"
    >
      View
    </button>
  );
};

export default ViewButton;
