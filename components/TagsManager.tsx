"use client";

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

    // set input state
    setSearchVal("");
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const onClickClearSearch = (e: React.MouseEvent<HTMLSpanElement>) => {
    setSearchVal("");
    setIsFocused(false);
  };

  const twBgColor = "bg-blue-100";
  const twBgColorHover = "hover:bg-blue-200";

  return (
    <div className={`flex`}>
      {/* input & dropdown */}
      <div className="flex flex-col">
        {/* input field */}
        <input
          ref={inputRef}
          type="text"
          value={searchVal}
          onFocus={onFocusInput}
          onBlur={unFocusInput}
          onChange={onChangeInput}
        />
        {/* dropdown */}
        <div className="relative">
          <div className="absolute flex flex-col w-full">
            {isFocused &&
              filteredTags.length > 0 &&
              filteredTags.map((tag, i) => (
                <div className={`${twBgColor} ${twBgColorHover}`} key={i}>
                  <span onClick={onClickAddExistingTagToNote}>{tag.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* control panel */}
      <div>
        {/* Add new tag */}
        {searchVal.length > 0 && filteredTags.length === 0 && (
          <button className="bg-lime-300 hover:bg-lime-500 p-1 rounded-md mx-2" onClick={onClickAddNewTagDef}>Add new tag</button>
        )}
        {/* clear input btn */}
        {isFocused && <button className="bg-red-300 hover:bg-red-500 p-1 rounded-sm mx-2" onClick={onClickClearSearch}>x</button>}
      </div>
    </div>
  );
};

export default TagsManager;
