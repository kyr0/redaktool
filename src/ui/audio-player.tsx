import React, { useState, useEffect, useRef } from 'react';

export const AudioPlayer = ({ audioBlob, className }: { audioBlob: Blob | null, className?: string}) => {
    const [audioUrl, setAudioUrl] = useState<string | null>("");

    useEffect(() => {
      if (audioBlob) {

          console.log('audio blob', audioBlob)
          // Create an object URL for the Blob
          const url = URL.createObjectURL(audioBlob);
          console.log('object url', url)
          setAudioUrl(url);

          // Cleanup
          return () => {
              URL.revokeObjectURL(url);
              setAudioUrl(null);
          };
      }
  }, [audioBlob]);

    return (
      <div>
        {audioUrl && <audio src={audioUrl} controls className={`ab-w-[100%] ab-h-[30px] ${className}`}/>}
      </div>
    );
};

export default AudioPlayer;