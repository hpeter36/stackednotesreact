import React, {useState, createContext} from 'react'

type GlobalContextData = {
	selectedId: number,
	setSelectedID: (id: number) => void
}

export const globalContext = createContext<GlobalContextData>({selectedId: -1, setSelectedID: (id: number) => {}});

const GlobalContext = ({children}: {children: React.ReactNode}) => {
	const [selectedId, setSelectedId] = useState(-1);

	const setSelectedID = (id: number) => {
		setSelectedId(id);
	};
  
	return (
	  <globalContext.Provider value={{ selectedId: selectedId, setSelectedID: setSelectedID }}>
		{children}
	  </globalContext.Provider>
	);
}

export default GlobalContext