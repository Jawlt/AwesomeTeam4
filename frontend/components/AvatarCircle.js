import { useEffect, useRef, useState } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';

export default function AvatarCircle() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const peerConnectionRef = useRef(null);
  const avatarSynthesizerRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        // Get speech token from backend using the correct URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('Backend URL not configured');
        }

        const tokenResponse = await axios.get(`${backendUrl}/api/speech-token`);
        const { token, region } = tokenResponse.data;

        // Configure with multiple public STUN servers for better reliability
        const peerConnection = new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
                'stun:stun.ekiga.net',
                'stun:stun.ideasip.com',
                'stun:stun.rixtelecom.se',
                'stun:stun.schlund.de'
              ]
            }
          ],
          iceCandidatePoolSize: 10
        });

        peerConnectionRef.current = peerConnection;

        // Log ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE Connection State:', peerConnection.iceConnectionState);
        };

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          if (event.track.kind === 'video' && videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
          if (event.track.kind === 'audio' && audioRef.current) {
            audioRef.current.srcObject = event.streams[0];
          }
        };

        // Add transceivers
        peerConnection.addTransceiver('video', { direction: 'sendrecv' });
        peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

        // Initialize Speech SDK with token
        const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);

        // Configure speech settings
        speechConfig.speechSynthesisLanguage = "en-US";
        speechConfig.speechSynthesisVoiceName = "en-US-JennyMultilingualNeural";

        // Configure avatar
        const avatarConfig = new SpeechSDK.AvatarConfig(
          "lisa",
          "casual-sitting"
        );

        // Create avatar synthesizer
        const avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechConfig, avatarConfig);
        avatarSynthesizerRef.current = avatarSynthesizer;

        // Start avatar
        await avatarSynthesizer.startAvatarAsync(peerConnection);
        setIsConnected(true);

        // Test speech
        const welcomeText = "Hello! I'm your AI training assistant. How can I help you today?";
        await avatarSynthesizer.speakTextAsync(welcomeText);

      } catch (err) {
        console.error('Avatar initialization error:', err);
        setError(err.message);
      }
    };

    initializeAvatar();

    // Cleanup
    return () => {
      if (avatarSynthesizerRef.current) {
        avatarSynthesizerRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const speak = async (text) => {
    if (!avatarSynthesizerRef.current || !isConnected) return;

    try {
      await avatarSynthesizerRef.current.speakTextAsync(text);
    } catch (err) {
      console.error('Speech error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="relative w-64 h-64 rounded-full bg-dark/10 border-2 border-dark/20 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <audio ref={audioRef} autoPlay />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
          <p className="text-red-500 text-sm text-center p-2">{error}</p>
        </div>
      )}
      {!isConnected && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-dark/60">Connecting...</p>
        </div>
      )}
    </div>
  );
}