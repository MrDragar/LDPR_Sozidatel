import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Changed import from 'react-dom/client' to 'react-dom' to correctly use createPortal.
import ReactDOM from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import MobileSelect from './MobileSelect';

interface SearchableSelectProps {
    label: string;
    name: string;
    id?: string;
    options: string[];
    selected: string;
    onChange: (name: string, value: string) => void;
    onBlur?: (name: string) => void;
    error?: string;
    required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ label, name, id, options, selected, onChange, onBlur, error, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

     const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBlur = useCallback(() => {
        if (onBlur) {
            onBlur(name);
        }
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
    }, [isOpen, handleBlur, wrapperRef, isMobile]);

    useEffect(() => {
        if (isOpen && !isMobile && inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
        }
    }, [isOpen, isMobile]);

    const handleSelect = (option: string) => {
        onChange(name, option);
        setSearchTerm('');
        setIsOpen(false);
        // FIX: Removed onBlur call. The parent's onChange handler now correctly
        // re-validates the field if it was already touched, clearing the error.
        // Calling onBlur here caused a race condition where validation ran on stale state.
    };

    const handleToggle = () => {
        const willBeOpen = !isOpen;
        setIsOpen(willBeOpen);
        if (!willBeOpen) {
            handleBlur();
        }
    };
    
    const handleMobileClose = () => {
        setIsOpen(false);
        handleBlur();
    };

    const portalRoot = document.getElementById('root');

    if (isMobile && portalRoot) {
        return (
             <>
                <label htmlFor={id || name} className="block text-base font-semibold text-gray-800 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <button
                    id={id || name}
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`w-full px-4 py-3 text-left bg-white border rounded-md flex justify-between items-center text-base cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500'}`}
                >
                    <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
                        {selected || 'Выберите...'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {isOpen && ReactDOM.createPortal(
                    <MobileSelect
                        isOpen={isOpen}
                        onClose={handleMobileClose}
                        options={options}
                        selectedOption={selected}
                        onSelect={handleSelect}
                        title={label}
                        isSearchable
                    />,
                    portalRoot
                )}
            </>
        );
    }


    return (
        <div ref={wrapperRef} className="relative">
            <label htmlFor={id || name} className="block text-base font-semibold text-gray-800 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div>
                <button
                    id={id || name}
                    type="button"
                    onClick={handleToggle}
                    className={`w-full px-4 py-3 text-left bg-white border rounded-md flex justify-between items-center text-base cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500'}`}
                >
                    <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
                        {selected || 'Выберите...'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div ref={dropdownRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg searchable-dropdown-pc overflow-hidden flex flex-col">
                        <div className="p-2 shrink-0 border-b border-white/10">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Поиск..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition duration-150 ease-in-out"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className="max-h-80 overflow-y-auto region-scrollbar pb-1">
                            {filteredOptions.length > 0 ? filteredOptions.map(option => (
                                <li
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-2 cursor-pointer transition-colors flex items-center justify-between ${selected === option ? 'selected bg-blue-600 text-white' : 'text-gray-900 hover:bg-blue-100'}`}
                                >
                                    <span>{option}</span>
                                    {selected === option && <Check className="h-5 w-5 shrink-0" />}
                                </li>
                            )) : <li className="px-4 py-2 text-gray-500">Не найдено</li>}
                        </ul>
                    </div>
                )}
            </div>
             {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default React.memo(SearchableSelect);