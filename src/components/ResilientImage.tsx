import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fit?: 'cover' | 'contain';
  priority?: boolean;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  fit = 'cover',
  priority = false,
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#161922] via-[#111319] to-[#0B0C10] text-[#9C9A94] border border-[#23262F] ${className}`}
      >
        <Trophy className="w-6 h-6 text-[#C9A86A]/70 mb-2" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-[#9C9A94] px-4 text-center">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain p-4 bg-[#0D0F14]' : 'object-cover'} ${className}`}
    />
  );
}
