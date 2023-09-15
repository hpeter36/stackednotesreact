import React, { useState, useRef, useEffect } from "react";

import { ApiResponse } from "@/types";
import { NoteElement } from ".";
import { NoteElementInput, NoteElementDataDb } from "./NoteElement";

const NoteContainer = () => {
  // esetleg itt lehet majd az aktuális root element id-t menteni amitől épp betöltjük a nodeokat
  // "add new note" az aktuális kiválasztáshoz ad hozzá
  const rootNodeId = 0;
  const rootNodeParentId = -1;

  const [rootNotesData, setRootNotesData] = useState<NoteElementInput[]>([]);
  const [notesData, setNotesData] = useState<NoteElementInput[]>([]); // nem túl performant megoldás

  const tempId = useRef(-2);

  useEffect(() => {
    const init = async () => {
      // get all notes
      // !!! elég lassan kezdi el tölteni a useffect sokáig tart
      let respData: ApiResponse = await fetch(
        `/api/get_notes?from_note_id=${rootNodeId}`
      ).then((resp) => resp.json());

      // get db data
      const notesDb = respData.data as NoteElementDataDb[];
      //console.log(notesDb);

      // dbData -> NoteElementInput
      const noteDataTemp: NoteElementInput[] = notesDb.map((noteDb) => {
        return {
          id: noteDb.id,
          parentId: noteDb.parent_id,
          title: noteDb.note,
          actLevel: 0, // will be set in NoteElement
          parentOrder: 0, // will be set in NoteElement
          childrenElements: [], // will be set in next step
          parentActions: null, // will be set in NoteElement
        };
      });

      // flat arry to hierarchical, fill childrenElements
      for (let i = 0; i < noteDataTemp.length; i++) {
        noteDataTemp[i].childrenElements = noteDataTemp.filter(
          (d) => d.parentId === noteDataTemp[i].id
        );
      }

      //console.log(noteDataTemp);

      setNotesData(noteDataTemp);

      // set the data of the root element
      setRootNotesData((prev) => [
        ...prev,
        {
          id: rootNodeId,
          parentId: rootNodeParentId,
          title: "root",
          actLevel: 0,
          parentOrder: 0,
          childrenElements: [], // will be filled later
          parentActions: null,
        },
      ]);
    };
    init();
  }, []);

  // --------------events
  // click on add new note button, add note to root
  const onClickAddNewNote = () => {
    setRootNotesData((prev) => [
      ...prev,
      {
        id: tempId.current - 1,
        parentId: rootNodeId,
        title: "",
        actLevel: 0,
        parentOrder: prev.length,
        childrenElements: [],
        parentActions: {
          removeElementWithId: removeElementWithId,
          updateElementDataAtIdx: updateElementDataAtIdx,
          newElementEndEdit: () => {},
        },
      },
    ]);

    tempId.current -= 1;
  };

  // ------------------- parent events

  const updateElementDataAtIdx = (
    parentOrderId: number,
    elem: NoteElementInput
  ) => {
    const updatedData = rootNotesData;
    updatedData[parentOrderId] = elem;
  };

  const removeElementWithId = (noteId: number) => {
    setRootNotesData((prev) => prev.filter((e) => e.id !== noteId));
    // delete from db too !!!
  };

  return (
    <div>
      {/* control panel */}
      <div>
        <button
          className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5"
          onClick={onClickAddNewNote}
        >
          Add new note
        </button>
      </div>
      {/* notes container */}
      <div>
        {rootNotesData.length > 0 &&
          rootNotesData.map((d) => (
            <NoteElement
              key={d.id}
              id={d.id}
              parentId={d.parentId}
              parentOrder={d.parentOrder}
              title={d.title}
              actLevel={d.actLevel}
              childrenElements={notesData}
              parentActions={d.parentActions}
            />
          ))}
      </div>
    </div>
  );
};

export default NoteContainer;
