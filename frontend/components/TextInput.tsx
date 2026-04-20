import React, { useCallback } from 'react';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'onChange' | 'onBlur'> {
    label?: string;
    description?: string;
    name: string;
    id?: string;
    error?: string;
    required?: boolean;
    format?: 'capitalizeName' | 'date' | 'phone';
    type?: 'text' | 'email' | 'tel' | 'url' | 'textarea';
    multiline?: boolean;
    value: string | number | readonly string[] | undefined;
    onChange: (name: string, value: string) => void;
    onBlur?: (name: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, description, name, id, error, required, format, type = 'text', multiline, value, onChange, onBlur, ...props }) => {
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let val = e.target.value;
        const prevVal = String(value ?? '');

        if (format === 'phone') {
            const isDeleting = val.length < prevVal.length;
            let digits = val.replace(/\D/g, '');
            const prevDigits = prevVal.replace(/\D/g, '');

            if (isDeleting && digits.length === prevDigits.length) {
                // User deleted a formatting char, so we manually drop the last digit
                digits = digits.slice(0, -1);
            }

            if (!digits) {
                onChange(name, '');
                return;
            }

            // Standardize starting digit for visual consistency
            if (digits[0] === '8' || digits[0] === '7') {
                digits = '8' + digits.substring(1);
            } else if (digits[0] === '9') {
                digits = '89' + digits.substring(1);
            } else {
                digits = '8' + digits; // Auto-prefix
            }

            let res = '8';
            if (digits.length > 1) {
                res += ' (' + digits.substring(1, 4);
            }
            if (digits.length >= 5) {
                res += ') ' + digits.substring(4, 7);
            }
            if (digits.length >= 8) {
                res += '-' + digits.substring(7, 9);
            }
            if (digits.length >= 10) {
                res += '-' + digits.substring(9, 11);
            }
            
            onChange(name, res);
        } else if (format === 'date') {
            const isDeleting = val.length < prevVal.length;
            
            // If the user deleted the automatically added dot, strip the preceding number too
            if (isDeleting && prevVal.endsWith('.') && val === prevVal.slice(0, -1)) {
                val = val.slice(0, -1);
            }

            const digits = val.replace(/\D/g, '');
            let res = '';
            for (let i = 0; i < digits.length; i++) {
                if (i === 2 || i === 4) {
                    res += '.';
                }
                res += digits[i];
            }
            
            // Auto-append dot while typing
            if (!isDeleting) {
                if (res.length === 2 || res.length === 5) {
                    res += '.';
                }
            }
            
            val = res.slice(0, 10);
            onChange(name, val);
        } else if (format === 'capitalizeName') {
            if (val) {
                val = val
                    .split(/([\s-]+)/)
                    .map(part => part.length > 0 && !/[\s-]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part)
                    .join('');
            }
            onChange(name, val);
        } else {
            onChange(name, val);
        }
    }, [name, onChange, format, value]);
    
    const handleBlur = useCallback(() => {
        if (onBlur) {
            onBlur(name);
        }
    }, [name, onBlur]);

    const inputClasses = `
        w-full px-4 py-3 border rounded-md bg-white
        text-gray-900 placeholder-gray-400 
        focus-visible:outline-none focus-visible:ring-2
        ${error ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500' : 'border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500'}
        transition duration-150 ease-in-out text-base
    `;

    const commonProps = {
        id: id || name,
        name,
        value: value ?? '',
        required,
        onChange: handleChange,
        onBlur: handleBlur,
        ...props,
    };

    return (
        <div>
            {label && (
                <label htmlFor={id || name} className="block text-base font-semibold text-gray-800 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {description && (
                <p className="text-sm text-gray-500 mb-3">{description}</p>
            )}
            {type === 'textarea' || multiline ? (
                <textarea
                    {...commonProps}
                    className={`${inputClasses} min-h-[100px]`}
                    rows={4}
                />
            ) : (
                <input
                    {...commonProps}
                    type={type}
                    className={inputClasses}
                />
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default React.memo(TextInput);