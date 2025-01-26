import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const AvatarCircle = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const animationStateRef = useRef({ isAnimating: false });

  useImperativeHandle(ref, () => ({
    speak: async (text) => {
      if (!synth) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower rate
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Analyze text for animation
      const words = text.split(' ');
      const averageWordDuration = 300; // ms per word
      const totalDuration = words.length * averageWordDuration;
      
      utterance.onstart = () => startMouthAnimation(words);
      utterance.onend = () => stopMouthAnimation();
      
      synth.speak(utterance);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    function drawFace(mouthOpenness = 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Face circle
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE0BD';
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(85, 100, 10, 0, Math.PI * 2);
      ctx.arc(171, 100, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth - now with variable openness
      ctx.beginPath();
      if (mouthOpenness > 0) {
        ctx.ellipse(128, 160, 30, mouthOpenness * 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#701010';
        ctx.fill();
        
        // Inner mouth
        ctx.beginPath();
        ctx.ellipse(128, 160 + (mouthOpenness * 5), 20, mouthOpenness * 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#450808';
        ctx.fill();
      } else {
        ctx.moveTo(98, 160);
        ctx.lineTo(158, 160);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.stroke();
      }
    }

    // Initial draw
    drawFace(0);

    let animationFrame;
    const frameRate = 60;
    const frameDuration = 1000 / frameRate;
    let lastFrameTime = 0;

    function getPhonemeOpenness(char) {
      const openPhonemes = 'aeiouAEIOU';
      const mediumPhonemes = 'mnNM';
      const closedPhonemes = 'bcdfghjklpqrstvwxyzBCDFGHJKLPQRSTVWXYZ';
      
      if (openPhonemes.includes(char)) return 1;
      if (mediumPhonemes.includes(char)) return 0.5;
      if (closedPhonemes.includes(char)) return 0.2;
      return 0;
    }

    function animate(words, timestamp) {
      if (!animationStateRef.current.isAnimating) return;
      
      if (!lastFrameTime) lastFrameTime = timestamp;
      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed >= frameDuration) {
        const currentTime = timestamp % 1000;
        const wordIndex = Math.floor(timestamp / 300) % words.length;
        const currentWord = words[wordIndex];
        
        if (currentWord) {
          const charIndex = Math.floor((currentTime % 300) / 300 * currentWord.length);
          const currentChar = currentWord[charIndex] || '';
          const openness = getPhonemeOpenness(currentChar);
          
          // Smooth transition
          const targetOpenness = openness;
          const currentOpenness = animationStateRef.current.currentOpenness || 0;
          const smoothOpenness = currentOpenness + (targetOpenness - currentOpenness) * 0.3;
          
          animationStateRef.current.currentOpenness = smoothOpenness;
          drawFace(smoothOpenness);
        }
        
        lastFrameTime = timestamp;
      }
      
      animationFrame = requestAnimationFrame((t) => animate(words, t));
    }

    function startMouthAnimation(words) {
      animationStateRef.current.isAnimating = true;
      animationStateRef.current.currentOpenness = 0;
      if (!animationFrame) {
        animate(words, performance.now());
      }
    }

    function stopMouthAnimation() {
      animationStateRef.current.isAnimating = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      drawFace(0);
    }

    // Export animation controls
    window.startMouthAnimation = startMouthAnimation;
    window.stopMouthAnimation = stopMouthAnimation;

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="relative w-64 h-64 rounded-full bg-dark/10 border-2 border-dark/20 overflow-hidden">
      <canvas
        ref={canvasRef}
        width="256"
        height="256"
        className="w-full h-full"
      />
      <audio ref={audioRef} />
    </div>
  );
});

AvatarCircle.displayName = 'AvatarCircle';
export default AvatarCircle;