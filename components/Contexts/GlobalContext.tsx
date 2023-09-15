import React, { useState, createContext } from "react";
import { NoteElementInput } from "../NoteElement";

type GlobalContextData = {
  selectedNoteElementData: NoteElementInput | null;
  setSelectedNoteElementData: (noteData: NoteElementInput | null) => void | null;
};

const defSelectedNoteElement: GlobalContextData = {
	selectedNoteElementData: null,
	setSelectedNoteElementData: (noteData: NoteElementInput | null) => {},
  }

export const globalContext = createContext<GlobalContextData>(defSelectedNoteElement);

const GlobalContext = ({ children }: { children: React.ReactNode }) => {
  const [selectedNoteElementData, setSelectedId] = useState<NoteElementInput | null>(defSelectedNoteElement.selectedNoteElementData);

  const setSelectedNoteElementData = (noteData: NoteElementInput | null) => {
    setSelectedId(noteData);
  };

  return (
    <globalContext.Provider
      value={{ selectedNoteElementData: selectedNoteElementData, setSelectedNoteElementData: setSelectedNoteElementData }}
    >
      {children}
    </globalContext.Provider>
  );
};

export default GlobalContext;