"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { globalContext } from "./Contexts";
import { TagDefData } from "./Contexts/GlobalContext";
import { ApiResponse } from "@/types";
import ElementDropDownList from "./_baseElements/ElementDropDownList";

type TagsManagerInput = {
  parentActions: {
    addTagToNote: (tagName: string) => void;
  };
};

const TagsManager = (inputs: TagsManagerInput) => {
  const [searchVal, setSearchVal] = useState("");

  // global context
  const ctx = useContext(globalContext);
  const { tagDefs, addNewTagDef } = ctx;

  const onClickAddTagToNote = (selectedTag: string) => {
    // append tag to note
    inputs.parentActions.addTagToNote(selectedTag);
  };

  const inputOnChangeEvent = (searchVal: string) => {
    setSearchVal(searchVal);
  };

  const onClickAddNewTagDef = (e: React.MouseEvent<HTMLSpanElement>) => {
    // add new tag to tagdefs db table if not exist
    const f = async () => {
      const respData: ApiResponse = await fetch(`/api/add_new_tag_def`, {
        method: "POST",
        body: JSON.stringify({
          tag_name: searchVal,
        }),
      }).then((resp) => resp.json());
    };
    f();

    // append tag to context if not present
    addNewTagDef({ name: searchVal, usage_count: 1 });

    // append tag to element
    inputs.parentActions.addTagToNote(searchVal);
  };

  return (
    <div className={`flex`}>
      {/* tag dropdown list */}
      <ElementDropDownList
        htmlId="select_tag_drop_down"
        htmlLabelText="Select tag"
        isShowLabel={false}
        data={tagDefs.map((d, i) => {
          return { id: i, name: d.name };
        })}
        defVal=""
        showElementCountByDef={5}
        clearSelectionOnSelect={true}
        unFocusOnSelect={true}
        parentActions={{
          selectElementEvent: onClickAddTagToNote,
          inputOnChangeEvent: inputOnChangeEvent,
        }}
      />
      {/* Add new tag button */}
      {searchVal.length > 0 &&
        tagDefs.findIndex((d) => d.name === searchVal) === -1 && (
          <button
            className="bg-lime-300 hover:bg-lime-500 p-1 rounded-md mx-2"
            onClick={onClickAddNewTagDef}
          >
            Add new tag
          </button>
        )}
    </div>
  );
};

export default TagsManager;
