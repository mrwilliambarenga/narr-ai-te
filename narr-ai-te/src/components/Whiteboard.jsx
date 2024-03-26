import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCanvas } from "../contexts/CanvasContext";
import rough from "roughjs/bundled/rough.esm";
import useHistory from "./useHistory";
import {
  toolList,
  drawElement,
  createElement,
  getElementAtPosition,
  adjustElementCoordinates,
  cursorForPosition,
  resizedCoordinates,
  adjustmentRequired,
} from "./utils";
import { IoIosUndo, IoIosRedo } from "react-icons/io";
import { AiOutlineClear } from "react-icons/ai";
import { RxCrossCircled } from "react-icons/rx";
import { LuSparkles } from "react-icons/lu";

/**
 * Renders tool selection controls for the whiteboard.
 * Allows users to choose between different drawing tools.
 * "flex items-center my-2 py-1 px-2 cursor-pointer border border-gray-300 rounded"
 */
const ToolSelector = ({ currentTool, setTool }) => (
  <div className="absolute m-5">
    {toolList.map((tool) => (
      <label
        className={
          currentTool === tool.id
            ? "cursor-pointer flex items-center mb-2 py-1 px-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
            : "cursor-pointer flex items-center mb-2 py-1 px-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded"
        }
        key={tool.id}
        htmlFor={tool.id}
      >
        <input
          type="radio"
          id={tool.id}
          className="opacity-0 absolute w-0 h-0"
          checked={currentTool === tool.id}
          onChange={() => setTool(tool.id)}
        />
        {tool.icon
          ? React.createElement(tool.icon, { className: "mr-2" })
          : null}
        {tool.label}
      </label>
    ))}
  </div>
);

/**
 * Main component for a whiteboard that supports drawing and interaction.
 * Utilizes a canvas for drawing and provides tool selection, undo, and redo functionalities.
 */
const Whiteboard = () => {
  const { id } = useParams();
  const { whiteboards, setCurrentState } = useCanvas();
  const initialState = whiteboards[id] || [];

  const [elements, setElements, undo, redo] = useHistory(initialState); // elements on the canvas
  const [action, setAction] = useState("none"); // whether or not we are currently drawing
  const [tool, setTool] = useState("pencil"); // the tool we have selected
  const [selectedElement, setSelectedElement] = useState(null); // the element we have selected

  const navigate = useNavigate();

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas"); // get the canvas element from the DOM
    // first check if the canvas exists
    if (canvas) {
      const context = canvas.getContext("2d"); // get the context of the canvas (i.e. the API for drawing on the canvas)
      context.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
      const roughCanvas = rough.canvas(canvas); // initialize roughjs on the canvas that we have created

      if (Array.isArray(elements)) {
        elements.forEach((element) => {
          drawElement(roughCanvas, context, element);
        }); // draw each element on the canvas
      }
    }
  }, [elements]); // when the elements array changes, re-render the canvas

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  /**
   * Updates the coordinates and properties of an existing drawing element.
   * This function is used for moving or resizing elements on the whiteboard.
   */
  const updateElement = (id, x1, y1, x2, y2, tool) => {
    const elementsCopy = [...elements];
    switch (tool) {
      case "line":
      case "rectangle":
        // update the last element in the array with the new coordinates
        elementsCopy[id] = createElement(id, x1, y1, x2, y2, tool);
        break;
      case "pencil":
        elementsCopy[id].points = [
          ...elementsCopy[id].points,
          { x: x2, y: y2 },
        ];
        break;
      default:
        throw new Error(`Tool type ${tool} not supported.`);
    }
    setElements(elementsCopy, true);
  };

  /**
   * Handles the mouse down event on the canvas to start drawing or selecting an element.
   * Initiates drawing, moving, or resizing based on the selected tool and element interaction.
   */
  const handleMouseDown = (e) => {
    const { clientX, clientY } = getPositionFromEvent(e);

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        if (element.tool === "pencil") {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          setSelectedElement({ ...element, xOffsets, yOffsets });
        } else {
          const offsetX = clientX - element.x1;
          const offsetY = clientY - element.y1;
          setSelectedElement({ ...element, offsetX, offsetY });
        }
        setElements((prevState) => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);
      setAction("drawing");
    }
  };

  /**
   * Handles the mouse move event on the canvas.
   * Continues drawing, moving, or resizing an element based on the current action.
   */
  const handleMouseMove = (e) => {
    const { clientX, clientY } = getPositionFromEvent(e);

    if (tool === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      e.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = selectedElement.id;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      if (selectedElement.tool === "pencil") {
        const newPoints = selectedElement.points.map((_, index) => ({
          x: clientX - selectedElement.xOffsets[index],
          y: clientY - selectedElement.yOffsets[index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[selectedElement.id] = {
          ...elementsCopy[selectedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, y1, x2, y2, tool, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = clientX - offsetX;
        const newY1 = clientY - offsetY;
        updateElement(id, newX1, newY1, newX1 + width, newY1 + height, tool);
      }
    } else if (action === "resizing") {
      const { id, tool, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, tool);
    }
  };

  /**
   * Handles the mouse up event on the canvas.
   * Finalizes the drawing, moving, or resizing action on an element.
   */
  const handleMouseUp = (e) => {
    if (selectedElement) {
      const index = selectedElement.id;
      const { tool } = elements[index];
      if (
        (action === "drawing" || action === "resizing") &&
        adjustmentRequired(tool)
      ) {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(index, x1, y1, x2, y2, tool);
      }
    }

    setAction("none");
    setSelectedElement(null);
  };

  /**
   * Gets the position of the event, supporting both touch and mouse events.
   * This function abstracts the way to obtain the clientX and clientY from an event,
   * allowing for a unified handling of mouse and touch inputs.
   */
  const getPositionFromEvent = (e) => {
    if (e.touches) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      };
    } else {
      return { clientX: e.clientX, clientY: e.clientY };
    }
  };

  /**
   * Handles the start of a touch event.
   * Prevents the default action to avoid scrolling or zooming the browser window,
   * and forwards the event to the generic mouse down handler to initiate drawing or interaction.
   */
  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };

  /**
   * Handles movement during a touch event.
   * Similar to `handleTouchStart`, it prevents the default action and
   * forwards the event to the generic mouse move handler to continue drawing or interaction.
   */
  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMouseMove(e);
  };

  /**
   * Handles the end of a touch event.
   * It prevents the default action and forwards the event to the generic mouse up handler
   * to finalize the drawing or interaction.
   */
  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp(e);
  };

  const exportCanvas = () => {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }
    const ctx = canvas.getContext("2d");

    // Temporarily set background color
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const imageData = canvas.toDataURL("image/png");

    return imageData;
  };

  const generateImage = () => {
    setCurrentState(id, elements);  // Save the current state before generating the image
    const imageUrl = exportCanvas();
    if (imageUrl) {
      navigate("/generation", { state: { imagePrompt: imageUrl } });
    } else {
      alert("Failed to generate image url.");
    }
  };

  /**
   * Saves the elements array and goes back to comic view.
   */
  const exitWhiteboard = () => {
    setCurrentState(id, elements);
    navigate("/view-comic");
  };

  return (
    <div>
      {/* Tool selection controls (top left) */}
      <ToolSelector currentTool={tool} setTool={setTool} />

      {/* Undo, Redo and Clear buttons (bottom left) */}
      <div className="absolute bottom-0 m-5 flex">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 mr-4 rounded flex items-center justify-center"
          onClick={undo}
        >
          <IoIosUndo className="mr-2" />
          Undo
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 mr-4 rounded flex items-center justify-center"
          onClick={redo}
        >
          <IoIosRedo className="mr-2" />
          Redo
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
          onClick={() => setElements([])}
        >
          <AiOutlineClear className="mr-2" />
          Clear
        </button>
      </div>

      {/* Exit button (top right) */}
      <div className="absolute top-0 m-5 right-0 flex flex-col">
        <button
          className="mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
          onClick={exitWhiteboard}
        >
          <RxCrossCircled className="mr-2" />
          Exit
        </button>
      </div>

      {/* Image generation (bottom right) */}
      <div className="absolute bottom-0 right-0 m-5 flex items-center">
        <button
          className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
          onClick={generateImage}
        >
          <LuSparkles className="mr-2" />
          Generate Image
        </button>
      </div>

      {/* Canvas */}
      <canvas
        id={"canvas"}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        Canvas
      </canvas>
    </div>
  );
};

export default Whiteboard;
