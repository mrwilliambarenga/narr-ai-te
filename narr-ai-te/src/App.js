import React from "react";
import { Routes, Route } from "react-router-dom";
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
            <Route path="/narr-ai-te" element={<Home />} />
            <Route path="/narr-ai-te/view-comic" element={<ViewComic />} />
            <Route path="/narr-ai-te/whiteboard" element={<Whiteboard />} />
            <Route path="/narr-ai-te/whiteboard/:id" element={<Whiteboard />} />
            <Route path="/narr-ai-te/generation" element={<GenerateImage />} />
          </Routes>
        </CanvasProvider>
      </ImageProvider>
    </div>
  );
}

export default App;
