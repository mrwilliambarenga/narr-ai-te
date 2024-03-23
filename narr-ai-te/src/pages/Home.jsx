import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center">
      <div className="flex justify-center text-3xl font-semibold py-2">narr-ai-te</div>
      <div className="flex justify-center">
        <Link
          to="/view-comic"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start
        </Link>
      </div>
    </div>
  );
};

export default Home;
