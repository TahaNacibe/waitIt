import React, { useState } from 'react';
import Image from 'next/image';
import getUserNameFirstLettersForErrorWidget from '@/lib/userName_for_pfpWidget';

const ScrollCard = ({ waitCard }) => {
  const [isErrorSignedOnPfpLoad, setIsErrorSignedOnPfpLoaded] = useState(false);

  return (
    <div className="w-72 h-72 relative rounded-lg overflow-hidden">
      <div
        className="w-full h-full bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${waitCard.image})`,
          filter: 'brightness(0.8)' 
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black">
        {waitCard.owner.photoURL && !isErrorSignedOnPfpLoad ? (
          <Image
            width={500}
            height={500}
            src={waitCard.owner.photoURL}
            onError={() => setIsErrorSignedOnPfpLoaded(true)}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white absolute top-2 right-2 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-white absolute top-2 right-2 bg-black/40 text-center flex items-center justify-center">
            <strong className="text-white font-semibold text-lg">
              {getUserNameFirstLettersForErrorWidget(waitCard.owner.displayName)}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollCard;