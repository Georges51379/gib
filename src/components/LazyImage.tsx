import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}

export const LazyImage = ({ src, alt, className, containerClassName }: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({ freezeOnceVisible: true });

  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc]);

  return (
    <div ref={ref} className={containerClassName}>
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt}
          className={className}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onLoad={() => setIsLoaded(true)}
        />
      )}
      {!isLoaded && (
        <div className={`${className} bg-muted animate-pulse`} />
      )}
    </div>
  );
};
