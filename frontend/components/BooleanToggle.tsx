import React from 'react';

interface BooleanToggleProps {
    label: string;
    description?: string;
    name: string;
    value: boolean | null;
    onChange: (name: string, value: boolean) => void;
    required?: boolean;
    error?: string;
}

const BooleanToggle: React.FC<BooleanToggleProps> = ({ label, description, name, value, onChange, required, error }) => {
    return (
        <div className="mb-6">
            <label className="block text-base font-semibold mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {description && <p className="text-sm opacity-70 mb-3">{description}</p>}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => onChange(name, true)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-center font-semibold transition-all duration-200 ${
                        value === true 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md !opacity-100' 
                            : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'
                    }`}
                >
                    Да
                </button>
                <button
                    type="button"
                    onClick={() => onChange(name, false)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-center font-semibold transition-all duration-200 ${
                        value === false 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md !opacity-100' 
                            : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'
                    }`}
                >
                    Нет
                </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default React.memo(BooleanToggle);
