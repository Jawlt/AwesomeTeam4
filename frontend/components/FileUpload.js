import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import FilePreview from './FilePreview';

export default function FileUpload({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [keyGoals, setKeyGoals] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const selectedFile = acceptedFiles[0]; // Allow only one file
    if (selectedFile) {
      setFile(Object.assign(selectedFile, {
        preview: selectedFile.type.startsWith('image/') 
          ? URL.createObjectURL(selectedFile)
          : null
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 1,  // Limit to one file
    accept: '.pdf,.docx', // Accept both PDF and DOCX files
  });

  const removeFile = () => {
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  };

  const handleSubmit = () => {
    if (file && title.trim() !== '') {
      onSubmit({ file, title, keyGoals });
      removeFile(); // Clear file after submission
      setTitle('');
      setKeyGoals('');
    } else {
      alert('Please provide a title before submitting.');
    }
  };

  // Cleanup preview when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
    };
  }, [file]);

  return (
    <div className="w-full max-w-md">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-dark/20 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <p className="text-dark">
          {isDragActive ? 'Drop a file here' : 'Drag & drop a file here, or click to select'}
        </p>
        <p className="text-sm text-dark/60 mt-2">
          Supported files: Images, PDF, Text (only one at a time)
        </p>
      </div>

      {file && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-dark">Selected File:</h3>
          <FilePreview file={file} onRemove={removeFile} />

          <input
            type="text"
            placeholder="Enter Lecture Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded p-2 text-dark w-full mt-2"
          />

          <textarea
            placeholder="Enter Key Goals"
            value={keyGoals}
            onChange={(e) => setKeyGoals(e.target.value)}
            className="border border-gray-300 rounded p-2 text-dark w-full mt-2"
          />

          <button 
            className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
              title.trim() === '' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
            onClick={handleSubmit}
            disabled={title.trim() === ''}
          >
            Submit File
          </button>
        </div>
      )}
    </div>
  );
}
