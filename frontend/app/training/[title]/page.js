'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GoogleSlides from '@/components/GoogleSlides';
import AvatarCircle from '@/components/AvatarCircle';
import MicrophoneButton from '@/components/MicrophoneButton';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';

export default function TrainingPage() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [isAvatarReady, setIsAvatarReady] = useState(false);
  const avatarRef = useRef(null);
  const params = useParams();
  const title = decodeURIComponent(params.title);
  const presentationId = '2PACX-1vQZJuY2sXryjYVYZa60igqZhVevkovTzR3NFqVNHgWXH42csZdf2zIMfNKPWs4lwMZGcXIL_zpyqNTD';

  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/speech-token`);
        const { token, region } = response.data;

        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        setRecognizer(newRecognizer);
      } catch (error) {
        console.error('Failed to initialize speech recognition:', error);
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, []);

  const raiseHand = async () => {
    if (!recognizer) return;

    if(!isAvatarReady) {
      //let the avatar know the user wants to speak
      //avatar will finish its current sentence and then set isAvatarReady to true
      if (avatarRef.current) {
        await avatarRef.current.speak('What can I help you with?');
      }
      setIsAvatarReady(true);
    }
    if (!isMicActive) {
      // Start recognition
      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const text = e.result.text;
          console.log('Recognized:', text);
          
          // Process the recognized text and get avatar to respond
          processUserInput(text);
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          setIsMicActive(true);
          console.log('Recognition started');
        },
        (error) => {
          console.error('Error starting recognition:', error);
        }
      );
    } else {
      // Stop recognition
      recognizer.stopContinuousRecognitionAsync(
        () => {
          setIsMicActive(false);
          console.log('Recognition stopped');
        },
        (error) => {
          console.error('Error stopping recognition:', error);
        }
      );
    }
  };

  const processUserInput = async (text) => {
    try {
      // Simple response logic - you can expand this based on your needs
      let response = '';
      if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
        response = "Hello! How can I help you today?";
      } else if (text.toLowerCase().includes('how are you')) {
        response = "I'm doing well, thank you for asking! How can I assist you with your training?";
      } else if (text.toLowerCase().includes('bye') || text.toLowerCase().includes('goodbye')) {
        response = "Goodbye! Feel free to come back if you have more questions.";
      } else {
        response = "I heard you say: " + text + ". How can I help you with that?";
      }

      // Make the avatar speak the response
      if (avatarRef.current) {
        setIsMicActive(false);
        setIsAvatarReady(false);
        await avatarRef.current.speak(response);
        setIsAvatarReady(true);
        setIsMicActive(true);
      }
    } catch (error) {
      console.error('Error processing user input:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">{title}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
          <div className="relative aspect-video bg-dark rounded-lg overflow-hidden">
            <GoogleSlides presentationId={presentationId} />
          </div>
          
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center h-full">
              <AvatarCircle ref={avatarRef} />
            </div>
            <div className="flex justify-center">
              <MicrophoneButton 
                isActive={isMicActive}
                onClick={raiseHand}
                avatarReady={isAvatarReady}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}