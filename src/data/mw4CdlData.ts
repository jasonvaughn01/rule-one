import {
  CdlRuleItem,
  CdlScheduleEvent,
  CdlTeam,
  ClubState,
  Mw4LoadoutPreset,
  Mw4MapId,
  RigUpgrade,
  TacticalStance,
} from '../types';

export const HERO_PENTHOUSE_IMAGE =
  '/src/assets/images/hero_penthouse_lounge_1795753021249.jpg';

export const VAULT_CONTROLLER_IMAGE =
  '/src/assets/images/vault_bespoke_controller_1795753020898.jpg';

export const MW4_RELEASE_FACTS = [
  {
    label: 'Global Launch',
    value: 'Oct 23, 2026',
    detail: 'Infinity Ward · IW 9.0 Engine · PS5, Xbox Series X/S, PC & Switch 2',
  },
  {
    label: 'Season 1 Live',
    value: 'Nov 6, 2026',
    detail: '12 launch 6v6 maps + Shipment (Oct 27) · 33 core weapons',
  },
  {
    label: 'CDL Ruleset',
    value: 'Settings v1.0',
    detail: '3 Modes: Hardpoint, Search & Destroy (6 maps), Hijack',
  },
  {
    label: 'CDL Kickoff Classic',
    value: 'Dec 4–13, 2026',
    detail: 'Opening Online Pro-Am featuring 12 CDL teams + top NA Challengers',
  },
];

export const CDL_2027_SCHEDULE: CdlScheduleEvent[] = [
  {
    id: 'ev-launch',
    event: 'Modern Warfare 4 Global Launch',
    dates: 'Oct 23, 2026',
    location: 'Worldwide (Current-Gen & Switch 2)',
    format: 'Campaign (Oct 16 EA) · DMZ (Oct 20 EA) · Core 6v6',
    status: 'Completed',
  },
  {
    id: 'ev-s1',
    event: 'MW4 Season 1 & CDL Settings v1.0',
    dates: 'Nov 6, 2026',
    location: 'Official CDL Competitive Playlist',
    format: '6-Map S&D Pool · APEX & Laser Bans Enacted',
    status: 'Completed',
  },
  {
    id: 'ev-kickoff',
    event: 'CDL 2027 Kickoff Classic',
    dates: 'Dec 4–13, 2026',
    location: 'Online Pro-Am',
    format: '12 CDL Franchises + NA Challengers Cups #1–#2',
    status: 'Upcoming',
  },
  {
    id: 'ev-m1',
    event: 'Minor 1 & Major I (Europe)',
    dates: 'Jan 8 – Feb 14, 2027',
    location: 'Europe LAN (City TBA)',
    format: 'Online Qualifiers (Jan 15–Feb 7) → Major I LAN',
    status: 'Upcoming',
  },
  {
    id: 'ev-m2',
    event: 'Major II — DreamHack Birmingham',
    dates: 'Apr 2–4, 2027',
    location: 'Birmingham, United Kingdom',
    format: 'LAN Pro-Am Bracket featuring Challengers Teams',
    status: 'Upcoming',
  },
  {
    id: 'ev-m3',
    event: 'Major III — Toronto KOI',
    dates: 'May 20–23, 2027',
    location: 'Toronto, Canada',
    format: 'Hosted by Toronto KOI · 12-Team Double Elimination',
    status: 'Upcoming',
  },
  {
    id: 'ev-m4',
    event: 'Major IV — U.S. West Coast',
    dates: 'Jun 18–20, 2027',
    location: 'U.S. West Coast (City TBA)',
    format: 'Final Major Qualifiers for Champs Seeding',
    status: 'Upcoming',
  },
  {
    id: 'ev-champs',
    event: 'CDL 2027 Championship Weekend',
    dates: 'Jul 8–11, 2027',
    location: 'Texas (Hosted by OpTic Texas)',
    format: 'World Championship · Modern Warfare 4 Title Decider',
    status: 'Championship',
  },
];

export const CDL_V1_RULESET: CdlRuleItem[] = [
  {
    id: 'r-han86',
    name: 'HAN 86 (Assault Rifle)',
    category: 'Weapons',
    status: 'Meta Legal',
    detail: 'Premier MW4 Main AR & Flex rifle for long-lane S&D cross-map anchors.',
  },
  {
    id: 'r-m4',
    name: 'M4 (Assault Rifle — Base Frame)',
    category: 'Weapons',
    status: 'Meta Legal',
    detail: 'Versatile hybrid AR on Coal and Munition. Base frame legal; APEX M16 burst banned.',
  },
  {
    id: 'r-vel46',
    name: 'VEL-46 (Submachine Gun)',
    category: 'Weapons',
    status: 'Meta Legal',
    detail: 'High-mobility entry SMG favored for fast bombsite hits on Silkworm and Lotus.',
  },
  {
    id: 'r-iso',
    name: 'ISO Nightshade (Submachine Gun)',
    category: 'Weapons',
    status: 'Meta Legal',
    detail: 'Precision close-quarters SMG dominating Reactor U92 core and Munition Depot.',
  },
  {
    id: 'r-sang9',
    name: 'Sang 9mm (Sidearm)',
    category: 'Weapons',
    status: 'Meta Legal',
    detail: 'Standard CDL v1.0 competitive secondary pistol for rapid mid-fight swaps.',
  },
  {
    id: 'r-snipers',
    name: 'Astaroth .57 & Signal 50',
    category: 'Weapons',
    status: 'Banned (CDL v1.0)',
    detail: 'Explicitly restricted sniper rifles in CDL Competitive Settings v1.0.',
  },
  {
    id: 'r-classes',
    name: 'All LMGs, Marksman Rifles, Shotguns & Launchers',
    category: 'Weapons',
    status: 'Banned (CDL v1.0)',
    detail: 'Full weapon category ban across Hardpoint, Hijack, and Search & Destroy.',
  },
  {
    id: 'r-apex',
    name: 'All APEX Attachments',
    category: 'Attachments',
    status: 'Banned (CDL v1.0)',
    detail: 'All MW4 weapon-conversion APEX kits (e.g., M4-to-M16 burst kit) are barred.',
  },
  {
    id: 'r-lasers',
    name: 'All Lasers & Akimbo Rear Grips',
    category: 'Attachments',
    status: 'Banned (CDL v1.0)',
    detail: 'Every laser sight and dual-wield grip restricted for competitive integrity.',
  },
  {
    id: 'r-optics',
    name: 'Bruen THRM-60 & Schlager Night View Pro',
    category: 'Attachments',
    status: 'Banned (CDL v1.0)',
    detail: 'Thermal and night-vision optics prohibited to protect S&D smoke discipline.',
  },
  {
    id: 'r-equip-legal',
    name: 'Stun Grenade, Smoke Grenade, Frag & Semtex',
    category: 'Equipment',
    status: 'Meta Legal',
    detail: 'Core S&D utility kit (1 Smoke per squad under standard pro GA).',
  },
  {
    id: 'r-equip-ban',
    name: 'Flash, Snapshot, Drill Charge, C4, Throwing Knife & Mines',
    category: 'Equipment',
    status: 'Banned (CDL v1.0)',
    detail: 'All proxy explosives, wall-piercing charges, and wall-hack snapshots banned.',
  },
  {
    id: 'r-fu-legal',
    name: 'Trophy System & Dead Silence',
    category: 'Field Upgrades',
    status: 'Meta Legal',
    detail: 'Mandatory S&D anchors for blocking pre-nades and silent bombsite pinches.',
  },
  {
    id: 'r-fu-ban',
    name: 'Portable Radar, Riot Shield & DDOS',
    category: 'Field Upgrades',
    status: 'Banned (CDL v1.0)',
    detail: 'Prohibited intel and stall field upgrades under CDL Settings v1.0.',
  },
];

export const CDL_2027_TEAMS: CdlTeam[] = [
  {
    id: 'faze-vegas',
    name: 'FaZe Vegas',
    shortTag: 'FAZE',
    city: 'Las Vegas',
    roster: ['Simp', 'HyDra', 'Scrap', 'Alluka'],
    sndWinRate: 78.4,
    rating: 97,
    payoutMultiplier: 2.25,
    minStake: 100000,
    scrimRetainer: 55000,
    signatureMap: 'coal',
    playstyle: 'Relentless mid-map pressure with HyDra & Simp ISO Nightshade duo pinch.',
    avatarUrl: '/src/assets/images/pro_devon_brooks_cod_1795753212778.jpg',
  },
  {
    id: 'optic-texas',
    name: 'OpTic Texas',
    shortTag: 'OPTIC',
    city: 'Dallas / Texas',
    roster: ['Shotzzy', 'Dashy', 'Huke', 'Mercules'],
    sndWinRate: 76.2,
    rating: 96,
    payoutMultiplier: 2.15,
    minStake: 100000,
    scrimRetainer: 50000,
    signatureMap: 'silkworm',
    playstyle: 'Shotzzy Subway timings paired with Dashy HAN 86 cross-lane lockdown.',
    avatarUrl: '/src/assets/images/pro_marcus_vance_1795753021562.jpg',
  },
  {
    id: 'la-thieves',
    name: 'Los Angeles Thieves',
    shortTag: 'LAT',
    city: 'Los Angeles',
    roster: ['aBeZy', 'Envoy', 'Ghosty', 'Octane'],
    sndWinRate: 74.8,
    rating: 95,
    payoutMultiplier: 2.1,
    minStake: 100000,
    scrimRetainer: 48000,
    signatureMap: 'reactor_u92',
    playstyle: 'First-blood VEL-46 entries from aBeZy with surgical Ghosty mid-round calls.',
    avatarUrl: '/src/assets/images/pro_lucas_silva_1795753022087.jpg',
  },
  {
    id: 'paris-gentle-mates',
    name: 'Paris Gentle Mates',
    shortTag: 'M8',
    city: 'Paris',
    roster: ['Drazah', 'Abuzah', '04', 'JoeDeceives'],
    sndWinRate: 72.5,
    rating: 94,
    payoutMultiplier: 2.05,
    minStake: 50000,
    scrimRetainer: 42000,
    signatureMap: 'rooftops',
    playstyle: 'Hyper-disciplined Generator Box headglitches and fast Bar retakes.',
    avatarUrl: '/src/assets/images/pro_henrik_lind_1795753020824.jpg',
  },
  {
    id: 'riyadh-falcons',
    name: 'Riyadh Falcons',
    shortTag: 'FLCN',
    city: 'Riyadh',
    roster: ['Cellium', 'Sib', 'KiSMET', 'Kremp'],
    sndWinRate: 73.1,
    rating: 94,
    payoutMultiplier: 2.05,
    minStake: 100000,
    scrimRetainer: 45000,
    signatureMap: 'lotus',
    playstyle: 'Cellium iron-anchor Courtyard holds and KiSMET smoke-covered bomb plants.',
  },
  {
    id: 'toronto-koi',
    name: 'Toronto KOI',
    shortTag: 'KOI',
    city: 'Toronto',
    roster: ['CleanX', 'RenKoR', 'Kips', 'Ethan'],
    sndWinRate: 70.9,
    rating: 93,
    payoutMultiplier: 2.0,
    minStake: 50000,
    scrimRetainer: 38000,
    signatureMap: 'munition',
    playstyle: 'Structured European S&D fundamentals and synchronized Depot trades.',
    avatarUrl: '/src/assets/images/pro_elena_rostova_1795753021442.jpg',
  },
  {
    id: 'cloud9-ny',
    name: 'Cloud9 New York',
    shortTag: 'C9NY',
    city: 'New York',
    roster: ['Pred', 'Insight', 'Cammy', 'Accuracy'],
    sndWinRate: 69.4,
    rating: 92,
    payoutMultiplier: 1.95,
    minStake: 50000,
    scrimRetainer: 35000,
    signatureMap: 'coal',
    playstyle: 'Slow default information play anchored by Insight and late Pred flanks.',
  },
  {
    id: 'm80-boston',
    name: 'M80 Boston',
    shortTag: 'M80',
    city: 'Boston',
    roster: ['Estreal', 'Nastie', 'Neptune', 'Nium'],
    sndWinRate: 68.0,
    rating: 91,
    payoutMultiplier: 1.9,
    minStake: 50000,
    scrimRetainer: 32000,
    signatureMap: 'munition',
    playstyle: 'New 2027 expansion franchise running high-tempo SMG splits on Munition.',
  },
  {
    id: 'g2-minnesota',
    name: 'G2 Minnesota',
    shortTag: 'G2MN',
    city: 'Minneapolis',
    roster: ['TJHaLy', 'Spart', 'Prolute', 'Abe'],
    sndWinRate: 67.2,
    rating: 91,
    payoutMultiplier: 1.9,
    minStake: 50000,
    scrimRetainer: 30000,
    signatureMap: 'rooftops',
    playstyle: 'Veteran S&D island routes and deceptive fake-plant calls.',
  },
  {
    id: 'miami-heretics',
    name: 'Miami Heretics',
    shortTag: 'MIA',
    city: 'Miami',
    roster: ['ReeaL', 'MettalZ', 'Lucky', 'SupeR'],
    sndWinRate: 68.6,
    rating: 91,
    payoutMultiplier: 1.92,
    minStake: 50000,
    scrimRetainer: 32000,
    signatureMap: 'silkworm',
    playstyle: 'Aggressive four-man hit timings through Gaming Den and Convenience Store.',
  },
  {
    id: 'carolina-ravens',
    name: 'Carolina Royal Ravens',
    shortTag: 'CAR',
    city: 'Charlotte',
    roster: ['Skyz', 'Owakening', 'Renegade', 'Nejra'],
    sndWinRate: 66.5,
    rating: 90,
    payoutMultiplier: 1.88,
    minStake: 50000,
    scrimRetainer: 30000,
    signatureMap: 'reactor_u92',
    playstyle: 'Heavy HAN 86 crossfire holds on Reactor U92 Upper Control.',
  },
  {
    id: 'vancouver-surge',
    name: 'Vancouver Surge',
    shortTag: 'VAN',
    city: 'Vancouver',
    roster: ['Mamba', 'Nemensions', 'Vik', 'Wevy'],
    sndWinRate: 65.4,
    rating: 89,
    payoutMultiplier: 1.85,
    minStake: 50000,
    scrimRetainer: 28000,
    signatureMap: 'lotus',
    playstyle: 'Fast Challengers-born aggression looking for early Courtyard first-bloods.',
  },
];

export const MW4_LOADOUT_PRESETS: Mw4LoadoutPreset[] = [
  {
    id: 'mw4-han86-anchor',
    name: 'HAN 86 Main AR Anchor',
    role: 'Main AR · Long Lanes & Post-Plant',
    primary: 'HAN 86 (Recoil Comp · Heavy Barrel · No Laser · No APEX)',
    secondary: 'Sang 9mm (Fast Draw Grip)',
    tactical: 'Stun Grenade',
    lethal: 'Frag Grenade',
    fieldUpgrade: 'Trophy System',
    tuning: '6-6 Dynamic · 0.02 Deadzone · Tactical Flipped',
    cdlLegal: true,
    edgeBonus: 1.8,
  },
  {
    id: 'mw4-iso-entry',
    name: 'ISO Nightshade Entry SMG',
    role: 'Entry Slayer · Bombsite Breacher',
    primary: 'ISO Nightshade (ADS Stock · Speed Mag · No Laser)',
    secondary: 'Sang 9mm',
    tactical: 'Smoke Grenade (1/Squad GA)',
    lethal: 'Semtex',
    fieldUpgrade: 'Dead Silence',
    tuning: '7-7 Dynamic · 0.01 Deadzone · Back Paddles',
    cdlLegal: true,
    edgeBonus: 2.0,
  },
  {
    id: 'mw4-vel46-roam',
    name: 'VEL-46 Silent Flank / IGL',
    role: 'Roamer · Subway & Outer Lab Timings',
    primary: 'VEL-46 (Strafe Barrel · Mobility Rear Grip · Iron Sights)',
    secondary: 'Sang 9mm',
    tactical: 'Stun Grenade',
    lethal: 'Semtex',
    fieldUpgrade: 'Dead Silence',
    tuning: '6-6 Linear · 0.02 Deadzone · Hair-Trigger ADS',
    cdlLegal: true,
    edgeBonus: 1.9,
  },
  {
    id: 'mw4-m4-flex',
    name: 'M4 Base Flex Hybrid',
    role: 'Flex AR · Mid-Map Connector Trade',
    primary: 'M4 Base Frame (CDL Legal · APEX Burst Removed)',
    secondary: 'Sang 9mm',
    tactical: 'Stun Grenade',
    lethal: 'Frag Grenade',
    fieldUpgrade: 'Trophy System',
    tuning: '6-6 Dynamic · 0.03 Deadzone · Veteran COD4 Stick Curve',
    cdlLegal: true,
    edgeBonus: 1.7,
  },
];

export const RIG_UPGRADES: RigUpgrade[] = [
  {
    id: 'rig-controller',
    name: 'Bespoke Carbon-Gold MW4 Pro Controller',
    category: 'Input Hardware',
    price: 85000,
    edgeBonus: 1.8,
    specSummary: '0.2ms optical triggers · Hall-effect sticks · 4 brass paddles',
    description:
      'Machined carbon-fiber shell with zero-deadzone aim tuning engineered for HAN 86 long-lane centering and VEL-46 slide-cancel entries.',
  },
  {
    id: 'rig-fiber',
    name: 'Dedicated Dark Fiber CDL Server Route',
    category: 'Network Infrastructure',
    price: 320000,
    edgeBonus: 3.2,
    specSummary: '2ms direct peer routing · Zero MW4 packet burst',
    description:
      'Private leased dark-fiber circuit terminating straight into CDL competitive hosting nodes for LAN-grade hit registration.',
  },
  {
    id: 'rig-display',
    name: '240Hz MicroLED Tactical Arena Array',
    category: 'Visual Suite',
    price: 450000,
    edgeBonus: 2.5,
    specSummary: '0.03ms response · Dark-shadow clarity on Coal & Silkworm',
    description:
      'Frameless calibrated display suite tuned for instant visibility into Silkworm Subway entrances and Reactor U92 shadow angles.',
  },
  {
    id: 'rig-analyst',
    name: 'Private CDL v1.0 S&D Film & Coaching Staff',
    category: 'Tactical Intelligence',
    price: 680000,
    edgeBonus: 4.0,
    specSummary: '6-map opening route heatmaps · Opposing team tendency charts',
    description:
      'Retain two veteran CDL S&D analysts tracking every franchise opening split across Coal, Lotus, Munition, Reactor U92, Rooftops, and Silkworm.',
  },
  {
    id: 'rig-audio',
    name: 'Mastering-Grade Open-Back Acoustic Booth',
    category: 'Audio Suite',
    price: 950000,
    edgeBonus: 3.5,
    specSummary: 'MW4 IW 9.0 footstep EQ · Bomb-defuse audio isolation',
    description:
      'Custom dark walnut acoustic lounge isolating directional footsteps, trophy pings, and bomb-plant audio cues during 1v2 clutches.',
  },
];

export const TACTICAL_STANCES: {
  id: TacticalStance;
  label: string;
  shortNote: string;
  attackMod: number;
  defenseMod: number;
  variance: number;
}[] = [
  {
    id: 'default_split',
    label: 'Default 2-1-1 Info Split',
    shortNote: 'Play HAN 86 cross-angles, gather opening intel, and trade mid-map.',
    attackMod: 1.02,
    defenseMod: 1.05,
    variance: 0.95,
  },
  {
    id: 'fast_exec',
    label: 'Fast Smoke & Site Hit',
    shortNote: 'VEL-46 & ISO Nightshade 4-man burst onto site before rotators arrive.',
    attackMod: 1.24,
    defenseMod: 0.84,
    variance: 1.28,
  },
  {
    id: 'mid_pinch',
    label: 'Mid-Map Control & Pinch',
    shortNote: 'Collapse center lanes with Dead Silence to squeeze anchors from two angles.',
    attackMod: 1.14,
    defenseMod: 0.98,
    variance: 1.15,
  },
  {
    id: 'anchor_hold',
    label: 'Trophy Anchor & Play Time',
    shortNote: 'Lock headglitches with Trophy Systems, bleed the 1:45 clock, and win post-plant.',
    attackMod: 0.86,
    defenseMod: 1.24,
    variance: 0.82,
  },
];

export const STAKE_TIERS = [50000, 100000, 250000, 500000, 1000000];

export const INITIAL_CLUB_STATE: ClubState = {
  treasury: 12450000,
  offshoreReserve: 28000000,
  wins: 16,
  losses: 5,
  streak: 3,
  bestStreak: 6,
  activeLoadoutId: 'mw4-han86-anchor',
  ownedRigIds: ['rig-controller'],
  ledger: [
    {
      id: 'init-mw4-1',
      timestamp: 'Nov 26, 19:20',
      type: 'match_win',
      title: 'S&D Victory vs. OpTic Texas (Silkworm)',
      subtitle: 'MW4 CDL v1.0 · $250,000 Private Scrim Stake',
      amount: 287500,
      scoreline: '6 – 4',
    },
    {
      id: 'init-mw4-2',
      timestamp: 'Nov 24, 21:10',
      type: 'match_win',
      title: 'S&D Victory vs. Toronto KOI (Munition)',
      subtitle: 'MW4 CDL v1.0 · $100,000 Private Scrim Stake',
      amount: 100000,
      scoreline: '6 – 3',
    },
    {
      id: 'init-mw4-3',
      timestamp: 'Nov 22, 17:45',
      type: 'match_loss',
      title: 'S&D Defeat vs. FaZe Vegas (Coal)',
      subtitle: 'MW4 CDL v1.0 · $100,000 Private Scrim Stake',
      amount: -100000,
      scoreline: '4 – 6',
    },
    {
      id: 'init-mw4-4',
      timestamp: 'Nov 19, 15:30',
      type: 'scrim_booking',
      title: 'Booked 2-Hr S&D Scrim Block vs. LA Thieves',
      subtitle: 'Reactor U92 & Rooftops · Private Dedicated Node',
      amount: -48000,
    },
    {
      id: 'init-mw4-5',
      timestamp: 'Nov 12, 11:05',
      type: 'rig_purchase',
      title: 'Acquired Bespoke Carbon-Gold MW4 Pro Controller',
      subtitle: 'Suite 74A · +1.8% Tactical Edge',
      amount: -85000,
    },
  ],
  bookings: [
    {
      id: 'bk-mw4-1',
      teamId: 'faze-vegas',
      teamName: 'FaZe Vegas',
      mapName: 'Coal & Silkworm',
      slotLabel: 'Tonight · 22:30 EST',
      retainerPaid: 55000,
      status: 'Confirmed',
    },
  ],
};

export function formatCurrency(amount: number, signed = false): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(abs);
  if (signed) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

const MAP_CALLOUT_BANK: Record<Mw4MapId, { playerWins: string[]; oppWins: string[] }> = {
  coal: {
    playerWins: [
      'HAN 86 locks down the Coal Catwalks — opening pick on The Hill clears A-Site for a clean bomb plant.',
      'Smoke isolates the Coal Warehouse headglitch; ISO Nightshade entry shreds the anchor for a 1v2 round win.',
      'Trophy System denies double Semtex on The Hill; disciplined post-plant crossfire closes the round.',
    ],
    oppWins: [
      'Opponent takes High Ground Catwalks off spawn and shuts down your Warehouse wrap with clean trades.',
      'Late-round Dead Silence pinch through the lower Coal tunnel catches the bomb carrier in transition.',
    ],
  },
  lotus: {
    playerWins: [
      'Clean smoke across Central Courtyard lets your VEL-46 duo flood Main Hall and secure the A-Site plant.',
      'Back Alley flank timing with Dead Silence nets a two-piece before the defenders can rotate out of Plaza.',
      'M4 Flex holds the Courtyard cut while Trophy protects the bomb — surgical defuse denial.',
    ],
    oppWins: [
      'Defending HAN 86 anchors Central Plaza and punishes the early Courtyard cross for first blood.',
      'Synchronized retake from Back Alley and Side Lanes overwhelms your post-plant spacing.',
    ],
  },
  munition: {
    playerWins: [
      'ISO Nightshade tears through Main Depot interior; fast bomb plant leaves rotators trapped at Loading Dock.',
      'Textbook pre-nade into Mid Connector tags two weak — Sang 9mm swap finishes the clutch.',
      'Control of Storage Interior cuts the map in half; clean 2v2 trade execution seals the round.',
    ],
    oppWins: [
      'Opposing SMGs dominate close quarters inside Main Depot and secure early mid-map control.',
      'Loading Dock sniper-lane read from their Main AR picks off your flanker before the site hit.',
    ],
  },
  reactor_u92: {
    playerWins: [
      'Upper Control Catwalk dominance forces defenders out of the Reactor Core — effortless B-Site detonation.',
      'Double stun into Outer Labs clears the lurker; Dead Silence wrap into Core seals the 1v1.',
      'HAN 86 holds the Reactor vertical drop while Trophy System nullifies retake utility.',
    ],
    oppWins: [
      'Opposing Flex claims Upper Control early and rains down fire onto the Reactor Core plant.',
      'Outer Labs flank collapses behind your entry players, leaving no trade angle on site.',
    ],
  },
  rooftops: {
    playerWins: [
      'Precision HAN 86 beam across the Rooftops Sniper Lane picks off the Bar anchor in the first 12 seconds.',
      'Smoke cuts off the Generator Box headglitch — VEL-46 duo floods The Bar for a decisive round win.',
      'Clean post-plant line-of-sight setup from Electrical Boxes drains the remaining defuse clock.',
    ],
    oppWins: [
      'Opponent locks down the Generator Box headglitches and wins two straight AR gunfights across mid.',
      'Fast Bar retake with coordinated stun grenades breaks your site hold.',
    ],
  },
  silkworm: {
    playerWins: [
      'Dead Silence rush through the Central Subway Entrance catches the Gaming Den anchor completely off-guard.',
      'Smoke isolates Convenience Store windows; ISO Nightshade clears Market and plants for Alley view.',
      'Perimeter Apartment wrap pinches the remaining defender on bomb — ice-cold veteran clutch.',
    ],
    oppWins: [
      'Opponent controls Convenience Store and shuts down your Subway pop-up with tight crossfires.',
      'Gaming Den lurker reads your late-round rotation and steals the round with a ninja defuse.',
    ],
  },
};

export function generateMw4RoundCommentary(
  mapId: Mw4MapId,
  wonByPlayer: boolean,
  teamName: string
): string {
  const bank = MAP_CALLOUT_BANK[mapId] || MAP_CALLOUT_BANK.coal;
  if (wonByPlayer) {
    return bank.playerWins[Math.floor(Math.random() * bank.playerWins.length)];
  }
  const raw = bank.oppWins[Math.floor(Math.random() * bank.oppWins.length)];
  return raw.replace('Opponent', teamName).replace('Opposing', `${teamName}'s`);
}
