import React, { useState, createContext, useEffect } from "react";
import { NoteElementInput } from "../NoteElement";
import { ApiResponse } from "@/types";

export type TagDefData = {
  name: string
  usage_count: number
}

type GlobalContextData = {
  selectedNoteElementData: NoteElementInput | null;
  setSelectedNoteElementData: (noteData: NoteElementInput | null) => void | null;
  tagDefs: TagDefData[];
  addNewTagDef: (tagDefData: TagDefData) => void
};

const defSelectedNoteElement: GlobalContextData = {
	selectedNoteElementData: null,
	setSelectedNoteElementData: (noteData: NoteElementInput | null) => {},
  tagDefs: [],
  addNewTagDef: (tagDefData: TagDefData) => {}
  }

export const globalContext = createContext<GlobalContextData>(defSelectedNoteElement);

const GlobalContext = ({ children }: { children: React.ReactNode }) => {
  const [selectedNoteElementData, setSelectedId] = useState<NoteElementInput | null>(defSelectedNoteElement.selectedNoteElementData);
  const [tagDefs, setTagDefs] = useState<TagDefData[]>([]);

  useEffect(() => {
    const f = async () => {
    let respData: ApiResponse = await fetch(
      `/api/get_tag_defs`
    ).then((resp) => resp.json());
    setTagDefs(respData.data as TagDefData[])
  }
  f()
    
  }, [])

  const addNewTagDef = (tagDefData: TagDefData) => {
    setTagDefs((prev) => [...prev, tagDefData]);
  };

  const setSelectedNoteElementData = (noteData: NoteElementInput | null) => {
    setSelectedId(noteData);
  };

  return (
    <globalContext.Provider
      value={{ 
        selectedNoteElementData: selectedNoteElementData, 
        setSelectedNoteElementData: setSelectedNoteElementData,
        tagDefs: tagDefs,
        addNewTagDef: addNewTagDef,
       }}
    >
      {children}
    </globalContext.Provider>
  );
};

export default GlobalContext;