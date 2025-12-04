import Modal from "./Modal";
import '../styles/ErrorModal.css';

export default function ErrorModal({ message, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="error_modal ">
        <button className="button_close" onClick={onClose}>X</button>
        <div className="error_message">
          <h2>Hey watch out!</h2>
          <p>{message}</p>
        </div>
        
      </div>
    </div>
  );
}
