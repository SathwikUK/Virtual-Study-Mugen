import React from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-full lg:w-1/6 bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <div className="h-1 border border-white mb-4 bg-white"></div>
      <ul>
        <li
          className={`cursor-pointer text-xl mb-4 p-2 rounded ${
            activeTab === "users" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </li>
        <li
          className={`cursor-pointer text-xl mb-4 p-2 rounded ${
            activeTab === "groups" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
