import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/noteContext";
import NoteItem from "./NoteItem";
import AddNote from "./AddNote";
import { PlusCircle } from "lucide-react";


const Notes = (props) => {
  const context = useContext(noteContext);
  const { notes, getAllNotes, editNote } = context;
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      getAllNotes();
    } else {
      navigate("/login");
    }
  }, []);

  const updateNote = (currentNote) => {
    setEditingNote(currentNote);
    setIsModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", editingNote.title);
    formData.append("description", editingNote.description);
    formData.append("tag", editingNote.tag);
    if (editingNote.newImage) {
      formData.append("image", editingNote.newImage);
    }
    editNote(editingNote._id, formData);
    setIsModalOpen(false);
    props.showAlert("Updated Successfully", "success");
  };

  const onEditChange = (e) => {
    setEditingNote({ ...editingNote, [e.target.name]: e.target.value });
  };

  const onEditImageChange = (e) => {
    setEditingNote({ ...editingNote, newImage: e.target.files[0] });
  };

    const handleAddNoteClick = () => {
      setIsAddingNote(true);
      // Scroll to the AddNote component
      const addNoteElement = document.getElementById("add-note-section");
      if (addNoteElement) {
        addNoteElement.scrollIntoView({ behavior: "smooth" });
      }
    };

  return (
    <div className="container mx-auto px-4 py-8">
      <div id="add-note-section">
        <AddNote
          showAlert={props.showAlert}
          isAddingNote={isAddingNote}
          setIsAddingNote={setIsAddingNote}
        />
      </div>
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-[#6494b4] mb-6">
          Your Memories
        </h2>
        {notes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#e6f0f6] to-[#f0f7fc] rounded-lg shadow-lg p-12 transition-all duration-300 hover:shadow-xl">
            <div className="w-32 h-32 bg-[#6494b4] rounded-full flex items-center justify-center mb-6 animate-pulse">
              <PlusCircle size={64} color="white" />
            </div>
            <h3 className="text-2xl font-semibold text-[#567c92] mb-2 text-center">
              No memories yet
            </h3>
            <p className="text-[#6494b4] text-lg mb-6 text-center">
              Start capturing your precious moments today!
            </p>
            <button
              onClick={handleAddNoteClick}
              className="px-6 py-3 bg-[#6494b4] text-white rounded-full font-medium transition-all duration-300 hover:bg-[#567c92] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:ring-opacity-50"
            >
              Add Your First Memory
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {notes?.map((note) => (
              <NoteItem
                key={note._id}
                updateNote={updateNote}
                showAlert={props.showAlert}
                note={note}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#6494b4] mb-4">
              Edit Memory
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingNote.title}
                  onChange={onEditChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#6494b4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editingNote.description}
                  onChange={onEditChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-50 border border-[#6494b4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  Tag
                </label>
                <input
                  type="text"
                  id="tag"
                  name="tag"
                  value={editingNote.tag}
                  onChange={onEditChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#6494b4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="newImage"
                  className="block text-sm font-medium text-[#6494b4] mb-1"
                >
                  New Image (optional)
                </label>
                <input
                  type="file"
                  id="newImage"
                  name="newImage"
                  onChange={onEditImageChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-[#6494b4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6494b4] text-white rounded-md hover:bg-[#567c92] transition duration-300"
                >
                  Update Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
