'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client'; // Import the useUser hook
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, error } = useUser(); // Check user session status

  // Redirect user to the homepage if authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/'); // Use replace to avoid navigation history clutter
    }
  }, [user, isLoading, router]);

  // Function to handle the login button click
  const loginWithRedirect = () => {
    window.location.href = '/api/auth/login'; // Ensure redirection works correctly
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">
      Error: {error.message}
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      <button 
        onClick={loginWithRedirect}  // Call login function on click
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Login with Auth0
      </button>
    </div>
  );
}
