// ./NewTimeLineModal.jsx
import Modal from "./Modal";
import { useState } from "react";

export default function NewTimeLineModal({ onCreate, onClose }) {
  const [timeline, setTimeline] = useState({
    name: "",
    description: "",
    anioInicio: "",
    anioFin: "",
    segmentos: 1,
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
    <Modal title="Create New Timeline" onClose={onClose}>
      <label>
        Name:
        <input
          type="text"
          value={timeline.name}
          onChange={(e) => setTimeline({ ...timeline, name: e.target.value })}
        />
      </label>

      <label>
        Description:
        <textarea
          value={timeline.description}
          onChange={(e) =>
            setTimeline({ ...timeline, description: e.target.value })
          }
        />
      </label>

      <label>
        Start Year:
        <input
          type="number"
          value={timeline.anioInicio}
          onChange={(e) =>
            setTimeline({ ...timeline, anioInicio: e.target.value })
          }
        />
      </label>

      <label>
        End Year:
        <input
          type="number"
          value={timeline.anioFin}
          onChange={(e) =>
            setTimeline({ ...timeline, anioFin: e.target.value })
          }
        />
      </label>

      <label>
        Segments:
        <input
          type="number"
          min="1"
          value={timeline.segmentos}
          onChange={(e) =>
            setTimeline({ ...timeline, segmentos: Number(e.target.value) })
          }
        />
      </label>

      <div className="modal-actions">
        <button onClick={handleCreate}>Create</button>
      </div>
    </Modal>
  );
}
