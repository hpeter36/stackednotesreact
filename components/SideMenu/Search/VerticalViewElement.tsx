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
    <div>
      <span onClick={onClickMoveToDown}>{inputs.noteDataDb.note}</span>
      <span onClick={onClickLoadNote}>&nbsp;load</span>
    </div>
  );
};

export default VerticalViewElement