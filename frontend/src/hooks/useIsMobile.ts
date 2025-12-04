import { useState, useEffect } from 'react';

// Hook to detect mobile viewport. Guards against SSR by checking for window.
export default function useIsMobile(): boolean {
  const isClient = typeof window !== 'undefined';
  const [isMobile, setIsMobile] = useState<boolean>(isClient ? window.innerWidth <= 768 : false);

  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient]);

  return isMobile;
}
