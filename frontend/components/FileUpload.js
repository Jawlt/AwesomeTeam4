import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import FilePreview from './FilePreview';

export default function FileUpload({ onSubmit }) {
  const [files, setFiles] = useState([]);
  
  const onDrop = useCallback(acceptedFiles => {
    const filesWithPreview = acceptedFiles.map(file => {
      return Object.assign(file, {
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : null
      });
    });
    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (fileToRemove) => {
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleSubmit = () => {
    onSubmit(files);
    setFiles([]); // Clear files after submission
  };

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="w-full max-w-md">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-dark/20 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <p className="text-dark">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-sm text-dark/60 mt-2">
          Supported files: Images, PDF, Text
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-dark">Selected Files:</h3>
          <ul className="space-y-3">
            {files.map((file, index) => (
              <FilePreview
                key={index}
                file={file}
                onRemove={() => removeFile(file)}
              />
            ))}
          </ul>
          <button 
            className="mt-4 w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition-colors"
            onClick={handleSubmit}
          >
            Submit Files
          </button>
        </div>
      )}
    </div>
  );
}