import React, { useCallback, useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
    label?: string;
    description?: string;
    name: string;
    value: File | null;
    onChange: (name: string, file: File | null) => void;
    error?: string;
    accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    label, 
    description, 
    name, 
    value, 
    onChange, 
    error,
    accept = ".pdf,.doc,.docx,.ppt,.pptx"
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            onChange(name, file);
        }
    }, [name, onChange]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onChange(name, e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onChange(name, null);
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-base font-semibold text-white mb-2">
                    {label}
                </label>
            )}
            
            {!value ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer flex flex-col items-center justify-center
                        ${isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'}
                        ${error ? 'border-red-500 bg-red-500/5' : ''}
                    `}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-white/10 p-4 rounded-full mb-4">
                        <UploadCloud className="h-8 w-8 text-blue-300" />
                    </div>
                    <p className="text-lg font-medium text-white mb-2">
                        Нажмите для загрузки или перетащите файл
                    </p>
                    {description && (
                        <p className="text-sm text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            ) : (
                <div className="w-full bg-white/10 border border-white/20 p-5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4 truncate">
                        <div className="bg-blue-600/20 p-3 rounded-lg shrink-0">
                            <File className="h-6 w-6 text-blue-300" />
                        </div>
                        <div className="truncate text-left">
                            <p className="text-white font-medium truncate mb-1" title={value.name}>
                                {value.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>{(value.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span className="flex items-center text-green-400"><CheckCircle2 className="h-4 w-4 mr-1"/> Загружено</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="p-2 shrink-0 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="h-5 w-5 text-gray-300" />
                    </button>
                </div>
            )}
            
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
    );
};

export default FileUpload;
