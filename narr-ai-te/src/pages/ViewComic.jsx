import React from "react";
import ImageList from "../components/ImageList";
import { useImages } from "../contexts/ImageContext";
import { useNavigate } from "react-router-dom";

import { AiOutlineClear } from "react-icons/ai";
import { CiCircleCheck } from "react-icons/ci";

const ViewComic = () => {
  const navigate = useNavigate();
  const { setImages } = useImages();

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart?")) {
      setImages([]);
      navigate("/");
    }
  };

  const handleDone = () => {
    navigate("/");
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex justify-center text-3xl font-semibold pt-20 pb-8">
        Your Comic
      </div>
      <ImageList />
      <div className="pt-12 flex flex-row items-center justify-center">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-4 flex items-center justify-center"
          onClick={handleRestart}
        >
          <AiOutlineClear className="inline-block mr-2" />
          Restart
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mx-4 flex items-center justify-center"
          onClick={handleDone}
        >
          <CiCircleCheck className="inline-block mr-2" />
          Done
        </button>
      </div>
    </div>
  );
};

export default ViewComic;
