import React, { useCallback } from 'react';

interface RadioGroupProps {
    label: string;
    name: string;
    options: string[];
    selected: string;
    onChange: (name: string, value: string) => void;
    required?: boolean;
    error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, selected, onChange, required, error }) => {
    const handleChange = useCallback((value: string) => {
        onChange(name, value);
    }, [name, onChange]);
    
    return (
        <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex flex-col gap-3">
                {options.map(option => (
                    <label
                        key={option}
                        className={`
                            relative flex items-start cursor-pointer px-5 py-4 rounded-xl border transition-all duration-200
                            ${selected === option 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md !opacity-100' 
                                : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 hover:border-white/30'
                            }
                        `}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={selected === option}
                            onChange={() => handleChange(option)}
                            className="sr-only"
                        />
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected === option ? 'border-white' : 'border-gray-300'} mr-4`}>
                            {selected === option && <div className="h-2.5 w-2.5 rounded-full radio-dot bg-white" />}
                        </div>
                        <span className="font-medium text-base">{option}</span>
                    </label>
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default React.memo(RadioGroup);