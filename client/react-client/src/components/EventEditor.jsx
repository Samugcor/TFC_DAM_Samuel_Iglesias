import { useState, useEffect, useCallback } from "react";
import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import ColorInput from "./ColorInput"
import '../styles/EventEditor.css';

export default function EventEditor({ event, onChange, onClose }) {
  const [title, setTitle] = useState(event.title);
  const [year, setYear] = useState(event.year);
  const [color, setColor] = useState(event.color);
  const [description, setDescription] = useState(event.description);

  
  // handler
  const handleDescriptionChange = useCallback((newDescription) => {
    setDescription(newDescription);
  }, []);

  
  const handleSave = () => {
    
  };

  // When switching to another event, update local state
  useEffect(() => {
    setTitle(event.title);
    setYear(event.year);
    setColor(event.color);
    setDescription(event.description);
  }, [event]);
  
  return (
    <div className="event-editor-panel">

      
      <input
        className="title_input"
        //style={{ color: color }} 
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Year</label>
      <input
      className="input_field"
        style={{width: "85px"}}
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
        <button className="secondary_button light" onClick={onClose}>Cancel</button>
        <button className="secondary_button dark" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}
