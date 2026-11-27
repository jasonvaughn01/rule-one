import { GAME_CATALOG } from '../data/gameCatalog';
import {
  EQUIPMENT_GUIDE_ITEMS,
  MW4_EVALUATED_BUILDS,
  MW4_MAP_ENUMERATION,
  MW4_PATCH_DIFFS,
  STRATEGY_TEMPLATES,
  VERIFIED_NEWS_ITEMS,
} from '../data/intelligencePipeline';

export type SearchResultGroup =
  | 'Games'
  | 'Maps & Tactical Boards'
  | 'Weapon Builds & Meta'
  | 'Patches & Ranked Intel'
  | 'Clans & Players';

export interface UniversalSearchResult {
  id: string;
  group: SearchResultGroup;
  title: string;
  subtitle: string;
  path: string;
  score: number;
  badge?: string;
}

export interface UniversalSearchResponse {
  query: string;
  didYouMean: string | null;
  grouped: Record<SearchResultGroup, UniversalSearchResult[]>;
  total: number;
}

// Common esports abbreviations & query expansion
const ABBREVIATION_MAP: Record<string, string[]> = {
  mw4: ['modern warfare 4', 'call of duty'],
  cod: ['call of duty', 'modern warfare 4', 'warzone'],
  wz: ['warzone', 'battle royale'],
  val: ['valorant'],
  valo: ['valorant'],
  valorent: ['valorant'],
  cs: ['counter-strike 2'],
  cs2: ['counter-strike 2'],
  csgo: ['counter-strike 2'],
  r6: ['rainbow six siege'],
  ow2: ['overwatch 2'],
  lol: ['league of legends'],
  tft: ['teamfight tactics'],
  sf6: ['street fighter 6'],
  mk1: ['mortal kombat 1'],
  ggst: ['guilty gear strive'],
  rl: ['rocket league'],
  fc: ['ea sports fc'],
  fifa: ['ea sports fc'],
  sc2: ['starcraft ii'],
  aoe4: ['age of empires iv'],
  wow: ['world of warcraft'],
  snd: ['search', 'map', 'coal', 'lotus', 'munition', 'silkworm', 'rooftops', 'reactor'],
  's&d': ['search', 'map', 'coal', 'lotus', 'munition', 'silkworm', 'rooftops', 'reactor'],
  ar: ['m4', 'han 86', 'build', 'weapon'],
  smg: ['vel-46', 'build', 'weapon'],
  ranked: ['ranked', 'cdl', 'm4', 'rules'],
  meta: ['build', 'patch', 'hypothesis', 'warzone', 'modern warfare 4'],
  maps: ['map', 'coal', 'lotus', 'munition', 'silkworm', 'rooftops', 'reactor'],
  clan: ['rule one', 'clan hq', 'recruitment'],
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[b.length];
}

function scoreText(tokens: string[], expandedTokens: string[], haystack: string): number {
  const hay = haystack.toLowerCase();
  const hayWords = hay.split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;

  for (const tok of tokens) {
    if (tok.length < 2) continue;
    if (hay.includes(tok)) {
      score += 12;
      if (hay.startsWith(tok)) score += 6;
    } else {
      // Fuzzy spelling tolerance for typos (distance <= 2 on words >= 4 chars)
      for (const word of hayWords) {
        if (Math.abs(word.length - tok.length) <= 2 && tok.length >= 4) {
          const dist = levenshtein(tok, word);
          if (dist === 1) {
            score += 8;
            break;
          }
          if (dist === 2 && tok.length >= 6) {
            score += 4;
            break;
          }
        }
      }
    }
  }

  for (const exp of expandedTokens) {
    if (hay.includes(exp)) {
      score += 5;
    }
  }

  return score;
}

interface SearchDoc {
  id: string;
  group: SearchResultGroup;
  title: string;
  subtitle: string;
  path: string;
  searchable: string;
  badge?: string;
}

const STATIC_DOCS: SearchDoc[] = [
  ...GAME_CATALOG.map((g) => ({
    id: `game-${g.slug}`,
    group: 'Games' as const,
    title: g.name,
    subtitle: `${g.developerApi.apiName} · ${g.developerApi.accessModel}`,
    path: `/games/${g.slug}`,
    searchable: `${g.name} ${g.shortTitle} ${g.category} ${g.publisher} ${g.developerApi.apiName} ${g.aliases.join(' ')} ${g.platforms.join(' ')}`,
    badge: g.developerApi.accessModel,
  })),
  {
    id: 'dev-connect-hub',
    group: 'Patches & Ranked Intel' as const,
    title: 'Connect with Game Developers & Official APIs',
    subtitle: 'Live Chess.com & Riot Data Dragon testers + all 12 official developer portals',
    path: '/developers',
    searchable: 'developer api connect portal riot valve steam bungie pubg blizzard supercell chess osu wargaming',
    badge: 'Developer Hub',
  },
  ...MW4_MAP_ENUMERATION.map((m) => ({
    id: `map-${m.id}`,
    group: 'Maps & Tactical Boards' as const,
    title: `${m.name} — MW4 Tactical Map`,
    subtitle: `${m.modePool} · ${m.hasInteractiveCanvas ? 'Interactive S&D Board' : 'Official Enumeration'}`,
    path: m.canvasMapId
      ? `/games/modern-warfare-4/maps/${m.canvasMapId}`
      : '/games/modern-warfare-4/maps/coal',
    searchable: `modern warfare 4 mw4 map ${m.name} ${m.modePool} snd search destroy tactical callouts`,
    badge: m.hasInteractiveCanvas ? 'Interactive Board' : 'Enumerated',
  })),
  ...MW4_EVALUATED_BUILDS.map((b) => ({
    id: `build-${b.slug}`,
    group: 'Weapon Builds & Meta' as const,
    title: b.build.name,
    subtitle: `${b.role} · ${b.build.primaryWeapon}`,
    path: `/games/modern-warfare-4/builds/${b.slug}`,
    searchable: `modern warfare 4 mw4 build loadout meta ranked ar smg ${b.build.name} ${b.build.primaryWeapon} ${b.role} ${b.build.attachments.join(' ')}`,
    badge: b.evidenceClass === 'prediction' ? 'Hypothesis' : 'Community Draft',
  })),
  ...MW4_PATCH_DIFFS.map((p) => ({
    id: `patch-${p.slug}`,
    group: 'Patches & Ranked Intel' as const,
    title: p.patchName,
    subtitle: `MW4 · ${p.releaseDate} · ${p.effectiveWindow}`,
    path: `/games/modern-warfare-4/patches/${p.slug}`,
    searchable: `modern warfare 4 mw4 patch update notes ${p.patchName} ${p.summary} ${p.impactedMaps.join(' ')}`,
    badge: 'Official Patch',
  })),
  {
    id: 'ranked-mw4',
    group: 'Patches & Ranked Intel',
    title: 'MW4 Ranked Play & CDL Ruleset Status',
    subtitle: 'CDL Kickoff Dec 4, 2026 · 8 Skill Divisions · Official Ranked Lock Pending',
    path: '/games/modern-warfare-4/ranked',
    searchable: 'modern warfare 4 mw4 ranked play cdl rules restrictions divisions competitive',
    badge: 'Ranked Hub',
  },
  {
    id: 'clan-rule-one',
    group: 'Clans & Players',
    title: 'Rule One — Competitive Clan HQ',
    subtitle: 'Public Opt-In HQ · Scrims, Roster Roles, VOD Logs & Map Veto',
    path: '/clans/rule-one',
    searchable: 'rule one clan hq recruitment scrims roster cofounder',
    badge: 'Clan HQ',
  },
  {
    id: 'player-jason',
    group: 'Clans & Players',
    title: 'Jason Vaughn — Public Player Profile',
    subtitle: 'Primary Founder · Call of Duty: Modern Warfare 4 · S&D IGL / Flex',
    path: '/players/jason-vaughn',
    searchable: 'jason vaughn player profile founder stats mw4',
    badge: 'Player Profile',
  },
  {
    id: 'player-fubar',
    group: 'Clans & Players',
    title: 'FPSxFUBARxGSG — Co-Founder Profile',
    subtitle: 'Co-Founder · Call of Duty: Modern Warfare 4 · Entry / Tactical Lead',
    path: '/players/fpsxfubarxgsg',
    searchable: 'fpsxfubarxgsg fubar cofounder player profile mw4',
    badge: 'Co-Founder',
  },
  {
    id: 'window-recruitment',
    group: 'Clans & Players',
    title: 'Recruitment — Find Clans & Teammates',
    subtitle: 'Browse open clan rosters, player listings, and local demo applications',
    path: '/recruitment',
    searchable: 'recruitment find clans teammates applications tryouts lft lfp roster',
    badge: 'Recruitment',
  },
  {
    id: 'window-events',
    group: 'Patches & Ranked Intel',
    title: 'Events — Competitive Tournament Directory & Calendar',
    subtitle: 'CDL 2027 Kickoff, VCT, CS2 Majors, LoL Esports, Chess.com Titled Tuesday',
    path: '/events',
    searchable: 'events tournaments calendar schedule cdl kickoff vct major worlds saved events',
    badge: 'Events',
  },
  {
    id: 'window-statistics',
    group: 'Patches & Ranked Intel',
    title: 'Statistics & Data Connection Status',
    subtitle: 'Self-reported match log, performance trends, and live Developer API status',
    path: '/statistics',
    searchable: 'statistics stats match log performance trends team reports data connection api',
    badge: 'Statistics',
  },
  {
    id: 'window-saved',
    group: 'Weapon Builds & Meta',
    title: 'Saved Library — Builds, Maps, Playbooks & Games',
    subtitle: 'Quick access to pinned games, tactical S&D playbooks, builds, and events',
    path: '/saved',
    searchable: 'saved bookmarks favorites playbooks builds maps events library',
    badge: 'Saved',
  },
  {
    id: 'window-settings',
    group: 'Clans & Players',
    title: 'Settings — Accessibility, Privacy, Notifications & Help',
    subtitle: 'Text scale, high contrast, reduced motion, local data controls, and billing transparency',
    path: '/settings',
    searchable: 'settings profile accessibility privacy notifications subscription help delete data',
    badge: 'Settings',
  },
  {
    id: 'window-strategies',
    group: 'Maps & Tactical Boards',
    title: 'Strategy Library — Playbooks & Competitive Templates',
    subtitle: 'Hardpoint setups, rotations, S&D executes, retakes, and Bo5 map veto frameworks',
    path: '/strategies',
    searchable: 'strategy strategies library playbook hardpoint rotation retake veto snd offense defense',
    badge: 'Strategies',
  },
  ...STRATEGY_TEMPLATES.map((st) => ({
    id: `strat-${st.id}`,
    group: 'Maps & Tactical Boards' as const,
    title: st.title,
    subtitle: `${st.gameName} · ${st.category} · ${st.evidenceClass}`,
    path: '/strategies',
    searchable: `strategy template ${st.title} ${st.gameName} ${st.mapName} ${st.mode} ${st.category}`,
    badge: st.mode,
  })),
  {
    id: 'window-news',
    group: 'Patches & Ranked Intel',
    title: 'Gaming News & Verified Patch Announcements',
    subtitle: 'Official publisher updates for MW4, LoL Esports Open Access, CS2 VRS, and VALORANT VCT',
    path: '/news',
    searchable: 'gaming news patch updates announcements esports cdl vct lol cs2',
    badge: 'News',
  },
  ...VERIFIED_NEWS_ITEMS.map((n) => ({
    id: `news-${n.id}`,
    group: 'Patches & Ranked Intel' as const,
    title: n.title,
    subtitle: `${n.gameName} · ${n.publishedDate} · ${n.evidenceClass}`,
    path: '/news',
    searchable: `news ${n.title} ${n.gameName} ${n.category} ${n.summary}`,
    badge: n.category,
  })),
  {
    id: 'window-equipment',
    group: 'Weapon Builds & Meta',
    title: 'Equipment & Competitive Gear Guide (Affiliate Disclosure)',
    subtitle: 'Monitors, controllers, mice, keyboards, headsets, capture & networking criteria',
    path: '/equipment',
    searchable: 'equipment gear hardware monitor controller mouse keyboard headset capture streaming ethernet affiliate',
    badge: 'Equipment',
  },
  ...EQUIPMENT_GUIDE_ITEMS.map((eq) => ({
    id: `eq-${eq.id}`,
    group: 'Weapon Builds & Meta' as const,
    title: eq.name,
    subtitle: `${eq.category} · ${eq.budgetTier} · ${eq.platforms.join(' / ')}`,
    path: '/equipment',
    searchable: `equipment gear ${eq.category} ${eq.name} ${eq.targetUseCase} ${eq.supportedGames.join(' ')}`,
    badge: eq.category,
  })),
  {
    id: 'window-notifications',
    group: 'Clans & Players',
    title: 'Notifications Center — Patch Alerts & Reminders',
    subtitle: 'Opt-in alert inbox for MW4 patch diffs, saved tournaments, and local tryout drafts',
    path: '/notifications',
    searchable: 'notifications alerts inbox patch reminders opt-in',
    badge: 'Alerts',
  },
  {
    id: 'window-admin',
    group: 'Patches & Ranked Intel',
    title: 'Owner Administration Dashboard & Transparency Console',
    subtitle: 'Measured local telemetry, asset rights ledger, API health, and correction queue',
    path: '/admin',
    searchable: 'admin owner dashboard ops telemetry ledger provenance review queue',
    badge: 'Admin',
  },
];

const SUGGESTION_TERMS = [
  'Counter-Strike 2',
  'VALORANT developer API',
  'League of Legends live patch',
  'Chess.com live stats',
  'Destiny 2 Bungie API',
  'Connect with developers',
];

export const EXAMPLE_SEARCHES = [
  'VALORANT developer API',
  'Counter-Strike 2',
  'League of Legends',
  'Chess.com live stats',
];

export function runUniversalSearch(rawQuery: string): UniversalSearchResponse {
  const cleaned = rawQuery.trim().toLowerCase();
  const emptyGrouped: Record<SearchResultGroup, UniversalSearchResult[]> = {
    Games: [],
    'Maps & Tactical Boards': [],
    'Weapon Builds & Meta': [],
    'Patches & Ranked Intel': [],
    'Clans & Players': [],
  };

  if (!cleaned) {
    return { query: rawQuery, didYouMean: null, grouped: emptyGrouped, total: 0 };
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const expandedTokens: string[] = [];
  for (const tok of tokens) {
    if (ABBREVIATION_MAP[tok]) {
      expandedTokens.push(...ABBREVIATION_MAP[tok]);
    }
  }

  const scored: UniversalSearchResult[] = [];
  for (const doc of STATIC_DOCS) {
    const score = scoreText(tokens, expandedTokens, doc.searchable);
    if (score > 0) {
      scored.push({
        id: doc.id,
        group: doc.group,
        title: doc.title,
        subtitle: doc.subtitle,
        path: doc.path,
        score,
        badge: doc.badge,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  for (const item of scored) {
    if (emptyGrouped[item.group].length < 5) {
      emptyGrouped[item.group].push(item);
    }
  }

  const total = Object.values(emptyGrouped).reduce((acc, list) => acc + list.length, 0);

  let didYouMean: string | null = null;
  if (total === 0) {
    let bestTerm = SUGGESTION_TERMS[0];
    let bestDist = Infinity;
    for (const term of SUGGESTION_TERMS) {
      const dist = levenshtein(cleaned, term.toLowerCase());
      if (dist < bestDist) {
        bestDist = dist;
        bestTerm = term;
      }
    }
    didYouMean = bestTerm;
  }

  return {
    query: rawQuery,
    didYouMean,
    grouped: emptyGrouped,
    total,
  };
}
