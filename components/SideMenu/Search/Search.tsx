import { useState } from "react";
import SearchByTag from "./SearchByTag";
import SearchByContent from "./SearchByContent";

// oldalt, fent
// by tag, hierarchical, vertical
// by content, vs code nézet

const Search = () => {
  const [searchBy, setSearchBy] = useState("tag"); // tag, content

  return (
    <div className="max-w-[160px]">
      <div>
        <div onClick={(e) => setSearchBy("tag")}>By tag</div>
        <div onClick={(e) => setSearchBy("content")}>By content</div>
      </div>
      <div>{searchBy === "tag" ? <SearchByTag /> : <SearchByContent />}</div>
    </div>
  );
};

export default Search;
