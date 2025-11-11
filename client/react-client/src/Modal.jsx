import "./styles/Modal.css";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {title && <h2>{title}</h2>}
        <div className="modal-content">{children}</div>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}