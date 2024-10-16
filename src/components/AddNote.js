import React, { useContext, useState } from "react";
import noteContext from "../context/notes/noteContext";
import img from "../assets/Circle-icons-cloud.svg.png";

const AddNote = ({ showAlert }) => {
  const context = useContext(noteContext);
  const { addNote } = context;
  const [note, setNote] = useState({ title: "", description: "", tag: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", note.title);
    formData.append("description", note.description);
    formData.append("tag", note.tag);
    if (image) {
      formData.append("image", image);
    }
    addNote(formData);
    setNote({ title: "", description: "", tag: "" });
    setImage(null);
    setPreview(null);
    showAlert("Memory added successfully", "success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto mb-8">
      <div className="flex items-center mb-4">
        <img
          src={img}
          alt="User Avatar"
          className="h-10 w-10 rounded-full mr-3"
        />
        <h2 className="text-xl font-semibold text-[#6494b4]">
          Create a Memory
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={note.title}
          onChange={onChange}
          required
          minLength={5}
          className="w-full px-3 py-2 mb-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
          placeholder="What's on your mind?"
        />
        <textarea
          name="description"
          value={note.description}
          onChange={onChange}
          required
          minLength={5}
          rows="3"
          className="w-full px-3 py-2 mb-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
          placeholder="Describe your memory..."
        ></textarea>
        <input
          type="text"
          name="tag"
          value={note.tag}
          onChange={onChange}
          className="w-full px-3 py-2 mb-3 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6494b4] focus:border-transparent"
          placeholder="Add tags (optional)"
        />
        {preview && (
          <div className="mb-3">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <label
            htmlFor="image"
            className="cursor-pointer flex items-center text-[#6494b4] hover:text-[#567c92]"
          >
            <i className="fa-solid fa-image mr-2"></i>
            Add Photo
          </label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={onImageChange}
            className="hidden"
            accept="image/*"
          />
          <button
            type="submit"
            className="bg-[#6494b4] text-white py-2 px-4 rounded-md hover:bg-[#567c92] transition duration-300 shadow-sm text-sm font-semibold"
            disabled={note.title.length < 5 || note.description.length < 5}
          >
            Post Memory
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNote;
