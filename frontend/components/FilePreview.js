export default function FilePreview({ file, onRemove }) {
    const getFileIcon = (type) => {
      if (type.startsWith('image/')) return '🖼️';
      if (type === 'application/pdf') return '📄';
      if (type === 'text/plain') return '📝';
      return '📎';
    };
  
    return (
      <li className="flex items-center gap-3 bg-card p-3 rounded-lg shadow-sm">
        {file.preview ? (
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-dark/5 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{getFileIcon(file.type)}</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-dark truncate">
            {file.name}
          </p>
          <p className="text-xs text-dark/60">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        
        <button
          onClick={onRemove}
          className="p-1 text-dark/60 hover:text-primary transition-colors"
          aria-label="Remove file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </li>
    );
  }