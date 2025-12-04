import Modal from "./Modal";
import { useState } from "react";
import '../styles/NewTimeLineModal.css';

export default function NewTimeLineModal({ onCreate, onClose }) {
  const [timeline, setTimeline] = useState({
    name: "",
    description: "",
    anioInicio: "",
    anioFin: "",
    yearSegments: 1,
  });

  const handleCreate = () => {
    // Validate required fields
    if (!timeline.name || !timeline.anioInicio || !timeline.anioFin) {
      alert("Please fill in name, start year and end year.");
      return;
    }
    // Convert years to numbers
    const prepared = {
      ...timeline,
      anioInicio: Number(timeline.anioInicio),
      anioFin: Number(timeline.anioFin),
    };
    onCreate(prepared);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Timeline</h2>
        <label>
          Name
          <input
            type="text"
            value={timeline.name}
            onChange={(e) => setTimeline({ ...timeline, name: e.target.value })}
          />
        </label>

        <label>
          Description
          <textarea
            value={timeline.description}
            onChange={(e) =>
              setTimeline({ ...timeline, description: e.target.value })
            }
          />
        </label>

        <div className="year_inputs">
          <label>
          Start Year
          <input
              type="number"
              value={timeline.anioInicio}
              onChange={(e) =>
                setTimeline({ ...timeline, anioInicio: e.target.value })
              }
            />
          </label>
              _
          <label>
            End Year
            <input
              type="number"
              value={timeline.anioFin}
              onChange={(e) =>
                setTimeline({ ...timeline, anioFin: e.target.value })
              }
            />
          </label>
        </div>

        <div className="segment_year_inputs">
          <label>
            Segmentos de año
            <input
              type="number"
              min="1"
              value={timeline.yearSegments}
              onChange={(e) =>
                setTimeline({ ...timeline, yearSegments: Number(e.target.value) })
              }
            />
          </label>
          <span className="tooltip-icon">?</span>
          <span className="tooltip-text">
            The number of years each segment in the timeline represents.
          </span>
        </div>

        <div className="modal-actions">
          <button className="secondary_button light" onClick={onClose}>Cancel</button>
          <button className="secondary_button dark" onClick={handleCreate}>Create</button>
        </div>
      </div>
    </div>
  );
}
