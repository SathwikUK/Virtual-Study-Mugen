import React from "react";

const DeleteButton = ({ onDelete }) => {
  return (
    <button
      onClick={onDelete}
      className="bg-red-500 text-base text-white py-1 px-3 rounded lg:px-3 lg:py-1  hover:bg-red-600 hover:scale-110 hover:shadow-sm hover:shadow-red-600 transition-transform sm:py-2 sm:px-4 md:py-3 md:px-5"
    >
      Delete
    </button>
  );
};

export default DeleteButton;
