import { GameCategory } from '../data/gameCatalog';

interface CategoryArtFallbackProps {
  title: string;
  category: GameCategory;
  className?: string;
}

/**
 * Appendix A compliant original black-and-gold abstract category SVG visual.
 * Contains zero publisher logos or imitated characters; title typography kept separate.
 */
export function CategoryArtFallback({
  title,
  category,
  className = '',
}: CategoryArtFallbackProps) {
  const patternAccent =
    category === 'Tactical FPS'
      ? 'M 20 120 L 140 40 L 260 120 L 380 40'
      : category === 'Battle royale'
      ? 'M 200 18 A 70 70 0 1 0 200 158 A 70 70 0 1 0 200 18'
      : category === 'MOBA'
      ? 'M 30 150 L 370 20 M 30 20 L 370 150'
      : category === 'Sports and racing'
      ? 'M 20 130 Q 200 10 380 130 M 20 155 Q 200 45 380 155'
      : 'M 60 30 L 200 30 L 340 90 L 200 150 L 60 150 Z';

  return (
    <div
      role="img"
      aria-label={`Original abstract ${category} esports visual for ${title}`}
      className={`relative overflow-hidden bg-[#0D0F14] flex flex-col justify-between p-4 ${className}`}
    >
      <svg
        viewBox="0 0 400 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-55"
      >
        <defs>
          <linearGradient id={`r1-grad-${category.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#171A23" />
            <stop offset="100%" stopColor="#090A0D" />
          </linearGradient>
        </defs>
        <rect width="400" height="180" fill={`url(#r1-grad-${category.replace(/\s+/g, '-')})`} />
        <g stroke="#22252E" strokeWidth="1">
          <line x1="0" y1="45" x2="400" y2="45" />
          <line x1="0" y1="90" x2="400" y2="90" />
          <line x1="0" y1="135" x2="400" y2="135" />
          <line x1="100" y1="0" x2="100" y2="180" />
          <line x1="200" y1="0" x2="200" y2="180" />
          <line x1="300" y1="0" x2="300" y2="180" />
        </g>
        <path d={patternAccent} fill="none" stroke="#C9A86A" strokeWidth="2.2" strokeOpacity="0.65" />
        <circle cx="200" cy="90" r="24" fill="none" stroke="#C9A86A" strokeWidth="1.2" strokeOpacity="0.4" />
      </svg>

      <span className="relative z-10 font-mono text-[10px] tracking-wider uppercase text-[#C9A86A]">
        {category}
      </span>
      <span className="relative z-10 font-display text-base font-semibold text-[#F3F1EC] leading-snug">
        {title}
      </span>
    </div>
  );
}
