import React from 'react';

export interface NominationOption {
    id: string;
    title: string;
    description: string;
}

interface NominationCardsProps {
    name: string;
    options: NominationOption[];
    value: string;
    onChange: (name: string, value: string) => void;
    error?: string;
}

const NominationCards: React.FC<NominationCardsProps> = ({ name, options, value, onChange, error }) => {
    return (
        <div className="flex flex-col space-y-4">
            {options.map((option) => {
                const isSelected = value === option.id;
                return (
                    <label
                        key={option.id}
                        className={`
                            relative flex items-start cursor-pointer rounded-xl border p-5 transition-all duration-200
                            ${isSelected 
                                ? 'border-blue-600 bg-blue-600 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) => onChange(name, e.target.value)}
                            className="sr-only"
                        />
                        <div className={`mt-0.5 mr-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-white' : 'border-gray-300'}`}>
                            {isSelected && <div className="h-2.5 w-2.5 rounded-full radio-dot bg-white" />}
                        </div>
                        <div className="flex w-full items-start justify-between">
                            <div className="flex flex-col">
                                <span className={`block font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    {option.title}
                                </span>
                                <span className={`mt-1 block text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {option.description}
                                </span>
                            </div>
                        </div>
                    </label>
                );
            })}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default NominationCards;
