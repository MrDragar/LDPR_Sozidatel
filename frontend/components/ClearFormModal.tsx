import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ClearFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ClearFormModal: React.FC<ClearFormModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640); // sm breakpoint

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const portalRoot = document.getElementById('root') || document.body;

    if (isMobile) {
        return ReactDOM.createPortal(
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                    onClick={onClose}
                />
                <div className="relative bg-white w-full rounded-t-3xl shadow-2xl flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0" />
                    
                    <div className="text-center mb-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4 shadow-sm">
                            <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Очистить форму?</h3>
                        <p className="text-base text-gray-500">
                            Все введенные данные будут удалены без возможности восстановления. Вы уверены?
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-4 py-4 text-lg font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            Да, очистить
                        </button>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-xl border border-gray-300 bg-white px-4 py-4 text-lg font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>,
            portalRoot
        );
    }

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-200 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1.5 transition-colors focus:outline-none"
                    aria-label="Закрыть"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <div className="sm:flex sm:items-start mb-6">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-4 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 className="text-lg font-bold leading-6 text-gray-900">
                            Очистить форму?
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Все введенные данные будут удалены без возможности восстановления. Вы уверены?
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row-reverse gap-3 mt-5">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-xl border border-transparent bg-red-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Очистить
                    </button>
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>,
        portalRoot
    );
};

export default ClearFormModal;
