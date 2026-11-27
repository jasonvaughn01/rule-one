import { EvidenceClass, Mw4BuildDraft } from '../lib/validators';

export interface SourceRegistryEntry {
  id: string;
  publisher: string;
  game: string;
  scope: string;
  sourceUrl: string;
  retrievedAt: string;
  effectivePatch: string;
  evidenceClass: EvidenceClass;
  permissions: string;
  reviewer: string;
  publicationState: 'published' | 'draft_review' | 'quarantined' | 'blocked_pending_approval';
  notes: string;
}

export interface Mw4MapEnumerationItem {
  id: string;
  name: string;
  modePool: 'Core 6v6 Launch' | 'Post-Launch 6v6' | 'Ground War 32v32' | 'Gunfight 2v2 / Kill Block';
  hasInteractiveCanvas: boolean;
  canvasMapId?: 'coal' | 'lotus' | 'munition' | 'reactor_u92' | 'rooftops' | 'silkworm';
  evidenceClass: EvidenceClass;
  geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)' | 'Enumerated — Canvas Pending';
  officialReleaseNote: string;
  cdlCandidateStatus?: 'Candidate — Revalidate against official CDL rules before lock' | 'Non-CDL / Public Pool';
  candidateModes?: ('Hardpoint' | 'Search & Destroy' | 'Hijack')[];
  officialGuideUrl?: string;
}

export interface PatchDiffRecord {
  id: string;
  slug: string;
  gameSlug: string;
  patchName: string;
  releaseDate: string;
  effectiveWindow: string;
  sourceUrl: string;
  evidenceClass: EvidenceClass;
  summary: string;
  flaggedWeaponsOrItems: string[];
  impactedMaps: string[];
  impactedRules: string[];
  reviewTasks: {
    id: string;
    target: string;
    status: 'draft_review' | 'approved' | 'blocked';
    note: string;
  }[];
}

export interface PartnerAdapterContract {
  id: string;
  partner: string;
  gamesCovered: string;
  docsUrl: string;
  credentialsConfigured: false;
  adapterStatus: 'disabled_pending_approval';
  delayAndRateNotes: string;
  commercialRightsStatus: string;
  fallbackMode: string;
}

export interface CorrectionLogEntry {
  id: string;
  submittedAt: string;
  targetPath: string;
  category: 'Map Geometry' | 'Weapon Stats' | 'Ruleset / Ranked' | 'Image Rights' | 'Other';
  summary: string;
  status: 'Logged for Review' | 'Verified & Updated';
}

export const SOURCE_REGISTRY: SourceRegistryEntry[] = [
  {
    id: 'src-mw4-launch',
    publisher: 'Activision / Infinity Ward',
    game: 'Call of Duty: Modern Warfare 4',
    scope: 'Global release date (Oct 23, 2026), platforms (PS5, Xbox Series X|S, PC, Switch 2), 12 launch 6v6 maps, 33 base weapons, Apex Attachments',
    sourceUrl: 'https://www.callofduty.com',
    retrievedAt: '2026-11-27T07:15:00Z',
    effectivePatch: 'Launch 1.0 / Season 1',
    evidenceClass: 'official',
    permissions: 'Public announcement facts; no commercial API or map-file redistribution license granted',
    reviewer: 'Rule One Editorial Desk',
    publicationState: 'published',
    notes: 'Confirmed 12 core 6v6 maps, Shipment (Oct 27), 3 Ground War maps, 4 Gunfight maps + Kill Block.',
  },
  {
    id: 'src-mw4-legacy-quarantine',
    publisher: 'Legacy Local Seed (Internal)',
    game: 'Call of Duty: Modern Warfare 4',
    scope: 'src/data/mw4CdlData.ts & src/data/sndMaps.ts — schematic coordinates, legacy CDL v1.0 restriction tables, M4/VEL-46 pairing',
    sourceUrl: 'internal://legacy-audit/2026-11-27',
    retrievedAt: '2026-11-27T07:00:00Z',
    effectivePatch: 'Pre-Audit Snapshot',
    evidenceClass: 'unverified',
    permissions: 'Internal schematic only — NOT verified publisher minimap geometry or locked Ranked rules',
    reviewer: 'Rule One Safety Audit',
    publicationState: 'quarantined',
    notes: 'Quarantined until independently verified against official Activision CDL & Ranked Play rulebooks.',
  },
  {
    id: 'src-activision-profile',
    publisher: 'Activision',
    game: 'Call of Duty franchise',
    scope: 'Authorized partner APIs and privacy-dependent gameplay data policy',
    sourceUrl: 'https://support.activision.com/articles/managing-your-activision-profile',
    retrievedAt: '2026-11-27T00:00:00Z',
    effectivePatch: 'Policy Current',
    evidenceClass: 'official',
    permissions: 'No partner access granted to Rule One; written partnership application required',
    reviewer: 'Rule One Compliance',
    publicationState: 'blocked_pending_approval',
    notes: 'No credential collection, scraping, or unofficial endpoint workarounds permitted.',
  },
  {
    id: 'src-steam-charts',
    publisher: 'Valve (Steam)',
    game: 'CS2, Dota 2, PUBG, Apex Legends (Steam PC snapshot)',
    scope: 'Concurrent PC activity snapshot on Steam (not global cross-platform ranking)',
    sourceUrl: 'https://store.steampowered.com/charts',
    retrievedAt: '2026-11-27T00:00:00Z',
    effectivePatch: 'Rolling Snapshot',
    evidenceClass: 'official',
    permissions: 'Public storefront data; publisher-specific match telemetry varies per title',
    reviewer: 'Rule One Editorial Desk',
    publicationState: 'published',
    notes: 'Used strictly as demand-discovery signal; never presented as global cross-platform rank.',
  },
  {
    id: 'src-riot-portal',
    publisher: 'Riot Games',
    game: 'League of Legends, VALORANT, Teamfight Tactics',
    scope: 'Developer portal key categories, production approval, opt-in & transformative monetization rules',
    sourceUrl: 'https://developer.riotgames.com/docs/portal',
    retrievedAt: '2026-11-27T00:00:00Z',
    effectivePatch: 'Policy Current',
    evidenceClass: 'official',
    permissions: 'Registration and production key approval pending; asset restrictions apply',
    reviewer: 'Rule One Compliance',
    publicationState: 'blocked_pending_approval',
    notes: 'Requires free-tier parity and explicit player opt-in for VALORANT match endpoints.',
  },
  {
    id: 'src-lol-open-access',
    publisher: 'Riot Games / LoL Esports',
    game: 'League of Legends Esports',
    scope: 'Nov 12, 2026 Open Access esports data announcement (5-minute delayed live series feed)',
    sourceUrl: 'https://lolesports.com/en-US/news/build-with-official-league-of-legends-esports-data',
    retrievedAt: '2026-11-27T00:00:00Z',
    effectivePatch: '2026-11-12 Announcement',
    evidenceClass: 'official',
    permissions: '5-minute delay documented; commercial redistribution permission requires separate verification',
    reviewer: 'Rule One Compliance',
    publicationState: 'draft_review',
    notes: 'Never label as real-time/live without showing measured timestamp and 5-minute delay.',
  },
];

export const MW4_MAP_ENUMERATION: Mw4MapEnumerationItem[] = [
  {
    id: 'coal',
    name: 'Coal',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'coal',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy', 'Hijack'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/coal',
  },
  {
    id: 'lotus',
    name: 'Lotus',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'lotus',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/lotus',
  },
  {
    id: 'munition',
    name: 'Munition',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'munition',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy', 'Hijack'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/munition',
  },
  {
    id: 'reactor_u92',
    name: 'Reactor U92',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'reactor_u92',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/reactor-u92',
  },
  {
    id: 'rooftops',
    name: 'Rooftops',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'rooftops',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy', 'Hijack'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/rooftops',
  },
  {
    id: 'silkworm',
    name: 'Silkworm',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: true,
    canvasMapId: 'silkworm',
    evidenceClass: 'official',
    geometryStatus: 'Schematic (Community-Drawn — Pending Licensed Minimap)',
    officialReleaseNote: 'Verified launch 6v6 map (Oct 23, 2026). Interactive tactical diagram available.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Search & Destroy', 'Hijack'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/silkworm',
  },
  {
    id: 'cachette',
    name: 'Cachette',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; tactical diagram queued for gameplay verification.',
    cdlCandidateStatus: 'Non-CDL / Public Pool',
  },
  {
    id: 'lithium',
    name: 'Lithium',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; candidate CDL pool map pending schematic board & official rules lock.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Search & Destroy'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/lithium',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; tactical diagram queued for gameplay verification.',
    cdlCandidateStatus: 'Non-CDL / Public Pool',
  },
  {
    id: 'nautical',
    name: 'Nautical',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; tactical diagram queued for gameplay verification.',
    cdlCandidateStatus: 'Non-CDL / Public Pool',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; candidate CDL pool map pending schematic board & official rules lock.',
    cdlCandidateStatus: 'Candidate — Revalidate against official CDL rules before lock',
    candidateModes: ['Hardpoint', 'Hijack'],
    officialGuideUrl: 'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/sentry',
  },
  {
    id: 'transit_213',
    name: 'Transit 213',
    modePool: 'Core 6v6 Launch',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Confirmed launch 6v6 map; tactical diagram queued for gameplay verification.',
    cdlCandidateStatus: 'Non-CDL / Public Pool',
  },
  {
    id: 'shipment',
    name: 'Shipment',
    modePool: 'Post-Launch 6v6',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Added Oct 27, 2026 (non-CDL / public respawn pool).',
    cdlCandidateStatus: 'Non-CDL / Public Pool',
  },
  {
    id: 'ground_war_pool',
    name: 'Ground War Large-Map Pool (3 Maps)',
    modePool: 'Ground War 32v32',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Reconciled separately from Core 6v6; 32v32 combined arms maps.',
  },
  {
    id: 'gunfight_killblock',
    name: 'Gunfight (4 Maps) + Kill Block (3v3 / 10v10)',
    modePool: 'Gunfight 2v2 / Kill Block',
    hasInteractiveCanvas: false,
    evidenceClass: 'official',
    geometryStatus: 'Enumerated — Canvas Pending',
    officialReleaseNote: 'Reconciled separately from Core 6v6 and CDL S&D pools.',
  },
];

export interface Mw4EvaluatedBuild {
  slug: string;
  build: Mw4BuildDraft;
  role: string;
  evidenceClass: EvidenceClass;
  hypothesisNotice?: string;
  tradeoffs: string;
  measurementNote: string;
}

export const MW4_EVALUATED_BUILDS: Mw4EvaluatedBuild[] = [
  {
    slug: 'm4-vel46-hypothesis',
    build: {
      id: 'mw4-m4-hypothesis',
      name: 'M4 Flex AR (Pre-Ranked Hypothesis)',
      primaryWeapon: 'M4 Base Frame (AR)',
      attachments: [
        'Compensator Muzzle',
        'Long Recoil Barrel',
        'Angled Grip Underbarrel',
        'Stippled Rear Grip',
        'Lightweight Stock',
      ],
      tactical: 'Stun Grenade',
      lethal: 'Semtex',
      fieldUpgrade: 'Dead Silence',
      patchVersion: 'Season 1 Launch',
    },
    role: 'Flex AR · Hypothesis Pairing with VEL-46',
    evidenceClass: 'prediction',
    hypothesisNotice:
      'HYPOTHESIS ONLY: Predicted M4 / VEL-46 Ranked pairing is unverified until Activision publishes official MW4 Ranked Play weapon restrictions and exact attachment names are confirmed in-game.',
    tradeoffs: 'Balanced mid-range recoil control vs slower sprint-to-fire compared to pure entry SMGs.',
    measurementNote:
      'No fabricated TTK/pick-rate telemetry. Independent 60fps firing-range recoil/ADS capture pending editor verification.',
  },
  {
    slug: 'han86-anchor-draft',
    build: {
      id: 'mw4-han86-draft',
      name: 'HAN 86 Anchor AR (Community Draft)',
      primaryWeapon: 'HAN 86 (AR)',
      attachments: [
        'Compensator Muzzle',
        'Heavy Stability Barrel',
        'Vertical Control Foregrip',
        'Low-Profile Reflex Optic',
      ],
      tactical: 'Stun Grenade',
      lethal: 'Frag Grenade',
      fieldUpgrade: 'Trophy System',
      patchVersion: 'Season 1 Launch',
    },
    role: 'Main AR Anchor · Quarantined Legacy Preset',
    evidenceClass: 'community_reported',
    hypothesisNotice:
      'Quarantined from legacy seed data — verify exact in-game attachment slot names and Ranked Play legality once official CDL/Ranked rules publish.',
    tradeoffs: 'Strong long-lane stability across Coal Catwalks & Rooftops; slower strafe speed in close quarters.',
    measurementNote: 'Awaiting independently tested ADS/range frame measurements with documented test method.',
  },
  {
    slug: 'vel46-entry-draft',
    build: {
      id: 'mw4-vel46-draft',
      name: 'VEL-46 Entry SMG (Hypothesis Draft)',
      primaryWeapon: 'VEL-46 (SMG)',
      attachments: [
        'Flash Hider Muzzle',
        'Compact Handling Barrel',
        'Sprint-to-Fire Grip',
        'Mobility Stock',
      ],
      tactical: 'Smoke Grenade',
      lethal: 'Semtex',
      fieldUpgrade: 'Dead Silence',
      patchVersion: 'Season 1 Launch',
    },
    role: 'Entry SMG · Hypothesis',
    evidenceClass: 'prediction',
    hypothesisNotice:
      'Predicted SMG entry pairing — test against alternative SMGs once official weapon tuning and Ranked bans are published.',
    tradeoffs: 'Fast close-range handling and bomb-site entry speed; sharp damage drop-off past 25m.',
    measurementNote: 'No fake meta score displayed; sample size pending verified testing.',
  },
];

export const MW4_PATCH_DIFFS: PatchDiffRecord[] = [
  {
    id: 'patch-s1-launch',
    slug: 'season-1-launch',
    gameSlug: 'modern-warfare-4',
    patchName: 'MW4 Season 1 & Pre-CDL Balance Watch',
    releaseDate: '2026-11-06',
    effectiveWindow: 'Active — Awaiting Official CDL Dec 4 Lock',
    sourceUrl: 'https://www.callofduty.com',
    evidenceClass: 'official',
    summary:
      'Season 1 content drop and Ground War player-configuration tweaks ahead of the December 4, 2026 CDL kickoff. Ranked Play playlist rules remain pending official publication.',
    flaggedWeaponsOrItems: ['APEX M16 Burst Conversion', 'Ground War 32v32'],
    impactedMaps: ['Coal', 'Lotus', 'Munition', 'Reactor U92', 'Rooftops', 'Silkworm'],
    impactedRules: [
      'CDL 2027 Season Kickoff confirmed for Dec 4, 2026',
      'Ranked Play 8 Skill Divisions (Bronze–Top 250) — exact weapon/attachment restriction list still unconfirmed',
    ],
    reviewTasks: [
      {
        id: 'rt-1',
        target: 'Verify exact Ranked Play weapon & Apex Attachment restriction list',
        status: 'blocked',
        note: 'Blocked until Activision publishes official MW4 Ranked Play ruleset; Ranked-Legal badges remain disabled.',
      },
      {
        id: 'rt-2',
        target: 'Reconcile remaining 6 launch 6v6 maps (Cachette, Lithium, Mumbai, Nautical, Sentry, Transit 213)',
        status: 'draft_review',
        note: 'Enumerated in coverage matrix; awaiting gameplay-observed objective and spawn verification.',
      },
      {
        id: 'rt-3',
        target: 'Re-test M4 / VEL-46 hypothesis builds against Season 1 tuning',
        status: 'draft_review',
        note: 'Do not auto-invent replacement builds; editor must record test method and date.',
      },
    ],
  },
  {
    id: 'patch-oct27-shipment',
    slug: 'oct-27-shipment',
    gameSlug: 'modern-warfare-4',
    patchName: 'Post-Launch Playlist Update — Shipment Added',
    releaseDate: '2026-10-27',
    effectiveWindow: 'Oct 27, 2026',
    sourceUrl: 'https://www.callofduty.com',
    evidenceClass: 'official',
    summary:
      'Added Shipment to core 6v6 public playlists four days after launch. Confirmed non-competitive respawn pool; does not alter CDL S&D map rotation.',
    flaggedWeaponsOrItems: [],
    impactedMaps: ['Shipment'],
    impactedRules: ['Public 6v6 map count expanded from 12 launch maps to 13'],
    reviewTasks: [
      {
        id: 'rt-4',
        target: 'Tag Shipment as Public Respawn Only (excluded from CDL S&D pool)',
        status: 'approved',
        note: 'Verified and reconciled in MW4 Map Enumeration.',
      },
    ],
  },
];

export const PARTNER_ADAPTERS: PartnerAdapterContract[] = [
  {
    id: 'adapter-activision',
    partner: 'Activision Partner API',
    gamesCovered: 'Call of Duty: Modern Warfare 4, Warzone, COD Mobile',
    docsUrl: 'https://support.activision.com/articles/managing-your-activision-profile',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'No approved public MW4 live plugin verified; written partnership inquiry required.',
    commercialRightsStatus: 'Not Granted — Manual Official Announcements Only',
    fallbackMode: 'Manual editorial entry with source URL & retrieval timestamp',
  },
  {
    id: 'adapter-riot',
    partner: 'Riot Games Developer API',
    gamesCovered: 'League of Legends, VALORANT, Teamfight Tactics',
    docsUrl: 'https://developer.riotgames.com/docs/portal',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Requires registered product, production key, free-tier parity, and VALORANT player opt-in.',
    commercialRightsStatus: 'Pending Registration & Transformative Feature Review',
    fallbackMode: 'Static catalog entry + manual patch review',
  },
  {
    id: 'adapter-grid-lol',
    partner: 'GRID / LoL Esports Open Access',
    gamesCovered: 'League of Legends Pro Esports Series',
    docsUrl: 'https://lolesports.com/en-US/news/build-with-official-league-of-legends-esports-data',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Nov 12, 2026 Open Access feed has documented 5-minute live series delay.',
    commercialRightsStatus: 'Commercial Rights Require Separate Verification',
    fallbackMode: 'Manual tournament schedule with source attribution',
  },
  {
    id: 'adapter-steam',
    partner: 'Steam Web API',
    gamesCovered: 'CS2, Dota 2, PUBG, Apex Legends, Steam PC Catalog',
    docsUrl: 'https://store.steampowered.com/charts',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Publisher-specific telemetry varies; Steam charts are PC-only, not global rankings.',
    commercialRightsStatus: 'Storefront Metadata Discovery Only',
    fallbackMode: 'Cached snapshot with explicit PC-only caveat',
  },
  {
    id: 'adapter-faceit',
    partner: 'FACEIT Developer Portal',
    gamesCovered: 'CS2, Rainbow Six Siege, Overwatch 2',
    docsUrl: 'https://developer.faceit.com/',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Endpoint scopes, terms, and rate quotas pending verification.',
    commercialRightsStatus: 'Pending Terms Review',
    fallbackMode: 'Manual match logging',
  },
  {
    id: 'adapter-startgg',
    partner: 'start.gg Developer Docs',
    gamesCovered: 'Street Fighter 6, Tekken 8, Smash Ultimate, FGC',
    docsUrl: 'https://developer.start.gg/',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'GraphQL tournament brackets pending token & resale terms review.',
    commercialRightsStatus: 'Pending Terms Review',
    fallbackMode: 'Manual tournament calendar links',
  },
  {
    id: 'adapter-epic',
    partner: 'Epic Games Developer Services',
    gamesCovered: 'Fortnite, Rocket League',
    docsUrl: 'https://dev.epicgames.com/',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Scope, OAuth consent, and competitive data availability pending.',
    commercialRightsStatus: 'Pending Terms Review',
    fallbackMode: 'Manual editorial hub',
  },
  {
    id: 'adapter-media-social',
    partner: 'Twitch Helix · YouTube Data API · Discord OAuth',
    gamesCovered: 'VOD Timestamps, Consented Clan Alerts & Stream Embeds',
    docsUrl: 'https://discord.com/developers/docs/',
    credentialsConfigured: false,
    adapterStatus: 'disabled_pending_approval',
    delayAndRateNotes: 'Server-side secrets only; weekly summaries & patch alerts require explicit opt-in channel consent.',
    commercialRightsStatus: 'Pending App Registration & Quota Review',
    fallbackMode: 'Manual VOD link timestamps in Clan HQ',
  },
];

export const INITIAL_CORRECTION_LOG: CorrectionLogEntry[] = [
  {
    id: 'corr-1',
    submittedAt: '2026-11-27',
    targetPath: '/games/modern-warfare-4/ranked',
    category: 'Ruleset / Ranked',
    summary:
      'Quarantined legacy MW4 CDL v1.0 restrictions and disabled Ranked-Legal claims until Activision publishes official Ranked Play rules.',
    status: 'Verified & Updated',
  },
  {
    id: 'corr-2',
    submittedAt: '2026-11-27',
    targetPath: '/games/modern-warfare-4/maps/coal',
    category: 'Map Geometry',
    summary:
      'Labeled interactive S&D map boards as community-drawn schematic diagrams pending official licensed minimap geometry.',
    status: 'Verified & Updated',
  },
  {
    id: 'corr-3',
    submittedAt: '2026-11-27',
    targetPath: '/clans/rule-one',
    category: 'Other',
    summary:
      'Archived legacy simulated wagering stakes, offshore reserve balances, and paid-edge hardware upgrades to comply with non-gambling competitive standards.',
    status: 'Verified & Updated',
  },
];

export const PRICING_EXPERIMENT_TIERS = [
  {
    id: 'free',
    name: 'Free Core',
    priceLabel: '$0 / mo',
    status: 'Active (No Billing)',
    summary: 'All public game hubs, verified map guides, patch explainers, and basic player/clan profiles stay useful forever.',
    entitlements: [
      'Full public game guides & patch diffs',
      'Interactive MW4 S&D tactical map canvas',
      'Public opt-in player & clan profile card',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Player (Price Test)',
    priceLabel: '$4.99 / mo',
    status: 'Billing Disabled — Validation Only',
    summary: 'Proposed transformative analysis tier for solo competitive players; requires willingness-to-pay validation first.',
    entitlements: [
      'Unlimited saved builds with patch-diff alerts',
      'Personal VOD timestamp journal & drill library',
      'Ad-free guide reading experience',
    ],
  },
  {
    id: 'clan-pro',
    name: 'Clan Pro (Price Test)',
    priceLabel: '$14.99 / mo',
    status: 'Billing Disabled — Validation Only',
    summary: 'One invite brings the whole roster: permissioned playbooks, mutual scrim scheduling, and veto prep.',
    entitlements: [
      'Multi-role Clan HQ (Owner / Admin / Captain / Member)',
      'Shared versioned map playbooks & veto boards',
      'Consented weekly clan workflow summaries',
    ],
  },
  {
    id: 'org',
    name: 'Organization (Price Test)',
    priceLabel: '$29.99 / mo',
    status: 'Billing Disabled — Validation Only',
    summary: 'Multi-roster esports organization management across multiple titles with audit trails.',
    entitlements: [
      'Multiple squads under one organization tenant',
      'Coach & analyst read/write role scoping',
      'Exportable post-match & attendance reports',
    ],
  },
];

export const EVIDENCE_CLASSIFICATION_LEGEND: {
  id: string;
  label: string;
  tone: 'green' | 'gold' | 'amber' | 'red' | 'neutral';
  meaning: string;
}[] = [
  {
    id: 'officially_verified',
    label: 'Officially verified',
    tone: 'green',
    meaning: 'Confirmed directly from a publisher announcement, developer API response, or official ruleset URL.',
  },
  {
    id: 'community_reported',
    label: 'Community-reported',
    tone: 'gold',
    meaning: 'Observed by players or competitive analysts; queued for editorial cross-check.',
  },
  {
    id: 'rule_one_tested',
    label: 'Rule One tested',
    tone: 'green',
    meaning: 'Independently captured in controlled testing with documented method, patch, and date.',
  },
  {
    id: 'predicted',
    label: 'Predicted',
    tone: 'amber',
    meaning: 'Explainable hypothesis derived from role fit, handling, and restriction factors — not confirmed meta fact.',
  },
  {
    id: 'experimental',
    label: 'Experimental',
    tone: 'amber',
    meaning: 'Early draft configuration undergoing live testing or awaiting community feedback.',
  },
  {
    id: 'outdated',
    label: 'Outdated',
    tone: 'red',
    meaning: 'Flagged by a newer patch diff; re-verification required before competitive use.',
  },
  {
    id: 'restricted',
    label: 'Restricted',
    tone: 'red',
    meaning: 'Banned or GA-restricted under referenced competitive ruleset guidelines.',
  },
  {
    id: 'unavailable',
    label: 'Unavailable',
    tone: 'neutral',
    meaning: 'Publisher has not released official data, API authorization, or locked rules yet.',
  },
];

export interface Mw4CandidateWeaponProfile {
  id: string;
  name: string;
  weaponClass: 'Assault Rifle' | 'SMG' | 'Marksman / Burst';
  verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock';
  intendedRole: string;
  predictionFactors: {
    recoilConsistency: string;
    handlingAndMobility: string;
    effectiveRange: string;
    competitiveRestrictions: string;
    roleFit: string;
  };
  counterplayNote: string;
}

export const MW4_CANDIDATE_WEAPONS: Mw4CandidateWeaponProfile[] = [
  {
    id: 'cand-m4',
    name: 'M4',
    weaponClass: 'Assault Rifle',
    verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock',
    intendedRole: 'Flex / Main AR baseline',
    predictionFactors: {
      recoilConsistency: 'Predictable vertical kick profile expected to favor mid-range headglitches.',
      handlingAndMobility: 'Balanced ADS/strafe trade-off when paired with lightweight rear grip & stock.',
      effectiveRange: '20m–45m primary lane coverage across Coal, Lotus, and Rooftops.',
      competitiveRestrictions: 'Ranked legality unconfirmed until Activision publishes MW4 Ranked rules.',
      roleFit: 'Strong Flex AR anchor candidate; pairs conceptually with an entry SMG.',
    },
    counterplayNote: 'Pressure inside 15m with SMG slide-challs or smoke-blocked crossfires.',
  },
  {
    id: 'cand-vel46',
    name: 'VEL 46',
    weaponClass: 'SMG',
    verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock',
    intendedRole: 'Primary Entry SMG',
    predictionFactors: {
      recoilConsistency: 'High fire-rate close-quarters beam; horizontal drift widens past 25m.',
      handlingAndMobility: 'Fast sprint-to-fire and bomb-site entry speed on tight lanes.',
      effectiveRange: '0m–22m hill breaks and S&D site executes.',
      competitiveRestrictions: 'Check attachment limits and muzzle/underbarrel GA once CDL Dec 4 locks.',
      roleFit: 'Primary Entry SMG candidate for 4v4 S&D and Hardpoint hill pressure.',
    },
    counterplayNote: 'Hold long crossfires from 30m+ AR power spots and force utility burn.',
  },
  {
    id: 'cand-hyeon-burst',
    name: 'Hyeon Burst',
    weaponClass: 'Marksman / Burst',
    verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock',
    intendedRole: 'Long-Lane Anchor / Specialist Watch',
    predictionFactors: {
      recoilConsistency: 'Burst grouping heavily rewards stationary first-burst accuracy.',
      handlingAndMobility: 'Slower sprint-to-fire and close-range recovery if first burst misses.',
      effectiveRange: '30m–55m power-position lockdowns.',
      competitiveRestrictions: 'High risk of early CDL GA / Ranked restriction if 1-burst TTK is overtuned.',
      roleFit: 'Situational S&D anchor candidate pending official Ranked Play rules.',
    },
    counterplayNote: 'Shoulder-peek first burst, smoke sightline, and collapse with trade pairs.',
  },
  {
    id: 'cand-cronen-osprey',
    name: 'Cronen Osprey',
    weaponClass: 'Assault Rifle',
    verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock',
    intendedRole: 'Main AR / Heavy Lane Control',
    predictionFactors: {
      recoilConsistency: 'Stable sustained-fire pattern suited for holding Hardpoint rotations.',
      handlingAndMobility: 'Heavier base frame; requires early pre-aiming on contested hills.',
      effectiveRange: '25m–50m open-lane suppression.',
      competitiveRestrictions: 'Unverified until full 33-weapon tuning sheet & Ranked bans publish.',
      roleFit: 'Candidate anchor AR for wide maps such as Reactor U92 and Lithium.',
    },
    counterplayNote: 'Pinch from flank timing windows before anchor establishes headglitch.',
  },
  {
    id: 'cand-iso-nightshade',
    name: 'ISO Nightshade',
    weaponClass: 'SMG',
    verificationStatus: 'Unverified Candidate — Verify against official MW4 weapon list & CDL lock',
    intendedRole: 'Stealth / Route SMG Watch',
    predictionFactors: {
      recoilConsistency: 'Controllable close-to-mid burst profile for flank routes.',
      handlingAndMobility: 'Agile ADS strafe speed suited for S&D mid-round lurks.',
      effectiveRange: '8m–26m hybrid SMG engagement envelope.',
      competitiveRestrictions: 'Integral suppressor or specialty barrel variants often face CDL review.',
      roleFit: 'Secondary SMG / route-runner candidate subject to official CDL ruleset.',
    },
    counterplayNote: 'Maintain 4v4 trade spacing and place Trophy / info watches on flank doors.',
  },
];

export const MW4_SUPPORTING_MAP_SOURCES = [
  {
    label: 'Official CDL Competitive Settings',
    url: 'https://callofdutyleague.com/en-us/competitive-settings',
    status: 'Primary Official Reference (Revalidate before Dec 4 lock)',
  },
  {
    label: 'Call of Duty Official Blog',
    url: 'https://www.callofduty.com/blog',
    status: 'Official Publisher Announcements & Patch Notes',
  },
  {
    label: 'Breaking Point Competitive Coverage',
    url: 'https://www.breakingpoint.gg/',
    status: 'Supporting Community / Esports Reference',
  },
  {
    label: 'MOBA Aura MW4 Map Reference',
    url: 'https://mobaaura.com/mw4/maps',
    status: 'Supporting Reference — Revalidate against official CDL rules',
  },
];

export interface StrategyTemplateItem {
  id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  mapId?: 'coal' | 'lotus' | 'munition' | 'reactor_u92' | 'rooftops' | 'silkworm';
  mapName: string;
  mode: 'Hardpoint' | 'Search & Destroy' | 'Hijack' | 'Map Veto Prep' | 'Tactical 5v5';
  category:
    | 'Hardpoint Opening Setup'
    | 'Hardpoint Rotation'
    | 'Objective Retake'
    | 'S&D Offensive Plan'
    | 'S&D Defensive Plan'
    | 'Mid-Round Adjustment'
    | 'Map Veto Preparation';
  seasonLabel: string;
  evidenceClass: 'Rule One tested' | 'Predicted' | 'Community-reported';
  summary: string;
  roleAssignments: string[];
  timingCheckpoints: string[];
  counterplayTips: string;
}

export const STRATEGY_TEMPLATES: StrategyTemplateItem[] = [
  {
    id: 'strat-coal-snd-offense',
    title: 'Coal S&D — Mid-Split A Pinch (1:45 Clock)',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'coal',
    mapName: 'Coal',
    mode: 'Search & Destroy',
    category: 'S&D Offensive Plan',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Predicted',
    summary:
      'Training template: smoke Mid Catwalk at 1:30 to deny main AR sightlines while pairing 2 SMG entries on A-Lane with a mid pinch.',
    roleAssignments: [
      'P1 Main AR: Hold long spawn-to-mid cross and call early defender crosses.',
      'P2 Flex AR: Throw single GA-compliant smoke on Catwalk and pinch A Connector.',
      'P3 Entry SMG: First contact A-Lane with Stun check.',
      'P4 Route SMG: Immediate trade spacing behind P3, carry bomb for safe plant.',
    ],
    timingCheckpoints: [
      '1:45 — Default spread to gather sound cues without dry-peeking sniper/AR lanes.',
      '1:25 — Deploy smoke and pinch A Site simultaneously from Connector & Lane.',
      '0:55 — Establish 3-man crossfire post-plant with Trophy System on bomb.',
    ],
    counterplayTips: 'If defenders stack A early with Trophy, abort at 1:15 and rotate silently to B.',
  },
  {
    id: 'strat-lotus-snd-defense',
    title: 'Lotus S&D — 2-1-1 Info Defense & Fast Retake',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'lotus',
    mapName: 'Lotus',
    mode: 'Search & Destroy',
    category: 'S&D Defensive Plan',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Predicted',
    summary:
      'Training template: prioritize live info over ego-challenging opening lanes; stay alive until attackers commit utility.',
    roleAssignments: [
      'P1 Main AR: Anchor B Sightline from headglitch with fast mid-call visibility.',
      'P2 Flex AR: Shoulder-peek Mid Courtyard for info without committing.',
      'P3 Entry SMG: Play close A-Site corner for trade bait-and-switch.',
      'P4 Route SMG: Float between A Back and Mid to double-swing whichever site gets hit.',
    ],
    timingCheckpoints: [
      '1:40 — Shoulder-peek lanes for utility count; zero isolated 1v1 duels.',
      '1:10 — Collapse 3-deep onto committed bomb site with coordinated stun + nade.',
      '0:35 — Pair defuse stick with crossfire cover from opposite angle.',
    ],
    counterplayTips: 'Watch for lurk timings cutting off Mid rotation when attackers fake A.',
  },
  {
    id: 'strat-munition-hp-opening',
    title: 'Munition Hardpoint — P1 Break & Early P2 Anchor',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'munition',
    mapName: 'Munition',
    mode: 'Hardpoint',
    category: 'Hardpoint Opening Setup',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Predicted',
    summary:
      'Training template: contest opening hill for 30 seconds while sending Main AR early at 0:25 remaining to lock P2 spawn anchor.',
    roleAssignments: [
      'P1 Main AR: Contest initial cut, then rotate at 0:25 to claim P2 back spawn.',
      'P2 Flex AR: Cut off opposing Mid flood lanes so SMGs can soak hill time.',
      'P3 Entry SMG: First slide into hill with Trophy placement.',
      'P4 Obj SMG: Soak scrap time until 0:10, then pinch P2 from old hill side.',
    ],
    timingCheckpoints: [
      '0:60–0:30 — Trade even on P1; burn opponent Trophy Systems.',
      '0:25 — Main AR secures P2 power position and flips spawn anchor.',
      '0:10 — Full 3-player collapse on new hill with 1 scrap-time player pinching.',
    ],
    counterplayTips: 'If spawns flip unfavorably at 0:20, group as 4 and break together instead of trickling.',
  },
  {
    id: 'strat-rooftops-hp-rotation',
    title: 'Rooftops Hardpoint — Mid-Map Lane Lock Rotation',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'rooftops',
    mapName: 'Rooftops',
    mode: 'Hardpoint',
    category: 'Hardpoint Rotation',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Community-reported',
    summary:
      'Training template: hold elevated mid-lane sightlines during hill transitions to stagger opponent wave spawns.',
    roleAssignments: [
      'P1 Main AR: Hold roof elevation watching cross-map rotation lanes.',
      'P2 Flex AR: Mirror enemy anchor side and call spawn flips early.',
      'P3 & P4 SMGs: Rotate in pair through interior corridors to trade cleanly.',
    ],
    timingCheckpoints: [
      '0:22 — Call spawn status and rotate Flex + Anchor together.',
      '0:08 — Drop Trophy on new hill entrance before first opposing push.',
    ],
    counterplayTips: 'Avoid over-extending past mid-line; one rogue player can accidentally flip good spawns.',
  },
  {
    id: 'strat-reactor-retake',
    title: 'Reactor U92 — Coordinated 3v3 Objective Retake',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'reactor_u92',
    mapName: 'Reactor U92',
    mode: 'Search & Destroy',
    category: 'Objective Retake',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Predicted',
    summary:
      'Training template: synchronize utility and dual-door entry timing on post-plant retakes instead of staggered 1v1 peeks.',
    roleAssignments: [
      'P1 AR: Pin primary post-plant headglitch from outer lane.',
      'P2 Flex: Clear Trophy with tactical, follow with Frag on plant box.',
      'P3 & P4 SMGs: Double-swing inner choke on 3-2-1 countdown.',
    ],
    timingCheckpoints: [
      '0:32 — Regroup outside choke; verify remaining stuns/nades.',
      '0:22 — Throw utility and hit site simultaneously from 2 angles.',
    ],
    counterplayTips: 'Fake defuse tap only after clearing immediate close-angle trade position.',
  },
  {
    id: 'strat-silkworm-midround',
    title: 'Silkworm S&D — Mid-Round Conditioning & Fake',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapId: 'silkworm',
    mapName: 'Silkworm',
    mode: 'Search & Destroy',
    category: 'Mid-Round Adjustment',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Predicted',
    summary:
      'Training template: after two fast A executes, condition defenders with early A presence while shifting bomb carrier through Mid to B.',
    roleAssignments: [
      'P1 & P2: Sell A-Lane noise with one tactical and shoulder peeks.',
      'P3 & P4: Walk bomb silently across Mid into B Site on 0:55 mark.',
    ],
    timingCheckpoints: [
      '1:30 — Show presence on A without taking lethal engagements.',
      '0:55 — Execute B once enemy flex rotates toward A.',
    ],
    counterplayTips: 'Keep one player watching flank pinch so defenders cannot collapse behind the fake.',
  },
  {
    id: 'strat-cdl-veto-prep',
    title: 'Bo5 Series — Map Veto & Auto-Ban Framework',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    mapName: 'All 8 Candidate CDL Maps',
    mode: 'Map Veto Prep',
    category: 'Map Veto Preparation',
    seasonLabel: 'Season 1 Candidate',
    evidenceClass: 'Rule One tested',
    summary:
      'Training template: structure pre-scrim and tournament map vetoes around your squad’s verified comfort maps rather than opponent reputation.',
    roleAssignments: [
      'IGL / Captain: Track squad scrim win-loss log per map & mode in Clan HQ.',
      'Coach / Analyst: Identify opponent auto-veto before series coin flip.',
    ],
    timingCheckpoints: [
      'Pre-Match — Lock 1 Hardpoint auto-veto and 1 S&D auto-veto before lobby opens.',
      'Post-Series — Log actual map outcomes in Clan HQ (no guessed win rates).',
    ],
    counterplayTips: 'Revalidate entire map pool against official CDL Competitive Settings before Dec 4 lock.',
  },
  {
    id: 'strat-cs2-default',
    title: 'Counter-Strike 2 — MR12 Default Map Control & Mid-Round Call',
    gameSlug: 'counter-strike-2',
    gameName: 'Counter-Strike 2',
    mapName: 'Active Duty Pool',
    mode: 'Tactical 5v5',
    category: 'Mid-Round Adjustment',
    seasonLabel: '2026 Active Duty',
    evidenceClass: 'Community-reported',
    summary:
      'Training template: 1-3-1 early spread to force CT utility usage and identify site stacks before calling final 0:40 execute.',
    roleAssignments: [
      'Extremity Lurks (2): Hold anti-push timing and deny flank info.',
      'Mid Pack (3): Trade utility for Mid control and prepare split.',
    ],
    timingCheckpoints: [
      '1:45–1:10 — Take space and bait CT smokes/molotovs.',
      '0:45 — Commit 4-man execute onto weakest site with lurk cutting rotations.',
    ],
    counterplayTips: 'Adapt tempo against aggressive CT eco rushes by pairing flash + trade rifles early.',
  },
];

export interface VerifiedNewsItem {
  id: string;
  title: string;
  gameSlug: string;
  gameName: string;
  category: 'Patch Update' | 'Esports Circuit' | 'Developer API' | 'Ruleset Watch';
  publishedDate: string;
  verifiedDate: string;
  evidenceClass: 'Officially verified' | 'Community-reported';
  summary: string;
  takeaways: string[];
  sourceLabel: string;
  sourceUrl: string;
}

export const VERIFIED_NEWS_ITEMS: VerifiedNewsItem[] = [
  {
    id: 'news-mw4-s1-cdl',
    title: 'Call of Duty: Modern Warfare 4 Season 1 & CDL 2027 Dec 4 Kickoff Watch',
    gameSlug: 'modern-warfare-4',
    gameName: 'Call of Duty: Modern Warfare 4',
    category: 'Ruleset Watch',
    publishedDate: '2026-11-06',
    verifiedDate: '2026-11-27',
    evidenceClass: 'Officially verified',
    summary:
      'MW4 launched Oct 23, 2026 across PS5, Xbox Series X|S, PC, and Switch 2 with 12 launch 6v6 maps (plus Shipment Oct 27). CDL 2027 Kickoff is scheduled for December 4, 2026; official Ranked Play weapon & attachment restriction locks remain pending.',
    takeaways: [
      'All 8 candidate CDL maps (Coal, Lithium, Lotus, Munition, Reactor U92, Rooftops, Sentry, Silkworm) are flagged for revalidation before Dec 4.',
      'Ranked-Legal badges remain intentionally disabled in Rule One Meta Lab until official rules publish.',
    ],
    sourceLabel: 'callofduty.com / callofdutyleague.com',
    sourceUrl: 'https://callofdutyleague.com/en-us/competitive-settings',
  },
  {
    id: 'news-lol-open-access',
    title: 'Riot Games & LoL Esports Announce Open Access Pro Esports Data Feed',
    gameSlug: 'league-of-legends',
    gameName: 'League of Legends',
    category: 'Developer API',
    publishedDate: '2026-11-12',
    verifiedDate: '2026-11-27',
    evidenceClass: 'Officially verified',
    summary:
      'LoL Esports announced expanded developer access to official esports series telemetry with a documented 5-minute live delay.',
    takeaways: [
      'Rule One documents the 5-minute delay transparently and keeps the partner adapter disabled until commercial redistribution approval is verified.',
      'Riot Data Dragon public patch & champion metadata can already be tested live in Player Statistics -> Developer Connect.',
    ],
    sourceLabel: 'lolesports.com',
    sourceUrl: 'https://lolesports.com/en-US/news/build-with-official-league-of-legends-esports-data',
  },
  {
    id: 'news-cs2-active-duty',
    title: 'Counter-Strike 2 Valve Regional Standings (VRS) & Active Duty Format',
    gameSlug: 'counter-strike-2',
    gameName: 'Counter-Strike 2',
    category: 'Esports Circuit',
    publishedDate: '2026-10-15',
    verifiedDate: '2026-11-27',
    evidenceClass: 'Officially verified',
    summary:
      'Valve continues running Major qualification through Valve Regional Standings (VRS) under MR12 competitive rules.',
    takeaways: [
      'Steam Charts data is treated strictly as a PC-only activity signal, never as a cross-platform global ranking.',
    ],
    sourceLabel: 'counter-strike.net',
    sourceUrl: 'https://www.counter-strike.net/',
  },
  {
    id: 'news-vct-season',
    title: 'VALORANT Champions Tour International Leagues & Opt-In API Policy',
    gameSlug: 'valorant',
    gameName: 'VALORANT',
    category: 'Developer API',
    publishedDate: '2026-10-20',
    verifiedDate: '2026-11-27',
    evidenceClass: 'Officially verified',
    summary:
      'Riot Developer Portal enforces strict production key registration, free-tier parity, and explicit Riot Sign-On (RSO) player opt-in for VALORANT match history.',
    takeaways: [
      'Rule One refuses unofficial match scraping and waits for approved Riot production API credentials.',
    ],
    sourceLabel: 'developer.riotgames.com',
    sourceUrl: 'https://developer.riotgames.com/docs/portal',
  },
];

export type EquipmentCategory =
  | 'Monitors'
  | 'Controllers'
  | 'Keyboards'
  | 'Mice'
  | 'Headsets'
  | 'Capture & Streaming'
  | 'Networking';

export interface EquipmentGuideItem {
  id: string;
  category: EquipmentCategory;
  name: string;
  targetUseCase: string;
  supportedGames: string[];
  platforms: ('PC' | 'Console' | 'Both')[];
  budgetTier: 'Entry' | 'Competitive Mid' | 'Tournament Spec';
  keySelectionCriteria: string[];
  affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance';
}

export const EQUIPMENT_GUIDE_ITEMS: EquipmentGuideItem[] = [
  {
    id: 'eq-monitor-240',
    category: 'Monitors',
    name: '24–25" 240Hz+ Low-Motion-Blur Competitive Display Class',
    targetUseCase: 'Fast target tracking in MW4, CS2, and VALORANT without excessive peripheral eye travel.',
    supportedGames: ['modern-warfare-4', 'counter-strike-2', 'valorant'],
    platforms: ['PC', 'Console'],
    budgetTier: 'Competitive Mid',
    keySelectionCriteria: [
      'True 120Hz HDMI 2.1 support if playing PS5 / Xbox Series X|S.',
      'Verified response time overdrive without inverse ghosting.',
      'Ergonomic height/tilt stand for consistent eye-level posture.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-controller-paddles',
    category: 'Controllers',
    name: 'Low-Latency Tournament Controller with Rear Paddles & Trigger Stops',
    targetUseCase: 'Jump-shotting, slide-canceling, and maintaining thumbstick aim during MW4 gunfights.',
    supportedGames: ['modern-warfare-4', 'apex-legends', 'rocket-league'],
    platforms: ['Both'],
    budgetTier: 'Competitive Mid',
    keySelectionCriteria: [
      'Remappable rear paddles (no illegal macros or rapid-fire scripts).',
      'Wired USB-C tournament mode to eliminate wireless polling jitter.',
      'Hall-effect or replaceable thumbstick modules to reduce stick drift.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-mouse-lightweight',
    category: 'Mice',
    name: 'Sub-65g Optical Sensor Esports Mouse Class',
    targetUseCase: 'Consistent micro-adjustments and low-sensitivity flicks in CS2 and VALORANT.',
    supportedGames: ['counter-strike-2', 'valorant', 'overwatch-2'],
    platforms: ['PC'],
    budgetTier: 'Competitive Mid',
    keySelectionCriteria: [
      'Shape matched to palm, claw, or fingertip grip before chasing spec numbers.',
      'Stable 1000Hz+ wired or 2.4GHz wireless polling without sensor spin-out.',
      'PTFE skates paired with a consistent control or balanced cloth pad.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-keyboard-rapid',
    category: 'Keyboards',
    name: 'Compact TKL / 65% Mechanical or Magnetic-Switch Keyboard Class',
    targetUseCase: 'Extra desk clearance for mouse movement and crisp counter-strafing responsiveness.',
    supportedGames: ['counter-strike-2', 'valorant', 'league-of-legends'],
    platforms: ['PC'],
    budgetTier: 'Tournament Spec',
    keySelectionCriteria: [
      'Confirm tournament legality of SOCD/rapid-trigger firmware (Valve restricts Snap Tap in CS2).',
      'Compact layout frees horizontal mousepad space for low eDPI players.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-headset-imaging',
    category: 'Headsets',
    name: 'Stereo Positional Audio Headset / Studio IEMs + Boom Mic',
    targetUseCase: 'Accurate footstep directionality and clear 4v4 S&D callouts without muddy bass bloat.',
    supportedGames: ['modern-warfare-4', 'counter-strike-2', 'valorant', 'rainbow-six-siege'],
    platforms: ['Both'],
    budgetTier: 'Entry',
    keySelectionCriteria: [
      'Clean stereo imaging outperforms artificial virtual 7.1 surround in most competitive FPS engines.',
      'Noise-rejecting cardioid mic for clean Discord / voice comms.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-capture-passthrough',
    category: 'Capture & Streaming',
    name: 'Zero-Lag HDMI 2.1 Passthrough Capture Interface Class',
    targetUseCase: 'Recording console/PC VODs for Clan HQ timestamp reviews without adding display delay.',
    supportedGames: ['modern-warfare-4', 'valorant', 'counter-strike-2'],
    platforms: ['Both'],
    budgetTier: 'Tournament Spec',
    keySelectionCriteria: [
      '1080p60/1440p120 passthrough with VRR support for console gameplay capture.',
      'Reliable local MP4/MKV VOD recording for match review.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
  {
    id: 'eq-network-ethernet',
    category: 'Networking',
    name: 'Wired Cat6 Ethernet + SQM Bufferbloat-Managed Router Class',
    targetUseCase: 'Eliminating Wi-Fi packet loss and jitter spikes during ranked matches and scrims.',
    supportedGames: ['modern-warfare-4', 'counter-strike-2', 'valorant', 'chess-com'],
    platforms: ['Both'],
    budgetTier: 'Entry',
    keySelectionCriteria: [
      'Direct wired Ethernet to PC/console delivers the highest ROI stability upgrade.',
      'Enable SQM / QoS traffic shaping if household uploads share the same connection.',
    ],
    affiliateStatus: 'Affiliate Link Disabled — Pending Program Acceptance',
  },
];

