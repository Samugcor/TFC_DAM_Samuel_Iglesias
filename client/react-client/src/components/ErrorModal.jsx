import Modal from "./Modal";

export default function ErrorModal({ message, onClose }) {
  return (
    <Modal title="Error" onClose={onClose}>
      <p>{message}</p>
    </Modal>
  );
}
