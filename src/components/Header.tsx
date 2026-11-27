import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onQuickScrim: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'map_control', label: 'S&D Map Control' },
  { id: 'match_desk', label: 'CDL Match Desk' },
  { id: 'cdl_intel', label: 'CDL v1.0 Intel' },
  { id: 'vault', label: 'Loadout & Vault' },
];

export function Header({
  activeTab,
  onSelectTab,
  onQuickScrim,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: AppTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090A0D]/95 backdrop-blur-md border-b border-[#22252E]">
      <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('map_control')}
          className="font-display text-xl font-semibold tracking-tight text-[#F3F1EC] hover:text-[#C9A86A] transition-colors whitespace-nowrap shrink-0"
        >
          Rule One
        </button>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#F3F1EC]'
                    : 'text-[#9C9A94] hover:text-[#F3F1EC]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#C9A86A]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onQuickScrim}
            className="px-4 py-2 text-sm font-medium text-[#090A0D] bg-[#C9A86A] hover:bg-[#D7B97E] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Run S&amp;D Scrim
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2.5 text-[#F3F1EC] hover:text-[#C9A86A] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#22252E] bg-[#0D0F14] px-6 py-4 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#171A22] text-[#C9A86A]'
                    : 'text-[#9C9A94] hover:text-[#F3F1EC]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
