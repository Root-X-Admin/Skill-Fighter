import Cropper from 'react-easy-crop';
import { useCallback, useState } from 'react';
import getCroppedImg from '../utils/cropImage';
import Modal from '@mui/material/Modal';

export default function ProfilePicModal({ open, onClose, onSave }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, croppedArea) => {
        setCroppedAreaPixels(croppedArea);
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setImageSrc(reader.result);
    };

    const handleSave = async () => {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        onSave(croppedImage);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <div className="absolute top-1/2 left-1/2 w-[90vw] md:w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1c] text-white p-4 rounded">
                {!imageSrc ? (
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                ) : (
                    <>
                        <div className="relative w-full h-[300px]">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="flex justify-end mt-3 space-x-2">
                            <button onClick={handleSave} className="bg-green-600 px-3 py-1 rounded">Save</button>
                            <button onClick={onClose} className="bg-red-500 px-3 py-1 rounded">Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
