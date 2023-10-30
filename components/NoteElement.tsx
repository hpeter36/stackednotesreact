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
  parent_id: number;
  note: string;
  note_order: number;
  depth_l: number;
  child_c: number;
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
  childCount: number;
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
  behaviour: {
    indentTwSize: string;
    isInitialCollapsed: boolean;
    isLazyLoadingChildren: boolean;
    isPreviewMode?: boolean;
  };
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
  const [isCollapsed, setIsCollapsed] = useState(() =>
    inputs.behaviour.isInitialCollapsed ? true : false
  );
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
    activeRootNodeId,
    setActiveRootNodeId,
  } = ctx;

  // ----------------------- hooks

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

  // -----------------------functions
  const getNoteCountDb = () => {
    return noteChildElementsData.length > 0
      ? noteChildElementsData.length
      : inputs.childCount;
  };

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
      if (getNoteCountDb() > 0) {
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
          childCount: 0,
          tags: [],
          childrenElements: [],
          parentActions: {
            removeElementWithId: removeElementDataWithId,
            updateElementDataAtIdx: updateElementDataAtIdx,
            newElementEndEdit: newElementEndEdit,
          },
          behaviour: {
            indentTwSize: "pl-5",
            isInitialCollapsed: true,
            isLazyLoadingChildren: false,
          },
        },
      ]);

    setIsAddNewElement(true);

    c += 1;
  };

  const onClickEditEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsOnEdit(true);
  };

  const onClickCollapseEvent = async (e: React.MouseEvent<HTMLDivElement>) => {
    // ha eleve nem 0 a child count a db prefetch érték, level, depth child count + input !!!

    // fetch children if
    if (
      isCollapsed && //  we expand the item
      inputs.childCount > 0 && // we have children according to db
      noteChildElementsData.length == 0 && //  we have 0 child in our component loaded
      inputs.behaviour.isLazyLoadingChildren //  and is in lazy loading mode
    ) {
      const f = async () => {
        // fetch element data
        let respData: ApiResponse = await fetch(
          `/api/get_notes?from_note_id=${inputs.id}&depth=1`,
          { method: "GET", cache: "no-store" }
        ).then((resp) => resp.json());
        let notesDb = respData.data as NoteElementDataDb[];

        // exclude the current component
        notesDb = notesDb.filter((note) => note.id !== inputs.id);

        // dbData -> NoteElementInput
        const noteDataTemp: NoteElementInput[] = notesDb.map((noteDb, i) => {
          return {
            id: noteDb.id,
            parentId: noteDb.parent_id,
            title: noteDb.note,
            actLevel: noteDb.depth_l,
            parentOrder: noteDb.note_order,
            childCount: noteDb.child_c,
            tags: [], // in next step
            childrenElements: [],
            parentActions: {
              removeElementWithId: removeElementDataWithId,
              updateElementDataAtIdx: updateElementDataAtIdx,
              newElementEndEdit: newElementEndEdit,
            },
            behaviour: {
              indentTwSize: "pl-5",
              isInitialCollapsed: true,
              isLazyLoadingChildren: true,
            },
          };
        });

        // fetch tags
        respData = await fetch(
          `/api/get_all_tags_from_id?from_note_id=${inputs.id}&depth=1`,
          { method: "GET" }
        ).then((resp) => resp.json());
        const allTagsDb = respData.data as NoteTagsDataDb[];

        // fill the tags
        for (let i = 0; i < noteDataTemp.length; i++) {
          noteDataTemp[i].tags = allTagsDb
            .filter((d) => d.note_id === noteDataTemp[i].id)
            .map((d) => d.tag_name);
        }

        // set in state
        setNoteChildElementsData(noteDataTemp);
      };
      await f();
    }

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

      // if this was selected, unselect
      if (inputs.id === selectedNoteElementData?.id)
        setSelectedNoteElementData(null);

      // trigger to clear container if this was the root elem
      if (inputs.id === activeRootNodeId) setActiveRootNodeId(0);
    }
  };

  const showNoteElementActionsEvent = (e: React.MouseEvent) => {
    setIsElementActionsVisible(true);
  };

  const hideNoteElementActionsEvent = (e: React.MouseEvent) => {
    setIsElementActionsVisible(false);
  };

  // to TagManager input
  const addTagToNote = async (tagName: string) => {
    // tag is not in element
    if (tags.indexOf(tagName) === -1) {
      // add tag to db and increment the counter by 1
      const f = async () => {
        const respData: ApiResponse = await fetch(`/api/add_tag_to_note`, {
          method: "POST",
          body: JSON.stringify({
            note_id: inputs.id,
            tag_name: tagName,
          }),
        }).then((resp) => resp.json());
      };
      await f();

      // add tag to state
      setTags((prev) => [...prev, tagName]);

      setNoteTagsChanged(true);
    }
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

  const isPreviewMode =
    inputs.behaviour.isPreviewMode !== undefined
      ? inputs.behaviour.isPreviewMode
      : false;

  const twHeaderBg = selected
    ? isPreviewMode
      ? "bg-blue-300"
      : "bg-red-500"
    : getNoteCountDb() > 0 && isCollapsed
    ? "bg-blue-400"
    : "bg-blue-300";
  const twHeaderVisibility =
    inputs.id === 0 ? (isPreviewMode ? "block" : "hidden") : "block";

  return (
    <div
      className={inputs.parentId === 0 ? "pl-5" : inputs.behaviour.indentTwSize}
    >
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

          <div className={`flex flex-col p-1 ${isOnEdit && "hidden"}`}>
            {/* note text */}
            <div>
              <span>{addedNoteText}</span>
            </div>
            {/* --- debug */}
            {/* <div className="flex justify-around">
              <span>id {inputs.id}</span>
              <span>parentId {inputs.parentId}</span>
              <span>(childs {getNoteCountDb()})</span>
              <span>p.order {inputs.parentOrder}</span>
              <span>actLevel {inputs.actLevel}</span>
            </div> */}

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
            parentActions={{ addTagToNote: addTagToNote }}
          />
          {/* child count when collapsed */}
          {isCollapsed && <span>({getNoteCountDb()})</span>}
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
            actLevel={d.actLevel} // inputs.actLevel + 1
            parentOrder={d.parentOrder} // i
            childCount={d.childCount}
            tags={d.tags}
            childrenElements={d.childrenElements}
            parentActions={{
              removeElementWithId: removeElementDataWithId,
              updateElementDataAtIdx: updateElementDataAtIdx,
              newElementEndEdit: newElementEndEdit,
            }}
            behaviour={d.behaviour}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteElement;
