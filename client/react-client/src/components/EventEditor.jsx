import { useState } from "react";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";

export default function EventEditor({ event, onChange, onClose }) {
  
  const handleDescriptionChange = () =>{

  }
  
  const handleSave = () => {
    onChange({
      ...event,
      title,
      year: parseInt(year),
      description,  // now HTML from the rich text editor
      color
    });
  };

  return (
    <div className="event-editor-panel">
      <h3>Edit Event</h3>

      <label>Title</label>
      <input
        type="text"
        value={event.title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Year</label>
      <input
        type="number"
        value={event.year}
        onChange={(e) => setYear(e.target.value)}
      />

      <label>Description</label>
      <SimpleEditor className="tiptap-editor" value={event.description} onChange={handleDescriptionChange}></SimpleEditor>

      <label>Color</label>
      <input
        type="color"
        value={event.color}
        onChange={(e) => setColor(e.target.value)}
      />

      <div className="event-editor-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave} className="save-button">Save</button>
      </div>
    </div>
  );
}
