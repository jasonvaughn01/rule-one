/**
 * Phase 0 Security TDD Test Specification for Rule One Firestore Security Rules.
 * Verifies all 12 "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED
 * and legitimate Founder / Co-Founder add, update, and delete flows succeed.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  actor: { uid: string; email: string; email_verified: boolean } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated read on /clubs/rule_one',
    actor: null,
    operation: 'get',
    path: '/clubs/rule_one',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified founder email spoof attack',
    actor: { uid: 'spoof-uid', email: 'jason.vaughn202@gmail.com', email_verified: false },
    operation: 'get',
    path: '/clubs/rule_one',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Non-member PII read on /clubs/rule_one/cofounders',
    actor: { uid: 'outsider-1', email: 'outsider@example.com', email_verified: true },
    operation: 'get',
    path: '/clubs/rule_one/cofounders/partner_example_com',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Non-member self-elevation into cofounders',
    actor: { uid: 'outsider-1', email: 'outsider@example.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/cofounders/outsider_example_com',
    payload: {
      clubId: 'rule_one',
      email: 'outsider@example.com',
      displayName: 'Attacker',
      role: 'cofounder',
      addedByUid: 'outsider-1',
      addedByEmail: 'outsider@example.com',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow ghost field injection on S&D playbook create',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/playbooks/pb_1',
    payload: {
      clubId: 'rule_one',
      mapId: 'coal',
      side: 'offense',
      name: 'Shadow Play',
      createdByUid: 'founder-uid',
      createdByEmail: 'jason.vaughn202@gmail.com',
      operators: [],
      utilities: [],
      routes: [],
      ghostAdminFlag: true,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Document ID poisoning with invalid characters',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/playbooks/bad$id!poison',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Author UID spoofing on playbook create',
    actor: { uid: 'cofounder-uid', email: 'partner@example.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/playbooks/pb_2',
    payload: {
      clubId: 'rule_one',
      mapId: 'silkworm',
      side: 'defense',
      name: 'Spoofed Play',
      createdByUid: 'someone-else-uid',
      createdByEmail: 'partner@example.com',
      operators: [],
      utilities: [],
      routes: [],
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable ownerEmail tampering on /clubs/rule_one',
    actor: { uid: 'cofounder-uid', email: 'partner@example.com', email_verified: true },
    operation: 'update',
    path: '/clubs/rule_one',
    payload: { ownerEmail: 'partner@example.com' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client-forged createdAt timestamp on ledger create',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/ledger/led_1',
    payload: {
      clubId: 'rule_one',
      type: 'treasury_wire',
      title: 'Forged time',
      subtitle: 'Test',
      amount: 1000000,
      createdByUid: 'founder-uid',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Array overflow attack on cofounderEmails (> 15)',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'update',
    path: '/clubs/rule_one',
    payload: {
      cofounderEmails: Array.from({ length: 20 }, (_, i) => `u${i}@example.com`),
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value type poisoning on treasury field (string instead of number)',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'update',
    path: '/clubs/rule_one',
    payload: { treasury: '999999999' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Invalid non-CDL mapId enum injection on S&D playbook',
    actor: { uid: 'founder-uid', email: 'jason.vaughn202@gmail.com', email_verified: true },
    operation: 'create',
    path: '/clubs/rule_one/playbooks/pb_invalid_map',
    payload: {
      clubId: 'rule_one',
      mapId: 'shipment',
      side: 'offense',
      name: 'Non CDL Map',
      createdByUid: 'founder-uid',
      createdByEmail: 'jason.vaughn202@gmail.com',
      operators: [],
      utilities: [],
      routes: [],
    },
    expected: 'PERMISSION_DENIED',
  },
];
