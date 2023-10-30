import React, { useState, useRef, useEffect } from "react";

type ElementDropDownListDataElement = {
  id: number;
  name: string;
};

type ElementDropDownListInputs = {
  htmlId: string;
  htmlLabelText: string;
  isShowLabel: boolean;
  data: ElementDropDownListDataElement[];
  defVal: string;
  showElementCountByDef: number;
  clearSelectionOnSelect: boolean;
  unFocusOnSelect: boolean;
  parentActions: {
    selectElementEvent: (selectedTag: string) => void;
    inputOnChangeEvent: (searchVal: string) => void;
  };
};

const ElementDropDownList = (inputs: ElementDropDownListInputs) => {
  const [searchVal, setSearchVal] = useState(inputs.defVal);
  const [isFocused, setIsFocused] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const [filteredElements, setFilteredElements] = useState<
    ElementDropDownListDataElement[]
  >([]);

  const inputRef = useRef<HTMLInputElement>(null);

  //--------- hooks

  // init, show the showElementCountByDef elements
  useEffect(() => {
    setFilteredElements(getDefSearch());
  }, []);

  // search val changed, trigger parent
  useEffect(() => {
    inputs.parentActions.inputOnChangeEvent(searchVal);
  }, [searchVal]);

  //--------- funcs

  // show the showElementCountByDef elements
  const getDefSearch = () => {
    return inputs.data.slice(0, inputs.showElementCountByDef);
  };

  const filterElements = (val: string) => {
    return val === ""
      ? getDefSearch()
      : inputs.data.filter((d) => d.name.indexOf(val) !== -1);
  };

  const unFocusInput = () => {
    setIsFocused(false);
    inputRef.current?.blur();
    setIsInputActive(false);
  };

  //--------- events

  // onchange, every input change
  const searchElements = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setSearchVal(val);
    setFilteredElements(filterElements(val));
  };

  // onfocus, first click in the input
  const onFocusShowElements = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setFilteredElements(filterElements(searchVal));
  };

  // clicking in input, should be the second and additional times
  const toggleDropdown = (e: React.MouseEvent<HTMLSpanElement>) => {
    const searchAtLeastOneMatch = filteredElements.length > 0;

    if (
      isInputActive &&
      document.activeElement === inputRef.current &&
      searchAtLeastOneMatch
    )
      setIsFocused((prev) => !prev);

    if (!isInputActive) setIsInputActive(true);
  };

  // leaving mouse from component
  const mouseLeaveComponent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (searchVal.length === 0) unFocusInput();
  };

  // clicking on 'x' button
  const clearSearch = (e: React.MouseEvent<HTMLSpanElement>) => {
    // clear input
    setSearchVal("");

    // unfocus
    unFocusInput();
  };

  // selecting an element in list
  const onClickSelectElement = (e: React.MouseEvent<HTMLSpanElement>) => {
    const selectedVal = e.currentTarget.innerHTML;

    inputs.parentActions.selectElementEvent(selectedVal);

    // set input text
    if (inputs.clearSelectionOnSelect) setSearchVal("");
    else setSearchVal(selectedVal);

    // unfocus if necessary
    if (inputs.unFocusOnSelect) {
      unFocusInput();
    }
  };

  const twBgColor = "bg-blue-100";
  const twBgColorHover = "hover:bg-blue-200";

  return (
    <div className={`flex`} onMouseLeave={mouseLeaveComponent}>
      {/* input & dropdown */}
      <div className="flex flex-col">
        {/* input field */}
        {inputs.isShowLabel && (
          <label htmlFor={inputs.htmlId}>{inputs.htmlLabelText}</label>
        )}
        <input
          id={inputs.htmlId}
          ref={inputRef}
          type="text"
          value={searchVal}
          onFocus={onFocusShowElements}
          onClick={toggleDropdown}
          // onBlur={unFocusInput}
          onChange={searchElements}
        />
        {/* dropdown */}
        <div className="relative">
          <div className="absolute flex flex-col w-full">
            {isFocused &&
              filteredElements.length > 0 &&
              filteredElements.map((tag, i) => (
                <div className={`${twBgColor} ${twBgColorHover}`} key={i}>
                  <span
                    className="inline-block w-full"
                    onClick={onClickSelectElement}
                  >
                    {tag.name}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* control panel */}
      <div>
        {/* clear input btn */}
        {isFocused && searchVal.length > 0 && (
          <button
            className="bg-red-300 hover:bg-red-500 p-1 rounded-sm mx-2 inline-block w-full"
            onClick={clearSearch}
          >
            x
          </button>
        )}
      </div>
    </div>
  );
};

export default ElementDropDownList;
