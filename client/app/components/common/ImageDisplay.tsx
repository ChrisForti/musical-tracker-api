import React, { useState } from 'react';

interface ImageDisplayProps {
  imageUrl?: string;
  altText: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'full';
  className?: string;
  fallbackIcon?: string;
  showFullSizeOnClick?: boolean;
}

export function ImageDisplay({
  imageUrl,
  altText,
  size = 'medium',
  className = '',
  fallbackIcon = '🎭',
  showFullSizeOnClick = false,
}: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Size configurations
  const sizeClasses = {
    thumbnail: 'w-12 h-12',
    small: 'w-16 h-16', 
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
    full: 'w-full h-auto max-w-md',
  };

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
  };

  const handleImageClick = () => {
    if (showFullSizeOnClick && imageUrl && !imageError) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // If no image URL or image failed to load, show fallback
  if (!imageUrl || imageError) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          bg-gray-200 dark:bg-gray-700 
          flex items-center justify-center 
          rounded-lg text-gray-500 dark:text-gray-400
          ${className}
        `}
      >
        <span className="text-2xl">{fallbackIcon}</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Image */}
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={altText}
          className={`
            ${sizeClasses[size]} 
            object-cover rounded-lg
            ${showFullSizeOnClick ? 'cursor-pointer hover:opacity-90' : ''}
            ${loading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-200
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handleImageClick}
        />
      </div>

      {/* Full Size Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}