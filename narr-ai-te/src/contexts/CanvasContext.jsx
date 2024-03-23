import React, { createContext, useContext, useState } from "react";

const CanvasContext = createContext();

export const useCanvas = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }) => {
  // For multiple whiteboards
  const [whiteboards, setWhiteboards] = useState({});

  const setCurrentState = (id, currentState) => {
    setWhiteboards((prevWhiteboards) => ({
      ...prevWhiteboards,
      [id]: currentState,
    }));
  };

  return (
    <CanvasContext.Provider value={{ whiteboards, setCurrentState }}>
      {children}
    </CanvasContext.Provider>
  );
};
