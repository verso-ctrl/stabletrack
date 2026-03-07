/**
 * db-explain.ts
 * Run with: npm run db:explain
 *
 * Uses PostgreSQL EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) to measure
 * TRUE server-side execution time. Network latency is NOT included —
 * these numbers reflect actual PostgreSQL work, so they're meaningful
 * whether you run this from your laptop or a server.
 *
 * Also reports whether each query uses an Index Scan or a Seq Scan,
 * which confirms that your indexes are actually being used.
 *
 * Server-side thresholds:
 *   ✅  < 5ms   — great
 *   ⚠️  5–20ms  — acceptable
 *   ❌  > 20ms  — investigate (likely a missing index or bad query shape)
 *
 * Note: With very small seed data PostgreSQL may choose Seq Scan over
 * an Index Scan — this is correct behavior (seq scan wins on tiny tables).
 * Seq Scans only become a problem once a table has thousands of rows.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Terminal helpers ──────────────────────────────────────────────────────────

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';

function badge(ms: number): string {
  if (ms < 5)  return `${GREEN}✅ ${ms.toFixed(2)}ms${RESET}`;
  if (ms < 20) return `${YELLOW}⚠️  ${ms.toFixed(2)}ms${RESET}`;
  return `${RED}❌ ${ms.toFixed(2)}ms${RESET}`;
}

// ─── Plan node types ──────────────────────────────────────────────────────────

type PlanNode = {
  'Node Type': string;
  'Relation Name'?: string;
  'Index Name'?: string;
  'Actual Rows': number;
  'Plan Rows': number;
  'Actual Loops': number;
  'Actual Total Time': number;
  Plans?: PlanNode[];
};

type ExplainRow = {
  'QUERY PLAN': Array<{
    Plan: PlanNode;
    'Planning Time': number;
    'Execution Time': number;
  }>;
};

function allNodes(node: PlanNode): PlanNode[] {
  return [node, ...(node.Plans || []).flatMap(allNodes)];
}

// ─── Core explain runner ───────────────────────────────────────────────────────

async function explain(label: string, sql: string): Promise<number> {
  const raw = await prisma.$queryRawUnsafe<ExplainRow[]>(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`
  );

  // Prisma returns the JSON column already parsed, but guard for string case
  const queryPlan = raw[0]['QUERY PLAN'];
  const top = Array.isArray(queryPlan) ? queryPlan[0] : JSON.parse(queryPlan as unknown as string)[0];

  const execMs: number = top['Execution Time'];
  const planMs: number = top['Planning Time'];
  const nodes = allNodes(top.Plan);

  const seqScans  = nodes.filter(n => n['Node Type'] === 'Seq Scan');
  const idxScans  = nodes.filter(n => n['Node Type'].startsWith('Index'));

  console.log(`  ${BOLD}${label}${RESET}`);
  console.log(`    exec=${badge(execMs)}  planning=${DIM}${planMs.toFixed(2)}ms${RESET}`);

  if (idxScans.length > 0) {
    const names = [...new Set(idxScans.map(n => n['Index Name'] || n['Relation Name'] || '?'))];
    console.log(`    ${GREEN}Index scan: ${names.join(', ')}${RESET}`);
  }

  for (const scan of seqScans) {
    const rows = (scan['Actual Rows'] ?? 0) * (scan['Actual Loops'] ?? 1);
    const t    = (scan['Actual Total Time'] ?? 0).toFixed(2);
    const rel  = scan['Relation Name'] ?? '?';
    if (rows > 500) {
      console.log(`    ${RED}⚠ Seq scan on "${rel}" — ${rows} rows in ${t}ms  ← add an index here${RESET}`);
    } else {
      console.log(`    ${DIM}Seq scan on "${rel}" — ${rows} rows (tiny table, planner prefers seq scan)${RESET}`);
    }
  }

  return execMs;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${CYAN}${BOLD}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}${BOLD}  BarnKeep DB — EXPLAIN ANALYZE${RESET}`);
  console.log(`${CYAN}${BOLD}  Server-side timing only · No network included${RESET}`);
  console.log(`${CYAN}${BOLD}═══════════════════════════════════════════════════${RESET}\n`);

  // Seed data discovery
  const firstBarn = await prisma.barn.findFirst({ include: { horses: { take: 1 } } });
  if (!firstBarn) {
    console.error(`${RED}No barn data found. Run npm run db:seed first.${RESET}`);
    process.exit(1);
  }

  const barnId  = firstBarn.id;
  const horseId = firstBarn.horses[0]?.id ?? null;

  const now       = new Date();
  const today     = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const in30days   = new Date(Date.now() + 30 * 86400_000);

  console.log(`  Barn:  ${BOLD}${firstBarn.name}${RESET} (${barnId})`);
  if (horseId) console.log(`  Horse: ${BOLD}${horseId}${RESET}`);
  console.log();

  const scores: Record<string, number> = {};

  // ── 1. Horse queries ───────────────────────────────────────────────────────
  console.log(`${BOLD}1. Horse Queries${RESET}`);

  scores['horse_list'] = await explain('List all horses in barn', `
    SELECT h.id, h."barnName", h.status, h."stallId", h."profilePhotoUrl"
    FROM "Horse" h
    WHERE h."barnId" = '${barnId}'
    ORDER BY h."barnName" ASC
  `);

  scores['horse_by_status'] = await explain('Active + layup horses for barn', `
    SELECT h.id, h."barnName", h.status
    FROM "Horse" h
    WHERE h."barnId" = '${barnId}' AND h.status IN ('ACTIVE', 'LAYUP')
    ORDER BY h."barnName" ASC
  `);

  if (horseId) {
    scores['horse_detail'] = await explain('Single horse by id', `
      SELECT h.*
      FROM "Horse" h
      WHERE h.id = '${horseId}'
    `);
  }
  console.log();

  // ── 2. Team ────────────────────────────────────────────────────────────────
  console.log(`${BOLD}2. Team${RESET}`);

  scores['members'] = await explain('Active members for barn', `
    SELECT bm.id, bm.role, bm.status, bm."userId"
    FROM "BarnMember" bm
    WHERE bm."barnId" = '${barnId}' AND bm.status = 'ACTIVE'
    ORDER BY bm."joinedAt" ASC
  `);
  console.log();

  // ── 3. Health & Medical ────────────────────────────────────────────────────
  console.log(`${BOLD}3. Health & Medical${RESET}`);

  if (horseId) {
    scores['medications_active'] = await explain('Active medications for horse', `
      SELECT m.*
      FROM "Medication" m
      WHERE m."horseId" = '${horseId}' AND m.status = 'ACTIVE'
      ORDER BY m."startDate" DESC
    `);

    scores['medications_all'] = await explain('All medications for horse', `
      SELECT m.*
      FROM "Medication" m
      WHERE m."horseId" = '${horseId}'
      ORDER BY m."startDate" DESC
    `);

    scores['vaccinations'] = await explain('Vaccination history for horse', `
      SELECT v.*
      FROM "Vaccination" v
      WHERE v."horseId" = '${horseId}'
      ORDER BY v."dateGiven" DESC
    `);

    scores['health_records'] = await explain('Health records for horse', `
      SELECT hr.*
      FROM "HealthRecord" hr
      WHERE hr."horseId" = '${horseId}'
      ORDER BY hr.date DESC
    `);

    scores['weight_records'] = await explain('Weight history for horse', `
      SELECT wr.*
      FROM "WeightRecord" wr
      WHERE wr."horseId" = '${horseId}'
      ORDER BY wr.date DESC
      LIMIT 20
    `);
  }

  scores['vax_due_30d'] = await explain('Vaccinations due in next 30 days (barn-wide alert)', `
    SELECT v.id, v."horseId", v.type, v."nextDueDate"
    FROM "Vaccination" v
    WHERE v."nextDueDate" <= '${in30days.toISOString()}'
      AND v."horseId" IN (
        SELECT id FROM "Horse" WHERE "barnId" = '${barnId}'
      )
    ORDER BY v."nextDueDate" ASC
  `);

  scores['meds_refill'] = await explain('Medications needing refill (barn-wide alert)', `
    SELECT m.id, m."horseId", m.name, m."refillsRemaining"
    FROM "Medication" m
    WHERE m.status = 'ACTIVE'
      AND m."refillsRemaining" IS NOT NULL
      AND m."refillsRemaining" <= 2
      AND m."horseId" IN (
        SELECT id FROM "Horse" WHERE "barnId" = '${barnId}'
      )
  `);
  console.log();

  // ── 4. Feed chart ──────────────────────────────────────────────────────────
  console.log(`${BOLD}4. Feed Chart${RESET}`);

  scores['feed_chart'] = await explain('Horses with feed programs (chart load)', `
    SELECT h.id, h."barnName", fp.id AS "feedProgramId", fp.instructions
    FROM "Horse" h
    JOIN "FeedProgram" fp ON fp."horseId" = h.id
    WHERE h."barnId" = '${barnId}' AND h.status IN ('ACTIVE', 'LAYUP')
    ORDER BY h."barnName" ASC
  `);

  scores['feed_items'] = await explain('Feed program items for barn (chart detail)', `
    SELECT fpi.*, fp."horseId"
    FROM "FeedProgramItem" fpi
    JOIN "FeedProgram" fp ON fp.id = fpi."feedProgramId"
    JOIN "Horse" h ON h.id = fp."horseId"
    WHERE h."barnId" = '${barnId}'
  `);

  scores['feed_logs_today'] = await explain("Today's feed logs for barn", `
    SELECT fl.id, fl."horseId", fl."feedingTime", fl."amountEaten", fl."loggedAt"
    FROM "FeedLog" fl
    WHERE fl."horseId" IN (SELECT id FROM "Horse" WHERE "barnId" = '${barnId}')
      AND fl."loggedAt" >= '${today.toISOString()}'
      AND fl."loggedAt" < '${tomorrow.toISOString()}'
  `);
  console.log();

  // ── 5. Events & Tasks ─────────────────────────────────────────────────────
  console.log(`${BOLD}5. Events & Tasks${RESET}`);

  scores['events_month'] = await explain('Events for current month', `
    SELECT e.id, e.title, e."scheduledDate", e.status, e.type
    FROM "Event" e
    WHERE e."barnId" = '${barnId}'
      AND e."scheduledDate" >= '${monthStart.toISOString()}'
      AND e."scheduledDate" <= '${monthEnd.toISOString()}'
    ORDER BY e."scheduledDate" ASC
  `);

  scores['events_overdue'] = await explain('Overdue events (dashboard alert)', `
    SELECT e.id, e.title, e."scheduledDate"
    FROM "Event" e
    WHERE e."barnId" = '${barnId}'
      AND e.status = 'SCHEDULED'
      AND e."scheduledDate" < '${now.toISOString()}'
    ORDER BY e."scheduledDate" ASC
    LIMIT 20
  `);

  scores['tasks_open'] = await explain('Open tasks for barn', `
    SELECT t.id, t.title, t.status, t.priority, t."dueDate", t."assigneeId"
    FROM "Task" t
    WHERE t."barnId" = '${barnId}' AND t.status != 'DONE'
    ORDER BY t.priority DESC, t."dueDate" ASC
  `);
  console.log();

  // ── 6. Daily Care ─────────────────────────────────────────────────────────
  console.log(`${BOLD}6. Daily Care${RESET}`);

  scores['daily_health_checks'] = await explain("Today's health checks for barn", `
    SELECT dhc.*
    FROM "DailyHealthCheck" dhc
    WHERE dhc."horseId" IN (SELECT id FROM "Horse" WHERE "barnId" = '${barnId}')
      AND dhc.date >= '${today.toISOString()}'
      AND dhc.date < '${tomorrow.toISOString()}'
  `);

  scores['turnouts_active'] = await explain('Current turnouts for barn', `
    SELECT ht.id, ht."horseId", ht."paddockId", ht."startTime"
    FROM "HorseTurnout" ht
    WHERE ht."horseId" IN (SELECT id FROM "Horse" WHERE "barnId" = '${barnId}')
      AND ht."endTime" IS NULL
  `);
  console.log();

  // ── 7. Activity log ───────────────────────────────────────────────────────
  console.log(`${BOLD}7. Activity Log${RESET}`);

  scores['activity_recent'] = await explain('Recent activity for barn', `
    SELECT al.id, al.type, al.description, al."createdAt", al."userId"
    FROM "ActivityLog" al
    WHERE al."barnId" = '${barnId}'
    ORDER BY al."createdAt" DESC
    LIMIT 20
  `);

  scores['activity_by_type'] = await explain('Activity filtered by type + barn', `
    SELECT al.id, al.type, al.description, al."createdAt"
    FROM "ActivityLog" al
    WHERE al."barnId" = '${barnId}' AND al.type = 'MEDICATION_ADDED'
    ORDER BY al."createdAt" DESC
    LIMIT 20
  `);
  console.log();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`${CYAN}${BOLD}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}Summary (server-side only)${RESET}\n`);

  const vals = Object.values(scores);
  const avg  = vals.reduce((s, v) => s + v, 0) / vals.length;
  const slowest = Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 3);

  console.log(`  Queries tested:       ${vals.length}`);
  console.log(`  Overall avg exec:     ${badge(avg)}`);
  console.log(`  Queries under 5ms:    ${GREEN}${vals.filter(v => v < 5).length}${RESET}`);
  console.log(`  Queries 5–20ms:       ${YELLOW}${vals.filter(v => v >= 5 && v < 20).length}${RESET}`);
  console.log(`  Queries over 20ms:    ${RED}${vals.filter(v => v >= 20).length}${RESET}`);

  console.log(`\n  ${BOLD}Slowest (server-side):${RESET}`);
  slowest.forEach(([name, ms]) => {
    console.log(`    ${badge(ms)}  ${name}`);
  });

  console.log(`\n  ${BOLD}Thresholds:${RESET}`);
  console.log(`    ${GREEN}✅ < 5ms${RESET}   — fast (PostgreSQL doing very little work)`);
  console.log(`    ${YELLOW}⚠️  5–20ms${RESET}  — acceptable, check for seq scans`);
  console.log(`    ${RED}❌ > 20ms${RESET}  — investigate, likely a missing index or N+1`);
  console.log(`\n  ${DIM}Seq scans on tiny seed data are normal — PostgreSQL`);
  console.log(`  skips indexes when a full table scan is faster.`);
  console.log(`  Index scans become critical at 1,000+ rows per table.${RESET}\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
