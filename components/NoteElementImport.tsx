"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { globalContext } from "./Contexts";
import NoteElement, {
  NoteElementDataDb,
  NoteElementInput,
} from "./NoteElement";
import { ApiResponse } from "@/types";
import { useSession } from "next-auth/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const NoteElementImport = () => {
  const [textCont, setTextCont] = useState("");
  const [notesData, setNotesData] = useState<NoteElementInput[]>([]);
  const ctx = useContext(globalContext);
  const { selectedNoteElementData, setActiveRootNodeId } = ctx;

  const { data: session, status } = useSession();

  //const [appendToRoot, setAppendToRoot] = useState(false);
  const appendToRoot = useRef(false);
  const rootElemId = useRef(0);

  // parent node is selected/changed -> set root note id
  useEffect(() => {
    // note selected
    if (selectedNoteElementData)
      rootElemId.current = selectedNoteElementData.id;

    // note is not selected -> 0 root node id
    if (!selectedNoteElementData) rootElemId.current = 0;
  }, [selectedNoteElementData]);

  // -----------funcs

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

  // -----------events

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
      // if (Math.abs(actLevel - prevLevel) > 1) {
      //   alert(
      //     "invalid data structure only one tab increment or decrement is allowed"
      //   );
      //   alert(`at: ${r}`);
      //   return;
      // }

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
      const respData: ApiResponse = await fetch(`/api/import_notes`, {
        method: "POST",
        body: JSON.stringify({
          rootNoteId: rootElemId.current,
          notesData: notesData,
        }),
      }).then((resp) => resp.json());
      console.log(respData);
    };
    f();

    setActiveRootNodeId(rootElemId.current);

    setTextCont("");
    setNotesData([]);
  };

  // change "Append to root node" option
  const onChangeAppendToRootCbx = (e: React.ChangeEvent<HTMLInputElement>) => {
    // append to root -> root note id = 0
    appendToRoot.current = e.currentTarget.checked;
    if (appendToRoot.current) rootElemId.current = 0;
    // if unchecked, set the selected element id if it is selected
    if (!appendToRoot.current && selectedNoteElementData)
      rootElemId.current = selectedNoteElementData.id;
  };

  function onClickCreateDbBackup() {
    // regular usernek egy feltölthető formátum kell majd amit be tud tölteni ismét

    // table schema
    // sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {

    // ez csak nekem mint adminnak, ha username xxx, egy gombra kattolva
    // fetch api, sequelize all table json ret

    // const [loading, setLoading] = useState(false);

    // setLoading(true);
    try {
      // get data
      const f = async () => {
        // get data
        const respData = await fetch(`/api/get_all_db_table_data`, {
          method: "GET",
        }).then((resp) => resp.json());
        const allTagsDb = respData.data as { fn: string; data: any[] }[];

        // make zips
        const zip = new JSZip();
        const remoteZips = allTagsDb.map((d) => {
          zip.file(d.fn, JSON.stringify(d.data));
          return d.data;
        });

        Promise.all(remoteZips)
          .then(() => {
            zip.generateAsync({ type: "blob" }).then((content) => {
              saveAs(content, "db_tables_data.zip");
            });
            //setLoading(false);
          })
          .catch(() => {
            //setLoading(false);
          });
      };
      f();

      //setLoading(false);
    } catch (error) {
      //setLoading(false);
    }
    //};
  }

  return (
    <div className="w-[500px] flex justify-center items-center bg-blue-300">
      <div className="w-5/6">
        {/* input area */}
        <textarea
          className="w-full h-[500px]"
          onChange={(e) => setTextCont(e.target.value)}
          value={textCont}
        />
        {/* control panel */}
        <div>
          {/* append to root cbx */}
          <input
            id="append_to_root_cbx"
            type="checkbox"
            onChange={onChangeAppendToRootCbx}
          />
          <label htmlFor="append_to_root_cbx">Append to root node</label>

          {/* Preview btn */}
          <button
            className="bg-blue-300 rounded p-3 text-lg border-2 border-black"
            onClick={onClickPreview}
          >
            Preview
          </button>

          {/* Approve btn */}
          {notesData.length > 0 && (
            <button
              className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5"
              onClick={onClickApprove}
            >
              Approve
            </button>
          )}
          {session && session.user?.email === "hajdupeter24@gmail.com" && (
            <button
              className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5"
              onClick={onClickCreateDbBackup}
            >
              Create Db. backup
            </button>
          )}
        </div>
        {/* notes preview */}
        {notesData.length > 0 && (
          <NoteElementImportPreview
            appendToRoot={appendToRoot.current}
            rootElemId={rootElemId.current}
            selectedNoteElementData={selectedNoteElementData}
            notesData={notesData}
            parentActions={{
              clearNoteElementsToImport: () => setNotesData([]),
            }}
          />
        )}
      </div>
    </div>
  );
};

type NoteElementImportPreviewInput = {
  appendToRoot: boolean;
  rootElemId: number;
  selectedNoteElementData: NoteElementInput | null;
  notesData: NoteElementInput[];
  parentActions: {
    clearNoteElementsToImport: () => void;
  };
};

// --------------------------------------------------- NoteElementImportPreview

const NoteElementImportPreview = (inputs: NoteElementImportPreviewInput) => {
  //const [notesData, setNotesData] = useState<NoteElementInput[]>(inputs.notesData);
  const [isOpened, setIsOpened] = useState(true);

  // useEffect(() => {
  //   setIsOpened(true)
  // }, [notesData])

  // useEffect(() => {
  //   setNotesData(inputs.notesData)
  //   setIsOpened(true)
  //   console.log("xxx")
  // }, [inputs.notesData])

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ left: 100, top: 100 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const left = e.clientX - offset.x;
    const top = e.clientY - offset.y;

    setPosition({ left, top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const onClickCloseWindow = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsOpened(false);
    inputs.parentActions.clearNoteElementsToImport();
  };

  return (
    <div
      className={isOpened ? "bg-blue-500" : " hidden"}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
      }}
    >
      {/* header */}
      <div
        className="flex h-8 items-center justify-between"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <h2>Note import preview</h2>
        <div
          className="w-8 h-8 text-center text-xl"
          onClick={onClickCloseWindow}
        >
          x
        </div>
      </div>
      {/* notes nodes */}
      <div>
        {/* overlay to disable input */}
        <div className="absolute w-full h-full z-10 bg-transparent"></div>
        {/* note elements */}
        {inputs.notesData.length > 0 && (
          <NoteElement
            id={inputs.rootElemId}
            parentId={-80}
            title={
              inputs.appendToRoot
                ? "root element"
                : inputs.selectedNoteElementData!.title
            }
            actLevel={0}
            parentOrder={0}
            tags={[]}
            childrenElements={inputs.notesData}
            parentActions={null}
          />
        )}
      </div>
    </div>
  );
};

export default NoteElementImport;
