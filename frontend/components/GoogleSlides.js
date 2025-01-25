import React, { useState, useRef } from 'react';

const GoogleSlides = ({ presentationId }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const iframeRef = useRef(null);

  const embedUrl = `https://docs.google.com/presentation/d/e/${presentationId}/embed?start=false&loop=false&delayms=3000#slide=${currentSlide}`;

  const goToNextSlide = () => {
    setCurrentSlide(prevSlide => prevSlide + 1);
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }
  };

  const goToPreviousSlide = () => {
    setCurrentSlide(prevSlide => Math.max(1, prevSlide - 1));
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }
  };

  return (
    <div className="relative w-full h-full">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        frameBorder="0"
        className="w-full h-full"
        allowFullScreen={true}
      />
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={goToPreviousSlide}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          Previous
        </button>
        <button
          onClick={goToNextSlide}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
        >
          Next
        </button>
      </div> */}
    </div>
  );
};

export default GoogleSlides;