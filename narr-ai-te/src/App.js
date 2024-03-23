import React from "react";
import { HashRouter as Routes, Route } from "react-router-dom";
import { ImageProvider } from "./contexts/ImageContext";
import { CanvasProvider } from "./contexts/CanvasContext";
import "./App.css";

import Home from "./pages/Home";
import ViewComic from "./pages/ViewComic";
import Whiteboard from "./components/Whiteboard";
import GenerateImage from "./pages/GenerateImage";

function App() {
  return (
    <div className="App">
      <ImageProvider>
        <CanvasProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/view-comic" element={<ViewComic />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
            <Route path="/whiteboard/:id" element={<Whiteboard />} />
            <Route path="/generation" element={<GenerateImage />} />
          </Routes>
        </CanvasProvider>
      </ImageProvider>
    </div>
  );
}

export default App;
