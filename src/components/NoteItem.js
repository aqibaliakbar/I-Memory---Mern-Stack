import React, { useContext } from "react";
import noteContext from "../context/notes/noteContext";
import img from "../assets/Circle-icons-cloud.svg.png";

const NoteItem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;
  const { note, updateNote } = props;
  return (
    <div className="col-md-3">
      <div className="card my-3">
        <div className="card-body">
          <h5 className="card-title c-text">{note.title}</h5>
          <p className="card-text">{note.description}</p>
          <p className="card-title fw-bold">{note.tag}</p>
          <i
            className="fa-solid fa-trash-can mx-2"
            onClick={() => {
              deleteNote(note._id, props.showAlert("Deleted Successfully", "Deleted"));
            }}
            style={{ color: "#7bb3d3" }}
          ></i>
          <i
            className="fa-solid fa-pen-to-square mx-2"
            onClick={() => {
              updateNote(note);
            }}
            style={{ color: "#7bb3d3" }}
          ></i>
          <img id="img3" src={img} alt="" />
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
