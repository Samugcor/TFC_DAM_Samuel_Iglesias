import { useState } from "react";

export default function EventEditor({ event, onChange, onClose }) {
  const [title, setTitle] = useState(event.title);
  const [year, setYear] = useState(event.year);
  const [description, setDescription] = useState(event.description);
  const [color, setColor] = useState(event.color);

  const handleSave = () => {
    onChange({
      ...event,
      title,
      year: parseInt(year),
      description,
      color
    });
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
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Color</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <div className="event-editor-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave} className="save-button">Save</button>
      </div>
    </div>
  );
}
