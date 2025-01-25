'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import LinkCard from '@/components/LinkCard';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error.message}</div>;
  }
  
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

  useEffect(() => {
    // Get the base URL of the application
    const url = window.location.origin;
    setBaseUrl(url);
    // Update links with base URL
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