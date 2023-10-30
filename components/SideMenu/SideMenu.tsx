"use client";

import React, { useState, useContext, createContext } from "react";

import Search from "./Search/Search";
import { NoteElementImport } from "@/components";
import { globalContext } from "../Contexts";

type MenuElements = "search" | "browser" | "import_notes" | "";

type SideMenuContextData = {
  closeSideMenu: ()  => void
}

const defaultSideMenuConextData:SideMenuContextData = {
  closeSideMenu: () => {}
}

export const sideMenuContext = createContext<SideMenuContextData>(defaultSideMenuConextData)

type SideMenuInput = {
  initialStateOpened: boolean
}

const SideMenu = (inputs: SideMenuInput) => {
  const [selectedItem, setSelectedItem] = useState<MenuElements>("browser");
  const [showMenu, setShowMenu] = useState(inputs.initialStateOpened);

  const ctx = useContext(globalContext);
  const { activeRootNodeId, setActiveRootNodeId } = ctx;

  const onClickBrowser = (e: React.MouseEvent<HTMLButtonElement>) => {
    // trigger container to load elements from root with collapsed state and lazy loading mode
    if (activeRootNodeId !== 0) setActiveRootNodeId(0);

    setSelectedItem("browser");
    closeSideMenu()
  };

  const closeSideMenu = () => {
    setShowMenu(false);
  }

  return (
    <sideMenuContext.Provider value={{closeSideMenu:closeSideMenu}}>
    <div className={`flex absolute bg-blue-100 h-full max-w-[600px]`}>
      {showMenu && (
        // menu
        <div className="flex flex-col gap-2 justify-center mr-2">
          {/* browser */}
          <div>
            <button
              className={`${
                selectedItem === "browser" ? "bg-blue-500" : "bg-blue-300"
              } hover:bg-blue-500 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]`}
              onClick={onClickBrowser}
            >
              Browser
            </button>
          </div>
          {/* search */}
          <div>
            {selectedItem !== "search" && (
              <button
                className="bg-blue-300 hover:bg-blue-500 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]"
                onClick={(e) => setSelectedItem("search")}
              >
                Search
              </button>
            )}
            {selectedItem === "search" && <Search />}
          </div>
          {/* import notes */}
          <div>
            {selectedItem !== "import_notes" && (
              <button
                className="bg-blue-300 hover:bg-blue-500 rounded p-3 text-lg border-2 border-black ml-5 w-[200px]"
                onClick={(e) => setSelectedItem("import_notes")}
              >
                Import Notes
              </button>
            )}
            {selectedItem === "import_notes" && <NoteElementImport />}
          </div>
        </div>
      )}
      {/* toggle menu */}
      <div className={`flex justify-center items-center h-full bg-blue-200`}>
        <button
          className="w-[60px] -rotate-90"
          onClick={(e) => setShowMenu((prev) => !prev)}
        >
          {showMenu ? "Hide" : "Show"} menu
        </button>
      </div>
    </div>
    </sideMenuContext.Provider>
  );
};

export default SideMenu;
