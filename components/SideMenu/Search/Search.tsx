import { useState } from "react";
import SearchByTag from "./SearchByTag";
import SearchByContent from "./SearchByContent";

// oldalt, fent
// by tag, hierarchical, vertical
// by content, vs code nézet

const Search = () => {
  const [searchBy, setSearchBy] = useState("tag"); // tag, content

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className={`${searchBy === "tag" && "bg-blue-500 text-white"} hover:bg-blue-500 hover:text-white flex-grow p-5 flex items-center justify-center`} onClick={(e) => setSearchBy("tag")}><span>By tag</span></div>
        <div className={`${searchBy !== "tag" && "bg-blue-500 text-white"} hover:bg-blue-500 hover:text-white flex-grow p-5 flex items-center justify-center`} onClick={(e) => setSearchBy("content")}><span>By content</span></div>
      </div>
      <div>{searchBy === "tag" ? <SearchByTag /> : <SearchByContent />}</div>
    </div>
  );
};

export default Search;
