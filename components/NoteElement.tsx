"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { globalContext } from "./Contexts";

import {
  FaPlus,
  FaPen,
  FaAngleDown,
  FaAngleUp,
  FaWindowClose,
} from "react-icons/fa";

type NoteElementInput = {
  id: number;
  title: string;
  childrenElements: NoteElementInput[];
  parentActions: {
    removeElementWithId: (noteId: number) => void;
    newElementEndEdit: () => void;
  } | null;
};

type NoteElemData = {
  id: number;
  node: React.ReactNode;
};

/* 
ha van child, az üres title content nem megengedett
lehetőleg csak hideoljuk a dolgokat ne újra csináljuk
*/

let c = 0;

const NoteElement = (inputs: NoteElementInput) => {
  const [noteChildElements, setNoteChildElements] = useState<NoteElemData[]>(
    []
  );
  const [addedNoteText, setAddedNoteText] = useState(inputs.title);
  const [selected, setSelected] = useState(false);
  const [isOnEdit, setIsOnEdit] = useState(() =>
    inputs.title === "" ? true : false
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  // add new child element state -> shows editable element component
  const [isAddNewElement, setIsAddNewElement] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // selected elem
  const { selectedId, setSelectedID } = useContext(globalContext);

  // init
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // elem selected or deselected event
  useEffect(() => {
    selectedId === inputs.id ? setSelected(true) : setSelected(false);
  }, [selectedId]);

  // when edit element text, focus on it
  useEffect(() => {
    if (isOnEdit) inputRef.current!.focus();
  }, [isOnEdit]);

  // -----------------------events
  // add new element
  const unFocusInputEvent = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 0) {
      setIsOnEdit(false);
      setIsAddNewElement(false);
      if (inputs.parentActions) {
        inputs.parentActions.newElementEndEdit();
      }
    }
    // cancel this element if no content, remove from its parent
    else {
      // cannot delete empty note if it has children
      if (noteChildElements.length > 0) {
        // mark with red border !!!
      } else {
        if (inputs.parentActions) {
          inputs.parentActions.removeElementWithId(inputs.id);
        }
      }
    }
  };

  // element selected or unselected event
  const onClickElementEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const isSelected = !selected;

    // set context
    setSelectedID(isSelected ? inputs.id : -1);
  };

  //add new empty note element, "+" clicked
  const onClickPlusIconEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    // add to element data list !!! not the final data values

    !isAddNewElement &&
      setNoteChildElements((prev) => [
        ...prev,
        {
          id: c,
          node: (
            <NoteElement
              id={c}
              key={prev.length}
              title=""
              childrenElements={[]}
              parentActions={{
                removeElementWithId: removeElementWithId,
                newElementEndEdit: newElementEndEdit,
              }}
            />
          ),
        },
      ]);

    setIsAddNewElement(true);

    c += 1;
  };

  const onClickEditEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsOnEdit(true);
  };

  const onClickCollapseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsCollapsed((prev) => !prev);
  };

  const onClickDeleteEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (confirm("Are you sure you want to delete?")) {
      if (inputs.parentActions)
        inputs.parentActions?.removeElementWithId(inputs.id);
    }
  };

  // ----------------------- parent events
  const removeElementWithId = (noteId: number) => {
    setNoteChildElements((prev) => prev.filter((e) => e.id !== noteId));
    setIsAddNewElement(false);
  };

  const newElementEndEdit = () => {
    setIsAddNewElement(false);
  };

  return (
    <div className="pl-5">
      {/* edit,insert note, note text  */}
      <div className={selected ? "bg-red-500 flex" : "bg-blue-300 flex"}>
        <div onClick={onClickElementEvent}>
          <textarea
            className={isOnEdit ? "block" : "hidden"}
            ref={inputRef}
            value={addedNoteText}
            placeholder="Add new note"
            onClick={(e) => e.stopPropagation()}
            onBlur={unFocusInputEvent}
            onChange={(e) => setAddedNoteText(e.target.value)}
          />

          <div className={!isOnEdit ? "p-5" : "hidden p-5"}>
            <span>{addedNoteText}</span>
          </div>
        </div>
        {/* element control panel */}
        <div className="flex justify-center items-center gap-5">
          <FaPlus className="w-6 h-6" onClick={onClickPlusIconEvent} />
          <FaPen className="w-6 h-6" onClick={onClickEditEvent} />
          {isCollapsed ? (
            <FaAngleDown className="w-6 h-6" onClick={onClickCollapseEvent} />
          ) : (
            <FaAngleUp className="w-6 h-6" onClick={onClickCollapseEvent} />
          )}
          <FaWindowClose className="w-6 h-6" onClick={onClickDeleteEvent} />
        </div>
      </div>

      {/* note children */}
      <div className={isCollapsed ? "hidden" : "block"}>
        {noteChildElements.map((d, i) => d.node)}
      </div>
    </div>
  );
};

export default NoteElement;
