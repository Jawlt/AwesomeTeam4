'use client';

import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import LinkCard from '@/components/LinkCard';

const links = [
  {
    title: 'Apple Tech Training',
    link: 'https://securityheretraining.com'
  },
  {
    title: 'Oracle Security Training',
    link: 'https://securityheretraining.com'
  },
  {
    title: 'Microsoft M365 Training',
    link: 'https://securityheretraining.com'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <FileUpload />
          </div>
          <div className="space-y-4">
            {links.map((item, index) => (
              <LinkCard
                key={index}
                title={item.title}
                link={item.link}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}