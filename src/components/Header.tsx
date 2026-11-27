import { Menu, X } from 'lucide-react';
import { AppTab, InterfaceMode } from '../types';
import { UniversalSearchBar } from './UniversalSearchBar';

interface HeaderProps {
  activeTab: AppTab;
  interfaceMode?: InterfaceMode;
  onToggleInterfaceMode?: () => void;
  onSelectTab: (tab: AppTab) => void;
  onQuickMapBoard: () => void;
  onNavigatePath?: (path: string, label?: string) => void;
  mobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export function Header({
  activeTab,
  interfaceMode = 'standard',
  onToggleInterfaceMode,
  onSelectTab,
  onQuickMapBoard,
  onNavigatePath,
  mobileSidebarOpen = false,
  onToggleMobileSidebar,
}: HeaderProps) {
  const handleHomeClick = () => {
    if (onNavigatePath) {
      onNavigatePath('/', 'Home');
    } else {
      onSelectTab('games');
    }
  };

  const handleSearchNavigate = (path: string, label?: string) => {
    if (onNavigatePath) {
      onNavigatePath(path, label);
    } else {
      onQuickMapBoard();
    }
  };

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-[#14161D] border-b border-[#2A303E] px-3 sm:px-6 flex items-center gap-2.5 sm:gap-4">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        aria-label={mobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileSidebarOpen}
        className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[10px] bg-[#1C1F27] border border-[#353D4B] text-[#F5F5F5] hover:border-[#D6B477] shrink-0 transition-colors"
      >
        {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <button
        type="button"
        onClick={handleHomeClick}
        className="min-h-[44px] px-1.5 font-display text-sm sm:text-base font-bold tracking-[0.14em] uppercase text-[#D6B477] hover:text-[#FFE0A1] transition-colors whitespace-nowrap shrink-0"
      >
        RULE ONE
      </button>

      <div className="flex-1 min-w-0 max-w-2xl">
        <UniversalSearchBar onNavigatePath={handleSearchNavigate} />
      </div>

      {onToggleInterfaceMode && (
        <button
          type="button"
          onClick={onToggleInterfaceMode}
          aria-pressed={interfaceMode === 'professional'}
          title="Switch between Standard Mode and Professional Mode"
          className={`min-h-[44px] px-3 sm:px-3.5 rounded-[10px] border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
            interfaceMode === 'professional'
              ? 'bg-[#D6B477]/15 text-[#D6B477] border-[#D6B477]'
              : 'bg-[#1C1F27] text-[#A7AFBD] border-[#353D4B] hover:text-[#F5F5F5] hover:border-[#D6B477]'
          }`}
        >
          {interfaceMode === 'professional' ? 'Pro Mode' : 'Standard'}
        </button>
      )}

      <button
        type="button"
        onClick={handleHomeClick}
        aria-current={activeTab === 'games' ? 'page' : undefined}
        className={`hidden sm:inline-flex items-center min-h-[44px] px-3.5 sm:px-4 rounded-[10px] border text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
          activeTab === 'games'
            ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
            : 'bg-[#1C1F27] text-[#F5F5F5] border-[#353D4B] hover:border-[#D6B477]'
        }`}
      >
        Home
      </button>
    </header>
  );
}
