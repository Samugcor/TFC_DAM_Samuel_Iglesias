import { useState, useEffect, useCallback } from "react";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import ColorInput from "./ColorInput"

export default function EventEditor({ event, onChange, onClose }) {
  const [title, setTitle] = useState(event.title);
  const [year, setYear] = useState(event.year);
  const [color, setColor] = useState(event.color || "#000000");
  const [description, setDescription] = useState(event.description);

  // When switching to another event, update local state
  useEffect(() => {
    setTitle(event.title);
    setYear(event.year);
    setColor(event.color);
    setDescription(event.description);
  }, [event]);

  const handleDescriptionChange = useCallback((newDescription) => {
    setDescription(newDescription);
  }, []);

  // SAVE button handler
  const handleSave = () => {
    const updated = {
      ...event,
      title,
      year: parseInt(year),
      description,
      color,
    };
    onChange(updated);
  };

  return (
    <div className="event-editor-panel">
      <h3>Edit Event</h3>

      <label>Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Year</label>
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <label>Description</label>
      <SimpleEditor
        className="tiptap-editor"
        value={description}
        onChange={handleDescriptionChange}
      />

      
      <ColorInput color={color} onChange={setColor} /> 

      <div className="event-editor-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
