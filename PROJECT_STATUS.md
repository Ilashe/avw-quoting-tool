# AVW Equipment Configurator — Project Status & Handoff

Last updated: 2026-07-06

---

## 1. What We're Trying to Achieve

AVW Equipment Co. Inc needs a standalone web-based car wash equipment configurator to replace
their manual quoting process.

**Origin:** The client saw a demo of Tommy Car Wash Systems' Oracle NetSuite CPQ (Configure
Price Quote) configurator in an internal meeting (source: `Recording 2026-06-15 124224.txt`
transcript). Someone in that meeting suggested using Claude + an Excel equipment catalog to
build an equivalent tool in-house instead of buying NetSuite.

**Why build instead of buy:**
| | Tommy's NetSuite CPQ | This tool |
|---|---|---|
| Cost | $150,000+/yr | ~$50/mo (Vercel + Supabase) |
| Quote generation time | 10–15 minutes | Instant |
| Distributor access | Requires NetSuite seat license | Just a login |

**What the tool does:**
- Walks a salesperson or distributor through a tabbed, section-by-section equipment selection
  process (General → Equipment → Backroom → Vacuum → POS → Controller → Items)
- Applies dependency logic: selecting one option reveals/hides/excludes others automatically
- Builds a live itemized price summary in real time as selections are made
- Saves quotes with unique IDs (`AVW-2026-001`) and full revision history (B1 → B2 → B3),
  never overwriting old revisions
- Restricts access via login, with three roles: admin, salesperson, distributor

---

## 2. Tech Stack (decided)

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | User's proven stack |
| Styling | Tailwind CSS | Fast, matches dense configurator layout |
| State | Zustand | Complex cross-tab state without prop drilling |
| Database | Supabase (PostgreSQL) | Quote storage, revisions, multi-user, RLS |
| Auth | Supabase Auth | Role-based access |
| PDF (Phase 11, deferred) | @react-pdf/renderer | Proforma Invoice + Proposal |
| Deployment | Vercel | Instant deploys, free tier |

Installed dependencies beyond the Next.js defaults: `zustand`, `@supabase/supabase-js`,
`@supabase/ssr`, `react-hook-form`, `zod`, `lucide-react`.

---

## 3. Brand / Visual Design

- Company: **AVW Equipment Co. Inc**
- Primary color: Dark navy `#1a2332` (top bar, tabs)
- Accent color: Red `#cc2229` (active tab, buttons, highlights)
- Background: Light gray `#f4f5f7`
- Panel: White for sections, dark sidebar for summary panel
- Text: Dark charcoal on light backgrounds, white on dark backgrounds

### Interface Layout (mirrors Tommy's NetSuite configurator)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AVW Logo │ Quote: AVW-2026-001-B1   Units: 0  Total: $0  [Save ▼] │  ← Top Bar
├──────────────────────────────────────────────────────────┬──────────┤
│ [General] [Equipment] [Backroom] [Vacuum] [POS] [Controller] [Items]│  ← Tab Nav
├──────────────────────────────────────────────────────────┬──────────┤
│   ┌─ Section: Conveyor ─────────────────────────── [▼] ┐ │ Summary  │
│   │  Conveyor Type: [dropdown]                          │ │ ────────│
│   │  Conveyor Length: [40ft ▼]                          │ │ Item    │
│   └─────────────────────────────────────────────────────┘ │ $0.00   │
│   ┌─ Section: Pre-Soak ──────────────────────────── [▼] ┐ │ ────────│
│   │  Pre-Soak Type: ○ None ○ Single ○ Double ○ Triple   │ │ TOTAL   │
│   │  Sign Panel: [dropdown]  [shows when not None]       │ │ $0.00   │
│   └─────────────────────────────────────────────────────┘ │         │
├───────────────────────────────────────────────────────────┴─────────┤
│  [← Back]                                          [Next → Backroom] │  ← Footer Nav
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Supabase — NOT yet created)

```sql
-- User profiles with roles
profiles (
  id uuid references auth.users,
  full_name text,
  role text CHECK (role IN ('admin', 'salesperson', 'distributor')),
  company text,
  created_at timestamptz
)

-- Equipment categories (tabs and sections)
categories (
  id uuid,
  tab text,          -- 'equipment' | 'backroom' | 'vacuum' | 'pos' | 'controller'
  section text,      -- 'conveyor' | 'pre_soak' | 'arches' etc.
  display_name text,
  sort_order int
)

-- Equipment items (the catalog)
equipment_items (
  id uuid,
  sku text UNIQUE,
  name text,
  description text,
  category_id uuid references categories,
  unit_price numeric,
  is_active boolean,
  metadata jsonb     -- extra fields (dimensions, weight, etc.)
)

-- Selectable options per equipment item
equipment_options (
  id uuid,
  item_id uuid references equipment_items,
  option_key text,   -- e.g. 'conveyor_type', 'presoak_count'
  option_label text,
  option_value text,
  price_modifier numeric DEFAULT 0,
  sort_order int
)

-- Dependency rules (the logic engine)
dependency_rules (
  id uuid,
  rule_name text,
  trigger_field text,
  trigger_value text,
  action_type text,  -- 'show' | 'hide' | 'require' | 'set_value' | 'exclude'
  target_field text,
  target_value text  -- for set_value actions
)

-- Quote headers
quotes (
  id uuid,
  quote_number text UNIQUE,   -- 'AVW-2026-001'
  customer_name text,
  ship_to_state text,
  ship_to_country text,
  project_type text,
  status text CHECK (status IN ('draft','submitted','approved','won','lost')),
  created_by uuid references profiles,
  created_at timestamptz,
  updated_at timestamptz
)

-- Revision snapshots (every save = new revision, never overwritten)
quote_revisions (
  id uuid,
  quote_id uuid references quotes,
  revision_label text,         -- 'B1', 'B2', 'B3'
  config_snapshot jsonb,       -- complete selections across all 7 tabs at save time
  line_items jsonb,            -- computed items + prices
  total_price numeric,
  saved_by uuid references profiles,
  saved_at timestamptz,
  notes text
)
```

---

## 5. Dependency Logic Engine

Rules live in the `dependency_rules` Supabase table **and** are mirrored in
`lib/rules/defaultRules.ts` as seed data. A `useConfiguratorRules` hook re-evaluates all rules
on every field change.

**Action types:** `show` | `hide` | `require` | `set_value` | `exclude`

**Example rules pulled from the Tommy NetSuite demo transcript:**
```ts
// Water Treatment Center auto-excludes standalone reclaim + RO
{ trigger_field: 'water_treatment', trigger_value: 'avw_water_treatment',
  action_type: 'hide', target_field: 'standalone_reclaim' }

// Hydraulic drive shows hydraulic pump options
{ trigger_field: 'equipment_drive_type', trigger_value: 'hydraulic',
  action_type: 'show', target_field: 'hydraulic_pump_section' }

// Triple pre-soak requires sign panel selection
{ trigger_field: 'presoak_count', trigger_value: 'triple',
  action_type: 'require', target_field: 'presoak_sign_panel' }
```

---

## 6. Quote ID + Revision System

- Quote number format: `AVW-YYYY-NNN` (e.g. `AVW-2026-001`)
- Revision label: `B1`, `B2`, `B3` — increments on every re-save after edits
- Every revision is immutable — full snapshot of all 7 tabs stored in `config_snapshot` JSONB
- Latest revision shown by default; older ones reachable via dropdown
- Revision diff view (Phase 9) highlights what changed between B1 and B2

---

## 7. Tab Structure & Fields

### Tab 1 — General
| Field | Type | Notes |
|---|---|---|
| Built with customer? | Radio | Yes / No / Test Quote |
| Customer Name | Text | Auto-populates quote header |
| Ship to State | Dropdown | US states |
| Ship to Country | Dropdown | Default: US |
| Project Type | Radio | New Build / Retrofit / Equipment Only |
| Project Contingency | Radio | Yes / No |
| Equipment Drive Type | Radio | Electric Motors / Hydraulic Drive |
| Site 3-Phase Voltage | Dropdown | 208V / 240V / 480V |
| Site Standard Voltage | Dropdown | 120V / 240V |
| Forklift Rental | Radio | Include / Not Included |

### Tab 2 — Equipment (collapsible accordion sections)
Conveyor (type, length 40–140ft, embeds) · Entrance Module · Pre-Soak (None/Single/Double/Triple
→ sign panel, LED color) · Combo Units (1, 2, 3) · High Pressure Arches (type, signage, color) ·
Paint & Rinse · Blowers & Starters · Heated Dryers · Drying Hoppers · Door Options · Ladder Rack ·
Balls & Colors · Install Options · Startup Detergents

### Tab 3 — Backroom
Detergent Dispenser (Hydroflex / Flow Pro / other) · Tank Sizes (55gal / 80gal, quantities) ·
Standalone Detergent Booster Pump · Primary Pumping Station · Secondary Pump · Main Booster Pump
· Trolley · Port Count · Air Compressors · **Water Treatment Center (auto-excludes standalone
reclaim/RO)** · Reclaim System · Reverse Osmosis · Softener · Deionization · Install & Startup

### Tab 4 — Vacuum
Number of Stalls · Spreader Bar Size (146"/116") · Colors · Canopies (Beck's styles) · Speakers ·
Backers/Graphics

### Tab 5 — POS
POS System type · Number of lanes · Gate system

### Tab 6 — Controller
Controller type (None / Standard / Advanced) · Controller options

### Tab 7 — Items (Hardware / Misc)
Manual line item additions · Quantity + price overrides · Discount field · Internal notes
(not shown on customer-facing output)

---

## 8. Folder Structure (created)

```
avw-quoting-tool/
├── app/
│   ├── (auth)/login/page.tsx              ← not yet created
│   ├── (app)/
│   │   ├── layout.tsx                     ← protected layout, not yet created
│   │   ├── quotes/page.tsx                ← quote dashboard, not yet created
│   │   ├── quotes/[id]/page.tsx           ← configurator for existing quote, not yet created
│   │   ├── new/page.tsx                   ← start new quote, not yet created
│   │   └── admin/catalog/page.tsx         ← catalog CRUD, not yet created
│   └── api/quotes/route.ts                ← not yet created
├── components/
│   ├── configurator/
│   │   ├── TopBar.tsx, TabNav.tsx, SummaryPanel.tsx, SectionAccordion.tsx  (not yet created)
│   │   ├── tabs/GeneralTab.tsx ... ItemsTab.tsx                           (not yet created)
│   │   └── fields/RadioGroup.tsx, SelectField.tsx, ConditionalField.tsx   (not yet created)
│   └── ui/                                ← shared primitives, not yet created
├── lib/
│   ├── supabase/client.ts, server.ts, middleware.ts   (not yet created)
│   ├── rules/engine.ts, defaultRules.ts               (not yet created)
│   └── quotes/generateId.ts, diffRevisions.ts         (not yet created)
├── store/
│   ├── configuratorStore.ts, quoteStore.ts, summaryStore.ts  (not yet created)
└── types/equipment.ts, quote.ts, rules.ts             (not yet created)
```

All directories above already exist on disk (empty, awaiting Phase 1+ content). The
`(auth)` and `(app)` route groups and `api/quotes` folder exist but have no files in them yet.

---

## 9. 12-Phase Build Plan & Current Status

| # | Phase | Status |
|---|---|---|
| 0 | Initialize Next.js + install deps + folder structure | ✅ **DONE** (2026-06-18) |
| 1 | Supabase schema + Auth + login page | ✅ **DONE** (2026-06-19) — see notes below |
| 2 | App shell: TopBar, TabNav, SummaryPanel, layout | ✅ **DONE** (2026-06-19) — see notes below |
| 3 | Zustand stores + dependency rules engine | ✅ **DONE** (2026-06-24) — see notes below |
| 4 | General Tab (all fields, validation, Zustand wired) | 🔶 **PARTIAL** (2026-06-28) — fields wired; Ship to State/Country removed; Ship to Address (Google Places autocomplete) added; validation still pending |
| 5 | Admin catalog panel (CRUD + CSV import) | pending |
| 6 | Equipment Tab (all accordion sections, live prices) | 🔶 **PARTIAL** (2026-06-28) — Conveyor, Belt Specs, Entrance Module, Presoak, High Pressure Equipment done; Friction Equipment = placeholder (specs not provided); remaining Equipment sub-tabs pending client data; no pricing yet |
| 7 | Backroom Tab (incl. Water Treatment dependency) | 🔶 **PARTIAL** (2026-07-01) — migration 0007 written; Hydraulics + Water sections seeded; HP Equipment extended; run 0007 in Supabase SQL Editor to apply |
| 8 | Vacuum + 2 NEW tabs (Fixtures & Signs, Misc Tunnel Equipment) + POS + Controller | 🔶 **PARTIAL** (2026-06-28) — Vacuum/POS/Controller = placeholders; Fixtures & Signs + Misc Tunnel Equipment tabs added as placeholders; all 5 await client catalog data |
| 9 | Quote management: save/load/revisions/dashboard/diff | ✅ **COMPLETE** (2026-06-30) — auto-save, quotes table + RLS, dashboard with greeting/stats/cards/sort/search/pin/clone/delete, Finish flow, splash screen, key={quoteId} remount guard |
| 10 | Items tab: manual line items, discounts, notes | pending |
| 11 | PDF generation: Proforma Invoice + Proposal (DEFERRED) | deferred — starts after Phase 9 validated |
| 12 | Polish, error handling, Vercel deploy | pending |

### What we did in Phase 0 (step by step)
1. Ran `npx create-next-app@latest` with TypeScript, Tailwind, App Router, ESLint, no `src/`
   directory, `@/*` import alias, npm as package manager.
2. Installed extra dependencies: `zustand @supabase/supabase-js @supabase/ssr react-hook-form
   zod lucide-react`.
3. Created the full folder skeleton listed in section 8 (route groups, component folders, lib
   subfolders, store/, types/).
4. Added `.env.local.example` with placeholders for `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Verified `npm run dev` boots and serves the default Next.js page (200 OK).
6. Hit a Turbopack "workspace root" warning because a stray `package-lock.json` exists one
   level up in `Documents/` (outside this project, not something we control) — fixed by setting
   `turbopack: { root: __dirname }` in `next.config.ts`.
7. **Folder rename (2026-06-18):** Project folder was renamed from `new-project` to
   `avw-quoting-tool` per user request. Used `robocopy /MOVE` because a direct `mv`/
   `Rename-Item` failed — this session's shell processes keep their working directory pinned to
   the original path, holding an OS-level lock on it. All files copied/moved successfully into
   `avw-quoting-tool`; re-verified `npm run dev` returns 200 from the new location. The old
   `new-project` folder is now an empty, locked husk that can't be deleted mid-session — it's
   harmless and can be deleted manually later from outside this session (e.g. in File Explorer).

### What we did in Phase 1 (step by step)
1. Received real Supabase project credentials from client; wrote `.env.local` (gitignored).
2. Found this Next.js version (16.2.9) renamed `middleware.ts` → `proxy.ts` — confirmed via the
   bundled docs (`node_modules/next/dist/docs`) per the `AGENTS.md` warning, and built session
   refresh / route protection as `proxy.ts` + `lib/supabase/middleware.ts` accordingly.
3. Built `lib/supabase/client.ts` (browser) and `server.ts` (server, async `cookies()`).
4. Wrote `supabase/migrations/0001_init.sql`: `profiles` (+ trigger to auto-create a row on
   signup, default role `salesperson`), `categories`, `equipment_items`, `equipment_options`,
   `dependency_rules`, `quotes`, `quote_revisions`, with RLS on every table.
5. Built login (`app/(auth)/login`) with a Zod-validated server action
   (`lib/auth/actions.ts`), and the protected app shell (`app/(app)/layout.tsx`) with a
   placeholder `/quotes` landing page.
6. **Brand pass:** client provided the real logo (`avw-logo.png`, circular blue/white seal,
   "AUTOMATIC VEHICLE WASH"). Replaced the placeholder navy/red palette with tokens drawn from
   the logo — `ink #0f2a4d`, `brand #1b4f9c`, `sky #3b72c4`, `mist #e8eef7`, `paper #f7f8fa` —
   defined in `app/globals.css` via Tailwind v4 `@theme`. Renamed the product from "Equipment
   Configurator" to **"Quoting Tool"** per client. Added Bebas Neue (`--font-display`) for
   badge-style headings/wordmark, echoing the logo's bold condensed seal lettering; kept Geist
   Sans for body copy and for the Sign In button specifically (client found the display font
   unclear/illegible at button size — confirmed font choice is scoped to headings only).
   Signature visual motif: faint concentric rings on the login page echoing the logo's seal.
7. **Caught and fixed a CSS bug:** `app/globals.css` originally had `--color-ink: var(--color-ink)`
   (self-referencing) inside `@theme inline`, silently breaking every `text-ink`/`bg-brand`/etc.
   utility (rendered as invisible/transparent). Fixed by moving static brand colors into a plain
   `@theme` block. Caught via an actual Playwright screenshot, not just a `tsc` pass — installed
   Playwright + Chromium ad hoc for this (not a project dependency, used as a one-off verification
   tool and cleaned up after).
8. **Caught and fixed a real RLS bug:** after creating the first admin user, the app shell kept
   showing "salesperson" instead of "admin" even though the `profiles` row was correctly set to
   `admin` (verified directly via a one-off service-role script). Root cause: the `profiles`
   SELECT policy checked "is this user an admin?" by querying `profiles` again, which re-triggers
   the same policy → Postgres error `42P17 infinite recursion detected in policy for relation
   "profiles"`. The query silently failed and the UI fell back to its `'salesperson'` default.
   Fixed in `supabase/migrations/0002_fix_profiles_rls_recursion.sql` with a `SECURITY DEFINER`
   `is_admin()` helper function (executes as table owner, bypasses RLS for that one lookup,
   breaking the recursion) — the standard Supabase-documented fix for this exact error. Migration
   confirmed applied and working (2026-06-19) — app shell now correctly shows "admin".
9. Confirmed two architecture decisions with the client (see section 10, items 7–8): single
   login for all roles (not separate admin/non-admin login flows), and "refresh-to-see" data
   freshness rather than Supabase Realtime push updates.

### What we did in Phase 2 (step by step)
1. Built `store/configuratorStore.ts` — a small Zustand store holding just `activeTab` and the
   7-tab order/labels (`general → equipment → backroom → vacuum → pos → controller → items`),
   with `setActiveTab` / `goNext` / `goBack`. Deliberately scoped to navigation only — unit
   count, total price, and selections are real state that Phase 3's pricing/dependency engine
   will own, not invented here as placeholder store fields.
2. Built `components/configurator/`: `TopBar.tsx` (quote number + revision label, static
   Units/Total display, disabled Save button), `TabNav.tsx` (7-tab strip wired to the store),
   `SummaryPanel.tsx` (right-hand sidebar, empty state for now), `FooterNav.tsx` (Back/Next,
   Next label shows the upcoming tab name, becomes a disabled "Save Quote" on the last tab),
   and `ConfiguratorShell.tsx` composing all of them plus the active tab's content.
3. Built one `TabPlaceholder.tsx` plus 7 thin tab components (`GeneralTab.tsx` …
   `ItemsTab.tsx`) under `components/configurator/tabs/`, each just naming which later phase
   builds its real fields (4, 6, 7, 8, 8, 8, 10 respectively) — so the shell has 7 real,
   independently swappable components to render rather than one big switch statement.
4. Wired the route: `app/(app)/quotes/[id]/page.tsx` renders `ConfiguratorShell`. The `[id]` is
   just used for display (uppercased into a fake quote number) until Phase 9 wires real
   persistence. Updated the `/quotes` placeholder to link to `/quotes/new` so there's something
   to click into.
5. Changed `(app)/layout.tsx` from `min-h-screen` to a fixed `h-screen` with `overflow-hidden`
   on `<main>`, so the configurator's tab content and summary panel scroll independently inside
   a fixed-height shell instead of the whole page scrolling — needed for the TopBar/TabNav/
   FooterNav to stay pinned while a tab's content scrolls.
6. **Verified in an actual browser, not just `tsc`:** logged in via Playwright (reused from the
   Phase 1 ad hoc install, still not a project dependency) against a temporary throwaway test
   account created and deleted via the service-role key — deliberately did **not** touch the
   real admin account's password to do this. Screenshotted the General tab and confirmed
   clicking "Equipment" in the tab strip correctly swaps content, restyles the active tab, and
   updates the footer's "Next →" label to the following tab. All verification scripts and
   screenshots deleted after use.

### What we did in Phase 3/4/6 (step by step) — 2026-06-24
Client sent the first batch of real catalog data ("AVW Quoting Tool Logic 6.23.2026.docx",
reorganized into `Main Tabs.txt`), covering the **General** tab and five **Equipment** sub-tabs:
Conveyor, Belt Specifications, Entrance Module, Presoak, High Pressure Equipment. ("Friction" is
explicitly undefined in the source — left as a "coming soon" placeholder.) Client will keep
sending more catalog data in batches; **each batch should update both the DB seed migration and
the relevant tab UI**, not just one or the other.

1. Built the real dependency rules engine instead of placeholder Phase 3 scaffolding directly
   against this real data: `types/equipment.ts` (Category/EquipmentItem/EquipmentOption/
   DependencyRule types), `store/selectionsStore.ts` (flat Zustand `field_key -> value` map,
   replaces the need for per-tab state), `lib/rules/engine.ts` (pure functions: `isFieldVisible`,
   `isFieldRequired`, `getExcludedOptionValues`, `getForcedValue` — generically support all 5
   action types: show/hide/require/set_value/exclude), `lib/rules/defaultRules.ts` (hand-kept
   code mirror of the seeded DB rules, per decision #2).
2. **General tab is NOT catalog-driven** — its 7 fields (Customer, Ship to State, Ship to
   Country, Equipment Drive Type, Site 3-Phase Voltage, Site Standard Voltage, Liftgate
   Required) are fixed quote-header attributes, not priced equipment, so they live in
   `lib/configurator/generalFields.ts` as a plain TS array, not in `equipment_items`. This
   replaces the earlier *guessed* General tab field list from the original phase-0 planning
   doc — the client-provided list is now authoritative.
3. Equipment sub-tab fields **are** catalog-driven (admin-editable later): seeded via
   `supabase/migrations/0003_equipment_conveyor_belt_entrance_presoak_hp.sql` — 5 categories,
   27 equipment_items (one per field, `metadata.field_key`/`widget` drive rendering), their
   options, and 7 dependency_rules. **No pricing data provided yet — every item/option seeded
   at $0**, to be updated in a separate pricing data drop. Migration is written to be
   re-runnable (deletes its own batch by `sku`/`rule_name` prefix before re-inserting), since
   more fields will be added to these same sections later.
4. Built generic field components (`components/configurator/fields/`: `TextField`,
   `RadioGroup`, `SelectField`, `NumberField`) and `SectionAccordion.tsx`, used by both the
   General tab (static fields) and Equipment tab (catalog-driven fields) so there's one set of
   styled inputs, not two.
5. Built `lib/catalog/useEquipmentCatalog.ts` — client-side fetch (categories + items +
   options + rules) for a given tab, consistent with the "refresh-to-see" decision (#8), no
   realtime subscriptions.
6. Built the real `GeneralTab.tsx` and `EquipmentTab.tsx`, replacing their Phase-2
   placeholders. `EquipmentTab` renders one `SectionAccordion` per category plus a static
   "Friction — coming soon" accordion at the end.
7. **Confirmed field-level specifics with the client during this session** (carry these
   forward — not in the source doc itself):
   - Conveyor Length is a free numeric input in **inches** (not feet, despite the source doc's
     `'` mark and despite this seeming short for a conveyor — client explicitly confirmed
     inches twice), range 40–165, with a "contact support" helper message outside that range.
   - Avalanche's dependency on Presoak is **not yet fully specified** — every option shows
     unconditionally for now; revisit once the client provides the full logic.
   - Flight Spacing options are constrained by the selected Flight Size: 1in→{1in,1.25in},
     1.25in→{1in,1.25in}, 1.5in→{1in,1.25in,1.5in}, 2in→all four; Flight Size=No hides the
     Flight Spacing field entirely. Implemented as 5 `exclude` rules + 1 `hide` rule.
   - Pricing is confirmed to be a separate, later data drop — fine to seed catalog
     fields/options at $0 now.
8. **Caught and fixed a real rules-engine bug during browser verification:** CTA Type was
   seeded with a `hide` rule (`cta=no → hide cta_type`), which left it incorrectly *visible*
   before CTA had been answered at all (selections start at `null`, which never equals `'no'`).
   Fixed by changing it to a `show` rule (`cta=yes → show cta_type`), making it default-hidden
   instead — the correct semantics whenever a field should only appear after a specific
   trigger value, vs. fields that are default-visible and hidden by a specific value.
9. **Verified in an actual browser** against the **real admin account** (client provided
   credentials directly this session) — logged in via Playwright, filled a General tab field,
   confirmed all 27 Equipment fields render across all 5 sections, and exercised the dependency
   logic end-to-end: CTA Type hidden until CTA=Yes, Flight Spacing's option list correctly
   shrinks/grows with Flight Size, Flight Spacing disappears entirely when Flight Size=No. Also
   hit and worked around a `next dev` Turbopack panic on this machine (Windows-specific
   `0xc0000142` child-process crash compiling `globals.css`) — verification was done against a
   production build (`next build` + `next start`) instead, which is unaffected. Verification
   script and screenshots deleted after use; no DB connection string is available to this
   assistant (only REST/anon/service-role keys), so **migrations must be run manually by the
   client in the Supabase SQL Editor** going forward, same as before.

### What we did 2026-06-24 (continued) — live Quote Summary + Turbopack fix
Client explicitly said we don't need to follow the 12-phase order strictly going forward — work
proceeds by whatever the client asks for next, catalog data keeps arriving incrementally, and
this file is the source of truth for "what's actually been built" regardless of phase number.

1. **Fixed the `next dev` Turbopack crash for real** (previously just worked around via
   `next build`/`next start`). Root cause, per the bundled Turbopack docs: PostCSS runs in a
   Node.js worker pool under Turbopack, and that worker process was crashing immediately on
   this machine (`0xc0000142`, a Windows DLL-init failure) — likely a Turbopack/Windows/Node-v24
   incompatibility. A clean `node_modules` reinstall (`npm ci`) did **not** fix it, ruling out
   stale binaries left over from the machine migration. Fix: `package.json`'s `dev` script is
   now `next dev --webpack` (Next's documented Turbopack opt-out) — confirmed working via a
   normal `npm run dev`. `next build`/`next start` are untouched and still use Turbopack for
   production (unaffected by this bug).
2. **Rebuilt `SummaryPanel.tsx`** (`components/configurator/SummaryPanel.tsx`) to be a live,
   rules-aware readout of every selected field across tabs, instead of a static empty-state
   placeholder:
   - Reads `lib/configurator/generalFields.ts` for General tab labels/options (always visible,
     no rules), and re-fetches the Equipment catalog via `useEquipmentCatalog('equipment')`
     for item names + option labels.
   - For each field with a non-null/non-empty value, resolves the **human-readable label**
     (not the raw `field_key`/`option_value`) — e.g. shows "Roller Correlator: Yes", not
     `roller_correlator: yes`.
   - Equipment fields are filtered through `isFieldVisible()` (the same dependency-rules
     engine the tab uses), so a value left over in a now-hidden field doesn't linger in the
     summary — confirmed via browser test: selecting CTA=Yes + CTA Type=Foaming shows both
     rows, then reverting CTA to No makes the "CTA Type" row disappear again even though its
     stored value (`foaming`) is technically still sitting in the Zustand store.
   - Total still hardcoded at $0.00 — no pricing data yet (see blockers).
   - **Known limitation to revisit:** the catalog is re-fetched independently in both
     `EquipmentTab` and `SummaryPanel` (two network calls instead of one shared fetch). Fine at
     today's small data volume; worth lifting into a shared context/store once more tabs
     (Backroom, Vacuum, POS, Controller) are catalog-driven too, so the summary doesn't need to
     fetch N tabs' worth of catalog separately.
3. **Widened the summary panel** from `w-72` (288px) to `w-96` (384px) per client request, to
   fit longer field names/values comfortably.
4. Verified both changes together in an actual browser (Playwright, against the real admin
   account, `npm run dev` now that it's fixed): General text field fill reflects live in the
   summary, Equipment radio selections reflect live, and the CTA/CTA Type show/hide behavior
   round-trips correctly in the summary panel itself, not just the tab.

### What we did 2026-06-24 (continued) — single-scroll layout + sticky Quote Summary
Client asked for the whole page (draft content + Quote Summary) to grow downward naturally with
**one scrollbar controlling everything**, instead of the Phase-2 fixed-height shell where the
tab content scrolled in its own clipped box. On top of that, the Quote Summary should be
**static/pinned in view** as you scroll, with **its own internal scrollbar** so a long, growing
selection list can be navigated independently of the page scroll.

1. **Single page scroll:** `app/(app)/layout.tsx`'s `<main>` is now the one real scroll
   container (`overflow-y-auto`) for everything below the top app header (logo/sign-out bar,
   which stays put as before). `ConfiguratorShell.tsx` no longer imposes its own
   `overflow-hidden`/`overflow-y-auto` on the TopBar/TabNav/content/FooterNav — they're normal
   flow now, so the whole tab grows to its natural content height and `main` scrolls it as one
   unit. Also removed a leftover `h-full` wrapper div in `app/(app)/quotes/[id]/page.tsx` (a
   Phase-2 relic) that was fighting the new layout.
2. **Hit and fixed a real flexbox bug along the way:** `main` being `flex-1` inside a flex
   column wasn't enough — flex items default to `min-height: auto`, which lets them grow to fit
   their content instead of respecting the flex-basis. Without `min-h-0` on `main`, it was
   silently expanding past the viewport on content-heavy tabs (e.g. Equipment), which doesn't
   show as a second visible scrollbar (overflow-hidden on `html`/`body` suppresses that) but is
   real latent breakage worth knowing about if anything ever looks subtly miscalculated. Fixed
   by adding `min-h-0` to `main`'s classes. Also added defensive `overflow-hidden` on `<html>`,
   `<body>`, and the outer app-shell div as a backstop so there's never more than one scrollable
   element on the page, confirmed by enumerating every element with `overflow-y: auto/scroll`
   that's actually scrollable (`scrollHeight > clientHeight`) — only `main` qualifies.
3. **Quote Summary is now `position: sticky` + its own internal scrollbar:**
   `SummaryPanel.tsx`'s `<aside>` is `sticky top-0 self-start h-screen w-96` — `self-start`
   matters because flex items default to stretching to the row's full height, which would
   defeat the sticky effect; `self-start` lets it keep its own `h-screen` box instead. Verified
   with real mouse-wheel scrolling (not Playwright's `.click()`, which does its own internal
   `scrollIntoView` that doesn't always trigger sticky recalculation the same way a real wheel
   event does — learned this the hard way mid-verification) that: the panel stays pinned at a
   fixed position while the page scrolls, releases naturally right as the page content's bottom
   edge approaches, and — once the selection list genuinely overflows the panel's available
   height — scrolling with the cursor over the panel moves only its internal list (header
   "Quote Summary" and footer "Total" stay fixed in place), leaving the page's own scroll
   position untouched.
4. Confirmed working via `npm run dev` directly (no `next build`/`next start` workaround
   needed) — the earlier Turbopack `dev` fix is holding up under this layout change too.

### What we did 2026-06-30 — Phase 9: Quote save/load/dashboard COMPLETE

1. **Auto-save** — debounced 2 s, with `skipNextSave` guard to suppress the hydration-triggered flush that was causing spurious saves on tab load.
2. **`quotes` table** — `supabase/migrations/0005_quotes.sql`. RLS pattern: `(select auth.uid()) = quotes.user_id` (subquery form prevents planner issue on Supabase).
3. **`supabase/migrations/0006`** — added `is_pinned boolean` and `total_value numeric(10,2)` columns to `quotes`.
4. **Quotes dashboard** (`/quotes`): greeting banner by time-of-day, stat cards (total/draft/complete), template cards, tab pills (All / Drafts / History), sort (Newest / Oldest / A–Z / Z–A), full-text search, date grouping, pin/unpin, clone, quick-preview panel, estimated value per card, delete.
5. **Finish flow** — last tab "Finish →" button marks quote `complete` + redirects to dashboard. Any edit on a complete quote auto-reverts it to `draft`.
6. **Splash screen** — 500 ms animated splash between login redirect and dashboard render.
7. **`key={quoteId}`** on `ConfiguratorShell` forces a full React remount on quote switch, eliminating stale store hydration.

### What we did 2026-07-01 — migration 0007: Backroom Chemical Panels extended + Hydraulics + Water

All new fields for this session are in the **Backroom tab**, not the Equipment tab. Earlier drafts
of this migration incorrectly placed items in the Equipment tab (`EQ-HP-004` through `EQ-HP-011`)
or a standalone "High Pressure Pumping" section — the final migration's cleanup block removes all
those mistakes before re-inserting correctly.

1. **Extended existing Backroom / Chemical Panels section** (`BR-CHEM-003` to `BR-CHEM-010`):
   - `BR-CHEM-003` How Many Pump Stations? — select_range 1–5 (upgraded from text widget in 0004).
     Shown only when High Pressure Pumping Station = Yes (trigger field from `BR-CHEM-002`, rule
     `br_chem_007_pump_count_show`).
   - `BR-CHEM-004` Air Assist Panels — Yes/No radio (always visible).
   - `BR-CHEM-005` WA1P Single Air Control Panel – How many? — select_range 1–5 (shown when Air Assist = Yes)
   - `BR-CHEM-006` WA2P Dual Air Control Panel – How many? — select_range 1–5 (shown when Air Assist = Yes)
   - `BR-CHEM-007` WA1-SK-2018 Retracted Dual Air Assist Kit – How many? — select_range 1–5 (shown when Air Assist = Yes)
   - `BR-CHEM-008` Water Solenoid ½" – How many? — select_range 1–7 (always visible)
   - `BR-CHEM-009` Water Solenoid ¾" – How many? — select_range 1–7 (always visible)
   - `BR-CHEM-010` Water Solenoid 1" – How many? — select_range 1–7 (always visible)

2. **New Backroom / Hydraulics section** (sort_order 20, `BR-HYD-001` to `BR-HYD-003`):
   - Hydraulic Units — radio (None / 1–8 Ports)
   - Hydraulic Units – How many? — select_range 1–5 (hidden when type = None via `br_hyd_007_unit_qty_hide`)
   - Air Compressor — radio (None / 4 compressor models)

3. **New Backroom / Water section** (sort_order 30, `BR-WAT-001` to `BR-WAT-008`):
   - Water Treatment Center — `widget: pending` (Sobrite options TBD)
   - Water Reclaim System — radio (120 GPM Reclaim System / No)
   - Reverse Osmosis System — radio (Purclean 15,000 / Purclean 6,000 / No)
   - Single RO/Reject Tank — radio (Yes / No)
   - Spot Free Water Tank — radio (3 tank options + None)
   - Reject Water Tank — radio (3 tank options + None)
   - Water Boiler — radio (PVI 400,000 BTU / PVI 800,000 BTU)
   - Water Softener — radio (Yes / No)

4. **Client must run** `supabase/migrations/0007_hp_hydraulics_water.sql` in the Supabase SQL Editor
   for any of this to appear in the app. Migration is re-runnable (cleanup block deletes by exact SKU
   before reinserting, including any items from earlier wrong runs).

---

### What we did 2026-06-28 — UI polish + new tabs + Google Places + state reset

1. **Conveyor Length overhaul:** Changed unit from `in` → `ft`. Changed widget from plain
   `NumberField` to `ComboNumberField` (`combobox_range`) — a Word font-size-style combo box
   that shows a dropdown of every integer 40–165 ft but also allows free text input. Restored
   the "None" checkbox (disables the input when checked, stores `'none'`). "Contact support"
   helper text changed to "Contact tech support" as a `mailto:teamsales@avwequipment.com`
   hyperlink with an explicit `onClick` handler so browser mail clients open reliably. **Requires
   re-running migration 0003 in Supabase SQL Editor to take effect in the DB.**

2. **General Tab field changes:**
   - Removed "Ship to State" and "Ship to Country" fields.
   - Added "Ship to Address" — a Google Places autocomplete field. Debounces on each keystroke
     (300ms), calls `AutocompleteSuggestion.fetchAutocompleteSuggestions` (new Places API, not
     the deprecated `Autocomplete` class), and renders a styled suggestion dropdown. Degrades
     to a plain text input if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing. **Requires client
     to obtain a Google Maps API key with Places API enabled and add it to `.env.local`.**

3. **Two new tabs added** (after Vacuum in the tab strip):
   - "Fixtures & Signs" (`fixtures_signs`) — placeholder, awaiting catalog data.
   - "Misc Tunnel Equip." (`misc_tunnel_equipment`) — placeholder, awaiting catalog data.
   Tab order is now: General → Equipment → Backroom → Vacuum → Fixtures & Signs →
   Misc Tunnel Equip. → POS → Controller → Items (9 tabs total, up from 7).

4. **Friction section renamed** to "Friction Equipment" in the Equipment tab accordion.

5. **Typography hierarchy:** Option labels (radio pills, select content) changed to `text-xs`
   vs field labels at `text-sm font-medium` — visible size difference between tool name and
   its options. Radio pills also slightly more compact (`px-2.5 py-1` vs `px-3 py-1.5`).

6. **All dropdowns are now fit-to-content width** (`w-auto`) — no more full-width `<select>`
   elements. Applies globally to `SelectField`, including any new dropdowns built going forward.

7. **Accordion auto-collapse:** Sections now auto-close 700ms after the **last visible field
   in that section is filled** (not on every individual interaction). Computed in `EquipmentTab`
   by checking that every item where `isFieldVisible()` is true has a non-null/non-empty value
   in the Zustand store. The `SectionAccordion` receives an `allFilled` prop and uses a
   `useEffect` that skips mount (so already-filled sections don't close on load) and fires only
   on the false→true transition.

8. **Sign-out clears Zustand state:** Replaced the `<form action={logout}>` server-action form
   in `app/(app)/layout.tsx` with a `<LogoutButton>` client component that synchronously resets
   both `selectionsStore` (all field values → `{}`) and `configuratorStore` (activeTab →
   `'general'`) before calling the server action. This ensures a clean slate when the next
   user signs in on the same browser session.

9. **SSR crash fixed in AddressAutocompleteField:** `setOptions()` from `@googlemaps/js-api-loader`
   internally references `window` — calling it at module level caused a `ReferenceError` during
   server-side rendering. Moved all Google Maps init inside `useEffect` (client-only).

### What we did 2026-07-06 — skills setup + project context

No code changes to the quoting tool this session. Work covered:
- **JobBOSS² integration research** — confirmed feasible as Phase 13. Hook point: `finishQuote`
  server action → `lib/actions/jobBoss.ts` → REST API. Post-build addition.
- **Standalone vacuum-calculator source reviewed** — identified as the Phase 8 (Vacuum tab)
  foundation. Contains Eurovac III pricing data (15 central unit models, VFD controls by
  HP/voltage, workstations by bay count) and calculation logic.
  Recommendation: extract price data into `supabase/migrations/0008_vacuum.sql`, build VacuumTab
  using the existing CatalogField renderer, port calculation logic as a utility function.
- **Claude Code user-scope skills installed** at `~/.claude/commands/`:
  design-mastery, mobile-app-ui-design, ux-ui-mastery, design-system-extractor, ui-ux-pro-max,
  vercel-web-design-guidelines, vercel-react-best-practices, accessibility-first, dark-mode-mastery,
  component-architecture. Available in all projects, not just this one.
- **Next step for quoting tool**: run migration 0007 in Supabase SQL Editor (if not yet done),
  then begin Phase 8 (Vacuum tab) using the standalone vacuum-calculator source as the data/logic
  source.

---

## 10. Key Decisions (carry these forward)

1. **Equipment catalog lives in Supabase, not in code.** Admin panel + CSV import handle it.
   Client has **not yet provided their catalog file** as of 2026-06-18 — this blocks real data
   in Phase 5/6, though schema and UI can be built with placeholder/seed data first.
2. **Dependency rules are data-driven** — stored in Supabase + seeded in `defaultRules.ts`. New
   logic = insert a row, not a code change.
3. **Every save creates a new revision.** `config_snapshot` JSONB stores the complete state of
   all 7 tabs. Old revisions are never overwritten.
4. **Zustand is the single source of truth** while configuring. Serialized to `config_snapshot`
   on save, deserialized back into the store on load.
5. **PDF generation (Phase 11) is deferred.** Client confirmed the configurator + quote saving
   is the priority; PDF work starts only after the core tool is validated.
6. **Role hierarchy:** Admin (full access + catalog management) > Salesperson (own quotes) >
   Distributor (own quotes only, no admin panel).
7. **One login, not two.** Confirmed with client (2026-06-19): a single login form for everyone.
   What differs after sign-in is role-based — admin gets an extra Admin section (catalog CRUD,
   Phase 5); salesperson/distributor only see the configurator + their own quotes. No separate
   admin login URL/flow.
8. **Data freshness is "refresh-to-see," not real-time push.** Confirmed with client
   (2026-06-19): when admin edits the catalog, salespeople/distributors see the change the next
   time they load or navigate a page — standard server-rendered-on-each-request behavior,
   already how the app works. Explicitly **not** building Supabase Realtime subscriptions for
   live in-session updates; out of scope unless requested later.

---

## 11. What's Blocking Progress Right Now

### Client must action these before they take effect in the app:
- **Re-run migration 0003** (`supabase/migrations/0003_equipment_conveyor_belt_entrance_presoak_hp.sql`)
  in the Supabase SQL Editor — required to pick up the Conveyor Length changes from 2026-06-28
  (unit ft, widget combobox_range, mailto metadata for the tech support link).
- **Google Maps API key** — add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<key>` to `.env.local`.
  Steps: Google Cloud Console → APIs & Services → enable Maps JavaScript API + Places API →
  create API key (restrict to your domain for production) → restart `npm run dev`. Without this,
  Ship to Address works as a plain text input only (no autocomplete suggestions).

### Waiting on client to provide:
- **Pricing data** for all seeded equipment (Conveyor, Belt Specs, Entrance Module, Presoak,
  High Pressure Equipment) — every item/option currently $0. TopBar "Total" and SummaryPanel
  "Total" will stay $0.00 until prices are provided.
- **Friction Equipment specs** — section is a "coming soon" placeholder.
- **Remaining Equipment sub-tabs** (everything beyond the 5 seeded sections).
- **Backroom Tab catalog data** — tab is a placeholder.
- **Vacuum, POS, Controller catalog data** — tabs are placeholders.
- **Fixtures & Signs catalog data** — tab added 2026-06-28, placeholder.
- **Miscellaneous Tunnel Equipment catalog data** — tab added 2026-06-28, placeholder.
- **Avalanche/Presoak dependency logic** — Avalanche options show unconditionally until the
  full conditional rule is defined.

### Each catalog data batch requires both:
  1. A new or updated DB seed migration (added to `supabase/migrations/`)
  2. The corresponding tab UI updated (or built from scratch if the tab is still a placeholder)
  Never update just one without the other.

### Still to build (no data blocker — code work):
- **Phase 10 — Items tab** — manual line items, quantities, discount field, internal notes.
- **Phase 5 — Admin catalog panel** — CRUD interface + CSV import so AVW staff can edit the
  catalog without touching the DB directly. Role-gated to admin only.
- **SummaryPanel multi-tab awareness** — currently only reads General + Equipment catalog.
  Must be extended to show selections from Backroom, Vacuum, Fixtures & Signs, Misc Tunnel
  Equipment, POS, Controller as those tabs get built out.
- **General Tab validation** — required fields (Customer, Equipment Drive Type, etc.) should
  block navigation to the next tab until filled. Currently there is no validation gate.
- **Role-based UI differences** — admin sees the admin panel link; salesperson/distributor do
  not. The role is read correctly in the header but no admin-gated routes exist yet beyond the
  layout-level check.

### Operational notes (carry forward every session):
- No direct Postgres connection available to this assistant (only REST/anon/service-role keys)
  — every SQL migration must be run manually by the client in the Supabase SQL Editor.
- `npm run dev` uses `--webpack` flag (Turbopack disabled) due to a Windows/Node-v24
  incompatibility with Turbopack's PostCSS worker pool. `next build`/`next start` are unaffected.
- ~~`next dev` (Turbopack) panics on this machine on `app/globals.css`~~ — **RESOLVED
  2026-06-24** via `next dev --webpack` opt-out.

---

## 12. How to Resume This Project

1. Open this file first for full context.
2. Confirm working directory is `C:\Users\Joseph Ilashe VM\Documents\Workflows\AVW\avw-quoting-tool`.
3. Check section 9 for the current phase and section 11 for what's blocking it.
4. Detailed phase-by-phase specs and the verification checklist (per-phase "how to verify") are
   also kept in the original plan file:
   `C:\Users\Joseph Ilashe VM\.claude\plans\splendid-leaping-stearns.md`
5. Update the status table in section 9 and the "What we did" log in section 9 at the end of
   every session, so this file stays the single source of truth for project history.
