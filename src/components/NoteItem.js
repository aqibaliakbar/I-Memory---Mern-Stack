import React, { useContext } from "react";

import noteContext from "../context/notes/noteContext";

import img from "../assets/Circle-icons-cloud.svg.png";

const NoteItem = ({ note, updateNote, showAlert }) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;

  return (
    <div className="bg-white border border-gray-200 p-6 mb-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#6494b4]">{note.title}</h3>
        <img className="h-6 w-6" src={img} alt="I-Memory Logo" />
      </div>
      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt={note.title}
          className="w-full object-cover rounded-lg mb-4"
        />
      )}
      <p className="text-gray-700 mb-4">{note.description}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#567c92]">{note.tag}</p>
        <div>
          <button
            onClick={() => {
              deleteNote(note._id);
              showAlert("Deleted Successfully", "success");
            }}
            className="text-red-500 hover:text-red-700 mr-4"
          >
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
          <button
            onClick={() => updateNote(note)}
            className="text-blue-500 hover:text-blue-700"
          >
            <i className="fa-solid fa-pen-to-square"></i> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem