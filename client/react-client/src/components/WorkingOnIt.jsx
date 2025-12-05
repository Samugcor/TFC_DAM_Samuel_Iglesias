import Modal from "./Modal";
import '../styles/MyModal.css';

export default function ErrorModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="mymodal working_modal ">
        <button className="button_close" onClick={onClose}>X</button>
        <div className="modal_message">
          <h2>We are working on it!</h2>
          <p>It seems like we are currently working to bring you this functionality :)</p>
        </div>
        
      </div>
    </div>
  );
}