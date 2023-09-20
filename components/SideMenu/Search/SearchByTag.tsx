import React, { useState, useEffect, useContext } from "react";
import { ApiResponse } from "@/types";
import { NoteElementDataDb } from "@/components/NoteElement";
import SearchByTagHierarchicalView from "./SearchByTagHierarchicalView";
import SearchByTagVerticalView from "./SearchByTagVerticalView";
import { globalContext } from "@/components/Contexts";

const SearchByTag = () => {
  const [view, setView] = useState("vertical"); // vertical, hierarchical

  const [selectedTagName, setSelectedTagName] = useState("topic");
  const [notesDataWithSelectedTag, setNotesDataWithSelectedTag] = useState<
    NoteElementDataDb[]
  >([]);

  const ctx = useContext(globalContext);
  const { noteTagsChanged, setNoteTagsChanged } = ctx;

  const loadNotesWithTagsFromDb = () => {
    const f = async () => {
      // load data with tags
      const respData: ApiResponse = await fetch(
        `/api/get_notes_with_tag?tag_name=${selectedTagName}`,
        { method: "GET" }
      ).then((resp) => resp.json());
      let data = respData.data as NoteElementDataDb[];
      data = [
        {
          id: 0,
          parent_id: -1,
          note: "",
          note_order: 0,
        },
        ...data,
      ];
      setNotesDataWithSelectedTag(data);
    };
    f();
  };

  // init comp
  useEffect(() => {
    loadNotesWithTagsFromDb();
  }, []);

  // note tags changed(added/removed), trigger reload
  useEffect(() => {
    if (noteTagsChanged) {
      loadNotesWithTagsFromDb();
      setNoteTagsChanged(false);
    }
  }, [noteTagsChanged]);

  return (
    <div>
      {/* select tag input !!! */}
      <div></div>
      {/* select view mode */}
      <div>
        <div>
          <label>
            <input
              type="radio"
              value="vertical"
              checked={view === "vertical"}
              onChange={(e) => setView(e.target.value)}
            />
            Vertical
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="hierarchical"
              checked={view === "hierarchical"}
              onChange={(e) => setView(e.target.value)}
            />
            Hieararchical
          </label>
        </div>
      </div>
      {/* show the selected view */}
      <div>
        {notesDataWithSelectedTag.length > 0 ? (
          view === "vertical" ? (
            <SearchByTagVerticalView
              notesDataWithSelectedTag={notesDataWithSelectedTag}
            />
          ) : (
            <SearchByTagHierarchicalView
              notesDataWithSelectedTag={notesDataWithSelectedTag}
            />
          )
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
};

export default SearchByTag;
