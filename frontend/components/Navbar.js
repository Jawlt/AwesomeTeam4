import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-primary text-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        <div className="flex-grow text-center">
          <h1 className="text-4xl font-bold">itrainU</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            <img src="/logo.png" alt="logo" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-primary hover:text-white transition"
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
