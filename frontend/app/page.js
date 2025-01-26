'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import LinkCard from '@/components/LinkCard';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [linkCards, setLinkCards] = useState([
    {
      title: 'Apple Tech Training',
      link: ''
    },
    {
      title: 'Oracle Security Training',
      link: ''
    },
    {
      title: 'Microsoft M365 Training',
      link: ''
    }
  ]);

  // Redirect user to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Call the addUser API after authentication
  useEffect(() => {
    if (user) {
      const addUser = async () => {
        try {
          const response = await fetch('/api/auth/addUser', {
            method: 'POST', // Ensure you are using POST
            headers: {
              'Content-Type': 'application/json', // Specify JSON content type
            },
            body: JSON.stringify({
              auth0Id: user.sub,       // Sending the Auth0 user information
              email: user.email,       // Sending the user's email
              name: user.name,         // Sending the user's name
              email_verified: user.email_verified, // Sending the email_verified status
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('Error adding user:', data.error);
          } else {
            console.log('User added successfully:', data.message);
          }
        } catch (err) {
          console.error('Failed to connect to the server:', err);
        }
      };

      addUser();
    }
  }, [user]);

  // Set base URL and update links
  useEffect(() => {
    const url = window.location.origin;
    setBaseUrl(url);
    setLinkCards(prevCards => 
      prevCards.map(card => ({
        ...card,
        link: `${url}/training/${encodeURIComponent(card.title)}`
      }))
    );
  }, []);

  const handleDeleteLink = (index) => {
    setLinkCards(prevCards => prevCards.filter((_, i) => i !== index));
  };

  const handleFilesSubmit = (files) => {
    const newLink = {
      title: 'Untitled',
      link: `${baseUrl}/training/${encodeURIComponent('Untitled')}`
    };
    setLinkCards(prevCards => [...prevCards, newLink]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <FileUpload onSubmit={handleFilesSubmit} />
          </div>
          <div className="space-y-4">
            {linkCards.map((item, index) => (
              <LinkCard
                key={index}
                title={item.title}
                link={item.link}
                localLink={item.link.replace(baseUrl, '')}
                onDelete={() => handleDeleteLink(index)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
