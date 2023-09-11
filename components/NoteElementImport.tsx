"use client";

import React, { useState, useContext } from "react";
import { globalContext } from "./Contexts";

const NoteElementImport = () => {
  const [textCont, setTextCont] = useState("");

  const { selectedId, setSelectedID } = useContext(globalContext);

  const onClickPreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    // no selected parent
    if (selectedId === -1) {
      alert("Error when importing notes, no parent element is selected!");
      return;
    }

    // 0 elements
	if (textCont === "") {
		alert("Error when importing notes, no content is specified!");
      return;
	} 

    // split content to rows
    
	//filter out empty rows
    // check for first row tab count
    // core logic
    // tabokat mutató nézet?
  };

  return (
    <div className="w-full flex justify-center items-center mt-10">
      <div className="w-5/6 h-[500px]">
        <textarea
          className="w-full h-full"
          onChange={(e) => setTextCont(e.target.value)}
          value={textCont}
        />
        <button
          className="bg-blue-300 rounded p-3 text-lg border-2 border-black"
          onClick={onClickPreview}
        >
          Preview
        </button>
        <div>{/* preview */}</div>
      </div>
    </div>
  );
};

export default NoteElementImport;
