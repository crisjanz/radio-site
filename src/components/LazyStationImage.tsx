import { useState, useRef, useEffect } from 'react';
import { getFaviconUrl } from '../config/api';

interface LazyStationImageProps {
  station: { id: number; favicon?: string; logo?: string; local_image_url?: string };
  alt: string;
  className?: string;
  fallbackClassName?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  width?: number;
  height?: number;
  quality?: number;
}

export default function LazyStationImage({ 
  station, 
  alt, 
  className = '', 
  fallbackClassName = '',
  style,
  onError,
  width = 64,
  height = 64,
  quality = 85
}: LazyStationImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageUrl = getFaviconUrl(station, { width, height, quality });

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} style={style}>
      {isInView && imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={style}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      ) : null}
      
      {/* Fallback/Loading state */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          (hasError || !imageUrl || (!isInView && !isLoaded)) ? 'opacity-100' : 'opacity-0'
        } ${fallbackClassName || 'bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'}`}
      >
        {!isInView ? (
          // Loading placeholder
          <div className="animate-pulse bg-gray-300 rounded w-full h-full"></div>
        ) : (
          // Fallback image
          <img src="/streemr-play.png" alt="Streemr" className="w-8 h-8 object-contain opacity-50" />
        )}
      </div>
    </div>
  );
}