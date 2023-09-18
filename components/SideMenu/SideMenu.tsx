import React, { useState } from "react";

import Search from "./Search/Search";
import AnotherMenuContent from "./AnotherMenuContent";

type MenuElements = "search" | "another" | ""

const SideMenu = () => {
  const [selectedItem, setSelectedItem] = useState<MenuElements>("");
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="flex">
      {showMenu && (
        // menu
        <div className="max-w-[160px]">
          {/* search */}
          <div className=" min-w-max">
            {selectedItem !== "search" && (
              <button onClick={(e) => setSelectedItem("search")}>Search</button>
            )}
            {selectedItem === "search" && <Search />}
          </div>
          {/* another item */}
          <div className=" min-w-max">
            {selectedItem !== "another" && (
              <button onClick={(e) => setSelectedItem("another")}>
                Another item
              </button>
            )}
            {selectedItem === "another" && <AnotherMenuContent />}
          </div>
        </div>
      )}
      {/* toggle menu */}
      <div className="flex justify-center items-center">
        <button className="-rotate-90"
          onClick={(e) => setShowMenu((prev) => !prev)}
        >
          Show menu
        </button>
      </div>
    </div>
  );
};

export default SideMenu;
