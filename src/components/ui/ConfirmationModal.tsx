import { AlertCircle, X } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    description?: string;
    confirmText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'proceed' | 'primary';
}

export default function ConfirmationModal({
    isOpen, onClose, onConfirm, title, description, confirmText = "Delete", isLoading, variant = 'danger'
}: ConfirmationModalProps) {
    const modalRef = useClickOutside<HTMLDivElement>(onClose);
    if (!isOpen) return null;

    const getIconColor = () => {
        switch (variant) {
            case 'danger': return 'bg-red-50 border-red-100 text-red-500';
            case 'warning': return 'bg-yellow-50 border-yellow-100 text-yellow-600';
            case 'primary': return 'bg-green-50 border-green-100 text-brand';
            case 'proceed': return 'bg-green-50 border-green-100 text-brand';
            default: return 'bg-red-50 border-red-100 text-red-500';
        }
    };

    const getButtonVariant = () => {
        if (variant === 'danger') return 'danger';
        return 'primary';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div ref={modalRef} className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" disabled={isLoading}><X size={20} /></button>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${getIconColor()}`}>
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-[#101828] mb-2">{title}</h3>
                    <p className="text-[#667085] text-sm leading-relaxed mb-8">{description}</p>
                    <div className="flex gap-3 w-full">
                        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>Cancel</Button>
                        <Button variant={getButtonVariant()} onClick={onConfirm} isLoading={isLoading} className="flex-1">
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}