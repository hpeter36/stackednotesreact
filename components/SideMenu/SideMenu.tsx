import React, { useState } from "react";

import Search from "./Search";
import ImportNotes from "./ImportNotes";

const SideMenu = () => {
  const [selectedItem, setSelectedItem] = useState("");

  return (
    <div>
      {/* search */}
      <div>
        {selectedItem !== "search" && (
          <button onClick={(e) => setSelectedItem("search")}>Search</button>
        )}
        {selectedItem === "search" && <Search />}
      </div>
      <div>
        {selectedItem !== "import_notes" && (
          <button onClick={(e) => setSelectedItem("import_notes")}>
            Import notes
          </button>
        )}
        {selectedItem === "import_notes" && <ImportNotes />}
      </div>
    </div>
  );
};

export default SideMenu;
