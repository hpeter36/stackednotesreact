import { useContext } from "react";
import { globalContext } from "@/components/Contexts";
import { NoteElementDataDb } from "@/components/NoteElement";

type VerticalViewElementInput = {
  noteDataDb: NoteElementDataDb;
  parentActions: {
    navigateDown: (noteId: number) => void;
  };
};

const VerticalViewElement = (inputs: VerticalViewElementInput) => {

  const ctx = useContext(globalContext)
  const {activeRootNodeId, setActiveRootNodeId} = ctx

  const onClickMoveToDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    inputs.parentActions.navigateDown(inputs.noteDataDb.id);
  };

  const onClickLoadNote = (e: React.MouseEvent<HTMLSpanElement>) => {
    setActiveRootNodeId(inputs.noteDataDb.id)
  };

  return (
    <div className="bg-blue-300 hover:bg-blue-500 flex justify-between">
      <span onClick={onClickMoveToDown}>{inputs.noteDataDb.note}</span>
      <span className=" hover:bg-red-500" onClick={onClickLoadNote}>&nbsp;load</span>
    </div>
  );
};

export default VerticalViewElement