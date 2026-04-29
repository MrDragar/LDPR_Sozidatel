import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, X, Check } from 'lucide-react';

export interface NominationOption {
    id: string;
    title: string;
    description: string;
}

interface NominationSelectProps {
    label: string;
    name: string;
    id?: string;
    options: NominationOption[];
    selected: string;
    onChange: (name: string, value: string) => void;
    required?: boolean;
    error?: string;
    onBlur?: (name: string) => void;
}

const NominationSelect: React.FC<NominationSelectProps> = ({ label, name, id, options, selected, onChange, required, error, onBlur }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const handleBlur = useCallback(() => {
        if (onBlur) onBlur(name);
    }, [name, onBlur]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false);
                    handleBlur();
                }
            }
        };
        if (!isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            if (!isMobile) {
                document.removeEventListener('mousedown', handleClickOutside);
            }
        };
    }, [isOpen, handleBlur, isMobile]);

    useEffect(() => {
        if (isOpen && !isMobile && dropdownRef.current) {
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            if (dropdownRect.bottom > window.innerHeight) {
                dropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    }, [isOpen, isMobile]);

    const handleSelect = (optionId: string) => {
        onChange(name, optionId);
        setIsOpen(false);
    };

    const handleToggle = () => {
        const willBeOpen = !isOpen;
        setIsOpen(willBeOpen);
        if (!willBeOpen) handleBlur();
    };

    const selectedOption = options.find(o => o.id === selected);

    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    const mobileSheet = isMobile && isOpen && ReactDOM.createPortal(
        <div
            className={`fixed inset-0 z-50 flex flex-col bg-[#11236B] transition-transform duration-300 ease-in-out font-sans animate-in slide-in-from-bottom-full`}
            role="dialog"
            aria-modal="true"
        >
            <header className="flex items-center justify-between p-4 border-b border-white/20 sticky top-0 bg-[#11236B] z-10 shrink-0">
                <h2 className="text-lg font-bold text-white truncate">
                    {label}
                </h2>
                <button
                    onClick={() => { setIsOpen(false); handleBlur(); }}
                    className="p-2 text-gray-400 rounded-full hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                    aria-label="Закрыть"
                >
                    <X className="h-6 w-6" />
                </button>
            </header>

            <ul 
                className="flex-grow overflow-y-auto p-2 region-scrollbar pb-1"
            >
                {options.map((option) => (
                    <li key={option.id}>
                        <button
                            onClick={() => handleSelect(option.id)}
                            className={`w-full flex items-start text-left px-4 py-3.5 rounded-lg border-b border-white/5 last:border-0 transition-colors ${
                                selected === option.id
                                    ? 'selected bg-blue-600 text-white'
                                    : 'text-gray-100 hover:bg-white/5'
                            }`}
                        >
                            <div className="flex-1 pr-2">
                                <span className={`block font-bold text-base mb-1 text-white`}>
                                    {option.title}
                                </span>
                                <span className={`block text-sm leading-snug text-white`}>
                                    {option.description}
                                </span>
                            </div>
                            {selected === option.id && <Check className="h-5 w-5 text-white mt-0.5 shrink-0" />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>,
        document.getElementById('root')!
    );

    return (
        <div ref={wrapperRef} className="relative">
            <label htmlFor={id || name} className="block text-base font-semibold text-white mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <button
                id={id || name}
                type="button"
                onClick={handleToggle}
                className={`w-full px-4 py-3 text-left bg-white/5 border rounded-xl flex justify-between items-center text-base transition-colors cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 ${error ? 'border-red-500 focus-visible:ring-red-500 bg-red-500/5' : 'border-white/20 focus-visible:ring-white/50 hover:bg-white/10'}`}
            >
                <span className={selected ? 'text-white font-medium' : 'text-gray-400'}>
                    {selectedOption ? selectedOption.title : 'Выберите номинацию...'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen && !isMobile ? 'transform rotate-180' : ''}`} />
            </button>
            
            {!isMobile && isOpen && (
                <div ref={dropdownRef} className="absolute z-50 w-full bg-[#11236B] border border-white/20 rounded-xl shadow-2xl mt-2 flex flex-col overflow-hidden searchable-dropdown-pc">
                    <ul className="max-h-96 overflow-y-auto w-full region-scrollbar pb-1">
                        {options.map(option => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`px-4 py-3 w-full cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/10 transition-colors ${selected === option.id ? 'selected bg-blue-600 text-white' : 'text-gray-100 hover:bg-white/5'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <span className={`block font-bold mb-1 text-white`}>
                                            {option.title}
                                        </span>
                                        <span className={`block text-sm leading-snug text-white`}>
                                            {option.description}
                                        </span>
                                    </div>
                                    {selected === option.id && <Check className="h-5 w-5 text-white ml-3 shrink-0 mt-1" />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            {mobileSheet}
        </div>
    );
};

export default React.memo(NominationSelect);
