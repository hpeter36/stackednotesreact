import React, { useState, useEffect } from "react";
import { NoteElementDataDb } from "@/components/NoteElement";
import VerticalViewElement from "./VerticalViewElement";

type SearchByTagVerticalViewInputs = {
  notesDataWithSelectedTag: NoteElementDataDb[];
};

const SearchByTagVerticalView = (inputs: SearchByTagVerticalViewInputs) => {
  // ------------------- funcs
  const getInitialDataStruct = (data: NoteElementDataDb[]) => {
    // deep copy
    const modifiedData: NoteElementDataDb[] = JSON.parse(JSON.stringify(data));

    for (let i = 1; i < modifiedData.length; i++) {
      // found direct parents if any
      let parent_id = 0;
      for (let k = 0; k < modifiedData.length; k++) {
        if (modifiedData[k].id === modifiedData[i].parent_id) {
          parent_id = modifiedData[k].id;
        }
      }
      modifiedData[i].parent_id = parent_id;
    }
    return modifiedData;
  };

  // ------------------- vars
  const [selectedParentElem, setSelectedParentElem] =
    useState<NoteElementDataDb>(inputs.notesDataWithSelectedTag[0]);
  const [notesDataWithSelectedTag, setNotesDataWithSelectedTag] = useState(
    getInitialDataStruct(inputs.notesDataWithSelectedTag)
  );

  useEffect(() => {
    if (inputs.notesDataWithSelectedTag !== null)
      setNotesDataWithSelectedTag(inputs.notesDataWithSelectedTag);
  }, [inputs.notesDataWithSelectedTag]);

  // ------------------- events
  const onClickMoveToUpperLevel = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (selectedParentElem.id !== 0)
      setSelectedParentElem(
        notesDataWithSelectedTag.find(
          (d) => d.id === selectedParentElem.parent_id
        )!
      );
  };

  // ------------------- parent actions
  const navigateDown = (noteId: number) => {
    if (
      notesDataWithSelectedTag.findIndex((d) => d.parent_id === noteId) !== -1
    )
      setSelectedParentElem(
        notesDataWithSelectedTag.find((d) => d.id === noteId)!
      );
  };

  const twHeaderStyle =
    selectedParentElem.note === ""
      ? "hidden"
      : "bg-blue-300 hover:bg-blue-500 p-2 border-b-2 flex justify-between";

  return (
    <div>
      {/* header with selected parent */}
      <div className={twHeaderStyle}>
        <span onClick={onClickMoveToUpperLevel}>{selectedParentElem.note}</span>
        <span>{"<"}</span>
      </div>
      {/* element list with selected parent */}
      <div>
        {notesDataWithSelectedTag
          .filter((d) => d.parent_id === selectedParentElem.id)
          .map((d, i) => (
            <VerticalViewElement
              key={i}
              noteDataDb={d}
              parentActions={{ navigateDown: navigateDown }}
            />
          ))}
      </div>
    </div>
  );
};

export default SearchByTagVerticalView;
