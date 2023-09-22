"use client"

import React, { useState } from "react";

import Search from "./Search/Search";
import {NoteElementImport }from "@/components";
import AnotherMenuContent from "./AnotherMenuContent";

type MenuElements = "search" | "another" | "import_notes" | ""

const SideMenu = () => {
  const [selectedItem, setSelectedItem] = useState<MenuElements>("");
  const [showMenu, setShowMenu] = useState(true);

  return (
    <div className="flex absolute bg-blue-100 h-screen max-w-[600px]">
      {showMenu && (
        // menu
        <div className="flex flex-col gap-2 justify-center">
          {/* search */}
          <div>
            {selectedItem !== "search" && (
              <button className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]" onClick={(e) => setSelectedItem("search")}>Search</button>
            )}
            {selectedItem === "search" && <Search />}
          </div>
          {/* import notes */}
          <div>
            {selectedItem !== "import_notes" && (
              <button className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]" onClick={(e) => setSelectedItem("import_notes")}>
                Import Notes
              </button>
            )}
            {selectedItem === "import_notes" && <NoteElementImport />}
          </div>
          {/* another item */}
          <div className=" min-w-max">
            {selectedItem !== "another" && (
              <button className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]" onClick={(e) => setSelectedItem("another")}>
                Another item
              </button>
            )}
            {selectedItem === "another" && <AnotherMenuContent />}
          </div>
        </div>
      )}
      {/* toggle menu */}
      <div className="flex justify-center items-center h-full">
        <button className="w-[60px] -rotate-90"
          onClick={(e) => setShowMenu((prev) => !prev)}
        >
          {showMenu ? "Hide" : "Show"} menu
        </button>
      </div>
    </div>
  );
};

export default SideMenu;
