import Modal from '@mui/material/Modal';

export default function ImageViewModal({ open, onClose, src }) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0b0b0b] p-4 rounded-lg">
                <img src={`data:image/jpeg;base64,${src}`} alt="Profile" className="max-w-[80vw] max-h-[80vh] rounded" />
            </div>
        </Modal>
    );
}
