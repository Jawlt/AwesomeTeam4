'use client';

import { useRouter } from 'next/navigation';

export default function LinkCard({ title, link, localLink, onDelete }) {
  const router = useRouter();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClick = () => {
    router.push(localLink);
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-4 border border-dark/10">
      <div className="flex justify-between items-start mb-2">
        <h3 
          className="text-lg font-semibold text-primary cursor-pointer hover:text-primary-hover"
          onClick={handleClick}
        >
          {title}
        </h3>
        <button
          onClick={onDelete}
          className="p-2 text-dark/60 hover:text-primary transition-colors"
          aria-label="Delete link"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
      <div className="flex">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 bg-background px-3 py-2 rounded-l border border-r-0 border-dark/20 text-sm text-dark"
        />
        <button
          onClick={copyToClipboard}
          className="px-3 bg-gray-200 border border-l-0 border-dark/20 rounded-r hover:bg-gray-300 transition-colors"
          aria-label="Copy link"
        >
          📋
        </button>
      </div>
    </div>
  );
}