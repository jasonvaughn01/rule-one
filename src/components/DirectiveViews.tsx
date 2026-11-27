import { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  Headphones,
  Info,
  Map as MapIcon,
  Newspaper,
  Settings,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import bespokeControllerImg from '../assets/images/vault_bespoke_controller_1795753020898.jpg';
import {
  EQUIPMENT_GUIDE_ITEMS,
  EquipmentCategory,
  MW4_PATCH_DIFFS,
  STRATEGY_TEMPLATES,
  StrategyTemplateItem,
  VERIFIED_NEWS_ITEMS,
} from '../data/intelligencePipeline';
import { MW4_SND_MAPS, SavedPlaybook } from '../data/sndMaps';
import { InterfaceMode, Mw4MapId } from '../types';
import { COMPETITIVE_EVENTS, NotificationPreferences, SectionHero } from './CommandCenterViews';

const EQUIPMENT_CATEGORIES: ('All' | EquipmentCategory)[] = [
  'All',
  'Monitors',
  'Controllers',
  'Mice',
  'Keyboards',
  'Headsets',
  'Capture & Streaming',
  'Networking',
];

const STRATEGY_MODES = [
  'All',
  'Search & Destroy',
  'Hardpoint',
  'Map Veto Prep',
  'Tactical 5v5',
] as const;

interface StrategyLibraryViewProps {
  interfaceMode: InterfaceMode;
  savedPlaybooks: SavedPlaybook[];
  onSavePlaybook: (play: SavedPlaybook) => void;
  onDeletePlaybook: (id: string) => void;
  onNavigatePath: (path: string, label?: string) => void;
}

export function StrategyLibraryView({
  interfaceMode,
  savedPlaybooks,
  onSavePlaybook,
  onDeletePlaybook,
  onNavigatePath,
}: StrategyLibraryViewProps) {
  const [gameFilter, setGameFilter] = useState<'all' | 'modern-warfare-4' | 'counter-strike-2'>('all');
  const [modeFilter, setModeFilter] = useState<(typeof STRATEGY_MODES)[number]>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return STRATEGY_TEMPLATES.filter((t) => {
      if (gameFilter !== 'all' && t.gameSlug !== gameFilter) return false;
      if (modeFilter !== 'All' && t.mode !== modeFilter) return false;
      return true;
    });
  }, [gameFilter, modeFilter]);

  const handleCloneTemplate = (template: StrategyTemplateItem) => {
    const targetMapId: Mw4MapId = template.mapId || 'coal';
    const mapData = MW4_SND_MAPS.find((m) => m.id === targetMapId) || MW4_SND_MAPS[0];
    const side = template.category === 'S&D Defensive Plan' ? 'defense' : 'offense';
    const basePlay = mapData.playbooks.find((p) => p.side === side) || mapData.playbooks[0];

    const newPlay: SavedPlaybook = {
      id: `tpl_${template.id}_${Date.now()}`,
      mapId: targetMapId,
      side,
      name: template.title.slice(0, 78),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      operators: basePlay.operators.map((op) => ({ ...op })),
      utilities: basePlay.utilities.map((u) => ({ ...u })),
      routes: basePlay.routes.map((r) => ({ ...r })),
    };

    onSavePlaybook(newPlay);
    setCopiedId(template.id);
    window.setTimeout(() => setCopiedId((prev) => (prev === template.id ? null : prev)), 2500);
  };

  return (
    <div className="space-y-6">
      <SectionHero
        title="Strategy Library & Playbook Templates"
        subtitle="Filterable competitive training templates and your saved clan playbooks. Clone any template directly into your playable tactical board."
        compact
      />

      {/* Explicit Training Recommendation Notice (Section 12) */}
      <div className="bg-[#14161D] border border-[#2C3240] rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#D6B477] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs sm:text-sm text-[#A7AFBD] leading-relaxed">
          <span className="text-[#F5F5F5] font-medium">Training Recommendations Only:</span>{' '}
          Templates below are structured competitive study frameworks (openings, rotations, retakes,
          mid-round adjustments, and map veto prep) — never guaranteed winning strategies. Adapt to
          opponent tendencies and official ruleset updates.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Titles' },
              { id: 'modern-warfare-4', label: 'Modern Warfare 4' },
              { id: 'counter-strike-2', label: 'Counter-Strike 2' },
            ] as const
          ).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGameFilter(g.id)}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                gameFilter === g.id
                  ? 'bg-[#D6B477]/15 text-[#F5F5F5] border-[#D6B477]'
                  : 'bg-[#1C1F27] text-[#A7AFBD] border-[#2D3342] hover:text-[#F5F5F5]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STRATEGY_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModeFilter(m)}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                modeFilter === m
                  ? 'bg-[#1C1F27] text-[#D6B477] border-[#D6B477]'
                  : 'bg-[#14161D] text-[#A7AFBD] border-[#2A303E] hover:text-[#F5F5F5]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Clan Playbooks */}
      <section className="bg-[#14161D] border border-[#2A303E] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
              Your Saved Playbooks ({savedPlaybooks.length})
            </h2>
            <p className="text-xs text-[#A7AFBD]">
              Synced to Clan HQ Firestore when signed in as Founder / Co-Founder, or stored locally.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigatePath('/maps', 'Tactical Maps')}
            className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#D6B477] text-[#0B0D12] text-xs font-semibold hover:bg-[#E1C184] transition-colors whitespace-nowrap shrink-0"
          >
            <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
            Open Tactical Editor
          </button>
        </div>

        {savedPlaybooks.length === 0 ? (
          <div className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-5 text-sm text-[#A7AFBD]">
            No custom playbooks saved yet. Clone a template below or build a round in Tactical Maps.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedPlaybooks.map((play) => (
              <div
                key={play.id}
                className="bg-[#1C1F27] border border-[#2D3342] rounded-lg p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-[#D6B477] uppercase">
                    {play.mapId.replace('_', ' ')} &middot; {play.side} &middot; {play.createdAt}
                  </p>
                  <h3 className="text-sm font-semibold text-[#F5F5F5]">{play.name}</h3>
                  <p className="text-xs text-[#A7AFBD] tabular-nums">
                    {play.operators.length} operators &middot; {play.utilities.length} utility
                    markers &middot; {play.routes.length} routes
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2A303E]">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigatePath(`/games/modern-warfare-4/maps/${play.mapId}`, play.name)
                    }
                    className="text-xs font-medium text-[#D6B477] hover:underline whitespace-nowrap"
                  >
                    Open on Board &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePlaybook(play.id)}
                    aria-label={`Delete playbook ${play.name}`}
                    className="p-1.5 rounded text-[#A7AFBD] hover:text-[#F87171] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Competitive Strategy Templates */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">
            Competitive Strategy Templates ({filteredTemplates.length})
          </h2>
          <span className="text-xs text-[#A7AFBD]">
            Mode: {interfaceMode === 'professional' ? 'Professional (Full Assignments)' : 'Standard'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl) => (
            <article
              key={tpl.id}
              className="bg-[#1C1F27] border border-[#2D3342] rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#D6B477] font-medium">
                    {tpl.gameName} &middot; {tpl.mapName} &middot; {tpl.category}
                  </span>
                  <span
                    className={`font-mono ${
                      tpl.evidenceClass === 'Rule One tested'
                        ? 'text-[#4ADE80]'
                        : tpl.evidenceClass === 'Predicted'
                        ? 'text-[#F59E0B]'
                        : 'text-[#A7AFBD]'
                    }`}
                  >
                    {tpl.evidenceClass}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold text-[#F5F5F5]">
                    {tpl.title}
                  </h3>
                  <p className="text-sm text-[#A7AFBD] mt-1 leading-relaxed">{tpl.summary}</p>
                </div>

                {interfaceMode === 'professional' ? (
                  <div className="space-y-3 pt-2 border-t border-[#2A303E]">
                    <div>
                      <p className="text-xs font-medium text-[#D6B477] mb-1">Role Assignments</p>
                      <ul className="space-y-1 text-xs text-[#A7AFBD] list-disc list-inside">
                        {tpl.roleAssignments.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#D6B477] mb-1">Timing Checkpoints</p>
                      <ul className="space-y-1 text-xs text-[#A7AFBD] font-mono">
                        {tpl.timingCheckpoints.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-xs text-[#F59E0B]">
                      Counterplay &amp; Adaptation: {tpl.counterplayTips}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#A7AFBD] pt-2 border-t border-[#2A303E]">
                    <span className="text-[#F5F5F5] font-medium">Key Timing:</span>{' '}
                    {tpl.timingCheckpoints[0]} &middot;{' '}
                    <span className="text-[#D6B477]">Switch to Pro Mode for full 4-player script.</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#2A303E]">
                <span className="text-xs text-[#A7AFBD]">{tpl.seasonLabel}</span>
                <div className="flex items-center gap-2">
                  {tpl.mapId && (
                    <button
                      type="button"
                      onClick={() => handleCloneTemplate(tpl)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14161D] border border-[#353D4B] hover:border-[#D6B477] text-xs font-medium text-[#F5F5F5] transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#4ADE80]" aria-hidden="true" />
                          Saved to Playbooks
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#D6B477]" aria-hidden="true" />
                          Clone to Playbooks
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      onNavigatePath(
                        tpl.mapId ? `/games/modern-warfare-4/maps/${tpl.mapId}` : '/maps',
                        tpl.mapName
                      )
                    }
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6B477] text-[#0B0D12] text-xs font-semibold hover:bg-[#E1C184] transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    Load Board
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

interface GamingNewsViewProps {
  interfaceMode: InterfaceMode;
  onNavigatePath: (path: string, label?: string) => void;
}

export function GamingNewsView({ interfaceMode, onNavigatePath }: GamingNewsViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const categories = ['All', 'Ruleset Watch', 'Developer API', 'Esports Circuit', 'Patch Update'];

  const filteredNews = useMemo(
    () =>
      VERIFIED_NEWS_ITEMS.filter(
        (n) => categoryFilter === 'All' || n.category === categoryFilter
      ),
    [categoryFilter]
  );

  return (
    <div className="space-y-6">
      <SectionHero
        title="Gaming News & Verified Patch Intel"
        subtitle="Official publisher announcements, competitive ruleset watches, and verified developer API updates with source links and verification dates."
        compact
      />

      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === cat
                ? 'bg-[#D6B477]/15 text-[#F5F5F5] border-[#D6B477]'
                : 'bg-[#1C1F27] text-[#A7AFBD] border-[#2D3342] hover:text-[#F5F5F5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="bg-[#1C1F27] border border-[#2D3342] rounded-xl p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#D6B477] font-medium">
                <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{item.gameName}</span>
                <span className="text-[#A7AFBD]">&middot; {item.category}</span>
              </div>
              <span className="font-mono text-[#4ADE80] tabular-nums">
                {item.evidenceClass} &middot; Verified {item.verifiedDate}
              </span>
            </div>

            <h2 className="font-display text-lg font-semibold text-[#F5F5F5]">{item.title}</h2>
            <p className="text-sm text-[#A7AFBD] leading-relaxed">{item.summary}</p>

            {(interfaceMode === 'professional' || item.takeaways.length > 0) && (
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#F5F5F5]/90 list-disc list-inside pt-2 border-t border-[#2A303E]">
                {item.takeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2A303E] text-xs">
              <span className="font-mono text-[#A7AFBD] tabular-nums">
                Published {item.publishedDate} &middot; Source: {item.sourceLabel}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onNavigatePath(
                      item.gameSlug === 'modern-warfare-4'
                        ? '/games/modern-warfare-4/patches/season-1-launch'
                        : `/games/${item.gameSlug}`,
                      item.gameName
                    )
                  }
                  className="text-[#D6B477] hover:underline font-medium whitespace-nowrap"
                >
                  Open Hub &rarr;
                </button>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#A7AFBD] hover:text-[#F5F5F5] whitespace-nowrap"
                >
                  Official Source
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

interface EquipmentCenterViewProps {
  interfaceMode: InterfaceMode;
}

export function EquipmentCenterView({ interfaceMode }: EquipmentCenterViewProps) {
  const [category, setCategory] = useState<'All' | EquipmentCategory>('All');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'PC' | 'Console'>('All');
  const [budgetFilter, setBudgetFilter] = useState<'All' | 'Entry' | 'Competitive Mid' | 'Tournament Spec'>('All');

  const filteredItems = useMemo(() => {
    return EQUIPMENT_GUIDE_ITEMS.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (
        platformFilter !== 'All' &&
        !item.platforms.includes(platformFilter) &&
        !item.platforms.includes('Both')
      ) {
        return false;
      }
      if (budgetFilter !== 'All' && item.budgetTier !== budgetFilter) return false;
      return true;
    });
  }, [category, platformFilter, budgetFilter]);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Equipment & Competitive Hardware Guide"
        subtitle="Objective competitive gear selection criteria by category, platform, and budget tier — built for competitive clarity with zero fake reviews."
        compact
      />

      {/* Transparent Affiliate Disclosure Banner (Section 25) */}
      <div className="bg-[#14161D] border border-[#D6B477]/40 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-[#D6B477] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-xs sm:text-sm text-[#A7AFBD] leading-relaxed">
          <p className="text-[#F5F5F5] font-semibold">
            Affiliate Transparency Disclosure &mdash; Outbound Links Currently Disabled
          </p>
          <p>
            Rule One plans to support free core tools via clearly disclosed equipment affiliate
            partnerships only after official program acceptance. We never fabricate user ratings,
            fake discount countdowns, or unverified pro endorsements.
          </p>
        </div>
      </div>

      {/* Studio Hardware Visual Feature (Preserved Appendix B Asset) */}
      <section className="bg-[#1C1F27] border border-[#2D3342] rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 bg-[#0B0D12] max-h-64 md:max-h-none overflow-hidden">
          <img
            src={bespokeControllerImg}
            alt="Illustrative bespoke matte-black competitive tournament controller with gold accents"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[#D6B477]">
            Illustrative Studio Hardware Visual &middot; Not a Sponsored Product
          </p>
          <h2 className="font-display text-xl font-semibold text-[#F5F5F5]">
            Prioritize Stability &amp; Input Consistency Over Hype
          </h2>
          <p className="text-sm text-[#A7AFBD] leading-relaxed">
            Wired Ethernet, a properly configured 120Hz/240Hz display, and tournament-legal input
            peripherals consistently outperform cosmetic upgrades. Filter hardware classes below by
            your platform and budget tier.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                category === cat
                  ? 'bg-[#D6B477]/15 text-[#F5F5F5] border-[#D6B477]'
                  : 'bg-[#1C1F27] text-[#A7AFBD] border-[#2D3342] hover:text-[#F5F5F5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#A7AFBD]">Platform:</span>
            {(['All', 'PC', 'Console'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatformFilter(p)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  platformFilter === p
                    ? 'border-[#D6B477] text-[#D6B477] bg-[#1C1F27]'
                    : 'border-[#2A303E] text-[#A7AFBD] hover:text-[#F5F5F5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#A7AFBD]">Budget Tier:</span>
            {(['All', 'Entry', 'Competitive Mid', 'Tournament Spec'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setBudgetFilter(tier)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  budgetFilter === tier
                    ? 'border-[#D6B477] text-[#D6B477] bg-[#1C1F27]'
                    : 'border-[#2A303E] text-[#A7AFBD] hover:text-[#F5F5F5]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="bg-[#1C1F27] border border-[#2D3342] rounded-xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[#D6B477] font-medium inline-flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5" aria-hidden="true" />
                  {item.category} &middot; {item.budgetTier}
                </span>
                <span className="text-[#A7AFBD]">{item.platforms.join(' / ')}</span>
              </div>

              <h3 className="font-display text-base font-semibold text-[#F5F5F5]">{item.name}</h3>
              <p className="text-sm text-[#A7AFBD] leading-relaxed">{item.targetUseCase}</p>

              <div className="pt-2 border-t border-[#2A303E] space-y-1">
                <p className="text-xs font-medium text-[#F5F5F5]">
                  {interfaceMode === 'professional'
                    ? 'Competitive Evaluation Checklist'
                    : 'What to Look For'}
                </p>
                <ul className="space-y-1 text-xs text-[#A7AFBD] list-disc list-inside">
                  {item.keySelectionCriteria.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A303E] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#F59E0B]">{item.affiliateStatus}</span>
              <span className="font-mono text-[#A7AFBD]">Zero fabricated ratings</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

interface NotificationsCenterViewProps {
  notifications: NotificationPreferences;
  savedEventIds: string[];
  savedPlaybooksCount: number;
  onNavigatePath: (path: string, label?: string) => void;
}

interface AlertRecord {
  id: string;
  category: 'Patch Diff' | 'Tournament Reminder' | 'Workspace Status';
  title: string;
  detail: string;
  date: string;
  path: string;
  pathLabel: string;
}

export function NotificationsCenterView({
  notifications,
  savedEventIds,
  savedPlaybooksCount,
  onNavigatePath,
}: NotificationsCenterViewProps) {
  const [readIds, setReadIds] = useState<string[]>([]);

  const alerts = useMemo<AlertRecord[]>(() => {
    const list: AlertRecord[] = [
      {
        id: 'alert-mw4-s1',
        category: 'Patch Diff',
        title: MW4_PATCH_DIFFS[0].patchName,
        detail: `${MW4_PATCH_DIFFS[0].flaggedWeaponsOrItems.join(', ')} flagged for review ahead of Dec 4 CDL Kickoff. Ranked-Legal badges remain locked until official rules publish.`,
        date: MW4_PATCH_DIFFS[0].releaseDate,
        path: '/games/modern-warfare-4/patches/season-1-launch',
        pathLabel: 'Inspect Patch Diff',
      },
    ];

    for (const ev of COMPETITIVE_EVENTS) {
      if (savedEventIds.includes(ev.id)) {
        list.push({
          id: `alert-ev-${ev.id}`,
          category: 'Tournament Reminder',
          title: `Saved Event: ${ev.title}`,
          detail: `${ev.dateWindow} · ${ev.format} (${ev.region}). Official source: ${ev.sourceLabel}.`,
          date: ev.dateWindow,
          path: '/tournaments',
          pathLabel: 'Open Tournaments',
        });
      }
    }

    list.push({
      id: 'alert-workspace-playbooks',
      category: 'Workspace Status',
      title: `${savedPlaybooksCount} Playbook${savedPlaybooksCount === 1 ? '' : 's'} Ready in Strategy Library`,
      detail:
        'Opt-in Discord / email external delivery remains disabled until explicitly enabled and authorized in Settings.',
      date: 'Local State',
      path: '/strategies',
      pathLabel: 'Open Strategy Library',
    });

    return list;
  }, [savedEventIds, savedPlaybooksCount]);

  const unreadCount = alerts.filter((a) => !readIds.includes(a.id)).length;

  return (
    <div className="space-y-6">
      <SectionHero
        title="Notifications Center"
        subtitle="Opt-in competitive alerts derived strictly from real local state, saved tournaments, and verified patch diffs — zero spam or fake pings."
        compact
      />

      <div className="bg-[#14161D] border border-[#2A303E] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A7AFBD]">
          <span className="font-mono text-[#F5F5F5] tabular-nums">
            {unreadCount} unread / {alerts.length} total
          </span>
          <span>&middot;</span>
          <span>
            Patch Alerts: {notifications.patchAlertsOptIn ? 'Opted In' : 'Off'} &middot; Clan
            Summary: {notifications.weeklyClanSummaryOptIn ? 'Opted In' : 'Off'} &middot; Scrim
            Reminders: {notifications.scrimRemindersOptIn ? 'Opted In' : 'Off'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReadIds(alerts.map((a) => a.id))}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1F27] border border-[#353D4B] hover:border-[#D6B477] text-xs text-[#F5F5F5] transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#D6B477]" aria-hidden="true" />
            Mark All Read
          </button>
          <button
            type="button"
            onClick={() => onNavigatePath('/settings', 'Settings')}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1F27] border border-[#353D4B] hover:border-[#D6B477] text-xs text-[#D6B477] transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            Channel Preferences
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const isRead = readIds.includes(alert.id);
          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isRead
                  ? 'bg-[#14161D] border-[#252A36] opacity-75'
                  : 'bg-[#1C1F27] border-[#353D4B]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Bell className="w-3.5 h-3.5 text-[#D6B477]" aria-hidden="true" />
                  <span className="font-medium text-[#D6B477]">{alert.category}</span>
                  <span className="text-[#A7AFBD] font-mono tabular-nums">&middot; {alert.date}</span>
                  {!isRead && <span className="text-[#4ADE80] font-mono">&middot; New</span>}
                </div>
                <h2 className="font-display text-base font-semibold text-[#F5F5F5]">
                  {alert.title}
                </h2>
                <p className="text-sm text-[#A7AFBD] leading-relaxed">{alert.detail}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isRead && (
                  <button
                    type="button"
                    onClick={() => setReadIds((prev) => [...prev, alert.id])}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#14161D] border border-[#2D3342] text-xs text-[#A7AFBD] hover:text-[#F5F5F5] whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigatePath(alert.path, alert.pathLabel)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#D6B477] text-[#0B0D12] text-xs font-semibold hover:bg-[#E1C184] whitespace-nowrap"
                >
                  {alert.pathLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
