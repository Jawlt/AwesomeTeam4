import { useState, useEffect } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export default function MicrophoneButton({ isActive, onClick, avatarReady }) {
  const [buttonText, setButtonText] = useState('Raise Your Hand');
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if(!avatarReady && buttonText === 'Speak Now') {
      setButtonText('Wait...');
      setIsDisabled(true);
    }
    if (avatarReady && buttonText === 'Wait...') {
      setButtonText('Speak Now');
      setIsDisabled(false);
    }
    console.log("The avatar is ready to listen? ", avatarReady);
  }, [avatarReady, buttonText]);

  const handleClick = () => {
    if (buttonText === 'Speak Now') {
      setButtonText('Raise Your Hand');
    } else {
      setButtonText('Wait...');
      setIsDisabled(true);
    }
    onClick();
  };

  
  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`w-32 h-12 rounded-full flex items-center justify-center transition-colors ${
        isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'
      } ${isDisabled ? 'cursor-not-allowed' : ''}`}
    >
      <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
        {buttonText}
      </span>
    </button>
  );
}