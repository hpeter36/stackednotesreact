"use client"

import React, { useState, useRef, useEffect, useContext } from "react";
import { globalContext } from "./Contexts";

import { ApiResponse } from "@/types";
import { NoteElement } from ".";
import {
  NoteElementInput,
  NoteElementDataDb,
  NoteTagsDataDb,
} from "./NoteElement";

const NoteContainer = () => {
  // !!! cachle obj

  const ctx = useContext(globalContext);
  const { activeRootNodeId, setActiveRootNodeId } = ctx;

  const [rootNotesData, setRootNotesData] = useState<NoteElementInput[]>([]);
  const [notesData, setNotesData] = useState<NoteElementInput[]>([]); // nem túl performant megoldás

  const tempId = useRef(-2);

  useEffect(() => {
    const init = async () => {
      // get all notes
      // !!! elég lassan kezdi el tölteni a useffect sokáig tart
      let respData: ApiResponse = await fetch(
        `/api/get_notes?from_note_id=${activeRootNodeId}`,
        { method: "GET" }
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
          tags: [],
          childrenElements: [], // will be set in next step
          parentActions: null, // will be set in NoteElement
        };
      });

      // get tags from db
      respData = await fetch(
        `/api/get_all_tags_from_id?from_note_id=${activeRootNodeId}`, {method: 'GET'}
      ).then((resp) => resp.json());
      const allTagsDb = respData.data as NoteTagsDataDb[];

      // fill the tags
      for (let i = 0; i < noteDataTemp.length; i++) {
        noteDataTemp[i].tags = allTagsDb
          .filter((d) => d.note_id === noteDataTemp[i].id)
          .map((d) => d.tag_name);
      }

      // flat arry to hierarchical, fill childrenElements
      for (let i = 0; i < noteDataTemp.length; i++) {
        noteDataTemp[i].childrenElements = noteDataTemp.filter(
          (d) => d.parentId === noteDataTemp[i].id
        );
      }

      //console.log(noteDataTemp);

      setNotesData(noteDataTemp);

      // set the data of the root element
      setRootNotesData([
        {
          id: noteDataTemp[0].id, // activeRootNodeId
          parentId: noteDataTemp[0].parentId, // -1
          title: noteDataTemp[0].title,
          actLevel: 0,
          parentOrder: 0,
          tags: noteDataTemp[0].tags,
          childrenElements: noteDataTemp[0].childrenElements,
          parentActions: null,
        },
      ]);
    };
    activeRootNodeId !== -1 && init();
  }, [activeRootNodeId]);

  // --------------events
  // click on add new note button, add note to root
  const onClickAddNewNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    setRootNotesData((prev) => [
      ...prev,
      {
        id: tempId.current - 1,
        parentId: activeRootNodeId,
        title: "",
        actLevel: 0,
        parentOrder: prev.length,
        tags: [],
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
    <div className="w-full ml-[60px]">
      {/* control panel */}
      <div className="w-full">
        {/* Add new note */}
        <button
          disabled={activeRootNodeId === -1 ? true : false}
          className="bg-blue-300 rounded p-3 text-lg border-2 border-black ml-5"
          onClick={onClickAddNewNote}
        >
          Add new note
        </button>
      </div>
      {/* notes container */}
      <div className="w-full max-h-screen overflow-scroll">
        {rootNotesData.length > 0 &&
          rootNotesData.map((d) => (
            <NoteElement
              key={d.id}
              id={d.id}
              parentId={d.parentId}
              parentOrder={d.parentOrder}
              title={d.title}
              actLevel={d.actLevel}
              tags={d.tags}
              childrenElements={notesData}
              parentActions={d.parentActions}
            />
          ))}
      </div>
    </div>
  );
};

export default NoteContainer;
