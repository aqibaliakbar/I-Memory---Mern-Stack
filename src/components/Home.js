import React from "react";
import Notes from "./Notes";

const Home = ({ showAlert }) => {
  return (
    <div className="bg-[#6494b4] min-h-screen">
      <div className="container mx-auto px-4 py-14">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
          Welcome to I-Memory
        </h1>
        <p className="text-xl text-white text-center mb-12 max-w-2xl mx-auto">
          Capture and cherish your moments in this digital sanctuary.
        </p>
        <Notes showAlert={showAlert} />
      </div>
    </div>
  );
};

export default Home;
