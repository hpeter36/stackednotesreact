"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { globalContext } from "./Contexts";
import { ApiResponse } from "@/types";
import NoteElementTag from "./NoteElementTag";

import {
  FaPlus,
  FaPen,
  FaAngleDown,
  FaAngleUp,
  FaWindowClose,
  FaFacebook,
} from "react-icons/fa";

import { TagsManager } from ".";

export type NoteElementDataDb = {
  id: number;
  note: string;
  note_order: number;
  parent_id: number;
};

export type NoteTagsDataDb = {
  note_id: number;
  parent_id: number;
  note_order: number;
  tag_name: string;
};

export type NoteElementInput = {
  id: number;
  parentId: number;
  title: string;
  actLevel: number;
  parentOrder: number;
  tags: string[];
  childrenElements: NoteElementInput[];
  parentActions: {
    removeElementWithId: (noteId: number) => void;
    updateElementDataAtIdx: (
      parentOrderId: number,
      elem: NoteElementInput
    ) => void;
    newElementEndEdit: () => void;
  } | null;
};

// helper only  !!!
let c = 0;

const NoteElement = (inputs: NoteElementInput) => {
  // ----------------------- init variables
  const initNoteChildElementsData = () => {
    return inputs.childrenElements.filter((d) => d.parentId === inputs.id);
  };

  // ----------------------- variables
  const [noteChildElementsData, setNoteChildElementsData] = useState<
    NoteElementInput[]
  >(() => initNoteChildElementsData()); // initNoteChildElementsData()
  const [addedNoteText, setAddedNoteText] = useState(inputs.title);
  const [tags, setTags] = useState(inputs.tags);

  const [selected, setSelected] = useState(false);
  const [isOnEdit, setIsOnEdit] = useState(() =>
    inputs.title === "" ? true : false
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isElementActionsVisible, setIsElementActionsVisible] = useState(false);

  // add new child element state -> shows editable element component
  const [isAddNewElement, setIsAddNewElement] = useState(() =>
    inputs.title === "" ? true : false
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // selected elem
  const ctx = useContext(globalContext);
  const {
    selectedNoteElementData,
    setSelectedNoteElementData,
    setNoteTagsChanged,
  } = ctx;

  // init, focus on input
  useEffect(() => {
    if (inputs.title.length === 0 && inputRef.current) inputRef.current.focus();
  }, []);

  // elem selected or deselected event
  useEffect(() => {
    selectedNoteElementData?.id === inputs.id
      ? setSelected(true)
      : setSelected(false);
  }, [selectedNoteElementData]);

  // when edit element text, focus on it
  useEffect(() => {
    if (isOnEdit) inputRef.current!.focus();
  }, [isOnEdit]);

  // -----------------------events
  // add new element
  const unFocusInputEvent = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newTextValue = e.target.value;

    // create/update note element
    if (newTextValue.length > 0) {
      // add new element
      if (isAddNewElement) {
        const f = async () => {
          // db. op.
          const respData: ApiResponse = await fetch(
            `/api/add_edit_note_element`,
            {
              method: "POST",
              body: JSON.stringify({
                parent_id: inputs.parentId,
                note: newTextValue,
              }),
            }
          ).then((resp) => resp.json());
          const insertedNote = respData.data as NoteElementDataDb;

          // update state at parent
          if (inputs.parentActions) {
            inputs.parentActions.updateElementDataAtIdx(inputs.parentOrder, {
              ...inputs,
              id: insertedNote.id,
              title: newTextValue,
            });
          }
        };
        f();
      }
      // update existing element text
      else {
        const f = async () => {
          const respData: ApiResponse = await fetch(
            `/api/add_edit_note_element`,
            {
              method: "POST",
              body: JSON.stringify({
                parent_id: inputs.parentId,
                note: newTextValue,
                note_id: inputs.id,
              }),
            }
          ).then((resp) => resp.json());
        };
        f();
        if (inputs.parentActions) {
          inputs.parentActions.updateElementDataAtIdx(inputs.parentOrder, {
            ...inputs,
            title: newTextValue,
          });
        }
      }

      setIsOnEdit(false);
      setIsAddNewElement(false);
      if (inputs.parentActions) {
        inputs.parentActions.newElementEndEdit();
      }
    }
    // cancel this element if no content, remove from its parent
    else {
      // cannot delete empty note if it has children
      if (noteChildElementsData.length > 0) {
        // mark with red border !!!
      }
      // empty note and no children -> delete from parent
      else {
        if (inputs.parentActions) {
          inputs.parentActions.removeElementWithId(inputs.id);
        }
      }
    }
  };

  // element selected or unselected event
  const SelectNoteElementEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const isSelected = !selected;

    // set context
    setSelectedNoteElementData(
      isSelected
        ? {
            ...inputs,
            title: addedNoteText,
            childrenElements: noteChildElementsData,
          }
        : null
    );
  };

  //add new empty note element, "+" clicked
  const onClickPlusIconEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    !isAddNewElement &&
      setNoteChildElementsData((prev) => [
        ...prev,
        {
          id: c,
          parentId: inputs.id,
          title: "",
          actLevel: inputs.actLevel + 1,
          parentOrder: prev.length,
          tags: [],
          childrenElements: [],
          parentActions: {
            removeElementWithId: removeElementDataWithId,
            updateElementDataAtIdx: updateElementDataAtIdx,
            newElementEndEdit: newElementEndEdit,
          },
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
    if (confirm(`Are you sure you want to delete(${inputs.id})?`)) {
      // delete db op.
      const f = async () => {
        const respData: ApiResponse = await fetch(
          `/api/delete_note_and_sub_notes`,
          {
            method: "DELETE",
            body: JSON.stringify({
              note_id_from: inputs.id,
            }),
          }
        ).then((resp) => resp.json());
      };
      f();

      // remove from state
      if (inputs.parentActions)
        inputs.parentActions?.removeElementWithId(inputs.id);
    }
  };

  const showNoteElementActionsEvent = (e: React.MouseEvent) => {
    setIsElementActionsVisible(true);
  };

  const hideNoteElementActionsEvent = (e: React.MouseEvent) => {
    setIsElementActionsVisible(false);
  };

  // to TagManager input
  const addTagToNote = (tagName: string) => {
    // add tag to note if not present and increment the counter by 1
    const f = async () => {
      const respData: ApiResponse = await fetch(`/api/add_tag_to_note`, {
        method: "POST",
        body: JSON.stringify({
          note_id: inputs.id,
          tag_name: tagName,
        }),
      }).then((resp) => resp.json());
    };
    f();

    // add tag to state
    if (tags.indexOf(tagName) === -1) setTags((prev) => [...prev, tagName]);

    setNoteTagsChanged(true);
  };

  // ----------------------- parent events
  const removeElementDataWithId = (noteId: number) => {
    setNoteChildElementsData((prev) => prev.filter((e) => e.id !== noteId));
    setIsAddNewElement(false);
  };

  const removeElementDataAtIdx = (parentOrderId: number) => {
    setNoteChildElementsData((prev) =>
      prev.filter((e, i) => e.parentOrder !== parentOrderId)
    );
    setIsAddNewElement(false);
  };

  const updateElementDataAtIdx = (
    parentOrderId: number,
    elem: NoteElementInput
  ) => {
    const updatedData = noteChildElementsData;
    updatedData[parentOrderId] = elem;

    setNoteChildElementsData(updatedData);
    setIsAddNewElement(false);
  };

  const newElementEndEdit = () => {
    setIsAddNewElement(false);
  };

  const removeTagPEvent = (tagName: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagName));
    setNoteTagsChanged(true);
  };

  const twHeaderBg = selected ? "bg-red-500" : "bg-blue-300";
  const twHeaderVisibility = inputs.id === 0 ? "none" : "block";

  return (
    <div className={inputs.id === 0 ? "pl-0" : "pl-5"}>
      {/* note header */}
      <div
        className={`flex justify-between ${twHeaderBg} ${twHeaderVisibility} border-gray-800 border-[1px] m-1`}
        onMouseOver={showNoteElementActionsEvent}
        onMouseOut={hideNoteElementActionsEvent}
      >
        {/* add/edit note, tags */}
        <div className="flex-grow" onClick={SelectNoteElementEvent}>
          {/* input field */}
          <textarea
            className={isOnEdit ? "block" : "hidden"}
            ref={inputRef}
            value={addedNoteText}
            placeholder="Add new note"
            onClick={(e) => e.stopPropagation()}
            onBlur={unFocusInputEvent}
            onChange={(e) => setAddedNoteText(e.target.value)}
          />

          <div className={`flex flex-col p-1 ${isOnEdit && "hidden" }`}>
            {/* note text */}
            <div>
              <span>{addedNoteText}</span>
            </div>

            {/* tags with delete button */}
            <div className="flex gap-1">
              {tags.map((d, i) => (
                <NoteElementTag
                  key={i}
                  tagText={d}
                  noteId={inputs.id}
                  parentActions={{ removeTag: removeTagPEvent }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* element control panel */}
        <div
          className={
            isElementActionsVisible
              ? "flex justify-center items-center gap-5"
              : "hidden"
          }
        >
          {/* add, edit, collapse, delete */}
          <FaPlus className="w-6 h-6" onClick={onClickPlusIconEvent} />
          <FaPen className="w-6 h-6" onClick={onClickEditEvent} />
          {isCollapsed ? (
            <FaAngleDown className="w-6 h-6" onClick={onClickCollapseEvent} />
          ) : (
            <FaAngleUp className="w-6 h-6" onClick={onClickCollapseEvent} />
          )}
          <FaWindowClose className="w-6 h-6" onClick={onClickDeleteEvent} />
          <TagsManager
            showTagsByDefCount={5}
            parentActions={{ addTagToNote: addTagToNote }}
          />
          {/* child count when collapsed */}
          {isCollapsed && <span>({noteChildElementsData.length})</span>}

          {/* --- debug */}
          {/* <span>id {inputs.id}</span>
          <span>parentId {inputs.parentId}</span>
          <span>(childs {noteChildElementsData.length})</span>
          <span>p.order {inputs.parentOrder}</span>
          <span>actLevel {inputs.actLevel}</span> */}
        </div>
      </div>

      {/* note children */}
      <div className={isCollapsed ? "hidden" : "block"}>
        {noteChildElementsData.map((d, i) => (
          <NoteElement
            key={d.id}
            id={d.id}
            parentId={d.parentId}
            title={d.title}
            actLevel={inputs.actLevel + 1}
            parentOrder={i}
            tags={d.tags}
            childrenElements={d.childrenElements}
            parentActions={{
              removeElementWithId: removeElementDataWithId,
              updateElementDataAtIdx: updateElementDataAtIdx,
              newElementEndEdit: newElementEndEdit,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteElement;
