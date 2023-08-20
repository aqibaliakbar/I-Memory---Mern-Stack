import React, { useContext, useEffect, useState, useRef } from "react"; // we can give an element a reference using useRef hook
import noteContext from "../context/notes/noteContext";
import NoteItem from "./NoteItem";
import AddNote from "./AddNote";
import img from "../assets/Circle-icons-cloud.svg.png";
import { useNavigate } from "react-router-dom";

const Notes = (props) => {
  const context = useContext(noteContext);
  const { notes, getAllNotes, editNote } = context;
  let navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      getAllNotes();
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  const ref = useRef(null);
  const refClose = useRef(null);

  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  const updateNote = (currentNote) => {
    //console.log(currentNote);
    ref.current.click();

    setNote({
      etitle: currentNote.title,
      edescription: currentNote.description,
      etag: currentNote.tag,
      id: currentNote._id,
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    editNote(note.id, note.etitle, note.edescription, note.etag);
    refClose.current.click();
    props.showAlert("Updated Successfully", "Success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <>
      <AddNote showAlert={props.showAlert} />

      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch demo modal
      </button>

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 c-text1" id="exampleModalLabel">
                <img id="img2" src={img} alt="" />
                Update Memory Note
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="container my-3">
                <form className="my-3">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label text-white">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="etitle"
                      name="etitle"
                      value={note.etitle}
                      aria-describedby="emailHelp"
                      onChange={onChange}
                      minLength={5}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="description"
                      className="form-label text-white"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edescription"
                      name="edescription"
                      value={note.edescription}
                      onChange={onChange}
                      minLength={5}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="description"
                      className="form-label text-white"
                    >
                      Tag
                    </label>
                    <input
                      type="text"
                      className="form-control "
                      id="etag"
                      name="etag"
                      value={note.etag}
                      onChange={onChange}
                      minLength={5}
                      required
                    />
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-3"
                data-bs-dismiss="modal"
                ref={refClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-2"
                onClick={handleClick}
                // disabled={note.etitle.length<5 || note.edescription.length<5}
              >
                Update Memory
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" row my-3 text-white">
        <h1>Your Memories</h1>
        <div className="container mx-2">
          {notes.length === 0 && "No Notes To Display!"}
        </div>
        {notes.map((note) => {
          return (
            <NoteItem
              key={note._id}
              updateNote={updateNote}
              showAlert={props.showAlert}
              note={note}
            />
          );
        })}
      </div>
    </>
  );
};

export default Notes;
