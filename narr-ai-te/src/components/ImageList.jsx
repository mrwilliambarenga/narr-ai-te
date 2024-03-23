import React from "react";
// import { Link } from "react-router-dom";
import { useImages } from "../contexts/ImageContext";
import { useNavigate } from "react-router-dom";
import { CiCirclePlus } from "react-icons/ci";


const ImageList = () => {
  const { images } = useImages();
  const navigate = useNavigate();

  const handleNewImage = () => {
    navigate("/whiteboard");
  };

  return (
    <div className="flex m-10 h-[50%] overflow-x-auto no-scrollbar">
      {(images.length !== 0) && images.map((image, index) => (
        <div
          key={image}
          className="relative h-full min-w-96 bg-gray-200 p-4 rounded-lg mx-4 max-h-[50vh] max-w-[50vh] flex items-center justify-center"
        >
          <div className="absolute top-0 left-0 m-8 bg-white py-2 px-4 rounded text-sm">
            {index + 1}
          </div>
          {image ? (
            <img
              src={image}
              alt={`${index + 1}`}
              className="object-contain rounded-lg border border-gray-400 bg-white w-[45vh] h-[45vh]"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-lg" />
          )}
        </div>
      ))}
      <div className="flex justify-center mx-4 border border-gray-400 rounded-lg p-1">
        <button onClick={handleNewImage}>
          <CiCirclePlus size={40} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ImageList;
