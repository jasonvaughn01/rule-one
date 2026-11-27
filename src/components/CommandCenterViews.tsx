import { useMemo, useState } from 'react';
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  HelpCircle,
  Map as MapIcon,
  Plug,
  Plus,
  Shield,
  SlidersHorizontal,
  Star,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react';
import heroPenthouseImg from '../assets/images/hero_penthouse_lounge_1795753021249.jpg';
import proDevonImg from '../assets/images/pro_devon_brooks_cod_1795753212778.jpg';
import proElenaImg from '../assets/images/pro_elena_rostova_1795753021442.jpg';
import proHenrikImg from '../assets/images/pro_henrik_lind_1795753020824.jpg';
import proLucasImg from '../assets/images/pro_lucas_silva_1795753022087.jpg';
import proMarcusImg from '../assets/images/pro_marcus_vance_1795753021562.jpg';
import { GAME_CATALOG } from '../data/gameCatalog';
import { MW4_EVALUATED_BUILDS, PRICING_EXPERIMENT_TIERS } from '../data/intelligencePipeline';
import { SavedPlaybook } from '../data/sndMaps';
import { sanitizePlainText } from '../lib/validators';
import { DeveloperConnectView } from './DeveloperConnectView';

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface NotificationPreferences {
  patchAlertsOptIn: boolean;
  weeklyClanSummaryOptIn: boolean;
  scrimRemindersOptIn: boolean;
}

export interface CompetitiveEventRecord {
  id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  circuit: string;
  dateWindow: string;
  region: string;
  format: string;
  status: 'Scheduled' | 'Recurring' | 'Seasonal';
  sourceUrl: string;
  sourceLabel: string;
}

export const COMPETITIVE_EVENTS: CompetitiveEventRecord[] = [
  {
    id: 'cdl-2027-kickoff',
    title: 'Call of Duty League 2027 Season Kickoff',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    circuit: 'Call of Duty League',
    dateWindow: 'Dec 4, 2026',
    region: 'North America / Global',
    format: '4v4 Hardpoint, S&D, Control',
    status: 'Scheduled',
    sourceUrl: 'https://callofdutyleague.com/',
    sourceLabel: 'callofdutyleague.com',
  },
  {
    id: 'vct-international-2027',
    title: 'VALORANT Champions Tour — International Leagues',
    gameSlug: 'valorant',
    gameName: 'VALORANT',
    circuit: 'Riot VCT',
    dateWindow: '2026–2027 Season',
    region: 'Americas, EMEA, Pacific, CN',
    format: '5v5 Tactical Map Veto',
    status: 'Seasonal',
    sourceUrl: 'https://valorantesports.com/',
    sourceLabel: 'valorantesports.com',
  },
  {
    id: 'cs2-major-circuit',
    title: 'Counter-Strike 2 Major Championship Circuit',
    gameSlug: 'counter-strike-2',
    gameName: 'Counter-Strike 2',
    circuit: 'Valve Major Circuit',
    dateWindow: 'Semi-Annual Majors',
    region: 'Global VRS Qualifiers',
    format: '5v5 MR12 Active Duty Pool',
    status: 'Seasonal',
    sourceUrl: 'https://www.counter-strike.net/',
    sourceLabel: 'counter-strike.net',
  },
  {
    id: 'lol-esports-open-access',
    title: 'League of Legends Esports — Regional Splits & Worlds',
    gameSlug: 'league-of-legends',
    gameName: 'League of Legends',
    circuit: 'LoL Esports',
    dateWindow: 'Year-Round Splits',
    region: 'LCK, LPL, LEC, LTA, LCP',
    format: '5v5 Fearless Draft / Bo3 & Bo5',
    status: 'Seasonal',
    sourceUrl: 'https://lolesports.com/',
    sourceLabel: 'lolesports.com',
  },
  {
    id: 'chess-titled-tuesday',
    title: 'Chess.com Titled Tuesday',
    gameSlug: 'chess-com',
    gameName: 'Chess.com',
    circuit: 'Chess.com Official',
    dateWindow: 'Every Tuesday (Weekly)',
    region: 'Global Online',
    format: '11-Round Swiss Blitz (3+1)',
    status: 'Recurring',
    sourceUrl: 'https://www.chess.com/tournament/live/titled-tuesdays',
    sourceLabel: 'chess.com',
  },
  {
    id: 'd2-trials-weekend',
    title: 'Destiny 2 — Trials of Osiris Weekend Ladder',
    gameSlug: 'destiny-2',
    gameName: 'Destiny 2',
    circuit: 'Bungie Competitive',
    dateWindow: 'Friday–Tuesday Reset',
    region: 'Global Crossplay',
    format: '3v3 Elimination',
    status: 'Recurring',
    sourceUrl: 'https://www.bungie.net/',
    sourceLabel: 'bungie.net',
  },
];

const ILLUSTRATIVE_PROFILES = [
  {
    id: 'illustrative-1',
    title: 'Tactical Entry Role Concept',
    role: 'Search & Destroy · Entry / Flex',
    image: proDevonImg,
    alt: 'Illustrative esports player portrait representing a tactical FPS entry role',
  },
  {
    id: 'illustrative-2',
    title: 'IGL & Map Control Role Concept',
    role: 'In-Game Leader · Veto & Rotations',
    image: proMarcusImg,
    alt: 'Illustrative esports player portrait representing an in-game leader role',
  },
  {
    id: 'illustrative-3',
    title: 'Anchor & Support Role Concept',
    role: 'Objective Anchor · Utility Timing',
    image: proElenaImg,
    alt: 'Illustrative esports player portrait representing an objective anchor role',
  },
  {
    id: 'illustrative-4',
    title: 'Flex & Scrim Analyst Concept',
    role: 'VOD Review · Counter-Strats',
    image: proLucasImg,
    alt: 'Illustrative esports player portrait representing a flex competitor role',
  },
  {
    id: 'illustrative-5',
    title: 'Coach & Draft Lead Concept',
    role: 'Prep & Composition Lead',
    image: proHenrikImg,
    alt: 'Illustrative esports portrait representing a team coach role',
  },
];

export function SectionHero({
  eyebrow = 'RULE ONE / COMPETITIVE COMMAND CENTER',
  title,
  subtitle,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[#343C49] flex flex-col justify-end bg-cover bg-center ${
        compact ? 'min-h-[170px] sm:min-h-[200px] p-5 sm:p-7' : 'min-h-[210px] sm:min-h-[245px] p-5 sm:p-8'
      }`}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(8,10,15,0.95) 0%, rgba(8,10,15,0.72) 55%, rgba(8,10,15,0.38) 100%), url(${heroPenthouseImg})`,
      }}
    >
      <div className="relative z-10 max-w-2xl space-y-2">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#E1C184]">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-[42px] font-bold leading-tight text-[#F3F4F7]">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-[#B5BECD] leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}

export function IllustrativeProfilesStrip({ limit = 3 }: { limit?: number }) {
  const items = ILLUSTRATIVE_PROFILES.slice(0, limit);
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-[#F3F4F7]">
          Existing project imagery
        </h2>
        <span className="text-xs text-[#B5BECD]">
          Original studio portraits · Illustrative profiles, not verified real athletes
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#151A23] border border-[#343C49] rounded-xl p-4 space-y-3"
          >
            <img
              src={item.image}
              alt={item.alt}
              loading="lazy"
              className="w-full h-44 object-cover object-top rounded-lg bg-[#0B0E14]"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#F3F4F7]">{item.title}</p>
              <p className="text-xs text-[#D6B477]">{item.role}</p>
              <p className="text-xs text-[#B5BECD]">
                Illustrative profile &bull; not verified athlete
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================================
 * RECRUITMENT WINDOW (/recruitment)
 * ========================================================================== */

interface RecruitmentApplication {
  id: string;
  clanName: string;
  gameName: string;
  role: string;
  handle: string;
  note: string;
  submittedAt: string;
  status: 'Draft Saved Locally';
}

const STORAGE_RECRUIT_APPS = 'rule_one_recruitment_apps_v1';

const OPEN_CLAN_LISTINGS = [
  {
    id: 'rule-one-hq',
    name: 'Rule One',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    rolesNeeded: ['Entry SMG', 'Flex AR', 'S&D Analyst'],
    region: 'NA East / Central',
    schedule: 'Tue / Thu / Sun · 20:00 EST',
    verifiedNote: 'Official Rule One pilot clan HQ (public opt-in)',
    path: '/clans/rule-one',
  },
  {
    id: 'demo-cs2-vanguard',
    name: 'Demo Listing — Northline CS2',
    gameSlug: 'counter-strike-2',
    gameName: 'Counter-Strike 2',
    rolesNeeded: ['AWP', 'Support / Anchor'],
    region: 'NA / EU',
    schedule: 'Mon / Wed · 19:30 EST',
    verifiedNote: 'Illustrative starter fixture · not an external verified org',
    path: '/games/counter-strike-2',
  },
  {
    id: 'demo-val-apex',
    name: 'Demo Listing — Meridian VCT Prep',
    gameSlug: 'valorant',
    gameName: 'VALORANT',
    rolesNeeded: ['Controller', 'Initiator'],
    region: 'NA West',
    schedule: 'Fri / Sat · 21:00 EST',
    verifiedNote: 'Illustrative starter fixture · not an external verified org',
    path: '/games/valorant',
  },
];

function loadRecruitmentApps(): RecruitmentApplication[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_RECRUIT_APPS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function RecruitmentView({
  onNavigatePath,
}: {
  onNavigatePath: (path: string, label?: string) => void;
}) {
  const [subTab, setSubTab] = useState<'clans' | 'players' | 'applications' | 'settings'>('clans');
  const [gameFilter, setGameFilter] = useState<string>('All');
  const [applications, setApplications] = useState<RecruitmentApplication[]>(loadRecruitmentApps);
  const [selectedClanId, setSelectedClanId] = useState<string>(OPEN_CLAN_LISTINGS[0].id);
  const [playerHandle, setPlayerHandle] = useState('');
  const [roleChoice, setRoleChoice] = useState('Entry SMG / Flex');
  const [note, setNote] = useState('');
  const [recruitVisibility, setRecruitVisibility] = useState<'private' | 'opt_in'>('private');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    if (gameFilter === 'All') return OPEN_CLAN_LISTINGS;
    return OPEN_CLAN_LISTINGS.filter((item) => item.gameSlug === gameFilter);
  }, [gameFilter]);

  const handleSubmitApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedHandle = sanitizePlainText(playerHandle).trim();
    const cleanedRole = sanitizePlainText(roleChoice).trim();
    const cleanedNote = sanitizePlainText(note).trim();
    if (!cleanedHandle) {
      setFeedback('Enter your in-game handle before saving an application.');
      return;
    }
    const targetClan =
      OPEN_CLAN_LISTINGS.find((c) => c.id === selectedClanId) || OPEN_CLAN_LISTINGS[0];
    const nextEntry: RecruitmentApplication = {
      id: `app-${Date.now()}`,
      clanName: targetClan.name,
      gameName: targetClan.gameName,
      role: cleanedRole || 'Flex',
      handle: cleanedHandle,
      note: cleanedNote || 'Available for scheduled tryout scrims.',
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Draft Saved Locally',
    };
    const next = [nextEntry, ...applications];
    setApplications(next);
    try {
      window.localStorage.setItem(STORAGE_RECRUIT_APPS, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
    setPlayerHandle('');
    setNote('');
    setFeedback(`Saved local tryout application for ${targetClan.name}.`);
    setSubTab('applications');
  };

  const handleDeleteApp = (id: string) => {
    const next = applications.filter((a) => a.id !== id);
    setApplications(next);
    try {
      window.localStorage.setItem(STORAGE_RECRUIT_APPS, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  return (
    <div className="space-y-6">
      <SectionHero
        title="Recruitment"
        subtitle="Find competitive clans, review open roles, and manage tryout applications. Public browsing requires no login; direct messages are disabled by design for safety."
        compact
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Recruitment views">
        {(
          [
            { id: 'clans', label: 'Find clans' },
            { id: 'players', label: 'Find players' },
            { id: 'applications', label: `Applications (${applications.length})` },
            { id: 'settings', label: 'Recruitment settings' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              subTab === tab.id
                ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'clans' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'All', label: 'All games' },
              { id: 'modern-warfare-4', label: 'Modern Warfare 4' },
              { id: 'counter-strike-2', label: 'Counter-Strike 2' },
              { id: 'valorant', label: 'VALORANT' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setGameFilter(f.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs sm:text-sm border transition-colors ${
                  gameFilter === f.id
                    ? 'bg-[#202632] text-[#E1C184] border-[#D6B477]'
                    : 'bg-[#151A23] text-[#B5BECD] border-[#343C49] hover:text-[#F3F4F7]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((clan) => (
              <div
                key={clan.id}
                className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#D6B477]">{clan.gameName}</p>
                  <h2 className="text-lg font-semibold text-[#F3F4F7]">{clan.name}</h2>
                  <p className="text-xs text-[#B5BECD]">
                    {clan.region} &middot; {clan.schedule}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clan.rolesNeeded.map((role) => (
                      <span
                        key={role}
                        className="px-2.5 py-1 rounded-md bg-[#202632] border border-[#353D4B] text-xs text-[#F3F4F7]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#9AA4B5] pt-1">{clan.verifiedNote}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClanId(clan.id);
                      setSubTab('applications');
                    }}
                    className="min-h-[44px] flex-1 px-3 py-2 rounded-lg bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184] transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigatePath(clan.path, clan.name)}
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-[#1C222D] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477]"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'players' && (
        <div className="space-y-6">
          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Opt-in public player profiles</h2>
            <p className="text-sm text-[#B5BECD]">
              Only players who explicitly opt in appear in public directories. No private emails or
              unconsented personal data are ever published.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigatePath('/players/jason-vaughn', 'Jason Vaughn')}
                className="min-h-[44px] p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-left transition-colors"
              >
                <p className="text-sm font-semibold text-[#F3F4F7]">Jason Vaughn</p>
                <p className="text-xs text-[#D6B477]">Primary Founder &middot; MW4 S&amp;D IGL / Flex</p>
              </button>
              <button
                type="button"
                onClick={() => onNavigatePath('/players/fpsxfubarxgsg', 'FPSxFUBARxGSG')}
                className="min-h-[44px] p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-left transition-colors"
              >
                <p className="text-sm font-semibold text-[#F3F4F7]">FPSxFUBARxGSG</p>
                <p className="text-xs text-[#D6B477]">Co-Founder &middot; MW4 Entry / Tactical Lead</p>
              </button>
            </div>
          </div>

          <IllustrativeProfilesStrip limit={5} />
        </div>
      )}

      {subTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSubmitApp}
            className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Submit tryout application</h2>
            <p className="text-xs text-[#B5BECD]">
              Saved locally in your browser so you can draft and organize tryout requests without
              creating an account.
            </p>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Target clan</span>
              <select
                value={selectedClanId}
                onChange={(e) => setSelectedClanId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
              >
                {OPEN_CLAN_LISTINGS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gameName})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">In-game handle / Riot ID / Activision ID</span>
              <input
                type="text"
                value={playerHandle}
                onChange={(e) => setPlayerHandle(e.target.value)}
                placeholder="e.g. TacticalLead#1042"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7] placeholder:text-[#9AA4B5]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Primary competitive role</span>
              <input
                type="text"
                value={roleChoice}
                onChange={(e) => setRoleChoice(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Availability &amp; VOD note</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Timezone, practice nights, and preferred competitive modes…"
                className="w-full px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7] placeholder:text-[#9AA4B5]"
              />
            </label>

            {feedback && <p className="text-xs text-[#D6B477]">{feedback}</p>}

            <button
              type="submit"
              className="min-h-[44px] w-full px-4 py-2.5 rounded-xl bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184] transition-colors"
            >
              Save local application
            </button>
          </form>

          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Your saved applications</h2>
            {applications.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0B0E14] border border-[#252C38] text-center space-y-2">
                <Users className="w-6 h-6 text-[#D6B477] mx-auto" aria-hidden="true" />
                <p className="text-sm text-[#F3F4F7]">No saved applications yet</p>
                <p className="text-xs text-[#B5BECD]">
                  Use the form to draft a tryout request for an open clan listing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F3F4F7]">{app.clanName}</p>
                      <p className="text-xs text-[#D6B477]">
                        {app.handle} &middot; {app.role}
                      </p>
                      <p className="text-xs text-[#B5BECD]">{app.note}</p>
                      <p className="text-[11px] text-[#9AA4B5]">
                        {app.status} &middot; {app.submittedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteApp(app.id)}
                      aria-label={`Remove application to ${app.clanName}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#202632] border border-[#353D4B] text-[#B5BECD] hover:text-red-300 hover:border-red-400/50"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'settings' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Recruitment privacy &amp; safety</h2>
          <p className="text-sm text-[#B5BECD]">
            Rule One keeps profiles private by default, prohibits exposing private emails, and
            omits unsolicited direct messaging.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRecruitVisibility('private')}
              className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium ${
                recruitVisibility === 'private'
                  ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                  : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B]'
              }`}
            >
              Private (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setRecruitVisibility('opt_in')}
              className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-medium ${
                recruitVisibility === 'opt_in'
                  ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                  : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B]'
              }`}
            >
              Opt-in public LFT card (local preview)
            </button>
          </div>
          <p className="text-xs text-[#9AA4B5]">
            Current local visibility mode:{' '}
            <span className="text-[#F3F4F7] font-medium">
              {recruitVisibility === 'private' ? 'Private (unlisted)' : 'Opt-in public allowlist only'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * EVENTS WINDOW (/events)
 * ========================================================================== */

export function EventsView({
  savedEventIds,
  onToggleSaveEvent,
  onNavigatePath,
}: {
  savedEventIds: string[];
  onToggleSaveEvent: (id: string) => void;
  onNavigatePath: (path: string, label?: string) => void;
}) {
  const [subTab, setSubTab] = useState<'directory' | 'calendar' | 'saved'>('directory');
  const [gameFilter, setGameFilter] = useState<string>('All');

  const visibleEvents = useMemo(() => {
    let base = COMPETITIVE_EVENTS;
    if (subTab === 'saved') {
      base = base.filter((e) => savedEventIds.includes(e.id));
    }
    if (gameFilter !== 'All') {
      base = base.filter((e) => e.gameSlug === gameFilter);
    }
    return base;
  }, [subTab, gameFilter, savedEventIds]);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Events & Tournaments"
        subtitle="Official esports circuits and recurring competitive schedules with direct publisher links. Save events to track them in your Saved library."
        compact
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Events views">
        {(
          [
            { id: 'directory', label: 'Tournament directory' },
            { id: 'calendar', label: 'Calendar' },
            { id: 'saved', label: `Saved events (${savedEventIds.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              subTab === tab.id
                ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'All', label: 'All titles' },
          { id: 'modern-warfare-4', label: 'MW4' },
          { id: 'valorant', label: 'VALORANT' },
          { id: 'counter-strike-2', label: 'CS2' },
          { id: 'league-of-legends', label: 'League of Legends' },
          { id: 'chess-com', label: 'Chess.com' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setGameFilter(f.id)}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs sm:text-sm border transition-colors ${
              gameFilter === f.id
                ? 'bg-[#202632] text-[#E1C184] border-[#D6B477]'
                : 'bg-[#151A23] text-[#B5BECD] border-[#343C49] hover:text-[#F3F4F7]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibleEvents.length === 0 ? (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-8 text-center space-y-2">
          <Calendar className="w-6 h-6 text-[#D6B477] mx-auto" aria-hidden="true" />
          <p className="text-base font-medium text-[#F3F4F7]">No matching events</p>
          <p className="text-sm text-[#B5BECD]">
            {subTab === 'saved'
              ? 'Bookmark any circuit from the Tournament directory to pin it here.'
              : 'Try switching back to All titles.'}
          </p>
        </div>
      ) : subTab === 'calendar' ? (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl divide-y divide-[#252C38]">
          {visibleEvents.map((ev) => {
            const isSaved = savedEventIds.includes(ev.id);
            return (
              <div
                key={ev.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#D6B477]">{ev.dateWindow}</span>
                    <span className="text-xs text-[#9AA4B5]">&middot; {ev.circuit}</span>
                  </div>
                  <p className="text-base font-semibold text-[#F3F4F7]">{ev.title}</p>
                  <p className="text-xs text-[#B5BECD]">
                    {ev.format} &middot; {ev.region}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleSaveEvent(ev.id)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-sm font-medium inline-flex items-center gap-2 ${
                      isSaved
                        ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                        : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Bookmark className="w-4 h-4" aria-hidden="true" />
                    )}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#202632] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477] inline-flex items-center gap-1.5"
                  >
                    Official
                    <ExternalLink className="w-3.5 h-3.5 text-[#D6B477]" aria-hidden="true" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleEvents.map((ev) => {
            const isSaved = savedEventIds.includes(ev.id);
            return (
              <div
                key={ev.id}
                className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#D6B477]">{ev.dateWindow}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#202632] text-[#B5BECD]">
                      {ev.status}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-[#F3F4F7]">{ev.title}</h2>
                  <p className="text-xs text-[#B5BECD]">
                    {ev.gameName} &middot; {ev.format}
                  </p>
                  <p className="text-xs text-[#9AA4B5]">{ev.region}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSaveEvent(ev.id)}
                    className={`min-h-[44px] flex-1 px-3 py-2 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-1.5 ${
                      isSaved
                        ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                        : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Bookmark className="w-4 h-4" aria-hidden="true" />
                    )}
                    {isSaved ? 'Saved' : 'Save event'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigatePath(
                        ev.gameSlug === 'modern-warfare-4'
                          ? '/games/modern-warfare-4/ranked'
                          : `/games/${ev.gameSlug}`,
                        ev.gameName
                      )
                    }
                    className="min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477]"
                  >
                    Hub
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * STATISTICS & DEVELOPER DATA WINDOW (/statistics & /developers)
 * ========================================================================== */

interface SelfReportedMatch {
  id: string;
  gameName: string;
  mapOrMode: string;
  result: 'Win' | 'Loss';
  scoreline: string;
  notes: string;
  loggedAt: string;
}

const STORAGE_SELF_MATCHES = 'rule_one_self_reported_matches_v1';

function loadSelfMatches(): SelfReportedMatch[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_SELF_MATCHES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StatisticsView({
  initialSubTab = 'connections',
  savedPlaybooks,
  onNavigatePath,
}: {
  initialSubTab?: 'connections' | 'match_log' | 'trends' | 'team_reports';
  savedPlaybooks: SavedPlaybook[];
  onNavigatePath: (path: string, label?: string) => void;
}) {
  const [subTab, setSubTab] = useState<'connections' | 'match_log' | 'trends' | 'team_reports'>(
    initialSubTab
  );
  const [matches, setMatches] = useState<SelfReportedMatch[]>(loadSelfMatches);
  const [gameName, setGameName] = useState('Call of Duty: Modern Warfare 4');
  const [mapOrMode, setMapOrMode] = useState('Coal — Search & Destroy');
  const [result, setResult] = useState<'Win' | 'Loss'>('Win');
  const [scoreline, setScoreline] = useState('6-4');
  const [notes, setNotes] = useState('');

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedMap = sanitizePlainText(mapOrMode).trim();
    const cleanedScore = sanitizePlainText(scoreline).trim();
    const cleanedNotes = sanitizePlainText(notes).trim();
    if (!cleanedMap) return;
    const entry: SelfReportedMatch = {
      id: `match-${Date.now()}`,
      gameName,
      mapOrMode: cleanedMap,
      result,
      scoreline: cleanedScore || (result === 'Win' ? 'Win' : 'Loss'),
      notes: cleanedNotes,
      loggedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    const next = [entry, ...matches];
    setMatches(next);
    try {
      window.localStorage.setItem(STORAGE_SELF_MATCHES, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
    setNotes('');
  };

  const handleDeleteMatch = (id: string) => {
    const next = matches.filter((m) => m.id !== id);
    setMatches(next);
    try {
      window.localStorage.setItem(STORAGE_SELF_MATCHES, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  const winCount = matches.filter((m) => m.result === 'Win').length;
  const winRate = matches.length > 0 ? Math.round((winCount / matches.length) * 100) : null;

  return (
    <div className="space-y-6">
      <SectionHero
        title="Statistics & Developer Data"
        subtitle="Real developer API connections (live Chess.com PubAPI, Riot Data Dragon, MW4 4-track pipeline + SAR export importer) alongside honest, self-reported match logging. Zero fabricated telemetry."
        compact
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Statistics views">
        {(
          [
            { id: 'connections', label: 'Data connection status' },
            { id: 'match_log', label: `Match log (${matches.length})` },
            { id: 'trends', label: 'Performance trends' },
            { id: 'team_reports', label: 'Team reports' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              subTab === tab.id
                ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'connections' && <DeveloperConnectView onNavigatePath={onNavigatePath} />}

      {subTab === 'match_log' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleAddMatch}
            className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4"
          >
            <div>
              <h2 className="text-lg font-semibold text-[#F3F4F7]">Log self-reported match</h2>
              <p className="text-xs text-[#B5BECD] mt-1">
                Manually recorded matches are explicitly labeled &ldquo;Self-reported&rdquo; and
                never mixed with verified developer API telemetry.
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Game</span>
              <select
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
              >
                {GAME_CATALOG.map((g) => (
                  <option key={g.slug} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Map &amp; mode</span>
              <input
                type="text"
                value={mapOrMode}
                onChange={(e) => setMapOrMode(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#B5BECD]">Result</span>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value === 'Loss' ? 'Loss' : 'Win')}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
                >
                  <option value="Win">Win</option>
                  <option value="Loss">Loss</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-[#B5BECD]">Scoreline</span>
                <input
                  type="text"
                  value={scoreline}
                  onChange={(e) => setScoreline(e.target.value)}
                  placeholder="6-4"
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7]"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-[#B5BECD]">Post-match note (optional)</span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key adjustment or VOD timestamp…"
                className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#202632] border border-[#596171] text-sm text-[#F3F4F7] placeholder:text-[#9AA4B5]"
              />
            </label>

            <button
              type="submit"
              className="min-h-[44px] w-full px-4 py-2.5 rounded-xl bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184] inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add self-reported match
            </button>
          </form>

          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Recorded match history</h2>
            {matches.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0B0E14] border border-[#252C38] text-center space-y-2">
                <p className="text-sm font-medium text-[#F3F4F7]">No matches logged yet</p>
                <p className="text-xs text-[#B5BECD]">
                  Record a self-reported match or import your Activision SAR export inside Data
                  connection status.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            m.result === 'Win'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {m.result} &middot; {m.scoreline}
                        </span>
                        <span className="text-[11px] text-[#D6B477]">Self-reported</span>
                      </div>
                      <p className="text-sm font-semibold text-[#F3F4F7]">{m.mapOrMode}</p>
                      <p className="text-xs text-[#B5BECD]">
                        {m.gameName} &middot; {m.loggedAt}
                      </p>
                      {m.notes && <p className="text-xs text-[#9AA4B5]">{m.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMatch(m.id)}
                      aria-label={`Delete match ${m.mapOrMode}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#202632] border border-[#353D4B] text-[#B5BECD] hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'trends' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Performance trends</h2>
            <span className="text-xs text-[#D6B477]">
              Computed strictly from your self-reported match log
            </span>
          </div>
          {matches.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#0B0E14] border border-[#252C38] space-y-2">
              <p className="text-sm font-medium text-[#F3F4F7]">Not enough data yet</p>
              <p className="text-xs text-[#B5BECD]">
                Rule One never invents fake K/D ratios or fabricated charts. Log matches in the
                Match log tab or test live public endpoints in Data connection status.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B]">
                <p className="text-xs text-[#B5BECD]">Matches logged (Self-reported)</p>
                <p className="text-2xl font-bold text-[#F3F4F7] tabular-nums mt-1">
                  {matches.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B]">
                <p className="text-xs text-[#B5BECD]">Record</p>
                <p className="text-2xl font-bold text-[#E1C184] tabular-nums mt-1">
                  {winCount}W – {matches.length - winCount}L
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B]">
                <p className="text-xs text-[#B5BECD]">Self-reported win rate</p>
                <p className="text-2xl font-bold text-[#F3F4F7] tabular-nums mt-1">{winRate}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'team_reports' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Team &amp; playbook reports</h2>
          <p className="text-sm text-[#B5BECD]">
            Active tactical playbooks stored: <strong className="text-[#F3F4F7]">{savedPlaybooks.length}</strong>{' '}
            &middot; Self-reported matches logged:{' '}
            <strong className="text-[#F3F4F7]">{matches.length}</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigatePath('/clans/rule-one', 'Clan HQ')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184]"
            >
              Open Clan HQ
            </button>
            <button
              type="button"
              onClick={() => onNavigatePath('/maps', 'Tactical Maps')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C222D] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477]"
            >
              Open Tactical Map Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * SAVED LIBRARY WINDOW (/saved)
 * ========================================================================== */

export function SavedView({
  favoriteGameSlugs,
  savedPlaybooks,
  savedEventIds,
  onToggleFavoriteGame,
  onDeletePlaybook,
  onToggleSaveEvent,
  onNavigatePath,
}: {
  favoriteGameSlugs: string[];
  savedPlaybooks: SavedPlaybook[];
  savedEventIds: string[];
  onToggleFavoriteGame: (slug: string) => void;
  onDeletePlaybook: (id: string) => void;
  onToggleSaveEvent: (id: string) => void;
  onNavigatePath: (path: string, label?: string) => void;
}) {
  const [subTab, setSubTab] = useState<'all' | 'builds' | 'maps' | 'playbooks' | 'games'>('all');

  const favoriteGames = useMemo(
    () => GAME_CATALOG.filter((g) => favoriteGameSlugs.includes(g.slug)),
    [favoriteGameSlugs]
  );

  const savedEvents = useMemo(
    () => COMPETITIVE_EVENTS.filter((ev) => savedEventIds.includes(ev.id)),
    [savedEventIds]
  );

  return (
    <div className="space-y-6">
      <SectionHero
        title="Saved Library"
        subtitle="Quick access to your pinned games, saved S&D tactical playbooks, evaluated MW4 builds, and bookmarked tournaments."
        compact
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Saved categories">
        {(
          [
            { id: 'all', label: 'All saved' },
            { id: 'builds', label: `Builds (${MW4_EVALUATED_BUILDS.length})` },
            { id: 'maps', label: 'Maps' },
            { id: 'playbooks', label: `Playbooks (${savedPlaybooks.length})` },
            { id: 'games', label: `Games (${favoriteGames.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={subTab === tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              subTab === tab.id
                ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(subTab === 'all' || subTab === 'games') && (
        <section className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Favorite games</h2>
            <button
              type="button"
              onClick={() => onNavigatePath('/games', 'Games')}
              className="text-xs font-medium text-[#D6B477] hover:underline"
            >
              Browse all {GAME_CATALOG.length} &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteGames.map((game) => (
              <div
                key={game.slug}
                className="p-3.5 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() =>
                    onNavigatePath(
                      game.priority === 'pilot' ? '/games/modern-warfare-4' : `/games/${game.slug}`,
                      game.shortTitle
                    )
                  }
                  className="text-left min-w-0 flex-1"
                >
                  <p className="text-sm font-semibold text-[#F3F4F7] truncate">{game.shortTitle}</p>
                  <p className="text-xs text-[#B5BECD] truncate">{game.developerApi.provider}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavoriteGame(game.slug)}
                  aria-label={`Remove ${game.shortTitle} from favorites`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#202632] text-[#D6B477]"
                >
                  <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {(subTab === 'all' || subTab === 'playbooks') && (
        <section className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Saved tactical playbooks</h2>
            <button
              type="button"
              onClick={() => onNavigatePath('/maps', 'Maps')}
              className="text-xs font-medium text-[#D6B477] hover:underline"
            >
              Open Map Editor &rarr;
            </button>
          </div>
          {savedPlaybooks.length === 0 ? (
            <p className="text-sm text-[#B5BECD]">
              No playbooks saved yet. Draw and save a Search &amp; Destroy setup in the Maps window.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedPlaybooks.map((play) => (
                <div
                  key={play.id}
                  className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onNavigatePath(`/games/modern-warfare-4/maps/${play.mapId}`, play.name)
                    }
                    className="text-left min-w-0 flex-1"
                  >
                    <p className="text-sm font-semibold text-[#F3F4F7] truncate">{play.name}</p>
                    <p className="text-xs text-[#B5BECD]">
                      Map: {play.mapId} &middot; {play.side} &middot; {play.createdAt}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePlaybook(play.id)}
                    aria-label={`Delete playbook ${play.name}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#202632] text-[#B5BECD] hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(subTab === 'all' || subTab === 'builds') && (
        <section className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">MW4 evaluated builds</h2>
            <button
              type="button"
              onClick={() => onNavigatePath('/meta', 'Meta Lab')}
              className="text-xs font-medium text-[#D6B477] hover:underline"
            >
              Open Meta Lab &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MW4_EVALUATED_BUILDS.map((entry) => (
              <button
                key={entry.slug}
                type="button"
                onClick={() =>
                  onNavigatePath(`/games/modern-warfare-4/builds/${entry.slug}`, entry.build.name)
                }
                className="min-h-[44px] p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-left space-y-1 transition-colors"
              >
                <p className="text-sm font-semibold text-[#F3F4F7]">{entry.build.name}</p>
                <p className="text-xs text-[#D6B477]">
                  {entry.role} &middot; {entry.build.primaryWeapon}
                </p>
                <p className="text-xs text-[#B5BECD]">
                  Evidence: {entry.evidenceClass} &middot; Ranked legality pending official lock
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {(subTab === 'all' || subTab === 'maps') && (
        <section className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Interactive map boards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['coal', 'lotus', 'munition', 'reactor_u92', 'rooftops', 'silkworm'] as const).map(
              (mapId) => (
                <button
                  key={mapId}
                  type="button"
                  onClick={() =>
                    onNavigatePath(`/games/modern-warfare-4/maps/${mapId}`, `MW4 ${mapId}`)
                  }
                  className="min-h-[44px] p-3.5 rounded-xl bg-[#1C222D] border border-[#353D4B] hover:border-[#D6B477] text-left flex items-center gap-2.5"
                >
                  <MapIcon className="w-4 h-4 text-[#D6B477] shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium text-[#F3F4F7] capitalize">
                    {mapId.replace('_', ' ')}
                  </span>
                </button>
              )
            )}
          </div>
        </section>
      )}

      {subTab === 'all' && savedEvents.length > 0 && (
        <section className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Saved events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F3F4F7] truncate">{ev.title}</p>
                  <p className="text-xs text-[#B5BECD]">
                    {ev.dateWindow} &middot; {ev.gameName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSaveEvent(ev.id)}
                  aria-label={`Remove ${ev.title} from saved events`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-[#202632] text-[#D6B477]"
                >
                  <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================================================
 * SETTINGS WINDOW (/settings)
 * ========================================================================== */

export function SettingsView({
  currentUserEmail,
  currentUserName,
  accessibility,
  notifications,
  useSvgFallbackMode,
  onUpdateAccessibility,
  onUpdateNotifications,
  onToggleSvgFallbackMode,
  onClearLocalData,
  onNavigatePath,
}: {
  currentUserEmail: string | null;
  currentUserName: string | null;
  accessibility: AccessibilitySettings;
  notifications: NotificationPreferences;
  useSvgFallbackMode: boolean;
  onUpdateAccessibility: (next: AccessibilitySettings) => void;
  onUpdateNotifications: (next: NotificationPreferences) => void;
  onToggleSvgFallbackMode: () => void;
  onClearLocalData: () => void;
  onNavigatePath: (path: string, label?: string) => void;
}) {
  const [subTab, setSubTab] = useState<
    'profile' | 'accessibility' | 'privacy' | 'notifications' | 'subscription' | 'help'
  >('profile');
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHero
        title="Settings"
        subtitle="Manage accessibility preferences, local privacy and data deletion, opt-in notifications, billing transparency, and help resources."
        compact
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
        {(
          [
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'accessibility', label: 'Accessibility', icon: Eye },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'help', label: 'Help', icon: HelpCircle },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={subTab === tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-sm font-medium inline-flex items-center gap-2 transition-colors ${
                subTab === tab.id
                  ? 'bg-[#493B24] text-[#FFE0A1] border-[#D6B477]'
                  : 'bg-[#1C222D] text-[#F3F4F7] border-[#353D4B] hover:border-[#D6B477]'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === 'profile' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Account &amp; public profile</h2>
          <p className="text-sm text-[#B5BECD]">
            {currentUserEmail
              ? `Signed in as ${currentUserName || currentUserEmail} (${currentUserEmail}).`
              : 'Browsing publicly without login. Sign in via Clan HQ only when syncing co-founder playbooks.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigatePath('/players/jason-vaughn', 'Public Profile')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184]"
            >
              View public profile
            </button>
            <button
              type="button"
              onClick={() => onNavigatePath('/clans/rule-one', 'Clan HQ')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C222D] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477]"
            >
              Manage Clan HQ &amp; Sign-In
            </button>
          </div>
        </div>
      )}

      {subTab === 'accessibility' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Display &amp; accessibility</h2>
          <p className="text-sm text-[#B5BECD]">
            Changes apply immediately across all windows and persist in your browser.
          </p>

          {[
            {
              key: 'largeText' as const,
              title: 'Larger base text (18px)',
              desc: 'Scales body and control copy up from the 16px default.',
              checked: accessibility.largeText,
              toggle: () =>
                onUpdateAccessibility({ ...accessibility, largeText: !accessibility.largeText }),
            },
            {
              key: 'highContrast' as const,
              title: 'High contrast canvas',
              desc: 'Deepens background darkness to maximize foreground contrast.',
              checked: accessibility.highContrast,
              toggle: () =>
                onUpdateAccessibility({
                  ...accessibility,
                  highContrast: !accessibility.highContrast,
                }),
            },
            {
              key: 'reducedMotion' as const,
              title: 'Reduced motion',
              desc: 'Disables hover scale animations and smooth-scroll transitions.',
              checked: accessibility.reducedMotion,
              toggle: () =>
                onUpdateAccessibility({
                  ...accessibility,
                  reducedMotion: !accessibility.reducedMotion,
                }),
            },
            {
              key: 'svgFallback' as const,
              title: 'Use neutral SVG artwork mode',
              desc: 'Replaces external game cover imagery with clean local typographic SVG cards.',
              checked: useSvgFallbackMode,
              toggle: onToggleSvgFallbackMode,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#F3F4F7]">{item.title}</p>
                <p className="text-xs text-[#B5BECD] mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                onClick={item.toggle}
                className={`min-h-[44px] min-w-[76px] px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  item.checked
                    ? 'bg-[#D6B477] text-[#0B0E14] border-[#D6B477]'
                    : 'bg-[#202632] text-[#B5BECD] border-[#596171]'
                }`}
              >
                {item.checked ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'privacy' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Privacy &amp; data deletion</h2>
          <p className="text-sm text-[#B5BECD]">
            Favorite games, recently viewed links, saved events, draft applications, and
            self-reported matches are stored locally in your browser. You can delete all local
            storage data at any time.
          </p>

          {clearedNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              All local Rule One preferences and logs have been reset.
            </div>
          )}

          {!confirmClear ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1C222D] border border-red-400/50 text-red-300 hover:bg-red-500/10 text-sm font-medium inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Delete local browser data
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-[#0B0E14] border border-red-400/50 space-y-3">
              <p className="text-sm text-[#F3F4F7]">
                Reset favorite games, recently viewed history, saved events, local applications, and
                self-reported match logs?
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearLocalData();
                    setConfirmClear(false);
                    setClearedNotice(true);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500"
                >
                  Confirm delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#1C222D] border border-[#353D4B] text-sm text-[#F3F4F7]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'notifications' && (
        <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-6 space-y-4 max-w-2xl">
          <h2 className="text-lg font-semibold text-[#F3F4F7]">Notification preferences</h2>
          <p className="text-sm text-[#B5BECD]">
            All alerts are off by default. Rule One only sends updates through explicitly opted-in
            channels—no notification spam.
          </p>

          {[
            {
              key: 'patchAlertsOptIn' as const,
              title: 'Saved-build patch alerts',
              desc: 'Notify when an official patch diff flags a saved weapon build as outdated.',
              checked: notifications.patchAlertsOptIn,
            },
            {
              key: 'weeklyClanSummaryOptIn' as const,
              title: 'Weekly clan operations summary',
              desc: 'Opt-in digest of scheduled scrims, attendance, and map veto notes.',
              checked: notifications.weeklyClanSummaryOptIn,
            },
            {
              key: 'scrimRemindersOptIn' as const,
              title: 'Mutual scrim confirmations',
              desc: 'Reminder when both captains confirm a scrim time slot.',
              checked: notifications.scrimRemindersOptIn,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-xl bg-[#1C222D] border border-[#353D4B] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-[#F3F4F7]">{item.title}</p>
                <p className="text-xs text-[#B5BECD] mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                onClick={() =>
                  onUpdateNotifications({ ...notifications, [item.key]: !item.checked })
                }
                className={`min-h-[44px] min-w-[84px] px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  item.checked
                    ? 'bg-[#D6B477] text-[#0B0E14] border-[#D6B477]'
                    : 'bg-[#202632] text-[#B5BECD] border-[#596171]'
                }`}
              >
                {item.checked ? 'Opted in' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'subscription' && (
        <div className="space-y-4">
          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#F3F4F7]">
                Planned membership tiers (Billing disabled)
              </h2>
              <p className="text-sm text-[#B5BECD] mt-1">
                Core guides, maps, and public profiles stay free. Checkout and billing remain
                strictly disabled until approved.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[#493B24] border border-[#D6B477] text-xs font-semibold text-[#FFE0A1]">
              Billing Disabled &middot; Preview Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_EXPERIMENT_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#D6B477]">{tier.status}</p>
                  <h3 className="text-base font-semibold text-[#F3F4F7]">{tier.name}</h3>
                  <p className="text-xl font-bold text-[#E1C184]">{tier.priceLabel}</p>
                  <p className="text-xs text-[#B5BECD] leading-relaxed">{tier.summary}</p>
                  <ul className="pt-1 space-y-1 text-xs text-[#9AA4B5] list-disc list-inside">
                    {tier.entitlements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  disabled
                  className="min-h-[44px] w-full px-3 py-2 rounded-lg bg-[#202632] border border-[#353D4B] text-xs text-[#9AA4B5] cursor-not-allowed"
                >
                  Checkout Disabled
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'help' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">Navigation &amp; shortcuts</h2>
            <ul className="space-y-2 text-sm text-[#B5BECD]">
              <li>
                Press <kbd className="px-2 py-0.5 rounded bg-[#202632] text-[#F3F4F7]">/</kbd> to
                focus global search from any window.
              </li>
              <li>
                Press <kbd className="px-2 py-0.5 rounded bg-[#202632] text-[#F3F4F7]">Esc</kbd> to
                dismiss search results or mobile drawers.
              </li>
              <li>Every major workflow is reachable within three clicks from Home.</li>
            </ul>
          </div>

          <div className="bg-[#151A23] border border-[#343C49] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#F3F4F7]">
              Source provenance &amp; corrections
            </h2>
            <p className="text-sm text-[#B5BECD]">
              Inspect our verified asset rights ledger, partner adapter statuses, and submit a
              factual correction directly in the Intel &amp; Rights Registry.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigatePath('/ops', 'Intel & Rights')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#D6B477] text-[#0B0E14] font-semibold text-sm hover:bg-[#E1C184] inline-flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                Open Intel &amp; Rights
              </button>
              <button
                type="button"
                onClick={() => onNavigatePath('/developers', 'Developer Connect')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1C222D] border border-[#353D4B] text-sm text-[#F3F4F7] hover:border-[#D6B477] inline-flex items-center gap-2"
              >
                <Plug className="w-4 h-4 text-[#D6B477]" aria-hidden="true" />
                Developer APIs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
