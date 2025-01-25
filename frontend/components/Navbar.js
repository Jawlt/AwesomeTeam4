import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-primary text-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Auto Training</h1>
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white">👤</span>
          </button>
          
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10">
              <button 
                className="block w-full text-left px-4 py-2 text-sm text-dark hover:bg-primary hover:text-white"
                onClick={() => {
                    window.location.href = '/api/auth/logout';
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}