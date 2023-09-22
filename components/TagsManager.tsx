"use client"

import React, { useContext, useState, useEffect, useRef } from "react";
import { globalContext } from "./Contexts";
import { TagDefData } from "./Contexts/GlobalContext";
import { ApiResponse } from "@/types";

type TagsManagerInput = {
  showTagsByDefCount: number;
  parentActions: {
    addTagToNote: (tagName: string) => void;
  };
};

const TagsManager = (inputs: TagsManagerInput) => {
  const [searchVal, setSearchVal] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [filteredTags, setFilteredTags] = useState<TagDefData[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const ctx = useContext(globalContext);
  const { tagDefs, addNewTagDef } = ctx;

  const getDefSearch = () => {
    return tagDefs.slice(0, inputs.showTagsByDefCount);
  };

  useEffect(() => {
    setFilteredTags(getDefSearch());
  }, []);

  //--------- funcs

  const filterTags = (val: string) => {
    return val === ""
      ? getDefSearch()
      : tagDefs.filter((d) => d.name.indexOf(val) !== -1);
  };

  //--------- events

  const onFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setFilteredTags(filterTags(searchVal));
  };

  const unFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {};

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setSearchVal(val);
    setFilteredTags(filterTags(val));
  };

  const onClickAddExistingTagToNote = (
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    // append tag to note
    inputs.parentActions.addTagToNote(e.currentTarget.innerHTML);

    // set input state
    setSearchVal("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const onClickAddNewTagDef = (e: React.MouseEvent<HTMLSpanElement>) => {
    // add new tag to tagdefs db table if not exist
    const f = async () => {
      const respData: ApiResponse = await fetch(
        `/api/add_new_tag_def?tag_name=${searchVal}`,
        { method: "POST" }
      ).then((resp) => resp.json());
    };
    f();

    // append tag to context if not present
    addNewTagDef({ name: searchVal, usage_count: 1 });

    // append tag to element
    inputs.parentActions.addTagToNote(searchVal);

    // set input state
    setSearchVal("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const onClickClearSearch = (e: React.MouseEvent<HTMLSpanElement>) => {
    setSearchVal("");
    setIsFocused(false);
  };

  return (
    <div>
      <div>
        {/* input field */}
        <input
          ref={inputRef}
          type="text"
          value={searchVal}
          onFocus={onFocusInput}
          onBlur={unFocusInput}
          onChange={onChangeInput}
        />
        {/* Add new tag */}
        {searchVal.length > 0 && filteredTags.length === 0 && (
          <button onClick={onClickAddNewTagDef}>Add new tag</button>
        )}
        {/* clear input btn */}
        {isFocused && <button onClick={onClickClearSearch}>x</button>}
      </div>
      {/* dropdown tag list */}
      <div className="relative">
        <div className="absolute">
          {isFocused &&
            filteredTags.length > 0 &&
            filteredTags.map((tag, i) => (
              <div key={i}>
                <span onClick={onClickAddExistingTagToNote}>{tag.name}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TagsManager;
