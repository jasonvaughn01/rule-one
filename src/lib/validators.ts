export type ClanRole = 'owner' | 'admin' | 'captain' | 'member';
export type EvidenceClass =
  | 'official'
  | 'independently_tested'
  | 'community_reported'
  | 'prediction'
  | 'unverified';

export interface TenantMember {
  uid: string;
  clanId: string;
  role: ClanRole;
  revoked?: boolean;
}

export interface Mw4BuildDraft {
  id: string;
  name: string;
  primaryWeapon: string;
  attachments: string[];
  tactical: string;
  lethal: string;
  fieldUpgrade: string;
  patchVersion: string;
}

export interface BuildValidationResult {
  publicLegal: boolean;
  cdlV1Legal: boolean;
  rankedLegalStatus: 'unknown_pending_official_rules' | 'verified_legal' | 'restricted';
  outdatedByPatch: boolean;
  warnings: string[];
}

const ROLE_WEIGHT: Record<ClanRole, number> = {
  owner: 4,
  admin: 3,
  captain: 2,
  member: 1,
};

export function sanitizePlainText(input: string, maxLength = 160): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function canAccessPrivateClanResource(
  actor: TenantMember | null,
  targetClanId: string,
  requiredRole: ClanRole = 'member'
): boolean {
  if (!actor || actor.revoked) return false;
  if (actor.clanId !== targetClanId) return false;
  return ROLE_WEIGHT[actor.role] >= ROLE_WEIGHT[requiredRole];
}

export function canModifyRole(
  actor: TenantMember | null,
  targetClanId: string,
  targetCurrentRole: ClanRole,
  nextRole: ClanRole
): boolean {
  if (!canAccessPrivateClanResource(actor, targetClanId, 'admin')) return false;
  if (!actor) return false;
  // Prevent privilege escalation above actor's own rank or revoking owner
  if (targetCurrentRole === 'owner') return false;
  if (ROLE_WEIGHT[nextRole] > ROLE_WEIGHT[actor.role]) return false;
  if (nextRole === 'owner' && actor.role !== 'owner') return false;
  return true;
}

export function isRouteIndexable(params: {
  isDraft: boolean;
  isPrivate: boolean;
  hasDuplicateFilterParams: boolean;
  evidenceClass: EvidenceClass;
  hasVerifiedSubstantiveContent: boolean;
}): boolean {
  if (params.isDraft || params.isPrivate || params.hasDuplicateFilterParams) return false;
  if (!params.hasVerifiedSubstantiveContent) return false;
  return params.evidenceClass === 'official' || params.evidenceClass === 'independently_tested';
}

const RESTRICTED_CDL_WEAPONS = ['Astaroth .57 (Sniper)', 'Signal 50 (Sniper)', 'Riot Shield'];
const RESTRICTED_CDL_ATTACHMENTS = [
  'APEX M16 Burst Conversion',
  'Tactical ADS Laser',
  'Bruen THRM-60 Thermal Optic',
];
const RESTRICTED_CDL_EQUIPMENT = ['Flash Grenade', 'Snapshot Grenade', 'Drill Charge', 'Portable Radar'];

export function validateMw4Build(
  build: Mw4BuildDraft,
  flaggedPatchItems: string[],
  officialRankedRulesPublished = false
): BuildValidationResult {
  const warnings: string[] = [];

  if (build.attachments.length > 5) {
    warnings.push('Exceeds standard 5-attachment Gunsmith limit.');
  }

  const hasBannedWeapon = RESTRICTED_CDL_WEAPONS.includes(build.primaryWeapon);
  const bannedAttachments = build.attachments.filter((a) => RESTRICTED_CDL_ATTACHMENTS.includes(a));
  const hasBannedEquip =
    RESTRICTED_CDL_EQUIPMENT.includes(build.tactical) ||
    RESTRICTED_CDL_EQUIPMENT.includes(build.lethal) ||
    RESTRICTED_CDL_EQUIPMENT.includes(build.fieldUpgrade);

  if (hasBannedWeapon) {
    warnings.push(`${build.primaryWeapon} is restricted in legacy CDL ruleset checks.`);
  }
  if (bannedAttachments.length > 0) {
    warnings.push(`Restricted CDL attachments: ${bannedAttachments.join(', ')}.`);
  }
  if (hasBannedEquip) {
    warnings.push('Equipment or Field Upgrade restricted under competitive ruleset.');
  }

  const allItems = [
    build.primaryWeapon,
    ...build.attachments,
    build.tactical,
    build.lethal,
    build.fieldUpgrade,
  ];
  const outdatedByPatch = allItems.some((item) =>
    flaggedPatchItems.some((flagged) => item.toLowerCase().includes(flagged.toLowerCase()))
  );
  if (outdatedByPatch) {
    warnings.push('Patch diff flagged an item in this build — re-test before tournament play.');
  }

  const cdlV1Legal = !hasBannedWeapon && bannedAttachments.length === 0 && !hasBannedEquip;

  return {
    publicLegal: build.attachments.length <= 5,
    cdlV1Legal,
    rankedLegalStatus: officialRankedRulesPublished
      ? cdlV1Legal
        ? 'verified_legal'
        : 'restricted'
      : 'unknown_pending_official_rules',
    outdatedByPatch,
    warnings,
  };
}

export function isEntryStale(lastCheckedIso: string, maxAgeDays: number, now = new Date()): boolean {
  const checked = new Date(lastCheckedIso).getTime();
  if (Number.isNaN(checked)) return true;
  const ageMs = now.getTime() - checked;
  return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
}
