import { Mw4MapId } from '../types';

export type RoundSide = 'offense' | 'defense';
export type OperatorRole =
  | 'HAN 86 · Main AR'
  | 'ISO Nightshade · Entry'
  | 'M4 · Flex AR'
  | 'VEL-46 · Roamer';

export interface MapBuilding {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  labelX?: number;
  labelY?: number;
}

export interface MapZone {
  id: string;
  name: string;
  lane: 'A-Lane' | 'Mid' | 'B-Lane';
  x: number;
  y: number;
  radius: number;
}

export interface BombSite {
  id: 'A' | 'B';
  name: string;
  x: number;
  y: number;
}

export interface OperatorToken {
  id: string;
  code: string;
  role: OperatorRole;
  x: number;
  y: number;
  aimDeg: number;
}

export interface UtilityMarker {
  id: string;
  kind: 'smoke' | 'nade' | 'trophy';
  x: number;
  y: number;
}

export interface RouteArrow {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface ProPlaybook {
  id: string;
  name: string;
  side: RoundSide;
  summary: string;
  timingSteps: { clock: string; callout: string }[];
  operators: OperatorToken[];
  utilities: UtilityMarker[];
  routes: RouteArrow[];
}

export interface SndMapConfig {
  id: Mw4MapId;
  name: string;
  poolNote: string;
  setting: string;
  brief: string;
  tacMapImageUrl: string;
  officialGuideUrl: string;
  offenseSpawn: { x: number; y: number; label: string };
  defenseSpawn: { x: number; y: number; label: string };
  sites: BombSite[];
  buildings: MapBuilding[];
  zones: MapZone[];
  playbooks: ProPlaybook[];
}

export const MW4_SND_MAPS: SndMapConfig[] = [
  {
    id: 'coal',
    name: 'Coal',
    poolNote: 'CDL v1.0 · S&D Exclusive',
    setting: 'Multi-Tiered Mining & Industrial Complex',
    brief:
      'Heavy verticality built around The Hill (B-Flag Mid), flanking Coal Warehouses, and elevated Catwalks. Whoever locks Catwalk height dictates A-Site plants.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/coal/MW4_MP_Coal_BASE.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/coal',
    offenseSpawn: { x: 110, y: 530, label: 'Offense Spawn (South Yard)' },
    defenseSpawn: { x: 880, y: 100, label: 'Defense Spawn (North Quarry)' },
    sites: [
      { id: 'A', name: 'A-Site · East Warehouse', x: 735, y: 245 },
      { id: 'B', name: 'B-Site · Lower Quarry Pit', x: 255, y: 185 },
    ],
    buildings: [
      { id: 'c-hill', label: 'The Hill (Mid)', x: 430, y: 250, w: 140, h: 110 },
      { id: 'c-wh-east', label: 'East Warehouse', x: 655, y: 315, w: 155, h: 115 },
      { id: 'c-wh-west', label: 'West Warehouse', x: 140, y: 270, w: 135, h: 115 },
      { id: 'c-catwalk', label: 'High Catwalks', x: 645, y: 105, w: 155, h: 85 },
      { id: 'c-silo', label: 'Coal Silos', x: 365, y: 95, w: 155, h: 85 },
      { id: 'c-loading', label: 'South Tipple', x: 395, y: 445, w: 150, h: 85 },
    ],
    zones: [
      { id: 'z-coal-a', name: 'A-Site / East Warehouse', lane: 'A-Lane', x: 730, y: 265, radius: 120 },
      { id: 'z-coal-mid', name: 'The Hill Control', lane: 'Mid', x: 500, y: 300, radius: 125 },
      { id: 'z-coal-b', name: 'B-Site / Quarry Pit', lane: 'B-Lane', x: 255, y: 195, radius: 115 },
    ],
    playbooks: [
      {
        id: 'coal-off-hill',
        name: 'Hill Smoke & Warehouse A-Split',
        side: 'offense',
        summary:
          'Smoke High Catwalks off spawn, contest The Hill with ISO Nightshade + M4 Flex, and pinch East Warehouse onto A-Site.',
        timingSteps: [
          { clock: '1:45', callout: 'HAN 86 holds South Tipple overwatch; Entry throws Catwalk cross smoke.' },
          { clock: '1:24', callout: 'M4 Flex & ISO clear The Hill and stun East Warehouse doorway.' },
          { clock: '1:02', callout: 'Drop Trophy on A-Site, plant for Warehouse line-of-sight; Roamer watches Silos.' },
          { clock: '0:38', callout: 'Hold vertical crossfire from East Warehouse & Hill — deny Catwalk retake.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 470, y: 425, aimDeg: -65 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 560, y: 280, aimDeg: -10 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 705, y: 345, aimDeg: -85 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 270, y: 340, aimDeg: -70 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 715, y: 185 },
          { id: 'u-2', kind: 'nade', x: 515, y: 265 },
          { id: 'u-3', kind: 'trophy', x: 725, y: 255 },
        ],
        routes: [
          { id: 'r-1', fromX: 560, fromY: 280, toX: 710, toY: 245 },
          { id: 'r-2', fromX: 705, fromY: 345, toX: 745, toY: 265 },
        ],
      },
      {
        id: 'coal-def-catwalk',
        name: 'Catwalk Height & Silo Crossfire',
        side: 'defense',
        summary:
          'Anchor High Catwalks with HAN 86 + Trophy while Flex denies The Hill and VEL-46 plays live info at West Warehouse.',
        timingSteps: [
          { clock: '1:45', callout: 'Main AR claims High Catwalks with Trophy System; Roamer spots Quarry Pit.' },
          { clock: '1:22', callout: 'Pre-nade South Tipple stairs to delay Hill control.' },
          { clock: '0:55', callout: 'Collapse through Silos on A-Site bomb tap; trade off Catwalk height.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 715, y: 155, aimDeg: 115 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 500, y: 260, aimDeg: 135 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 435, y: 145, aimDeg: 130 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 255, y: 195, aimDeg: 110 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 715, y: 170 },
          { id: 'u-2', kind: 'nade', x: 545, y: 350 },
        ],
        routes: [{ id: 'r-1', fromX: 435, fromY: 145, toX: 625, toY: 235 }],
      },
    ],
  },
  {
    id: 'lotus',
    name: 'Lotus',
    poolNote: 'CDL v1.0 · Universal (HP · Hijack · S&D)',
    setting: 'Structured Courtyard & Main Hall Complex',
    brief:
      'Universal CDL centerpiece built around the Central Courtyard Plaza, Main Hall interior, and narrow Back Alley flanks. Smoke discipline decides mid crosses.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/lotus/Lotus_Tac_Map.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/lotus',
    offenseSpawn: { x: 110, y: 315, label: 'Offense Spawn (West Terrace)' },
    defenseSpawn: { x: 880, y: 315, label: 'Defense Spawn (East Garden)' },
    sites: [
      { id: 'A', name: 'A-Site · Main Hall', x: 560, y: 145 },
      { id: 'B', name: 'B-Site · Back Alley', x: 550, y: 485 },
    ],
    buildings: [
      { id: 'l-plaza', label: 'Central Courtyard', x: 425, y: 255, w: 150, h: 110 },
      { id: 'l-hall', label: 'Main Hall', x: 625, y: 95, w: 160, h: 110 },
      { id: 'l-alley', label: 'Back Alley', x: 615, y: 415, w: 165, h: 105 },
      { id: 'l-west-n', label: 'North Lounge', x: 225, y: 115, w: 145, h: 100 },
      { id: 'l-west-s', label: 'South Gallery', x: 225, y: 410, w: 145, h: 100 },
    ],
    zones: [
      { id: 'z-lotus-a', name: 'A-Site / Main Hall', lane: 'A-Lane', x: 565, y: 155, radius: 120 },
      { id: 'z-lotus-mid', name: 'Central Courtyard', lane: 'Mid', x: 500, y: 310, radius: 125 },
      { id: 'z-lotus-b', name: 'B-Site / Back Alley', lane: 'B-Lane', x: 555, y: 475, radius: 120 },
    ],
    playbooks: [
      {
        id: 'lotus-off-courtyard',
        name: 'Courtyard Smoke & Main Hall Split',
        side: 'offense',
        summary:
          'Smoke Central Courtyard sightline to isolate East Garden anchors, then pinch Main Hall from North Lounge and Mid.',
        timingSteps: [
          { clock: '1:45', callout: 'Drop Mid Courtyard smoke; HAN 86 posts North Lounge doorway.' },
          { clock: '1:25', callout: 'ISO & M4 double-stun Main Hall anchor and take A-Site control.' },
          { clock: '1:00', callout: 'Plant A-Site open to North Lounge; VEL-46 cuts Back Alley rotation.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 345, y: 165, aimDeg: -5 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 515, y: 170, aimDeg: -10 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 485, y: 290, aimDeg: -45 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 405, y: 465, aimDeg: 10 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 615, y: 280 },
          { id: 'u-2', kind: 'trophy', x: 555, y: 150 },
        ],
        routes: [
          { id: 'r-1', fromX: 515, fromY: 170, toX: 575, toY: 145 },
          { id: 'r-2', fromX: 485, fromY: 290, toX: 560, toY: 185 },
        ],
      },
      {
        id: 'lotus-def-plaza',
        name: 'Courtyard Lock & Fast Alley Pinch',
        side: 'defense',
        summary:
          'Hold Central Courtyard cross with HAN 86 while Main Hall and Back Alley SMGs stay alive for instant trades.',
        timingSteps: [
          { clock: '1:45', callout: 'Main AR locks Courtyard lane; Trophy down inside Main Hall.' },
          { clock: '1:20', callout: 'Play live info in Back Alley — call early South Gallery footsteps.' },
          { clock: '0:48', callout: 'Execute synchronized 3-man retake through Courtyard and Garden.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 660, y: 310, aimDeg: 180 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 645, y: 160, aimDeg: 175 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 635, y: 465, aimDeg: 185 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 540, y: 255, aimDeg: 160 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 650, y: 165 },
          { id: 'u-2', kind: 'nade', x: 430, y: 455 },
        ],
        routes: [{ id: 'r-1', fromX: 660, fromY: 310, toX: 575, toY: 195 }],
      },
    ],
  },
  {
    id: 'munition',
    name: 'Munition',
    poolNote: 'CDL v1.0 · Universal (HP · Hijack · S&D)',
    setting: 'Military Storage Depot & Loading Docks',
    brief:
      'Tight warehouse lanes centered on Main Depot interior, Mid Connector, and exterior Loading Docks. ISO Nightshade and VEL-46 dictate Depot gunfights.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/munition/Munition_Tac_Map.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/munition',
    offenseSpawn: { x: 115, y: 520, label: 'Offense Spawn (South Apron)' },
    defenseSpawn: { x: 875, y: 105, label: 'Defense Spawn (North Gate)' },
    sites: [
      { id: 'A', name: 'A-Site · Loading Dock', x: 755, y: 245 },
      { id: 'B', name: 'B-Site · Armory Yard', x: 250, y: 180 },
    ],
    buildings: [
      { id: 'm-depot', label: 'Main Depot', x: 410, y: 225, w: 175, h: 145 },
      { id: 'm-dock', label: 'Loading Dock', x: 675, y: 325, w: 145, h: 110 },
      { id: 'm-conn', label: 'Mid Connector', x: 430, y: 425, w: 140, h: 85 },
      { id: 'm-armory', label: 'Armory', x: 145, y: 255, w: 135, h: 115 },
      { id: 'm-bunker', label: 'North Bunker', x: 375, y: 85, w: 165, h: 85 },
    ],
    zones: [
      { id: 'z-mun-a', name: 'A-Site / Loading Dock', lane: 'A-Lane', x: 745, y: 260, radius: 120 },
      { id: 'z-mun-mid', name: 'Main Depot Interior', lane: 'Mid', x: 495, y: 295, radius: 130 },
      { id: 'z-mun-b', name: 'B-Site / Armory Yard', lane: 'B-Lane', x: 250, y: 185, radius: 115 },
    ],
    playbooks: [
      {
        id: 'mun-off-depot',
        name: 'Main Depot Take & Dock Pinch',
        side: 'offense',
        summary:
          'Flood Main Depot with both SMGs to split the map in half, smoke North Gate cross, and collapse onto Loading Dock A-Site.',
        timingSteps: [
          { clock: '1:45', callout: 'Double-stun Main Depot doors; ISO & VEL-46 clear interior together.' },
          { clock: '1:24', callout: 'Smoke North Gate lane; HAN 86 posts South Loading Dock headglitch.' },
          { clock: '1:02', callout: 'Plant A-Site protected by Trophy; Depot players hold connector flank.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 705, y: 415, aimDeg: -85 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 535, y: 270, aimDeg: -10 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 455, y: 315, aimDeg: -25 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 280, y: 315, aimDeg: -75 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 740, y: 170 },
          { id: 'u-2', kind: 'nade', x: 515, y: 245 },
          { id: 'u-3', kind: 'trophy', x: 745, y: 255 },
        ],
        routes: [
          { id: 'r-1', fromX: 535, fromY: 270, toX: 730, toY: 245 },
          { id: 'r-2', fromX: 705, fromY: 415, toX: 755, toY: 280 },
        ],
      },
      {
        id: 'mun-def-depot',
        name: 'Depot Lockdown & North Bunker Overwatch',
        side: 'defense',
        summary:
          'Deny Main Depot entry with two SMGs playing tight trade corners while HAN 86 locks Loading Dock from North Gate.',
        timingSteps: [
          { clock: '1:45', callout: 'Drop Trophy inside Main Depot; Main AR watches Loading Dock long angle.' },
          { clock: '1:20', callout: 'Pre-nade Mid Connector to punish slow offense defaults.' },
          { clock: '0:50', callout: 'Pivot through North Bunker on B-Site contact.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 775, y: 170, aimDeg: 105 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 525, y: 285, aimDeg: 145 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 435, y: 145, aimDeg: 135 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 265, y: 195, aimDeg: 110 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 500, y: 295 },
          { id: 'u-2', kind: 'nade', x: 495, y: 405 },
        ],
        routes: [{ id: 'r-1', fromX: 435, fromY: 145, toX: 295, toY: 185 }],
      },
    ],
  },
  {
    id: 'reactor_u92',
    name: 'Reactor U92',
    poolNote: 'CDL v1.0 · Hardpoint & S&D',
    setting: 'Nuclear Hazard Core & Upper Control Catwalks',
    brief:
      'Industrial nuclear facility centered on the multi-level Reactor Core, Upper Control Catwalks, and flanking Outer Labs corridors.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/reactor-u92/Reactor_U92_Tac_Map.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/reactor-u92',
    offenseSpawn: { x: 115, y: 310, label: 'Offense Spawn (West Cooling)' },
    defenseSpawn: { x: 880, y: 310, label: 'Defense Spawn (East Containment)' },
    sites: [
      { id: 'A', name: 'A-Site · Upper Control', x: 550, y: 145 },
      { id: 'B', name: 'B-Site · Lower Core Pit', x: 530, y: 465 },
    ],
    buildings: [
      { id: 'r-core', label: 'Reactor Core', x: 435, y: 245, w: 140, h: 125 },
      { id: 'r-catwalk', label: 'Upper Control', x: 615, y: 105, w: 160, h: 95 },
      { id: 'r-lab-n', label: 'North Lab', x: 245, y: 110, w: 145, h: 95 },
      { id: 'r-lab-s', label: 'Outer South Lab', x: 245, y: 420, w: 150, h: 95 },
      { id: 'r-turbine', label: 'Turbine Hall', x: 625, y: 415, w: 155, h: 100 },
    ],
    zones: [
      { id: 'z-ru-a', name: 'A-Site / Upper Control', lane: 'A-Lane', x: 565, y: 150, radius: 120 },
      { id: 'z-ru-mid', name: 'Reactor Core Mid', lane: 'Mid', x: 505, y: 305, radius: 125 },
      { id: 'z-ru-b', name: 'B-Site / Core Pit', lane: 'B-Lane', x: 540, y: 465, radius: 120 },
    ],
    playbooks: [
      {
        id: 'ru-off-core',
        name: 'Upper Control Take & Core Drop',
        side: 'offense',
        summary:
          'Win Upper Control Catwalk priority from North Lab while VEL-46 flanks Outer South Lab to trap East Containment rotators.',
        timingSteps: [
          { clock: '1:45', callout: 'HAN 86 holds North Lab sightline; smoke Reactor Core mid cross.' },
          { clock: '1:22', callout: 'ISO & M4 breach Upper Control with stun utility and drop Trophy.' },
          { clock: '0:58', callout: 'Plant A-Site tucked behind console; Roamer cuts Turbine Hall flank.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 350, y: 155, aimDeg: -5 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 525, y: 155, aimDeg: 0 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 485, y: 290, aimDeg: -50 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 415, y: 465, aimDeg: 5 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 560, y: 270 },
          { id: 'u-2', kind: 'trophy', x: 550, y: 155 },
        ],
        routes: [
          { id: 'r-1', fromX: 525, fromY: 155, toX: 625, toY: 150 },
          { id: 'r-2', fromX: 415, fromY: 465, toX: 605, toY: 465 },
        ],
      },
      {
        id: 'ru-def-catwalk',
        name: 'Reactor Core Stack & Outer Lab Info',
        side: 'defense',
        summary:
          'Control Reactor Core center elevation to cut off cross-map splits while Turbine and Catwalk anchors crossfire bombsites.',
        timingSteps: [
          { clock: '1:45', callout: 'Flex posts Reactor Core rail; Main AR watches North Lab from Upper Control.' },
          { clock: '1:18', callout: 'Hold stun utility for late A-Site hit; Roamer checks Outer South Lab.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 675, y: 150, aimDeg: 180 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 530, y: 300, aimDeg: 175 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 655, y: 455, aimDeg: 185 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 570, y: 215, aimDeg: 165 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 660, y: 160 },
          { id: 'u-2', kind: 'nade', x: 415, y: 155 },
        ],
        routes: [{ id: 'r-1', fromX: 530, fromY: 300, toX: 555, toY: 175 }],
      },
    ],
  },
  {
    id: 'rooftops',
    name: 'Rooftops',
    poolNote: 'CDL v1.0 · Hardpoint & S&D',
    setting: 'High-Rise Urban Skyline & Generator Deck',
    brief:
      'Notorious headglitch and long-angle battleground anchored by The Bar, Generator / Electrical Boxes, and exposed high-rise Sniper Lanes.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/rooftops/MW4_Rooftops_Tac_Map_BASE.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/rooftops',
    offenseSpawn: { x: 115, y: 520, label: 'Offense Spawn (Helipad Deck)' },
    defenseSpawn: { x: 875, y: 105, label: 'Defense Spawn (Penthouse Terrace)' },
    sites: [
      { id: 'A', name: 'A-Site · The Bar', x: 265, y: 170 },
      { id: 'B', name: 'B-Site · Generator Deck', x: 740, y: 260 },
    ],
    buildings: [
      { id: 'rf-bar', label: 'The Bar', x: 145, y: 245, w: 145, h: 120 },
      { id: 'rf-gen', label: 'Generator Boxes', x: 645, y: 325, w: 155, h: 105 },
      { id: 'rf-sky', label: 'Skybridge Mid', x: 425, y: 255, w: 145, h: 95 },
      { id: 'rf-lounge', label: 'North Penthouse', x: 385, y: 90, w: 165, h: 85 },
      { id: 'rf-hvac', label: 'HVAC Units', x: 400, y: 435, w: 150, h: 85 },
    ],
    zones: [
      { id: 'z-rf-a', name: 'A-Site / The Bar', lane: 'A-Lane', x: 265, y: 185, radius: 120 },
      { id: 'z-rf-mid', name: 'Skybridge / Sniper Lane', lane: 'Mid', x: 495, y: 295, radius: 125 },
      { id: 'z-rf-b', name: 'B-Site / Generator Deck', lane: 'B-Lane', x: 735, y: 270, radius: 120 },
    ],
    playbooks: [
      {
        id: 'rf-off-bar',
        name: 'Sniper Lane Smoke & Fast Bar Exec',
        side: 'offense',
        summary:
          'Smoke the long Skybridge sniper angle so Penthouse ARs cannot pick the cross, then flood The Bar with VEL-46 and ISO.',
        timingSteps: [
          { clock: '1:45', callout: 'Throw Skybridge cross smoke; HAN 86 posts HVAC watching Generator flank.' },
          { clock: '1:25', callout: 'Stun The Bar patio and breach with ISO + M4 Flex.' },
          { clock: '1:00', callout: 'Plant A-Site for Bar windows; hold crossfire against North Penthouse retake.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 475, y: 425, aimDeg: -45 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 245, y: 215, aimDeg: -20 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 340, y: 250, aimDeg: -60 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 645, y: 375, aimDeg: -85 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 455, y: 200 },
          { id: 'u-2', kind: 'trophy', x: 265, y: 185 },
        ],
        routes: [
          { id: 'r-1', fromX: 245, fromY: 215, toX: 265, toY: 165 },
          { id: 'r-2', fromX: 340, fromY: 250, toX: 390, toY: 165 },
        ],
      },
      {
        id: 'rf-def-gen',
        name: 'Generator Headglitch & Bar Anchor',
        side: 'defense',
        summary:
          'Exploit Rooftops Generator Boxes with HAN 86 + Trophy while two players lock The Bar and Skybridge.',
        timingSteps: [
          { clock: '1:45', callout: 'Main AR posts Generator Boxes; M4 watches long Sniper Lane from Penthouse.' },
          { clock: '1:18', callout: 'Do not challenge smoke dry — play trade spacing around Bar doorway.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 715, y: 295, aimDeg: 145 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 270, y: 185, aimDeg: 120 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 455, y: 140, aimDeg: 125 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 525, y: 275, aimDeg: 145 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 720, y: 280 },
          { id: 'u-2', kind: 'nade', x: 255, y: 345 },
        ],
        routes: [{ id: 'r-1', fromX: 455, fromY: 140, toX: 310, toY: 170 }],
      },
    ],
  },
  {
    id: 'silkworm',
    name: 'Silkworm',
    poolNote: 'CDL v1.0 · S&D Exclusive',
    setting: 'South Korean Commercial District & Subway',
    brief:
      'Dense urban S&D masterpiece featuring Convenience Store / Market, Gaming Den, Central Subway Entrance, and wrapping Perimeter Apartments.',
    tacMapImageUrl:
      'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/guides/games/mw4/tac-map/silkworm/Silkworm_Tac_Map.webp',
    officialGuideUrl:
      'https://www.callofduty.com/guides/modernwarfare4/multiplayer-maps/launch/silkworm',
    offenseSpawn: { x: 115, y: 525, label: 'Offense Spawn (South Street)' },
    defenseSpawn: { x: 875, y: 105, label: 'Defense Spawn (North Plaza)' },
    sites: [
      { id: 'A', name: 'A-Site · Convenience Store', x: 260, y: 175 },
      { id: 'B', name: 'B-Site · Gaming Den Plaza', x: 735, y: 245 },
    ],
    buildings: [
      { id: 'sw-store', label: 'Convenience Store', x: 140, y: 245, w: 150, h: 115 },
      { id: 'sw-subway', label: 'Subway Entrance', x: 430, y: 255, w: 140, h: 105 },
      { id: 'sw-den', label: 'Gaming Den', x: 660, y: 315, w: 155, h: 115 },
      { id: 'sw-apt-n', label: 'North Apartments', x: 375, y: 90, w: 165, h: 85 },
      { id: 'sw-alley', label: 'South Alley', x: 395, y: 445, w: 155, h: 85 },
    ],
    zones: [
      { id: 'z-sw-a', name: 'A-Site / Convenience Store', lane: 'A-Lane', x: 255, y: 190, radius: 120 },
      { id: 'z-sw-mid', name: 'Subway Entrance Mid', lane: 'Mid', x: 500, y: 305, radius: 125 },
      { id: 'z-sw-b', name: 'B-Site / Gaming Den', lane: 'B-Lane', x: 735, y: 265, radius: 120 },
    ],
    playbooks: [
      {
        id: 'sw-off-subway',
        name: 'Subway Dead Silence Pinch to Gaming Den',
        side: 'offense',
        summary:
          'Send VEL-46 silent through Central Subway Entrance while ISO + M4 execute onto Gaming Den B-Site with smoke cover.',
        timingSteps: [
          { clock: '1:45', callout: 'Roamer drops into Central Subway with Dead Silence; HAN 86 locks South Alley.' },
          { clock: '1:24', callout: 'Smoke North Plaza cross; ISO & M4 stun Gaming Den interior.' },
          { clock: '1:02', callout: 'Subway player pops up behind B anchor — plant Gaming Den Plaza with Trophy.' },
          { clock: '0:38', callout: 'Play Market/Alley crossfire; force defenders through choke.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 465, y: 435, aimDeg: -50 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 710, y: 345, aimDeg: -80 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 605, y: 295, aimDeg: -25 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 495, y: 270, aimDeg: -10 },
        ],
        utilities: [
          { id: 'u-1', kind: 'smoke', x: 735, y: 175 },
          { id: 'u-2', kind: 'nade', x: 720, y: 315 },
          { id: 'u-3', kind: 'trophy', x: 730, y: 255 },
        ],
        routes: [
          { id: 'r-1', fromX: 495, fromY: 270, toX: 705, toY: 245 },
          { id: 'r-2', fromX: 710, fromY: 345, toX: 740, toY: 265 },
        ],
      },
      {
        id: 'sw-def-market',
        name: 'Convenience Store & Subway Trap',
        side: 'defense',
        summary:
          'Hold Convenience Store windows and watch Subway pop-up with ISO Nightshade while HAN 86 anchors Gaming Den Plaza.',
        timingSteps: [
          { clock: '1:45', callout: 'Drop Trophy at Convenience Store; ISO holds Subway stairwell angle.' },
          { clock: '1:20', callout: 'Pre-nade Gaming Den doorway to delay fast B hits.' },
          { clock: '0:50', callout: 'Wrap through North Apartments on bomb spot for clean 2v2 retake.' },
        ],
        operators: [
          { id: 'op-1', code: 'AR1', role: 'HAN 86 · Main AR', x: 740, y: 215, aimDeg: 115 },
          { id: 'op-2', code: 'SM1', role: 'ISO Nightshade · Entry', x: 505, y: 250, aimDeg: 140 },
          { id: 'op-3', code: 'FLX', role: 'M4 · Flex AR', x: 430, y: 145, aimDeg: 135 },
          { id: 'op-4', code: 'SM2', role: 'VEL-46 · Roamer', x: 255, y: 215, aimDeg: 115 },
        ],
        utilities: [
          { id: 'u-1', kind: 'trophy', x: 250, y: 230 },
          { id: 'u-2', kind: 'nade', x: 685, y: 345 },
        ],
        routes: [{ id: 'r-1', fromX: 430, fromY: 145, toX: 285, toY: 185 }],
      },
    ],
  },
];

export interface SavedPlaybook {
  id: string;
  mapId: Mw4MapId;
  side: RoundSide;
  name: string;
  createdAt: string;
  operators: OperatorToken[];
  utilities: UtilityMarker[];
  routes: RouteArrow[];
}
