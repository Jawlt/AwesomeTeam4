'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import AvatarCircle from '@/components/AvatarCircle';
import MicrophoneButton from '@/components/MicrophoneButton';

export default function TrainingPage() {
  const [isMicActive, setIsMicActive] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">XYZ Training Title</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
          <div className="relative aspect-video bg-dark rounded-lg overflow-hidden">
            <VideoPlayer />
          </div>
          
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center h-full flex justify-center">
              <AvatarCircle />
            </div>
            <div className="flex justify-center">
              <MicrophoneButton 
                isActive={isMicActive} 
                onClick={() => setIsMicActive(!isMicActive)} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}