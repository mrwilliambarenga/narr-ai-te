import React, { useState } from "react";
import { functions } from "../firebase";
import { httpsCallable } from "firebase/functions";

import { useImages } from "../contexts/ImageContext";
import { useNavigate, useLocation } from "react-router-dom";

import ClipLoader from "react-spinners/ClipLoader";
import { LuSparkles } from "react-icons/lu";
import { CiCircleCheck } from "react-icons/ci";
import { IoExitOutline } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";

import sketch_img from "../assets/sketch.webp";
import comic_img from "../assets/comic.webp";
import cartoon_img from "../assets/cartoon.webp";
import disney_img from "../assets/disney.webp";
import manga_img from "../assets/manga.webp";
import anime_img from "../assets/anime.webp";
import daVinci_img from "../assets/daVinci.webp";
import vanGogh_img from "../assets/vanGogh.webp";
import dali_img from "../assets/dali.webp";

// Each item is of the form {theme: [prompt, displayImage]}
const themes = {
  sketch: ["a simple sketch", sketch_img],
  dali: ["a Dali painting", dali_img],
  vanGogh: ["a Van Gogh painting", vanGogh_img],
  daVinci: ["a Da Vinci painting", daVinci_img],
  manga: ["a manga panel", manga_img],
  anime: ["a colourful, mordern anime scene", anime_img],
  comic: ["a coloured comic panel", comic_img],
  cartoon: ["a colourful, modern cartoon scene", cartoon_img],
  disney: ["a Disney movie scene", disney_img],
};

const GenerateImage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setImages } = useImages();

  const imgParam = location.state?.imagePrompt; // The input prompt from the whiteboard

  const [selectedTheme, setTheme] = useState("sketch");
  const [image, setImage] = useState(imgParam);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    setIsLoading(true);
    const generateImageFunction = httpsCallable(functions, "generateImage");

    try {
      const { data } = await generateImageFunction({
        imgParam,
        selectedThemePrompt: themes[selectedTheme][0],
      });
      setImage(data.imageUrl);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = image;
    link.target = "_blank";
    link.download = "generated_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevTheme = () => {
    const themesArray = Object.keys(themes);
    const index = themesArray.indexOf(selectedTheme);
    const prevTheme =
      themesArray[(index - 1 + themesArray.length) % themesArray.length];
    setTheme(prevTheme);
  };

  const handleNextTheme = () => {
    const themesArray = Object.keys(themes);
    const index = themesArray.indexOf(selectedTheme);
    const nextTheme = themesArray[(index + 1) % themesArray.length];
    setTheme(nextTheme);
  };

  const handleReturn = () => {
    navigate("/whiteboard");
  };

  const handleConfirm = () => {
    setImages((prevImages) => [...prevImages, image]);
    navigate("/view-comic");
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center">
      <div className="flex justify-center text-3xl font-semibold pt-12">
        Generate an image
      </div>
      <div className="h-full flex flex-col items-center justify-center">
        <div className="flex flex-row justify-between items-center">
          {/* Display original sketch */}
          <div className="flex flex-col justify-center p-4 m-4 bg-gray-200 border border-gray-400 rounded-xl">
            <div className="flex justify-center mx-4 my-2 mb-4 max-h-[40vh] max-w-[40vh]">
              <img
                src={imgParam}
                alt="Sketch"
                className="object-contain rounded-lg border border-gray-400 bg-white w-[40vh] h-[40vh]"
              />
            </div>
          </div>
          {/* Theme selection */}
          <div className="flex flex-col justify-center p-4 m-4 bg-gray-200 border border-gray-400 rounded-xl">
            <div className="flex justify-between">
              <button
                className="mx-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
                onClick={handlePrevTheme}
              >
                <RxChevronLeft />
              </button>
              <div className="bg-gray-200 font-bold py-1 px-2 rounded flex items-center justify-center">
                <label htmlFor="">
                  Theme:
                  <select
                    name="theme"
                    id="theme"
                    value={selectedTheme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="ml-1"
                  >
                    {Object.keys(themes).map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="mx-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
                onClick={handleNextTheme}
              >
                <RxChevronRight />
              </button>
            </div>
            <div className="flex justify-center mx-4 my-2 mb-4 max-h-[40vh] max-w-[40vh]">
              <img
                src={themes[selectedTheme][1]}
                alt="Style"
                className="object-contain rounded-lg border border-gray-400 bg-white w-[40vh] h-[40vh]"
              />
            </div>
          </div>
          {/* Display generated image */}
          <div className="flex flex-col justify-center p-4 m-4 bg-gray-200 border-4 border-purple-400 rounded-xl">
            <div className="flex justify-center mx-4 my-2 mb-4 max-h-[40vh] max-w-[40vh]">
              {isLoading ? (
                <div className="object-contain rounded-lg border border-gray-400 bg-white w-[40vh] h-[40vh] flex items-center justify-center">
                  <ClipLoader color="#3B82F6" loading={isLoading} size={150} />
                </div>
              ) : (
                <img
                  src={image}
                  alt="Selected"
                  className="object-contain rounded-lg border border-gray-400 bg-white w-[40vh] h-[40vh]"
                />
              )}
            </div>
            <div className="relative flex items-center justify-center mx-4">
              <button
                className="mx-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
                onClick={generateImage}
              >
                <LuSparkles className="mr-2" />
                Spin
              </button>
              <button
                className="absolute right-0 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded flex items-center justify-center"
                onClick={downloadImage}
              >
                <IoMdDownload />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="pb-12 flex flex-row items-center justify-center">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 mx-4 rounded flex items-center justify-center"
          onClick={handleReturn}
        >
          <IoExitOutline className="mr-2" />
          Go Back
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mx-4 rounded flex items-center justify-center"
          onClick={handleConfirm}
        >
          <CiCircleCheck className="mr-2" />
          Save Image
        </button>
      </div>
    </div>
  );
};

export default GenerateImage;
