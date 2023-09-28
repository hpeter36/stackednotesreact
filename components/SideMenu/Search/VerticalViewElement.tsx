import { useContext } from "react";
import { globalContext } from "@/components/Contexts";
import { NoteElementDataDb } from "@/components/NoteElement";
import { sideMenuContext } from "../SideMenu";

type VerticalViewElementInput = {
  noteDataDb: NoteElementDataDb;
  parentActions: {
    navigateDown: (noteId: number) => void;
  };
};

const VerticalViewElement = (inputs: VerticalViewElementInput) => {

  // global context
  const ctx = useContext(globalContext)
  const {activeRootNodeId, setActiveRootNodeId} = ctx

  // side menu context
  const sideMenuCtx = useContext(sideMenuContext);
  const { closeSideMenu } = sideMenuCtx;

  const onClickMoveToDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    inputs.parentActions.navigateDown(inputs.noteDataDb.id);
  };

  const onClickLoadNote = (e: React.MouseEvent<HTMLSpanElement>) => {
    closeSideMenu()
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