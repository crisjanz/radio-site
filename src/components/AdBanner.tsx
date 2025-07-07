import React, { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  responsive = true,
  className = '',
  style = {}
}) => {
  useEffect(() => {
    try {
      // Only initialize if AdSense is loaded and approved
      if (window.adsbygoogle && window.adsbygoogle.push) {
        window.adsbygoogle.push({});
      }
    } catch (error) {
      // Silently handle errors during development/before approval
      console.debug('AdSense not ready:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  return (
    <div 
      className={`ad-container ${className}`} 
      style={{
        // Default styles
        height: '60px',
        minHeight: '60px', 
        maxHeight: '100px',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
        border: '1px dashed #e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#6c757d',
        // Override with passed styles
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
        data-ad-client="ca-pub-2704220713309204"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
      <span style={{ position: 'absolute', opacity: 0.3 }}>Ad Space</span>
    </div>
  );
};

export default AdBanner;