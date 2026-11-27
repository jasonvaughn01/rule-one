export type AppTab = 'map_control' | 'match_desk' | 'cdl_intel' | 'vault';

export type Mw4MapId =
  | 'coal'
  | 'lotus'
  | 'munition'
  | 'reactor_u92'
  | 'rooftops'
  | 'silkworm';

export type TacticalStance =
  | 'default_split'
  | 'fast_exec'
  | 'mid_pinch'
  | 'anchor_hold';

export interface CdlTeam {
  id: string;
  name: string;
  shortTag: string;
  city: string;
  roster: string[];
  sndWinRate: number;
  rating: number;
  payoutMultiplier: number;
  minStake: number;
  scrimRetainer: number;
  signatureMap: Mw4MapId;
  playstyle: string;
  avatarUrl?: string;
}

export interface CdlScheduleEvent {
  id: string;
  event: string;
  dates: string;
  location: string;
  format: string;
  status: 'Completed' | 'Upcoming' | 'Championship';
}

export interface CdlRuleItem {
  id: string;
  name: string;
  category: 'Weapons' | 'Attachments' | 'Equipment' | 'Field Upgrades';
  status: 'Banned (CDL v1.0)' | 'Meta Legal';
  detail: string;
}

export interface Mw4LoadoutPreset {
  id: string;
  name: string;
  role: string;
  primary: string;
  secondary: string;
  tactical: string;
  lethal: string;
  fieldUpgrade: string;
  tuning: string;
  cdlLegal: boolean;
  edgeBonus: number;
}

export interface RigUpgrade {
  id: string;
  name: string;
  category: string;
  price: number;
  edgeBonus: number;
  specSummary: string;
  description: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type:
    | 'match_win'
    | 'match_loss'
    | 'scrim_booking'
    | 'rig_purchase'
    | 'treasury_wire'
    | 'treasury_withdraw';
  title: string;
  subtitle: string;
  amount: number;
  scoreline?: string;
}

export interface BookedScrim {
  id: string;
  teamId: string;
  teamName: string;
  mapName: string;
  slotLabel: string;
  retainerPaid: number;
  status: 'Confirmed' | 'Completed';
}

export interface MatchEvent {
  id: string;
  roundLabel: string;
  text: string;
  highlight: 'player' | 'opponent' | 'neutral';
}

export interface ClubState {
  treasury: number;
  offshoreReserve: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  activeLoadoutId: string;
  ownedRigIds: string[];
  ledger: LedgerEntry[];
  bookings: BookedScrim[];
}
