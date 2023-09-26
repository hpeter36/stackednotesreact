import { ApiResponse } from "@/types";

type NoteElementTagInputs = {
  tagText: string;
  noteId: number;
  parentActions: {
    removeTag(tagName: string): void;
  };
};

const NoteElementTag = (inputs: NoteElementTagInputs) => {
  return (
    <div className="hover:bg-blue-500">
      <span>{`${inputs.tagText} `}</span>
      {/* delete tag btn */}
      <button
        className=" hover:bg-red-400"
        onClick={(e) => {
          e.stopPropagation();

          if (confirm("Are you sure you want to delete this tag?")) {
            //delete from db
            const f = async () => {
              const respData: ApiResponse = await fetch(
                `/api/delete_tag_from_note`,
                {
                  method: "DELETE",
                  body: JSON.stringify({
                    note_id: inputs.noteId,
                    tag_name: inputs.tagText,
                  }),
                }
              ).then((resp) => resp.json());
            };
            f();

            // remove from state
            inputs.parentActions.removeTag(inputs.tagText);
          }
        }}
      >
        x
      </button>
    </div>
  );
};

export default NoteElementTag;
