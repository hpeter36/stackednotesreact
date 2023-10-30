import React, { useState, useEffect, useContext } from "react";
import { ApiResponse } from "@/types";
import { NoteElementDataDb } from "@/components/NoteElement";
import SearchByTagHierarchicalView from "./SearchByTagHierarchicalView";
import SearchByTagVerticalView from "./SearchByTagVerticalView";
import { globalContext } from "@/components/Contexts";
import ElementDropDownList from "@/components/_baseElements/ElementDropDownList";

const SearchByTag = () => {
  const [view, setView] = useState("vertical"); // vertical, hierarchical
  const [selectedTagName, setSelectedTagName] = useState("topic");
  const [notesDataWithSelectedTag, setNotesDataWithSelectedTag] = useState<
    NoteElementDataDb[] | null
  >(null);

  const ctx = useContext(globalContext);
  const { noteTagsChanged, setNoteTagsChanged, tagDefs } = ctx;

  const loadNotesWithTagsFromDb = async (tagName: string) => {
    const f = async () => {
      // load data with tags
      const respData: ApiResponse = await fetch(
        `/api/get_notes_with_tag?tag_name=${tagName}`,
        { method: "GET" }
      ).then((resp) => resp.json());
      let data = respData.data as NoteElementDataDb[];
      if (data.length > 0) {
        data = [
          {
            id: 0,
            parent_id: -1,
            note: "",
            note_order: 0,
            depth_l: 0,
            child_c: -1,
          },
          ...data,
        ];
      }
      setNotesDataWithSelectedTag(data);
    };
    await f();
  };

  // init comp, load data from db and set state
  useEffect(() => {
    loadNotesWithTagsFromDb(selectedTagName);
  }, []);

  useEffect(() => {}, [notesDataWithSelectedTag]);

  // note tags changed(added/removed), trigger reload
  useEffect(() => {
    if (noteTagsChanged) {
      loadNotesWithTagsFromDb(selectedTagName);
      setNoteTagsChanged(false);
    }
  }, [noteTagsChanged]);

  // ---------- parent actions
  const elementSelectedFromTagListEvent = async (selectedTag: string) => {
    if (selectedTagName !== selectedTag) {
      await loadNotesWithTagsFromDb(selectedTag);
      setSelectedTagName(selectedTag);
    }
  };

  const searchInputOnChangeEvent = (searchVal: string) => {};

  return (
    <div>
      {/* select tag input */}
      <div>
        <ElementDropDownList
          htmlId="select_tag_drop_down"
          htmlLabelText="Select tag"
          isShowLabel={true}
          data={tagDefs.map((d, i) => {
            return { id: i, name: d.name };
          })}
          defVal="topic"
          showElementCountByDef={5}
          clearSelectionOnSelect={false}
          unFocusOnSelect={true}
          parentActions={{
            selectElementEvent: elementSelectedFromTagListEvent,
            inputOnChangeEvent: searchInputOnChangeEvent,
          }}
        />
      </div>
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
        {notesDataWithSelectedTag !== null ? (
          notesDataWithSelectedTag.length > 0 ? (
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
            <span>No tags found</span>
          )
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
};

export default SearchByTag;
