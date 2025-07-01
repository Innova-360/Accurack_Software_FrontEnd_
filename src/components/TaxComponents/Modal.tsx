import { X } from "lucide-react";

// Modal component must be defined before it is used in renderModal
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}

export default Modal;