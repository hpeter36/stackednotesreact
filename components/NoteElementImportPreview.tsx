import {useState} from "react"
import NoteElement, { NoteElementInput } from "./NoteElement";

type NoteElementImportPreviewInput = {
	appendToRoot: boolean;
	rootElemId: number;
	selectedNoteElementData: NoteElementInput | null;
	notesData: NoteElementInput[];
	parentActions: {
	  clearNoteElementsToImport: () => void;
	};
  };

const NoteElementImportPreview = (inputs: NoteElementImportPreviewInput) => {
  //const [notesData, setNotesData] = useState<NoteElementInput[]>(inputs.notesData);
  const [isOpened, setIsOpened] = useState(true);

  // useEffect(() => {
  //   setIsOpened(true)
  // }, [notesData])

  // useEffect(() => {
  //   setNotesData(inputs.notesData)
  //   setIsOpened(true)
  //   console.log("xxx")
  // }, [inputs.notesData])

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ left: 100, top: 100 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const left = e.clientX - offset.x;
    const top = e.clientY - offset.y;

    setPosition({ left, top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const onClickCloseWindow = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsOpened(false);
    inputs.parentActions.clearNoteElementsToImport();
  };

  return (
    <div
      className={isOpened ? "bg-blue-500" : "hidden"}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
      }}
    >
      {/* header */}
      <div
        className="flex h-8 items-center justify-between"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <h2>Note import preview</h2>
        <div
          className="w-8 h-8 text-center text-xl"
          onClick={onClickCloseWindow}
        >
          x
        </div>
      </div>
      {/* notes nodes */}
      <div>
        {/* overlay to disable input */}
        <div className="absolute w-full h-full z-10 bg-transparent"></div>
        {/* note elements */}
        {inputs.notesData.length > 0 && (
          <NoteElement
            id={inputs.rootElemId}
            parentId={-80}
            title={
              inputs.appendToRoot
                ? "root element"
                : inputs.selectedNoteElementData!.title
            }
            actLevel={0}
            parentOrder={0}
            tags={[]}
            childrenElements={inputs.notesData}
            parentActions={null}
          />
        )}
      </div>
    </div>
  );
};

export default NoteElementImportPreview;
