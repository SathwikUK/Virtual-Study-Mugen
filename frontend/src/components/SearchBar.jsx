import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    // <div className="mb-4 mt-4 w-11/12 scale-x-90 outline outline-slate-300 rounded focus:outline-red-500  ">
    <div className="mb-4 mt-4 w-11/12 scale-x-90 rounded border border-slate-600 ">
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
    </div>
  );
};

export default SearchBar;
