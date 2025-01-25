import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  
  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

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
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-dark">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex justify-between items-center bg-card p-2 rounded shadow-sm">
                <span className="truncate text-dark">{file.name}</span>
                <button
                  onClick={() => removeFile(file)}
                  className="text-primary hover:text-primary-hover"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button 
            className="mt-4 w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition-colors"
            onClick={() => console.log('Submit files:', files)}
          >
            Submit Files
          </button>
        </div>
      )}
    </div>
  );
}