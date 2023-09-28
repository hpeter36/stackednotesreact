import React, { useState, createContext, useEffect } from "react";
import { NoteElementInput } from "../NoteElement";
import { ApiResponse } from "@/types";

export type TagDefData = {
  name: string;
  usage_count: number;
};

type GlobalContextData = {
  selectedNoteElementData: NoteElementInput | null;
  setSelectedNoteElementData: (
    noteData: NoteElementInput | null
  ) => void | null;
  tagDefs: TagDefData[];
  addNewTagDef: (tagDefData: TagDefData) => void;
  activeRootNodeId: number;
  setActiveRootNodeId: (noteId: number) => void;
  noteTagsChanged: boolean;
  setNoteTagsChanged: (value: boolean) => void;
};

const defSelectedNoteElement: GlobalContextData = {
  selectedNoteElementData: null,
  setSelectedNoteElementData: (noteData: NoteElementInput | null) => {},
  tagDefs: [],
  addNewTagDef: (tagDefData: TagDefData) => {},
  activeRootNodeId: 0,
  setActiveRootNodeId: (noteId: number) => {},
  noteTagsChanged: false,
  setNoteTagsChanged: (value: boolean) => {},
};

export const globalContext = createContext<GlobalContextData>(
  defSelectedNoteElement
);

const GlobalContext = ({ children }: { children: React.ReactNode }) => {
  const [selectedNoteElementData, setSelectedId] =
    useState<NoteElementInput | null>(
      defSelectedNoteElement.selectedNoteElementData
    );
  const [tagDefs, setTagDefs] = useState<TagDefData[]>([]);
  const [activeRootNodeId, setActiveRootNodeId] = useState(0);
  const [_noteTagsChanged, _setNoteTagsChanged] = useState(false);

  // init
  useEffect(() => {
    // load tag defs from db
    const f = async () => {
      let respData: ApiResponse = await fetch(`/api/get_tag_defs`, {
        method: "GET",
      }).then((resp) => resp.json());
      setTagDefs(respData.data as TagDefData[]);
    };
    f();
  }, []);

  const addNewTagDef = (tagDefData: TagDefData) => {
    setTagDefs((prev) => [...prev, tagDefData]);
  };

  const setSelectedNoteElementData = (noteData: NoteElementInput | null) => {
    setSelectedId(noteData);
  };

  const setRootNoteId = (noteId: number) => {
    setActiveRootNodeId(noteId);
  };

  const setNoteTagsChanged = (value: boolean) => {
    _setNoteTagsChanged(value);
  };

  return (
    <globalContext.Provider
      value={{
        selectedNoteElementData: selectedNoteElementData,
        setSelectedNoteElementData: setSelectedNoteElementData,
        tagDefs: tagDefs,
        addNewTagDef: addNewTagDef,
        activeRootNodeId: activeRootNodeId,
        setActiveRootNodeId: setRootNoteId,
        noteTagsChanged: _noteTagsChanged,
        setNoteTagsChanged: _setNoteTagsChanged,
      }}
    >
      {children}
    </globalContext.Provider>
  );
};

export default GlobalContext;
