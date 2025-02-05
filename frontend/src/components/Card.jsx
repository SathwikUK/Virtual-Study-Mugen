import React from "react";
import ViewButton from "../components/ViewButton";
import DeleteButton from "../components/DeleteButton";

const Card = ({ title, subtitle, onView, onEdit, onDelete }) => {
  return (
    <div className="h-fit w-screen  xl:w-11/12 bg-white shadow-md rounded-lg p-3 mb-1 mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-600 hover:shadow-md hover:shadow-slate-600 transition-transform">
      {/* Flex container for aligning details */}
      <div className=" md:mx-8 lg:mx-10 mb-3 md:mb-0">
        {/* Title and subtitle container */}
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      {/* Buttons container */}
      <div className="flex flex-row md:flex-row w-full md:w-auto justify-start md:justify-end space-x-2 md:space-x-4">
        <ViewButton onView={onView} />
        <DeleteButton onDelete={onDelete} />
      </div>
    </div>
  );
};

export default Card;
