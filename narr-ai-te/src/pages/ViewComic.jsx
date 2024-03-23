import React from "react";
import ImageList from "../components/ImageList";
import { useNavigate } from "react-router-dom";

const ViewComic = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/");
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center">
      <div className="flex justify-center text-3xl font-semibold py-2">
        Your Comic
      </div>
      <ImageList />
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleReturn}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default ViewComic;
