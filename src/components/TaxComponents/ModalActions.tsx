function ModalActions({ onClose, onSave }: { onClose: () => void; onSave?: () => void }) {
    return (
        <div className="flex gap-x-4 justify-end">
            <button className="bg-white py-2 px-3 text-black rounded-xl pr-4 border border-gray-300" onClick={onClose}>
                Cancel
            </button>
            <button className="bg-[#043E49] py-2 px-3 text-white rounded-xl" onClick={onSave}>
                Save
            </button>
        </div>
    );
}

export default ModalActions;