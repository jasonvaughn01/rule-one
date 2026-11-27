import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

async function runAll() {
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`PASS: ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${t.name}\n  ->`, err instanceof Error ? err.message : err);
      failed++;
    }
  }
  console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

const root = process.cwd();

// 1. Verify every game in GAME_CATALOG has an official developer API + verified https artwork
test('Catalog contains only developer-API connected games with verified images & portals', async () => {
  const ts = await import('esbuild');
  const built = ts.buildSync({
    entryPoints: [path.join(root, 'src/data/gameCatalog.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  const modUrl = `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`;
  const mod = await import(modUrl);

  assert.equal(mod.GAME_CATALOG.length, 21, 'Catalog must contain the 21 verified developer-pipeline games');
  assert.ok(
    mod.GAME_CATALOG.some((g) => g.slug === 'modern-warfare-4'),
    'Call of Duty: Modern Warfare 4 (2026) must be in catalog'
  );
  assert.ok(mod.DEVELOPER_ECOSYSTEMS.length >= 11, 'Must expose grouped official developer ecosystems');
  for (const game of mod.GAME_CATALOG) {
    assert.ok(game.imageUrl.startsWith('https://'), `Missing https imageUrl for ${game.name}`);
    assert.ok(game.posterUrl.startsWith('https://'), `Missing https posterUrl for ${game.name}`);
    assert.ok(game.developerApi?.portalUrl.startsWith('https://'), `Missing developer portalUrl for ${game.name}`);
    assert.ok(game.developerApi?.docsUrl.startsWith('https://'), `Missing developer docsUrl for ${game.name}`);
    assert.ok(game.developerApi?.contactSteps.length >= 2, `Missing developer contactSteps for ${game.name}`);
  }
});

// 2. Verify Appendix B bundled source assets exist in workspace
test('Appendix B original bundled assets preserved in workspace', () => {
  const requiredAssets = [
    'src/assets/images/pro_marcus_vance_1795753021562.jpg',
    'src/assets/images/pro_lucas_silva_1795753022087.jpg',
    'src/assets/images/pro_devon_brooks_cod_1795753212778.jpg',
    'src/assets/images/pro_elena_rostova_1795753021442.jpg',
    'src/assets/images/pro_henrik_lind_1795753020824.jpg',
    'src/assets/images/vault_bespoke_controller_1795753020898.jpg',
    'src/assets/images/hero_penthouse_lounge_1795753021249.jpg',
  ];
  for (const rel of requiredAssets) {
    assert.ok(fs.existsSync(path.join(root, rel)), `Missing preserved asset: ${rel}`);
  }
});

// 3. Verify SEO static infrastructure: robots.txt & split sitemaps
test('SEO robots.txt and split sitemaps exist and block private /ops routes', () => {
  const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
  assert.ok(robots.includes('Disallow: /ops'), 'robots.txt must disallow /ops');
  assert.ok(robots.includes('Sitemap:'), 'robots.txt must reference sitemap.xml');
  assert.ok(fs.existsSync(path.join(root, 'public/sitemap.xml')));
  assert.ok(fs.existsSync(path.join(root, 'public/sitemaps/mw4.xml')));
  assert.ok(fs.existsSync(path.join(root, 'public/sitemaps/directory.xml')));
});

// 4. Verify multi-tenant security rules draft enforces cross-clan isolation & anti-escalation
test('Multi-tenant rules draft enforces cross-clan isolation and blocks owner revocation', () => {
  const rules = fs.readFileSync(path.join(root, 'firestore.rules.multitenant.draft'), 'utf8');
  assert.ok(rules.includes('allow read, write: if false;'), 'Global default deny missing');
  assert.ok(rules.includes('resource.data.role != \'owner\''), 'Owner protection missing');
  assert.ok(rules.includes('resource.data.clanId == clanId'), 'Cross-clan isolation guard missing');
  assert.ok(rules.includes('resource.data.publicOptIn == true'), 'Public opt-in allowlist guard missing');
});

// 5. Verify validators logic (RBAC, XSS, SEO indexability, MW4 build validation, staleness)
test('Domain validators enforce RBAC, XSS sanitization, indexability, build rules, and staleness', async () => {
  const ts = await import('esbuild');
  const built = ts.buildSync({
    entryPoints: [path.join(root, 'src/lib/validators.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  const modUrl = `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`;
  const v = await import(modUrl);

  // Anonymous & cross-clan isolation
  assert.equal(v.canAccessPrivateClanResource(null, 'clan-a'), false);
  assert.equal(
    v.canAccessPrivateClanResource({ uid: 'u1', clanId: 'clan-b', role: 'owner' }, 'clan-a'),
    false
  );
  // Revoked member denied
  assert.equal(
    v.canAccessPrivateClanResource({ uid: 'u1', clanId: 'clan-a', role: 'admin', revoked: true }, 'clan-a'),
    false
  );
  // Privilege escalation blocked (admin cannot promote to owner or modify owner)
  assert.equal(
    v.canModifyRole({ uid: 'u1', clanId: 'clan-a', role: 'admin' }, 'clan-a', 'member', 'owner'),
    false
  );
  assert.equal(
    v.canModifyRole({ uid: 'u1', clanId: 'clan-a', role: 'admin' }, 'clan-a', 'owner', 'member'),
    false
  );
  assert.equal(
    v.canModifyRole({ uid: 'u1', clanId: 'clan-a', role: 'admin' }, 'clan-a', 'member', 'captain'),
    true
  );

  // XSS sanitization
  const clean = v.sanitizePlainText('<script>alert(1)</script>javascript:bad onclick=evil() Safe');
  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.toLowerCase().includes('javascript:'));
  assert.ok(!clean.toLowerCase().includes('onclick='));

  // SEO noindex gates
  assert.equal(
    v.isRouteIndexable({
      isDraft: true,
      isPrivate: false,
      hasDuplicateFilterParams: false,
      evidenceClass: 'official',
      hasVerifiedSubstantiveContent: true,
    }),
    false
  );
  assert.equal(
    v.isRouteIndexable({
      isDraft: false,
      isPrivate: false,
      hasDuplicateFilterParams: false,
      evidenceClass: 'unverified',
      hasVerifiedSubstantiveContent: true,
    }),
    false
  );

  // MW4 build validator: ranked unknown when official rules not published + patch diff invalidation
  const res = v.validateMw4Build(
    {
      id: 'b1',
      name: 'Test',
      primaryWeapon: 'M4 Base Frame (AR)',
      attachments: ['APEX M16 Burst Conversion'],
      tactical: 'Stun Grenade',
      lethal: 'Semtex',
      fieldUpgrade: 'Dead Silence',
      patchVersion: 'S1',
    },
    ['APEX M16 Burst Conversion'],
    false
  );
  assert.equal(res.cdlV1Legal, false);
  assert.equal(res.rankedLegalStatus, 'unknown_pending_official_rules');
  assert.equal(res.outdatedByPatch, true);

  // Staleness check
  assert.equal(v.isEntryStale('2025-01-01T00:00:00Z', 30, new Date('2026-11-27T00:00:00Z')), true);
  assert.equal(v.isEntryStale('2026-11-26T00:00:00Z', 30, new Date('2026-11-27T00:00:00Z')), false);
});

// 6. Verify Universal Search handles abbreviations, typos, developer APIs, and games
test('Universal search resolves API-connected games, developer portals, and typos', async () => {
  const ts = await import('esbuild');
  const built = ts.buildSync({
    entryPoints: [path.join(root, 'src/lib/universalSearch.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  const modUrl = `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`;
  const s = await import(modUrl);

  const q1 = s.runUniversalSearch('Best MW4 Ranked AR build');
  assert.ok(q1.grouped['Weapon Builds & Meta'].length > 0, 'MW4 AR build search failed');

  const q2 = s.runUniversalSearch('developer api riot');
  assert.ok(q2.grouped['Patches & Ranked Intel'].some((r) => r.path === '/developers'), 'Developer hub search failed');

  const q3 = s.runUniversalSearch('Valorent competitive maps');
  assert.ok(q3.grouped.Games.some((g) => g.title === 'VALORANT'), 'Typo tolerance for Valorent failed');

  const q4 = s.runUniversalSearch('chess');
  assert.ok(q4.grouped.Games.some((g) => g.title === 'Chess.com'), 'Chess.com search failed');
});

// 7. Verify billing disabled & no fake live partner adapters
test('All partner adapters disabled-by-default and billing disabled in pricing tests', () => {
  const pipe = fs.readFileSync(path.join(root, 'src/data/intelligencePipeline.ts'), 'utf8');
  assert.ok(!pipe.includes('credentialsConfigured: true'), 'Partner credentials must stay false');
  assert.ok(pipe.includes('Billing Disabled'), 'Pricing experiments must remain billing-disabled');
});

// 8. Verify Master Directive datasets: 8 candidate CDL maps, 5 candidate MW4 weapons, 8 evidence classes, strategies, equipment disclosure, and search indexing
test('Master Directive datasets & search cover 8 CDL candidate maps, 5 candidate weapons, strategies, news, and equipment', async () => {
  const ts = await import('esbuild');
  const pipeBuilt = ts.buildSync({
    entryPoints: [path.join(root, 'src/data/intelligencePipeline.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  const pipeMod = await import(
    `data:text/javascript;base64,${Buffer.from(pipeBuilt.outputFiles[0].text).toString('base64')}`
  );

  const cdlCandidates = pipeMod.MW4_MAP_ENUMERATION.filter(
    (m) => m.cdlCandidateStatus && m.cdlCandidateStatus.startsWith('Candidate')
  );
  assert.equal(cdlCandidates.length, 8, 'Must enumerate all 8 candidate CDL maps');
  for (const m of cdlCandidates) {
    assert.ok(m.officialGuideUrl?.startsWith('https://www.callofduty.com/guides/modernwarfare4/'), `Missing candidate guide URL for ${m.name}`);
  }

  assert.equal(pipeMod.MW4_CANDIDATE_WEAPONS.length, 5, 'Must include all 5 discussed MW4 candidate weapons');
  assert.equal(pipeMod.EVIDENCE_CLASSIFICATION_LEGEND.length, 8, 'Must include all 8 evidence classification labels');
  assert.ok(pipeMod.STRATEGY_TEMPLATES.length >= 7, 'Must provide competitive strategy templates');
  assert.ok(pipeMod.VERIFIED_NEWS_ITEMS.length >= 4, 'Must provide verified gaming news entries');
  assert.ok(pipeMod.EQUIPMENT_GUIDE_ITEMS.length >= 7, 'Must cover all 7 equipment categories');
  for (const eq of pipeMod.EQUIPMENT_GUIDE_ITEMS) {
    assert.ok(eq.affiliateStatus.includes('Disabled'), `Affiliate link must remain disabled for ${eq.name}`);
  }

  const searchBuilt = ts.buildSync({
    entryPoints: [path.join(root, 'src/lib/universalSearch.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  const searchMod = await import(
    `data:text/javascript;base64,${Buffer.from(searchBuilt.outputFiles[0].text).toString('base64')}`
  );
  assert.ok(
    searchMod.runUniversalSearch('hardpoint rotation').grouped['Maps & Tactical Boards'].some((r) => r.path === '/strategies'),
    'Universal search must surface Strategy Library'
  );
  assert.ok(
    searchMod.runUniversalSearch('equipment monitor').grouped['Weapon Builds & Meta'].some((r) => r.path === '/equipment'),
    'Universal search must surface Equipment Guide'
  );
  assert.ok(
    searchMod.runUniversalSearch('gaming news').grouped['Patches & Ranked Intel'].some((r) => r.path === '/news'),
    'Universal search must surface Gaming News'
  );
});

void runAll();
