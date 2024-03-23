/**
 * A central place to store and manage the state of images that are generated
 */
import React, { createContext, useContext, useState } from "react";

const ImageContext = createContext();

export const useImages = () => {
  return useContext(ImageContext);
};

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  
  return (
    <ImageContext.Provider value={{ images, setImages }}>
      {children}
    </ImageContext.Provider>
  );
};
