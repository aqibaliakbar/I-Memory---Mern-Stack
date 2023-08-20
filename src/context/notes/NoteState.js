import NoteContext from "./noteContext"; 
import { useState } from "react";

const NoteState = (props) => {
  const host = "http://localhost:5000";
  const notesInitial = [];

  const [notes, setNotes] = useState(notesInitial);

  // Fetch All Notes Function

  const getAllNotes = async () => {
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("authToken"),
      },
    });

    const json = await response.json();
    //console.log(json);

    setNotes(json);
  };

  // Add Note Function

  const addNote = async (title, description, tag) => {
    const response = await fetch(`${host}/api/notes/addnotes`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("authToken"),
      },
      body: JSON.stringify({ title, description, tag }),
    });

    const note = await response.json();

    setNotes(notes.concat(note));
  };

  // Delete Note Function
  const deleteNote = async (id) => {
    const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
      method: "Delete", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("authToken"),
      },
    });
    const json = response.json();
    console.log(json);

    const newNotes = notes.filter((note) => {
      return note._id !== id;
    });
    setNotes(newNotes);
  };

  //  Edit Note Function
  const editNote = async (id, title, description, tag) => {
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: "PUT", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("authToken"),
      },
      body: JSON.stringify({ title, description, tag }),
    });
    const json = await response.json();
    //console.log(json);

    getAllNotes();
  };

  return (
    <NoteContext.Provider
      value={{ notes, addNote, deleteNote, editNote, getAllNotes }}
    >
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
