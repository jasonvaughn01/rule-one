import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Crosshair,
  ExternalLink,
  Headphones,
  Map as MapIcon,
  Newspaper,
  Plug,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  GAME_CATALOG,
  GAME_CATEGORIES,
  GameCatalogEntry,
  GameCategory,
} from '../data/gameCatalog';
import {
  PRICING_EXPERIMENT_TIERS,
  STRATEGY_TEMPLATES,
  VERIFIED_NEWS_ITEMS,
} from '../data/intelligencePipeline';
import { InterfaceMode } from '../types';
import { CategoryArtFallback } from './CategoryArtFallback';
import { IllustrativeProfilesStrip, SectionHero } from './CommandCenterViews';
import { ResilientImage } from './ResilientImage';

export interface UserGamingPreferences {
  favoriteGameSlugs: string[];
  platforms: string[];
  experience: 'Beginner' | 'Competitive' | 'Pro / Semi-Pro' | 'Clan Leader / Org';
  preferredModes: string[];
}

export interface RecentlyViewedItem {
  path: string;
  label: string;
  viewedAt: string;
}

interface GameDirectoryViewProps {
  mode: 'home' | 'catalog' | 'detail';
  interfaceMode?: InterfaceMode;
  selectedGame: GameCatalogEntry | null;
  preferences: UserGamingPreferences;
  recentlyViewed: RecentlyViewedItem[];
  useSvgFallbackMode: boolean;
  onUpdatePreferences: (next: UserGamingPreferences) => void;
  onToggleFavoriteGame: (slug: string) => void;
  onNavigatePath: (path: string, label?: string) => void;
}

const ALL_PLATFORMS = ['PC', 'PS5', 'Xbox Series X|S', 'Nintendo Switch 2', 'Mobile'];
const EXPERIENCE_LEVELS: UserGamingPreferences['experience'][] = [
  'Beginner',
  'Competitive',
  'Pro / Semi-Pro',
  'Clan Leader / Org',
];

const QUICK_ACCESS_TILES = [
  {
    id: 'meta',
    label: 'Meta Lab',
    detail: 'Build validator & 5 candidate weapons',
    path: '/meta',
    navLabel: 'Meta Lab',
    icon: Crosshair,
  },
  {
    id: 'maps',
    label: 'Tactical Maps',
    detail: 'Interactive S&D board & 8 CDL candidates',
    path: '/maps',
    navLabel: 'Tactical Maps',
    icon: MapIcon,
  },
  {
    id: 'strategies',
    label: 'Strategy Library',
    detail: 'Playbooks, rotations, retakes & veto prep',
    path: '/strategies',
    navLabel: 'Strategy Library',
    icon: BookOpen,
  },
  {
    id: 'ranked',
    label: 'Ranked Center',
    detail: 'CDL Dec 4 kickoff & ruleset status',
    path: '/ranked',
    navLabel: 'Ranked Center',
    icon: Trophy,
  },
  {
    id: 'clan',
    label: 'Clan HQ',
    detail: 'Roster, scrims & co-founder sync',
    path: '/clans/rule-one',
    navLabel: 'Clan HQ',
    icon: Shield,
  },
  {
    id: 'tournaments',
    label: 'Tournaments',
    detail: 'CDL, VCT, CS2 Majors & LoL Esports',
    path: '/tournaments',
    navLabel: 'Tournaments',
    icon: Calendar,
  },
  {
    id: 'news',
    label: 'Gaming News',
    detail: 'Verified patches & developer API updates',
    path: '/news',
    navLabel: 'Gaming News',
    icon: Newspaper,
  },
  {
    id: 'equipment',
    label: 'Equipment Guide',
    detail: 'Monitors, controllers & gear criteria',
    path: '/equipment',
    navLabel: 'Equipment',
    icon: Headphones,
  },
] as const;

function GamePoster({
  game,
  useSvgFallbackMode,
  className = 'w-full h-full',
  priority = false,
}: {
  game: GameCatalogEntry;
  useSvgFallbackMode: boolean;
  className?: string;
  priority?: boolean;
}) {
  const src = game.posterUrl || game.imageUrl;
  if (useSvgFallbackMode || !src) {
    return (
      <CategoryArtFallback
        title={game.shortTitle}
        category={game.category}
        className={className}
      />
    );
  }
  return (
    <ResilientImage
      src={src}
      alt={game.altText}
      fallbackLabel={game.shortTitle}
      fit={game.posterFit}
      priority={priority}
      className={className}
    />
  );
}

export function GameDirectoryView({
  mode,
  interfaceMode = 'standard',
  selectedGame,
  preferences,
  recentlyViewed,
  useSvgFallbackMode,
  onUpdatePreferences,
  onToggleFavoriteGame,
  onNavigatePath,
}: GameDirectoryViewProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | GameCategory>('All');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const favoriteGames = useMemo(() => {
    const bySlug = new Map(GAME_CATALOG.map((g) => [g.slug, g]));
    const resolved = preferences.favoriteGameSlugs
      .map((slug) => bySlug.get(slug))
      .filter((g): g is GameCatalogEntry => Boolean(g));
    return resolved.length > 0 ? resolved : GAME_CATALOG.slice(0, 3);
  }, [preferences.favoriteGameSlugs]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return GAME_CATALOG.filter((game) => {
      if (activeCategory !== 'All' && game.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      return (
        game.name.toLowerCase().includes(q) ||
        game.shortTitle.toLowerCase().includes(q) ||
        game.publisher.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q) ||
        game.aliases.some((a) => a.includes(q))
      );
    });
  }, [activeCategory, catalogSearch]);

  // 1) INDIVIDUAL GAME HUB (/games/:slug)
  if (mode === 'detail' && selectedGame && selectedGame.slug !== 'modern-warfare-4') {
    const related = GAME_CATALOG.filter(
      (g) => g.category === selectedGame.category && g.slug !== selectedGame.slug
    ).slice(0, 4);
    const isFav = preferences.favoriteGameSlugs.includes(selectedGame.slug);

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigatePath('/games', 'Games')}
            className="min-h-[44px] inline-flex items-center gap-2 px-3 rounded-lg text-sm text-[#B5BECD] hover:text-[#F3F4F7] hover:bg-[#1C222D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D6B477]" aria-hidden="true" />
            All Games
          </button>
          <span className="text-xs font-medium text-[#D6B477]">{selectedGame.category}</span>
        </div>

        <section className="bg-[#151A23] border border-[#343C49] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          <div className="w-40 sm:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-[#0B0E14] border border-[#343C49] shrink-0">
            <GamePoster
              game={selectedGame}
              useSvgFallbackMode={useSvgFallbackMode}
              priority
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D6B477]">
                {selectedGame.category}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F4F7]">
                {selectedGame.name}
              </h1>
              <p className="text-sm text-[#B5BECD]">
                {selectedGame.publisher} &middot; {selectedGame.platforms.join(', ')}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#B5BECD] leading-relaxed">
              Connected via <span className="text-[#F3F4F7] font-medium">{selectedGame.developerApi.apiName}</span>{' '}
              ({selectedGame.developerApi.accessModel}). Supports{' '}
              {selectedGame.developerApi.dataScopes.join(', ').toLowerCase()}.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onToggleFavoriteGame(selectedGame.slug)}
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                  isFav
                    ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                    : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
                }`}
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
                {isFav ? 'In Favorites' : 'Add to Favorites'}
              </button>

              <button
                type="button"
                onClick={() => onNavigatePath('/developers', 'Developer Connect')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B0E14] bg-[#D6B477] hover:bg-[#E1C184] rounded-xl transition-colors"
              >
                <Plug className="w-4 h-4" aria-hidden="true" />
                {selectedGame.developerApi.liveDemoSupported
                  ? 'Test Live API'
                  : 'Connect Developer API'}
              </button>

              <a
                href={selectedGame.developerApi.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F3F4F7] bg-[#1C222D] hover:bg-[#242C3A] border border-[#353D4B] hover:border-[#D6B477] rounded-xl transition-colors"
              >
                Developer Portal
                <ExternalLink className="w-4 h-4 text-[#D6B477]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* Official Developer Data Connection Steps */}
        <section className="bg-[#151A23] border border-[#343C49] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#F3F4F7]">
                How to Connect {selectedGame.developerApi.provider} Data
              </h2>
              <p className="text-xs text-[#B5BECD] mt-0.5">
                {selectedGame.developerApi.apiName} &middot; {selectedGame.developerApi.accessModel}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href={selectedGame.developerApi.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6B477] hover:underline inline-flex items-center gap-1"
              >
                API Docs
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
              <a
                href={selectedGame.developerApi.communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B5BECD] hover:text-[#F3F4F7] inline-flex items-center gap-1"
              >
                {selectedGame.developerApi.communityLabel}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <ol className="space-y-2 text-sm text-[#B5BECD] list-decimal list-inside">
            {selectedGame.developerApi.contactSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Game-Specific Competitive Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedGame.schemaModules.map((mod) => (
              <div
                key={mod.id}
                className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-2"
              >
                <h3 className="text-base font-semibold text-[#F3F4F7]">{mod.label}</h3>
                <p className="text-sm text-[#B5BECD] leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">More in {selectedGame.category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rel) => (
                <button
                  key={rel.slug}
                  type="button"
                  onClick={() =>
                    onNavigatePath(
                      rel.priority === 'pilot' ? '/games/modern-warfare-4' : `/games/${rel.slug}`,
                      rel.shortTitle
                    )
                  }
                  className="text-left group"
                >
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#151A23] border border-[#343C49] group-hover:border-[#D6B477] transition-colors">
                    <GamePoster
                      game={rel}
                      useSvgFallbackMode={useSvgFallbackMode}
                      className="w-full h-full group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#F3F4F7] group-hover:text-[#D6B477] transition-colors truncate">
                    {rel.shortTitle}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-[#9AA4B5] pt-2">
          Source: {selectedGame.imageSource} &middot; Verified {selectedGame.verifiedCheckedDate}{' '}
          &middot;{' '}
          <button
            type="button"
            onClick={() => onNavigatePath('/ops', 'Intel & Rights')}
            className="text-[#D6B477] hover:underline"
          >
            Rights &amp; Editorial Status
          </button>
        </p>
      </div>
    );
  }

  // 2) ALL 21 API-CONNECTED GAMES CATALOG (/games)
  if (mode === 'catalog') {
    return (
      <div className="space-y-6">
        <SectionHero
          title={`Games (${GAME_CATALOG.length})`}
          subtitle="Curated exclusively to titles with verified official developer data APIs or partner pipelines. Star any title to pin it to your Home Command Center."
          compact
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['All', ...GAME_CATEGORIES] as const).map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                      : 'bg-[#1C222D] text-[#B5BECD] border-[#353D4B] hover:text-[#F3F4F7] hover:border-[#D6B477]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search
              className="w-4 h-4 text-[#B5BECD] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Filter games…"
              aria-label="Filter developer-connected games"
              className="w-full min-h-[44px] pl-10 pr-9 py-2 text-sm bg-[#202632] border border-[#596171] rounded-[9px] text-[#F3F4F7] placeholder:text-[#9AA4B5] focus:border-[#D6B477] focus:outline-none"
            />
            {catalogSearch && (
              <button
                type="button"
                onClick={() => setCatalogSearch('')}
                aria-label="Clear filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#B5BECD] hover:text-[#F3F4F7]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredCatalog.map((game) => {
            const isFav = preferences.favoriteGameSlugs.includes(game.slug);
            const targetPath =
              game.priority === 'pilot' ? '/games/modern-warfare-4' : `/games/${game.slug}`;

            return (
              <div key={game.slug} className="group relative">
                <button
                  type="button"
                  onClick={() => onNavigatePath(targetPath, game.shortTitle)}
                  className="block w-full text-left"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-[#151A23] border border-[#343C49] group-hover:border-[#D6B477] transition-colors">
                    <GamePoster
                      game={game}
                      useSvgFallbackMode={useSvgFallbackMode}
                      className="w-full h-full group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <p className="mt-2.5 text-sm sm:text-base font-semibold text-[#F3F4F7] group-hover:text-[#D6B477] transition-colors truncate">
                    {game.shortTitle}
                  </p>
                  <p className="text-xs text-[#D6B477] truncate mt-0.5">
                    {game.developerApi.provider} &middot; {game.developerApi.accessModel}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavoriteGame(game.slug)}
                  aria-label={
                    isFav
                      ? `Remove ${game.shortTitle} from favorites`
                      : `Add ${game.shortTitle} to favorites`
                  }
                  className={`absolute top-2.5 right-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border backdrop-blur-sm transition-all ${
                    isFav
                      ? 'bg-[#D6B477] text-[#0B0E14] border-[#D6B477] opacity-100'
                      : 'bg-[#0B0E14]/80 text-[#F3F4F7] border-[#353D4B] opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:border-[#D6B477]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>

        {filteredCatalog.length === 0 && (
          <div className="bg-[#151A23] border border-[#343C49] rounded-xl py-12 px-4 text-center space-y-2">
            <p className="text-base font-medium text-[#F3F4F7]">
              No games match &ldquo;{catalogSearch}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setCatalogSearch('');
                setActiveCategory('All');
              }}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#1C222D] border border-[#353D4B] text-sm text-[#D6B477] hover:border-[#D6B477]"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3) HOME COMMAND CENTER (/)
  return (
    <div className="space-y-8">
      <SectionHero
        title="Your Team. Your Strategy. Your Competitive Edge."
        subtitle={`Maximum Competitive Intelligence. Minimum User Effort. ${GAME_CATALOG.length} developer-API connected titles, interactive MW4 tactical maps, explainable meta predictions, and Co-Founder Clan HQ.`}
      />

      {/* Section 1: Your favorite games */}
      <section aria-labelledby="favorite-games-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="favorite-games-heading"
            className="text-lg sm:text-xl font-semibold text-[#F3F4F7]"
          >
            Your favorite games
          </h2>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCustomizeOpen((prev) => !prev)}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-sm text-[#F3F4F7] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#D6B477]" aria-hidden="true" />
              {customizeOpen ? 'Done' : 'Customize'}
            </button>
            <button
              type="button"
              onClick={() => onNavigatePath('/games', 'Games')}
              className="min-h-[44px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-sm font-medium text-[#E1C184] transition-colors"
            >
              All {GAME_CATALOG.length}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Collapsible Personalization Drawer */}
        {customizeOpen && (
          <div className="bg-[#151A23] border border-[#343C49] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-[#F3F4F7]">Personalize your dashboard</p>
              <button
                type="button"
                onClick={() => setCustomizeOpen(false)}
                aria-label="Close personalization"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#B5BECD] hover:text-[#F3F4F7]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#B5BECD]">Competitive experience</p>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onUpdatePreferences({ ...preferences, experience: lvl })}
                      className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                        preferences.experience === lvl
                          ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477] font-semibold'
                          : 'bg-[#1C222D] text-[#B5BECD] border-[#353D4B] hover:text-[#F3F4F7]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-[#B5BECD]">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map((plat) => {
                    const active = preferences.platforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          const next = active
                            ? preferences.platforms.filter((p) => p !== plat)
                            : [...preferences.platforms, plat];
                          if (next.length > 0) {
                            onUpdatePreferences({ ...preferences, platforms: next });
                          }
                        }}
                        className={`min-h-[44px] px-3.5 py-2 text-xs sm:text-sm rounded-lg border transition-colors ${
                          active
                            ? 'bg-[#202632] text-[#F3F4F7] border-[#D6B477]'
                            : 'bg-[#1C222D] text-[#B5BECD] border-[#353D4B] hover:text-[#F3F4F7]'
                        }`}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3140] flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#B5BECD]">
                {favoriteGames.length} favorite{favoriteGames.length === 1 ? '' : 's'} pinned.
              </p>
              <button
                type="button"
                onClick={() => onNavigatePath('/games', 'Games')}
                className="text-sm font-medium text-[#D6B477] hover:underline"
              >
                Pick from all {GAME_CATALOG.length} games &rarr;
              </button>
            </div>
          </div>
        )}

        {/* 3-Column Vertical Portrait Poster Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {favoriteGames.slice(0, 6).map((game, idx) => {
            const targetPath =
              game.priority === 'pilot' ? '/games/modern-warfare-4' : `/games/${game.slug}`;
            return (
              <button
                key={game.slug}
                type="button"
                onClick={() => onNavigatePath(targetPath, game.shortTitle)}
                className="group text-left rounded-2xl focus-visible:outline-2 focus-visible:outline-[#D6B477]"
              >
                <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#151A23] border border-[#343C49] group-hover:border-[#D6B477] transition-all shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                  <GamePoster
                    game={game}
                    useSvgFallbackMode={useSvgFallbackMode}
                    priority={idx < 3}
                    className="w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <p className="mt-2.5 text-sm sm:text-base font-semibold text-[#F3F4F7] group-hover:text-[#D6B477] transition-colors truncate">
                  {game.shortTitle}
                </p>
                <p className="text-xs text-[#D6B477] truncate">
                  {game.developerApi.provider} &middot; {game.category}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2: Quick access (Responsive 2/3/4 Column Grid matching HTML prototype) */}
      <section aria-labelledby="quick-access-heading" className="space-y-4">
        <h2
          id="quick-access-heading"
          className="text-lg sm:text-xl font-semibold text-[#F3F4F7]"
        >
          Quick access
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {QUICK_ACCESS_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => onNavigatePath(tile.path, tile.navLabel)}
                className="group bg-[#1C222D] hover:bg-[#232B39] border border-[#353D4B] hover:border-[#D6B477] rounded-xl p-4 sm:p-5 text-left transition-all flex flex-col justify-between min-h-[112px]"
              >
                <Icon
                  className="w-5 h-5 text-[#D6B477] group-hover:scale-105 transition-transform"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div className="mt-3 space-y-1">
                  <span className="block text-sm sm:text-base font-semibold text-[#F3F4F7] tracking-tight">
                    {tile.label}
                  </span>
                  <span className="block text-xs text-[#B5BECD] leading-snug">
                    {tile.detail}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Viewed Strip */}
      {recentlyViewed.length > 0 && (
        <section aria-label="Recently viewed" className="space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#B5BECD]">
            <Clock className="w-4 h-4 text-[#D6B477]" aria-hidden="true" />
            <span>Continue where you left off</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentlyViewed.slice(0, 5).map((rv) => (
              <button
                key={rv.path}
                type="button"
                onClick={() => onNavigatePath(rv.path, rv.label)}
                className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium text-[#F3F4F7] bg-[#1C222D] hover:bg-[#242C3A] border border-[#353D4B] hover:border-[#D6B477] rounded-xl transition-colors"
              >
                {rv.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Strategies & Verified Patch Updates (Section 5 Traffic Hub Previews) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#14161D] border border-[#2A303E] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
              Featured Competitive Strategies
            </h2>
            <button
              type="button"
              onClick={() => onNavigatePath('/strategies', 'Strategy Library')}
              className="text-xs font-medium text-[#D6B477] hover:underline whitespace-nowrap"
            >
              All Templates &rarr;
            </button>
          </div>
          <div className="space-y-2.5">
            {STRATEGY_TEMPLATES.slice(0, interfaceMode === 'professional' ? 4 : 3).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onNavigatePath('/strategies', 'Strategy Library')}
                className="w-full text-left p-3.5 rounded-xl bg-[#1C1F27] border border-[#2D3342] hover:border-[#D6B477] transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[#D6B477]">{tpl.mapName} &middot; {tpl.mode}</span>
                  <span className="text-[#F59E0B]">{tpl.evidenceClass}</span>
                </div>
                <p className="text-sm font-semibold text-[#F5F5F5]">{tpl.title}</p>
                <p className="text-xs text-[#A7AFBD] line-clamp-2">{tpl.summary}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#14161D] border border-[#2A303E] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
              Latest Verified Patch &amp; Circuit Intel
            </h2>
            <button
              type="button"
              onClick={() => onNavigatePath('/news', 'Gaming News')}
              className="text-xs font-medium text-[#D6B477] hover:underline whitespace-nowrap"
            >
              All News &rarr;
            </button>
          </div>
          <div className="space-y-2.5">
            {VERIFIED_NEWS_ITEMS.slice(0, interfaceMode === 'professional' ? 4 : 3).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onNavigatePath('/news', 'Gaming News')}
                className="w-full text-left p-3.5 rounded-xl bg-[#1C1F27] border border-[#2D3342] hover:border-[#D6B477] transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="text-[#D6B477]">{n.gameName}</span>
                  <span className="text-[#4ADE80] tabular-nums">{n.publishedDate}</span>
                </div>
                <p className="text-sm font-semibold text-[#F5F5F5]">{n.title}</p>
                <p className="text-xs text-[#A7AFBD] line-clamp-2">{n.summary}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent Free Core & Proposed Membership Overview (Billing Disabled) */}
      <section className="bg-[#14161D] border border-[#2A303E] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
              Free Core Platform &amp; Proposed Plans
            </h2>
            <p className="text-xs text-[#A7AFBD] mt-0.5">
              Core competitive guides, tactical maps, and public profiles stay free. Paid billing
              and ad accounts remain strictly disabled.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => onNavigatePath('/recruitment', 'Recruitment')}
              className="inline-flex items-center gap-1 text-[#D6B477] hover:underline"
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              Find Teammates
            </button>
            <button
              type="button"
              onClick={() => onNavigatePath('/equipment', 'Equipment')}
              className="inline-flex items-center gap-1 text-[#A7AFBD] hover:text-[#F5F5F5]"
            >
              <Headphones className="w-3.5 h-3.5 text-[#D6B477]" aria-hidden="true" />
              Gear Guide
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICING_EXPERIMENT_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border p-4 space-y-2 ${
                tier.id === 'free'
                  ? 'bg-[#1C1F27] border-[#D6B477]'
                  : 'bg-[#1C1F27] border-[#2D3342]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#F5F5F5]">{tier.name}</h3>
                <span className="font-mono text-sm font-semibold text-[#D6B477] tabular-nums">
                  {tier.priceLabel}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#F59E0B]">{tier.status}</p>
              <p className="text-xs text-[#A7AFBD] leading-relaxed">{tier.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Existing project imagery (explicitly labeled illustrative) */}
      <IllustrativeProfilesStrip limit={3} />
    </div>
  );
}
