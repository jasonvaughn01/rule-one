import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import {
  EXAMPLE_SEARCHES,
  SearchResultGroup,
  runUniversalSearch,
} from '../lib/universalSearch';

interface UniversalSearchBarProps {
  onNavigatePath: (path: string, label?: string) => void;
}

const GROUP_ORDER: SearchResultGroup[] = [
  'Games',
  'Maps & Tactical Boards',
  'Weapon Builds & Meta',
  'Patches & Ranked Intel',
  'Clans & Players',
];

export function UniversalSearchBar({ onNavigatePath }: UniversalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const response = useMemo(() => runUniversalSearch(query), [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const handleSelect = (path: string, title: string) => {
    setOpen(false);
    setQuery('');
    onNavigatePath(path, title);
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <Search
        className="w-4 h-4 text-[#B5BECD] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Search games, maps, builds, clans…"
        aria-label="Search games, maps, builds, or clans"
        className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm sm:text-base bg-[#202632] border border-[#596171] rounded-[9px] text-[#F3F4F7] placeholder:text-[#9AA4B5] focus:border-[#D6B477] focus:outline-none transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-[#B5BECD] hover:text-[#F3F4F7]"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div
          role="region"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-[#151A23] border border-[#343C49] rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto"
        >
          {!query.trim() ? (
            <div className="p-4 space-y-2.5">
              <p className="text-xs font-medium text-[#B5BECD]">
                Popular searches (press <kbd className="px-1.5 py-0.5 rounded bg-[#202632] text-[#F3F4F7] text-[11px]">/</kbd> anytime)
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_SEARCHES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="min-h-[40px] px-3 py-1.5 text-xs sm:text-sm text-[#F3F4F7] bg-[#1C222D] hover:bg-[#262E3D] border border-[#353D4B] hover:border-[#D6B477] rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : response.total === 0 ? (
            <div className="p-4 space-y-2.5">
              <p className="text-sm text-[#B5BECD]">
                No matches for <span className="text-[#F3F4F7]">&ldquo;{query}&rdquo;</span>
              </p>
              {response.didYouMean && (
                <button
                  type="button"
                  onClick={() => setQuery(response.didYouMean!)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg bg-[#1C222D] border border-[#353D4B] text-xs sm:text-sm font-medium text-[#D6B477] hover:border-[#D6B477]"
                >
                  Did you mean: {response.didYouMean}?
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#252C38]">
              {GROUP_ORDER.map((groupName) => {
                const items = response.grouped[groupName];
                if (items.length === 0) return null;
                return (
                  <div key={groupName} className="p-2.5">
                    <p className="px-2.5 pb-1.5 text-xs font-semibold text-[#D6B477]">
                      {groupName}
                    </p>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item.path, item.title)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-lg hover:bg-[#202632] text-left flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#F3F4F7] truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-[#B5BECD] truncate">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#D6B477] shrink-0" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
