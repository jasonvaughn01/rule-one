# Security Specification — Rule One MW4 CDL Co-Founder RBAC

## 1. Data Invariants
1. **Founder Bootstrap & Verified Identity**: All authenticated reads and writes require `request.auth != null && request.auth.token.email_verified == true`. The primary bootstrapped founder (`jason.vaughn202@gmail.com`) can never be removed or locked out.
2. **Master Gate Membership**: Subcollection access under `/clubs/{clubId}/cofounders`, `/clubs/{clubId}/playbooks`, and `/clubs/{clubId}/ledger` strictly requires membership in the parent `/clubs/{clubId}` document (`isClubMember(clubId)`). Removing a co-founder synchronously revokes all subcollection read/write/delete access.
3. **PII Isolation**: Emails inside `/clubs/{clubId}` and `/clubs/{clubId}/cofounders/{cofounderId}` are never publicly readable or readable by arbitrary signed-in non-members.
4. **Strict Payload & Boundary Integrity**: All IDs match `^[a-zA-Z0-9_\-]+$` (<= 128 chars), every string has explicit `.size()` bounds, arrays have strict `.size()` caps (`cofounderEmails <= 15`, `ownedRigIds <= 10`, `operators <= 4`, `utilities <= 20`, `routes <= 20`), and all `createdAt`/`updatedAt` timestamps equal `request.time`.
5. **Immutable Ownership & Temporal Integrity**: `ownerUid`, `ownerEmail`, `clubId`, `createdByUid`, `addedByUid`, and `createdAt` cannot be modified after creation.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Anonymous user attempts `get(/clubs/rule_one)`.
2. **Unverified Email Spoof**: User with `email: 'jason.vaughn202@gmail.com'` and `email_verified: false` attempts `get` or `write` on `/clubs/rule_one`.
3. **Unauthorized Non-Member Read**: Verified external user (`stranger@example.com`, not in `cofounderEmails`) attempts `get(/clubs/rule_one)` or `list(/clubs/rule_one/cofounders)`.
4. **Self-Elevation Attack**: Non-member attempts to add their own email into `/clubs/rule_one/cofounders/stranger_example_com` or append themselves to `cofounderEmails`.
5. **Shadow Field Injection**: Co-founder attempts to create a playbook with an extra undocumented ghost field (`isSuperUser: true`).
6. **ID Poisoning**: Admin attempts to create a playbook with a 200-character or invalid-character document ID (`bad/id$!`).
7. **Author UID Spoofing**: Co-founder attempts to create a playbook setting `createdByUid` to another user's UID.
8. **Immutable Field Tampering**: Co-founder attempts to modify `ownerEmail` or `ownerUid` or `createdAt` on `/clubs/rule_one`.
9. **Client Timestamp Forgery**: Admin attempts to write a backdated client timestamp (`createdAt: 2020-01-01`) instead of `request.time`.
10. **Array Overflow (Denial of Wallet)**: Admin attempts to submit 25 `cofounderEmails` (exceeding max 15) or 50 `utilities` (exceeding max 20).
11. **Value Type Poisoning**: Admin attempts to update `treasury` on `/clubs/rule_one` with a string `"9999999"` instead of a number.
12. **Invalid Map Enum Injection**: Admin attempts to save an S&D playbook with `mapId: "shipment"` (not in official MW4 CDL v1.0 6-map pool).
