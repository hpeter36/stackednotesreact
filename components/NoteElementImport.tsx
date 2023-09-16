"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { globalContext } from "./Contexts";
import NoteElement, {
  NoteElementDataDb,
  NoteElementInput,
} from "./NoteElement";
import { ApiResponse } from "@/types";

const NoteElementImport = () => {
  const [textCont, setTextCont] = useState("");
  const [notesData, setNotesData] = useState<NoteElementInput[]>([]);
  const ctx = useContext(globalContext);
  const { selectedNoteElementData, setSelectedNoteElementData } = ctx;

  //const [appendToRoot, setAppendToRoot] = useState(false);
  const appendToRoot = useRef(false);
  const rootElemId = useRef(0);

  // parent node is selected/changed
  useEffect(() => {
    if (selectedNoteElementData)
      rootElemId.current = selectedNoteElementData.id;
    if (!selectedNoteElementData) rootElemId.current = 0;
  }, [selectedNoteElementData]);

  function getTabCount(row: string) {
    let c = 0;

    if (row != undefined) {
      for (const ch of row) {
        if (ch == "\t") c = c += 1;
        else return c;
      }
    }
    return c;
  }

  const onClickPreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    // no selected parent
    if (!appendToRoot.current && !selectedNoteElementData) {
      alert("Error when importing notes, no parent element is selected!");
      return;
    }

    // 0 elements
    if (textCont === "") {
      alert("Error when importing notes, no content is specified!");
      return;
    }

    // split content to rows
    let rows = textCont.split("\n");

    //filter out empty rows
    rows = rows.filter((d) => !RegExp("^[^a-zA-Z0-9]*$").test(d));
    if (rows.length == 0) return;

    // check for first row tab count
    const tabCountBase = getTabCount(rows[0]);
    // if (getTabCount(rows[0]) != 0) {
    //   alert("The first row shouldn't contain any tab");
    //   return;
    // }

    //const toRepl = "\t".repeat(tabCountBase);
    if (tabCountBase > 0) {
      rows = rows.map((d) => d.substring(tabCountBase, d.length));
    }

    // core logic
    const idStartNum = -2;

    const notesDataArr: NoteElementInput[] = [];
    let prevLevel = 0;
    let actLevel = 0;
    let actParentId = rootElemId.current;
    let parentIdAtLevelArr = Array(100).fill(rootElemId.current); // max 100 levels(tabs)
    // parentIdAtLevelArr[0] = selectedNoteElementData?.id;
    for (let i = 0; i < rows.length; i++) {
      actLevel = getTabCount(rows[i]) + 1;
      actParentId = parentIdAtLevelArr[actLevel - 1];

      // remove tabs from actual row
      const r = rows[i].replace("\t", "");

      const actId = idStartNum - i;

      notesDataArr.push({
        id: actId,
        parentId: actParentId!,
        title: r,
        actLevel: actLevel,
        parentOrder: 0,
        tags: [],
        childrenElements: [],
        parentActions: null,
      });

      //console.log(`id ${i} p_id ${actParentId} lvl. ${actLevel} ${r}`);

      // check for correct tabbing
      if (Math.abs(actLevel - prevLevel) > 1) {
        alert(
          "invalid data structure only one tab increment or decrement is allowed"
        );
        alert(`at: ${r}`);
        return;
      }

      let newNoteId = actId;
      parentIdAtLevelArr[actLevel] = newNoteId;
      prevLevel = actLevel;
    }

    // flat arry to hierarchical, fill childrenElements
    for (let i = 0; i < notesDataArr.length; i++) {
      notesDataArr[i].childrenElements = notesDataArr.filter(
        (d) => d.parentId === notesDataArr[i].id
      );
    }

    setNotesData(notesDataArr);

    console.log("notesDataArr");
    console.log(notesDataArr);
  };

  // apply/start import
  const onClickApprove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const f = async () => {
      
      // init
      const addedIdsToDb: { idTmp: number; idDb: number }[] = [
        { idTmp: rootElemId.current, idDb: rootElemId.current },
      ];

      // process parents(1st level)
      for (const noteParent of notesData) {
        // insert to db if not already
        if (addedIdsToDb.findIndex((d) => d.idTmp === noteParent.id) === -1) {
          const parentId = addedIdsToDb.find(
            (d) => d.idTmp === noteParent.parentId
          );
          if (!parentId){
            console.error(
              `Error when inserting notes to db, db parent id cannot be retrieved from tmp parent id(${noteParent.parentId})`
            );
            return
          }

          const respData: ApiResponse = await fetch(
            `/api/add_edit_note_element?parent_id=${parentId.idDb}&note=${noteParent.title}`
          ).then((resp) => resp.json());
          const noteDb = respData.data as NoteElementDataDb;
          addedIdsToDb.push({ idTmp: noteParent.id, idDb: noteDb.id });
        }

        // process parents(2nd level)
        for (const noteChild of noteParent.childrenElements) {
          // insert to db if not already
          if (addedIdsToDb.findIndex((d) => d.idTmp === noteChild.id) === -1) {
            const parentId = addedIdsToDb.find(
              (d) => d.idTmp === noteChild.parentId
            );
            if (!parentId){
              console.error(
                `Error when inserting notes to db, db parent id cannot be retrieved from tmp parent id(${noteChild.parentId})`
              );
              return
            }
  
            const respData: ApiResponse = await fetch(
              `/api/add_edit_note_element?parent_id=${parentId.idDb}&note=${noteChild.title}`
            ).then((resp) => resp.json());
            const noteDb = respData.data as NoteElementDataDb;
            addedIdsToDb.push({ idTmp: noteChild.id, idDb: noteDb.id });
          }
        }
      }
    };
    f();

    window.location.reload()

    //setTextCont("");
    //setNotesData([]);
  };

  // change "Append to root node" option
  const onChangeAppendToRootCbx = (e: React.ChangeEvent<HTMLInputElement>) => {
    appendToRoot.current = e.currentTarget.checked;
    if (appendToRoot.current) rootElemId.current = 0;
    // if unchecked, set the selected element id if it is selected
    if (!appendToRoot.current && selectedNoteElementData)
      rootElemId.current = selectedNoteElementData.id;
  };

  return (
    <div className="w-full flex justify-center items-center mt-10">
      <div className="w-5/6 h-[500px]">
        {/* input area */}
        <textarea
          className="w-full h-full"
          onChange={(e) => setTextCont(e.target.value)}
          value={textCont}
        />
        {/* control panel */}
        <div>
          <input
            id="append_to_root_cbx"
            type="checkbox"
            onChange={onChangeAppendToRootCbx}
          />
          <label htmlFor="append_to_root_cbx">Append to root node</label>
          <button
            className="bg-blue-300 rounded p-3 text-lg border-2 border-black"
            onClick={onClickPreview}
          >
            Preview
          </button>
          {notesData.length > 0 && (
            <button
              className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5"
              onClick={onClickApprove}
            >
              Approve
            </button>
          )}
        </div>
        {/* preview */}
        <div>
          <div className="absolute w-full h-full z-10 bg-transparent"></div>
          {notesData.length > 0 && (
            <NoteElement
              id={rootElemId.current}
              parentId={-80}
              title={
                appendToRoot.current
                  ? "root element"
                  : selectedNoteElementData!.title
              }
              actLevel={0}
              parentOrder={0}
              tags={[]}
              childrenElements={notesData}
              parentActions={null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteElementImport;
