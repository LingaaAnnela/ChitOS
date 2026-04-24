# ChitOS — Build TODO
> Generated: 22 Apr 2026
>
> HOW TO USE:
> Open a fresh Claude Code session and paste:
> "Read CLAUDE.md. Read TODO.md. Execute TODO-[NNN]."
> Claude completes the task and marks it [x].
> Commit. Open next session for next item.

---

## Priority 0 — Blockers

- [x] **TODO-001** · Effort: Medium · Deps: none
  **Create i18n JSON translation files for all six languages**
  The Transloco HTTP loader fetches `/assets/i18n/{lang}.json` at runtime. None of these files exist. Every screen that uses `t()` or `transloco` renders blank or throws 404s — the entire app is non-functional without them.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-001.

  Create the following six JSON files under src/assets/i18n/:
    en.json  te.json  hi.json  ta.json  kn.json  ml.json

  Steps:
  1. Grep every .ts file under src/app/ for t('...') and transloco key usages to produce a master key list.
  2. Write en.json first with all keys mapped to their English display strings (derive from the
     inline template text already present in dashboard, member-home, landing, group-detail,
     auction-console, import-wizard, member-approvals, notifications, profile, onboarding,
     auth-shell).
  3. For te.json, hi.json, ta.json, kn.json, ml.json — copy the en.json structure and use accurate
     translations for each language. Use Noto Sans font note in comments.
  4. Verify the Transloco loader in src/app/transloco-loader.ts points to /assets/i18n/{lang}.json.
  5. Spot-check: open the app in the browser and confirm no 404s appear in the network tab for i18n files.

  On completion mark TODO-001 as [x] in TODO.md.
  ```

---

- [x] **TODO-002** · Effort: Medium · Deps: TODO-001
  **Build Login and Signup pages; wire auth-shell child routes**
  `src/app/auth/auth-shell.ts` is a bare `<router-outlet />` with no child routes and no login/signup components. The auth guard redirects unauthenticated users to `/auth/login` but that route does not exist — the app hard-loops.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-002.

  1. Read src/app/auth/auth-shell.ts and src/app/app.routes.ts.
  2. Read /design/chitos_full.html for the console login panel and /design/mobile.html for the
     mobile login screen — extract exact layout, field names, and button labels.
  3. Create src/app/auth/login/login.ts — standalone component with:
       - Email + password fields using Angular Signal Forms (@angular/forms/signals)
       - "Sign in" primary button; "Forgot password?" link
       - "Don't have an account? Sign up" link routing to /auth/signup
       - Calls AuthStore.login(); shows inline error on failure
       - Redirects to /console/dashboard (organiser) or /app/home (member) on success
       - Mobile-first layout (375px base), matches design tokens exactly
       - All labels via transloco keys; add keys to en.json and all lang files
  4. Create src/app/auth/signup/signup.ts — standalone component with:
       - Name, phone (Indian +91 format), email, password, confirm-password
       - "Create account" primary button
       - Calls AuthStore.register(); shows inline error on failure
       - Redirects to /onboarding after success
       - Mobile-first layout, design tokens, transloco keys
  5. Update src/app/auth/auth-shell.ts to add child routes for login and signup.
  6. Update src/app/app.routes.ts: add /auth/login and /auth/signup as children of the auth path.
  7. Verify auth.guard.ts redirects to /auth/login (not /login).

  On completion mark TODO-002 as [x] in TODO.md.
  ```

---

- [x] **TODO-003** · Effort: Low · Deps: none
  **Wire BottomNav into member-app-shell**
  `src/app/shared/bottom-nav/bottom-nav.ts` exists and is fully implemented but has zero usages in any template — it is not rendered anywhere. The mobile shell has no navigation.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-003.

  1. Read src/app/member-app/member-app-shell.ts (full file).
  2. Read src/app/shared/bottom-nav/bottom-nav.ts to understand its signal inputs and routing expectations.
  3. Read /design/mobile.html — confirm the 5-tab bottom nav labels and icons:
     Home, Groups, Auction, Notifications, Profile.
  4. Import BottomNav into member-app-shell. Add <app-bottom-nav> at the bottom of the shell
     template. Pass the active tab derived from the current router URL using toSignal(router.events).
  5. Ensure the shell layout uses CSS grid or flex so the bottom nav is always sticky at the bottom
     (position: fixed, bottom: 0) and the main <router-outlet> has padding-bottom: 72px so content
     is not hidden under the nav.
  6. Verify on mobile viewport (375px) that all 5 tabs are visible and tapping each navigates to
     the correct route.

  On completion mark TODO-003 as [x] in TODO.md.
  ```

---

- [x] **TODO-004** · Effort: Low · Deps: none
  **Fix core/auth/index.ts — empty export barrel**
  `src/app/core/auth/index.ts` is empty (`export {}`). Any import from `@core/auth` resolves to nothing.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-004.

  1. List all files under src/app/core/auth/ (Glob).
  2. Read each file. Identify which symbols are meant to be public API (guards, stores, models, tokens).
  3. Rewrite src/app/core/auth/index.ts to re-export every public symbol.
  4. Grep the entire src/ tree for imports from core/auth to confirm nothing is broken.

  On completion mark TODO-004 as [x] in TODO.md.
  ```

---

## Priority 1 — Core Organiser Flows

- [x] **TODO-005** · Effort: High · Deps: TODO-001, TODO-004
  **Build console cycles sub-route (CyclesPage)**
  `src/app/console/cycles/index.ts` is a 1-line stub. Recording which cycle has been paid out is a core organiser workflow.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-005.

  1. Read /design/chitos_full.html — find the cycles / payment history section. Extract layout,
     column names, badge states, and action buttons exactly.
  2. Read src/app/console/console.store.ts to understand which group/cycle data is available.
  3. Read src/app/core/mock-supabase.service.ts and src/app/core/seed.data.ts — understand cycle
     data shape (cycle number, winner, payout date, amount, status).
  4. Build src/app/console/cycles/cycles.ts — standalone CyclesPage component:
       - Heading "Cycles" with group name subtitle
       - Table (desktop) / card list (mobile) of all cycles:
           columns: Cycle #, Draw Date, Winner, Payout Amount (Indian ₹ format), Status badge
           (Pending / Paid / Overdue)
       - "Mark as Paid" button on Pending rows — calls console.store to update status, triggers toast
       - Empty state using <app-empty-state> when no cycles
       - Skeleton loader while loading
       - All text via transloco keys; add keys to i18n files
       - Mobile-first (375px base), full design token compliance
  5. Update cycles/index.ts to export CyclesPage.
  6. Verify the route /console/groups/:id/cycles resolves and renders correctly.

  On completion mark TODO-005 as [x] in TODO.md.
  ```

---

- [x] **TODO-006** · Effort: High · Deps: TODO-001, TODO-004
  **Build console fixed-console sub-route (FixedConsolePage)**
  Fixed-draw chit groups have a deterministic cycle order (no auction). `src/app/console/fixed-console/index.ts` is a stub.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-006.

  1. Read /design/chitos_full.html — locate the fixed-draw console panel. Extract the cycle schedule
     table, winner column (pre-assigned), payment status, and organiser action buttons.
  2. Read src/app/console/console.store.ts and seed.data.ts for fixed-group data shape.
  3. Read src/app/console/auction-console/auction-console.ts as a structural reference.
  4. Build src/app/console/fixed-console/fixed-console.ts — standalone FixedConsolePage:
       - Displays the pre-set cycle order: Cycle #, Scheduled Date, Assigned Winner (member avatar
         + name), Amount, Status
       - "Confirm Payout" action per upcoming cycle — calls store, shows confirm-dialog (build
         minimal inline if TODO-011 not done)
       - Summary header: total collected, total disbursed, remaining — all in Indian ₹ format
       - Mobile-first, all design tokens, transloco keys
  5. Update fixed-console/index.ts to export FixedConsolePage.
  6. Verify /console/groups/:id/fixed resolves.

  On completion mark TODO-006 as [x] in TODO.md.
  ```

---

- [x] **TODO-007** · Effort: High · Deps: TODO-001, TODO-004
  **Build console lottery-console sub-route (LotteryConsolePage)**
  Random-draw chit groups require a live lottery UI. `src/app/console/lottery-console/index.ts` is a stub.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-007.

  1. Read /design/chitos_full.html — find the lottery draw panel. Extract the draw animation
     placeholder, eligible members list, drawn winner display, and confirmation flow.
  2. Read src/app/console/console.store.ts and seed.data.ts for lottery-group cycle data.
  3. Read src/app/shared/countdown-timer/countdown-timer.ts — reuse it for draw countdown.
  4. Build src/app/console/lottery-console/lottery-console.ts — standalone LotteryConsolePage:
       - Eligible members list (members who haven't won yet) — avatar + name chips
       - "Start Draw" button: triggers a 3-second countdown then reveals the winner
       - Winner reveal card: large member avatar, name, prize amount (Indian ₹ format), highlight
         using saffron accent (#E67C2A / #FEF0E6) — no confetti, no animation beyond reveal
       - "Confirm & Record" button calls store.recordWinner(), shows toast
       - Previous draws table below (cycle #, date, winner)
       - Mobile-first, all design tokens, transloco keys
  5. Update lottery-console/index.ts to export LotteryConsolePage.
  6. Verify /console/groups/:id/lottery resolves.

  On completion mark TODO-007 as [x] in TODO.md.
  ```

---

- [x] **TODO-008** · Effort: High · Deps: TODO-001, TODO-004
  **Build console consensus-console sub-route (ConsensusConsolePage)**
  Consensus groups require member voting on who wins each cycle. `src/app/console/consensus-console/index.ts` is a stub.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-008.

  1. Read /design/chitos_full.html — locate the consensus voting panel. Extract vote tally display,
     member vote list, quorum indicator, and "Close Voting" action.
  2. Read console.store.ts and seed.data.ts for consensus vote data shape.
  3. Build src/app/console/consensus-console/consensus-console.ts — standalone ConsensusConsolePage:
       - Active voting round: cycle number, close date (DD MMM YYYY), quorum progress bar
         (<app-progress-bar>)
       - Candidate rows: member avatar + name, vote count, percentage bar
       - "Close Voting & Declare Winner" button — enabled only when quorum met — calls store,
         shows confirm dialog
       - Past rounds table: Cycle #, Winner, Votes, Date
       - Mobile-first, all design tokens, transloco keys
  4. Update consensus-console/index.ts to export ConsensusConsolePage.
  5. Verify /console/groups/:id/consensus resolves.

  On completion mark TODO-008 as [x] in TODO.md.
  ```

---

- [x] **TODO-009** · Effort: Medium · Deps: TODO-001, TODO-012
  **Build console announcements sub-route (AnnouncementsPage)**
  `src/app/console/announcements/index.ts` is a stub. Organisers need to post and view group announcements.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-009.

  1. Read /design/chitos_full.html — find the announcements panel. Extract the compose form,
     announcement card layout, and WhatsApp share trigger.
  2. Read src/app/shared/announcement-card/ (may be empty — if so, build the component inline in
     this task and also write the shared component file).
  3. Read src/app/shared/whatsapp-share-btn/whatsapp-share-btn.ts.
  4. Build src/app/console/announcements/announcements.ts — standalone AnnouncementsPage:
       - Compose box: textarea (max 500 chars), character counter, "Post Announcement" button
       - Toggle: "Send via WhatsApp" checkbox — if checked, opens <app-whatsapp-share-btn> with
         the announcement text pre-filled
       - Feed of past announcements using <app-announcement-card>: author avatar, timestamp
         (DD MMM YYYY), body text, WhatsApp resend icon
       - Empty state when no announcements
       - Mobile-first, all design tokens, transloco keys
  5. If announcement-card component was empty, write the full implementation in
     src/app/shared/announcement-card/ and export from its index.ts.
  6. Verify /console/groups/:id/announcements resolves.

  On completion mark TODO-009 as [x] in TODO.md.
  ```

---

- [ ] **TODO-010** · Effort: Medium · Deps: TODO-001
  **Build console invites sub-route (InvitesPage)**
  `src/app/console/invites/index.ts` is a stub. Organisers invite new members via link or WhatsApp.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-010.

  1. Read /design/chitos_full.html — find the invites / invite member panel. Extract invite link
     display, copy button, WhatsApp invite flow, and pending invites list.
  2. Read src/app/shared/whatsapp-share-btn/whatsapp-share-btn.ts.
  3. Read console.store.ts for group token / invite data.
  4. Build src/app/console/invites/invites.ts — standalone InvitesPage:
       - Invite link card: full URL (e.g. https://chitos.app/join/TOKEN), "Copy Link" button
         (uses Clipboard API), <app-whatsapp-share-btn>
       - "Regenerate Link" button with confirm-dialog (inline confirm if TODO-011 not done)
       - Pending invites table: invitee name/phone, invited date, status badge
         (Pending / Accepted / Expired), "Revoke" action
       - Empty state when no pending invites
       - Mobile-first, all design tokens, transloco keys
  5. Update invites/index.ts to export InvitesPage.
  6. Verify /console/groups/:id/invites resolves.

  On completion mark TODO-010 as [x] in TODO.md.
  ```

---

## Priority 2 — Organiser Tools

- [ ] **TODO-011** · Effort: Low · Deps: none
  **Build ConfirmDialog shared component**
  `src/app/shared/confirm-dialog/index.ts` is empty. Multiple flows (mark paid, close voting, regenerate link, revoke invite) need a reusable confirm modal.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-011.

  1. Read /design/chitos_full.html and /design/mobile.html for any modal/dialog patterns. Extract
     overlay backdrop, card dimensions, heading, body text, and button pair layout.
  2. Build src/app/shared/confirm-dialog/confirm-dialog.ts — standalone component:
       - Signal inputs: title: string, message: string, confirmLabel: string (default "Confirm"),
         cancelLabel: string (default "Cancel"), danger: boolean (default false)
       - Output signals: confirmed EventEmitter, cancelled EventEmitter
       - Design: centered card, 12px border-radius, 0.5px border, no shadow, warm off-white
         overlay backdrop
       - "Confirm" button: danger red #DC2626 fill when danger=true, else #1A1A1A fill
       - "Cancel" button: ghost / text style
       - Trap focus inside dialog when open; close on Escape key
       - All labels via transloco keys; add keys to i18n files
  3. Export ConfirmDialog from src/app/shared/confirm-dialog/index.ts.

  On completion mark TODO-011 as [x] in TODO.md.
  ```

---

- [ ] **TODO-012** · Effort: Low · Deps: none
  **Build AnnouncementCard shared component**
  `src/app/shared/announcement-card/index.ts` is empty. Used by both the organiser announcements page and the member home feed.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-012.

  1. Read /design/chitos_full.html and /design/mobile.html — locate announcement card instances.
     Extract avatar size, timestamp format, body text style, and action icons.
  2. Build src/app/shared/announcement-card/announcement-card.ts — standalone component:
       - Signal inputs: authorName: string, authorAvatar: string (URL), timestamp: Date,
         body: string, showResend: boolean (default false)
       - Layout: avatar (32px circle) + author name + timestamp (DD MMM YYYY via IndianDatePipe)
         in a row; body text below
       - Timestamp uses relative-time.pipe.ts for recency (e.g. "2 days ago") with full date
         as title tooltip
       - If showResend=true, show <app-whatsapp-share-btn> icon at card trailing edge
       - Card background #FFFFFF, border 0.5px rgba(0,0,0,0.07), border-radius 12px
       - No shadow, no gradient
  3. Export AnnouncementCard from src/app/shared/announcement-card/index.ts.

  On completion mark TODO-012 as [x] in TODO.md.
  ```

---

- [ ] **TODO-013** · Effort: Medium · Deps: none
  **Build InterestCalculator shared component**
  `src/app/shared/interest-calculator/index.ts` is empty. The group-detail page has an interest calculator accordion that currently renders nothing.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-013.

  1. Read /design/chitos_full.html — find the interest calculator panel. Extract field labels,
     formula display, and output format.
  2. Read src/app/core/interest.service.ts — understand the calculation API (principal, rate,
     duration inputs; returned maturity amount).
  3. Build src/app/shared/interest-calculator/interest-calculator.ts — standalone component:
       - Signal inputs: principal: number (rupees), annualRate: number (%), durationMonths: number
       - Internally computes using InterestService (inject via inject())
       - Displays: Monthly installment, Total interest paid, Effective annual yield —
         all formatted with IndianCurrencyPipe (Indian ₹ format)
       - All numeric outputs update reactively via computed() signals when inputs change
       - Clean label/value grid layout, JetBrains Mono for numbers
       - No input fields — display component driven by parent inputs
  4. Export InterestCalculator from src/app/shared/interest-calculator/index.ts.
  5. Import and wire it into group-detail.ts where the interest accordion currently renders a stub.

  On completion mark TODO-013 as [x] in TODO.md.
  ```

---

- [x] **TODO-014** · Effort: Medium · Deps: TODO-001, TODO-011
  **Build console settings page (SettingsPage)**
  `src/app/console/settings/index.ts` is a stub ("Settings — coming soon"). Organisers need account, plan, and notification preferences.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-014.

  1. Read /design/chitos_full.html — find the settings screen. Extract sections, field labels,
     and toggle/select patterns.
  2. Read src/app/core/auth.store.ts for current user profile data.
  3. Read src/app/core/plan.config.ts for plan tier definitions.
  4. Replace the stub in src/app/console/settings/index.ts with a full SettingsPage component.
     Sections:
       A. Profile — display name, phone, email (read-only), profile photo placeholder
       B. Plan — current plan badge, feature list, "Upgrade" CTA (links to landing pricing section)
       C. Notifications — WhatsApp alerts toggle, email alerts toggle; saves to AuthStore
       D. Language — language selector using LanguageSwitcher component (already exists)
       E. Danger Zone — "Delete account" link (opens ConfirmDialog with danger=true)
     Each section is a white card (12px radius, 0.5px border), separated by 16px gap.
  5. All labels via transloco keys; add keys to i18n files.
  6. Mobile-first, full design token compliance.
  7. Verify /console/settings resolves and all sections render.

  On completion mark TODO-014 as [x] in TODO.md.
  ```

---

- [ ] **TODO-015** · Effort: Medium · Deps: TODO-001, TODO-010
  **Console: inviting state for a group (Office Gang scenario)**
  When a newly created group has fewer members than required, the dashboard and group-detail should show an "Inviting" state with member slots, invite actions, and a start-group gate.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-015.

  1. Read /design/chitos_full.html — find the "Office Gang" group card and its detail state when
     status=inviting. Extract: member slot grid (filled vs empty avatar slots), progress text
     (e.g. "8 of 20 members joined"), "Invite Members" CTA, and "Start Group" button (disabled
     until full).
  2. Read src/app/console/group-detail/group-detail.ts — identify where group status is checked.
  3. Read src/app/core/seed.data.ts — add or confirm an "inviting" group fixture
     (e.g. Office Gang, 8/20 members).
  4. In group-detail.ts, add a conditional block for status === 'inviting':
       - Member slots grid: filled slots show avatar + name; empty slots show a dashed circle
       - "Invite Members" button navigates to /console/groups/:id/invites
       - "Start Group" button: disabled with tooltip "Need 20/20 members" until full;
         calls store.startGroup() when enabled
       - Progress bar (<app-progress-bar>) showing 8/20
  5. In the console dashboard group table/cards, ensure groups with status=inviting display
     an "Inviting" badge (warning amber).
  6. All text via transloco keys; add keys to i18n files.

  On completion mark TODO-015 as [x] in TODO.md.
  ```

---

- [ ] **TODO-016** · Effort: Medium · Deps: TODO-001
  **Console: completed state for a group (Family Savings scenario)**
  When all cycles are done, the group detail and dashboard should show a "Completed" state with final summary and archive actions.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-016.

  1. Read /design/chitos_full.html — find the "Family Savings" completed group panel. Extract:
     completion banner, final stats (total collected, total disbursed, group duration), member
     payouts summary table, "Download Report" CTA, and "Archive Group" button.
  2. Read src/app/core/pdf.service.ts — understand how to trigger a PDF export.
  3. Read group-detail.ts — identify where group status is checked.
  4. Read seed.data.ts — add or confirm a completed group fixture
     (Family Savings, all cycles paid).
  5. In group-detail.ts, add a conditional block for status === 'completed':
       - Completion banner: saffron accent (#E67C2A bg #FEF0E6), group name, end date,
         "All cycles complete" text
       - Stats row: Total Collected (₹), Total Disbursed (₹), Duration (months) —
         Indian ₹ format throughout
       - Member payouts table: member name, cycle won, amount received, date (DD MMM YYYY)
       - "Download PDF Report" button — calls pdf.service; shows toast on success
       - "Archive Group" button (secondary) — calls store.archiveGroup(), navigates to dashboard
  6. Dashboard: completed groups show "Completed" badge (success green).
  7. All text via transloco keys; add keys to i18n files.

  On completion mark TODO-016 as [x] in TODO.md.
  ```

---

## Priority 3 — Member App Screens

- [ ] **TODO-017** · Effort: High · Deps: TODO-001, TODO-003, TODO-013
  **Build mobile group detail screen (MemberGroupView)**
  `src/app/member-app/group-view/index.ts` is a stub ("Group view — coming soon"). This is mobile screen 02.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-017.

  1. Read /design/mobile.html — Screen 02 (Group Detail). Extract: group header (name, status
     badge, my slot number), cycle timeline scroll, upcoming payment card, past winners list,
     interest calculator accordion, and action buttons.
  2. Read src/app/member-app/member.store.ts for group and cycle data available to the member.
  3. Read src/app/shared/interest-calculator/ (built in TODO-013) and src/app/shared/progress-bar/.
  4. Replace the stub in src/app/member-app/group-view/index.ts with a full MemberGroupView:
       - Header: group name + status badge; "My slot: #N" chip (JetBrains Mono)
       - Progress bar: cycles completed / total (e.g. 3 of 20)
       - Upcoming payment card: next due date (DD MMM YYYY), amount (Indian ₹), "Pay Now" button
         (opens payment-method-modal)
       - Winner timeline: horizontal scroll strip — past winners show avatar + name, future
         slots show "?" placeholder
       - My status card: won / not yet won; if won, shows which cycle and amount
       - Interest accordion: <app-interest-calculator> with group principal and rate
       - Announcements section: last 3 <app-announcement-card> with "View all" link
       - Mobile-first (375px), all design tokens, transloco keys
  5. Add keys to i18n files.
  6. Verify /app/groups/:id resolves and renders correctly on 375px viewport.

  On completion mark TODO-017 as [x] in TODO.md.
  ```

---

- [ ] **TODO-018** · Effort: High · Deps: TODO-001, TODO-003
  **Build mobile auction room screen (MemberAuctionRoom)**
  `src/app/member-app/auction-room/index.ts` is a stub ("Auction room — coming soon"). This is mobile screen 03.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-018.

  1. Read /design/mobile.html — Screen 03 (Auction Room). Extract: live bid display, countdown
     timer, current leader, bid input, submit bid button, and bidding history list.
  2. Read src/app/console/auction-console/auction-console.ts and auction.store.ts as data
     source references.
  3. Read src/app/shared/countdown-timer/countdown-timer.ts.
  4. Replace the stub in src/app/member-app/auction-room/index.ts with a full MemberAuctionRoom:
       - Status banner: "Auction Live" (success green), "Auction Closed" (secondary), or
         "Upcoming" with start time
       - Current lowest bid card: amount (Indian ₹, large Newsreader serif), bidder avatar + name,
         <app-countdown-timer> to auction close
       - Bid input: number field, "Place Bid" button — validates bid is lower than current lowest;
         shows inline error if not; calls auction.store.placeBid()
       - My current bid chip (if I've bid): shows my bid amount + rank
       - Bid history list: bidder avatar + name, bid amount, time ago (relative-time.pipe)
       - Post-auction state: winner banner (saffron accent if I won), final bid, payout date
       - Mobile-first (375px), all design tokens, transloco keys; add keys to i18n files
  5. Verify /app/auction resolves and renders on 375px viewport.

  On completion mark TODO-018 as [x] in TODO.md.
  ```

---

- [ ] **TODO-019** · Effort: High · Deps: TODO-001, TODO-003, TODO-011
  **Build mobile Create Group Wizard (Screen 07)**
  No create-group flow exists anywhere in the app. This is mobile screen 07 and a core organiser action initiated from the member app.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-019.

  1. Read /design/mobile.html — Screen 07 (Create Group wizard). Extract all steps, field labels,
     validation rules, and the final confirmation screen.
  2. Read src/app/core/plan.config.ts for group size / feature limits per plan.
  3. Read src/app/core/mock-supabase.service.ts to understand the createGroup() API shape.
  4. Create src/app/member-app/create-group/create-group.ts — standalone multi-step wizard:
       Step 1 — Group basics: name (text), description (textarea, optional), group type selector
                (Auction / Lottery / Fixed / Consensus) with icon chips
       Step 2 — Financial setup: monthly contribution (₹), total members (stepper 5–50),
                duration auto-calculated and displayed
       Step 3 — Schedule: start date (date picker, DD MMM YYYY display), draw day of month (1–28)
       Step 4 — Rules: late fee (% toggle + amount), withdrawal policy (select), max bid
                discount % (for auction type only)
       Step 5 — Review & create: summary card of all settings, "Create Group" primary button,
                "Back" secondary button
     - Progress indicator at top (step N of 5, pill style)
     - "Next" / "Back" buttons; "Next" disabled until current step is valid
     - Uses Angular Signal Forms (@angular/forms/signals) throughout
     - On submit: calls mock-supabase.service.createGroup(); shows toast "Group created!";
       navigates to /app/groups/:newId
     - <app-confirm-dialog> before final submit if user tries to navigate away with unsaved state
     - Mobile-first (375px), all design tokens, transloco keys; add keys to i18n files
  5. Add route /app/groups/create to app.routes.ts (child of member-app).
  6. Add "Create Group" FAB or button to member-home.
  7. Verify wizard flows end-to-end on 375px viewport.

  On completion mark TODO-019 as [x] in TODO.md.
  ```

---

## Priority 4 — Design Polish & Mobile Audit

- [ ] **TODO-020** · Effort: Low · Deps: none
  **Audit and fix mobile-first CSS across all components**
  Base styles are not explicitly anchored to 375px. Some components may overflow horizontally or have incorrect tap targets on small screens.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-020.

  1. Open each of the following components and audit their SCSS/inline styles:
       - member-app-shell.ts, member-home.ts, notifications.ts, profile.ts
       - console-shell.ts, dashboard/index.ts, group-detail.ts
       - All shared: avatar, badge, bottom-nav, top-bar, progress-bar, skeleton-loader, toast,
         countdown-timer, trust-score-pill, whatsapp-share-btn, language-switcher,
         payment-method-modal
  2. For each file check:
       A. Base styles target 375px (no min-width on base layout rules)
       B. All media queries use min-width: 768px (tablet) and min-width: 1024px (desktop)
       C. No horizontal overflow: no fixed pixel widths wider than 375px without overflow handling
       D. Touch targets: all interactive elements >= 44px tap target height or padding
       E. No box-shadow, no gradient, no hardcoded color hex values (must use CSS custom properties)
       F. Border weight: every border is 0.5px solid — never 1px or 2px
  3. Fix every violation found. Do not refactor working code — only fix compliance issues.
  4. After fixes, start the dev server and visually verify on 375px viewport in browser.

  On completion mark TODO-020 as [x] in TODO.md.
  ```

---

- [ ] **TODO-021** · Effort: Medium · Deps: TODO-002
  **Build onboarding shell with actual onboarding steps**
  `src/app/onboarding/onboarding-shell.ts` is a bare `<router-outlet />`. New users land here after signup with no guidance.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-021.

  1. Read /design/mobile.html — find the onboarding / welcome flow. Extract step count,
     copy text, and CTA buttons.
  2. Read /design/chitos_full.html for any desktop onboarding panels.
  3. Read src/app/core/auth.store.ts for current user data (name available after signup).
  4. Build a 3-step onboarding flow as child components of the onboarding shell:
       Step 1 — Welcome: "Welcome, {name}!" heading (Newsreader serif, weight 300),
                one-line value prop, "Get Started" button
       Step 2 — What is a chit fund: simple 3-point explainer (icon placeholder + text),
                "Next" button
       Step 3 — Choose your role: two large tap cards — "I'm organising a group"
                (→ /console/dashboard) and "I'm joining a group" (→ /app/home); "Skip" text link
     - Step progress dots at top
     - "Skip" on steps 1–2 goes directly to role selection
     - State persists in AuthStore (onboardingComplete flag) so completed users skip this flow
  5. Add child routes for steps to onboarding-shell.ts and app.routes.ts.
  6. Mobile-first, all design tokens, transloco keys; add keys to i18n files.

  On completion mark TODO-021 as [x] in TODO.md.
  ```

---

## Priority 5 — Launch Features

- [ ] **TODO-022** · Effort: Low · Deps: none
  **Create src/manifest.webmanifest for PWA install**
  The PWA manifest file is not present — "Add to Home Screen" install prompts will not work.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-022.

  1. Read src/index.html — check if a <link rel="manifest"> tag is present; if not, add it
     pointing to manifest.webmanifest.
  2. Read ngsw-config.json to confirm asset group patterns.
  3. Create src/manifest.webmanifest:
     {
       "name": "ChitOS",
       "short_name": "ChitOS",
       "description": "Digital chit fund management for organisers and members",
       "start_url": "/",
       "display": "standalone",
       "background_color": "#F9F7F4",
       "theme_color": "#E67C2A",
       "icons": [
         { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
         { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
       ]
     }
  4. Create placeholder PNG icons at src/icons/icon-192x192.png and src/icons/icon-512x512.png
     (1px transparent PNGs are fine as placeholders — replace with real assets before launch).
  5. Run ng build and confirm no manifest-related warnings in the build output.

  On completion mark TODO-022 as [x] in TODO.md.
  ```

---

- [ ] **TODO-023** · Effort: Low · Deps: TODO-022
  **Validate service worker and PWA install prompt**
  `ngsw-config.json` exists but the full PWA install flow (beforeinstallprompt, offline fallback) has not been validated.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-023.

  1. Read ngsw-config.json — confirm asset groups cover all compiled output (main, polyfills,
     styles, i18n JSON files).
  2. Read src/app/app.config.ts — confirm provideServiceWorker is wired with correct path and
     registrationStrategy.
  3. Add /assets/i18n/*.json to the ngsw-config.json data group (or asset group with
     network-first strategy) so i18n files are cached and available offline.
  4. Run ng build --configuration production and serve the dist/ with npx http-server.
     Open Chrome DevTools → Application → Service Workers — confirm the SW is registered and active.
  5. Check Application → Manifest for any warnings. Fix any warnings found.
  6. Document any remaining issues as inline comments in ngsw-config.json.

  On completion mark TODO-023 as [x] in TODO.md.
  ```

---

- [ ] **TODO-024** · Effort: Medium · Deps: TODO-001
  **Complete all i18n translations (Telugu, Hindi, Tamil, Kannada, Malayalam)**
  TODO-001 creates skeleton JSON files, but machine translations need review for financial and chit-fund-specific terminology.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-024.

  Prerequisite: TODO-001 must be complete (all 6 JSON files exist).

  1. Read src/assets/i18n/en.json as the master key list.
  2. For each of te, hi, ta, kn, ml:
       - Open the corresponding JSON file
       - Review every key where the value is still the English string or a placeholder
       - Provide accurate translations with correct financial/chit-fund terminology:
           "chit fund" → correct regional term (chit / kuri / bisee / committee as appropriate)
           All ₹ amount labels must retain the ₹ symbol
           Date format labels must stay DD MMM YYYY
  3. Verify: switch language in the app using the LanguageSwitcher — confirm all visible strings
     change correctly on at least: Dashboard, Group Detail, Member Home, and Login.
  4. Add any missing keys discovered during review to en.json first, then to all other lang files.

  On completion mark TODO-024 as [x] in TODO.md.
  ```

---

## Priority 6 — Quality

- [ ] **TODO-025** · Effort: Medium · Deps: TODO-001
  **Write Vitest unit tests for core services**
  No test files exist for `interest.service.ts`, `indian-currency.pipe.ts`, `trust-score.service.ts`, or `currency.utils.ts` — all are pure calculation logic ideal for unit tests.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-025.

  1. Read src/app/core/interest.service.ts, src/app/shared/pipes/indian-currency.pipe.ts,
     src/app/core/trust-score.service.ts, src/app/core/utils/currency.utils.ts.
  2. Write Vitest spec files alongside each:
       interest.service.spec.ts — simple interest calc, compound interest, zero rate,
                                  negative duration guard
       indian-currency.pipe.spec.ts — Indian ₹1,00,000 format, crore format, ₹0, negatives,
                                      decimal rounding
       trust-score.service.spec.ts — full attendance = 100 score, late payments deduct correctly,
                                     new member baseline
       currency.utils.spec.ts — all exported utility functions with edge cases
  3. Tests must use Vitest (import { describe, it, expect } from 'vitest') — no Jest, no TestBed
     for pure services.
  4. Run npx vitest run and confirm all tests pass.
  5. Fix any bugs uncovered by the tests.

  On completion mark TODO-025 as [x] in TODO.md.
  ```

---

- [ ] **TODO-026** · Effort: Medium · Deps: TODO-001, TODO-003, TODO-017, TODO-020
  **Run Lighthouse audit and fix critical issues**
  No performance baseline exists. PWA, accessibility, and performance scores are unknown.
  ```
  Read CLAUDE.md. Read TODO.md. Execute TODO-026.

  1. Run ng build --configuration production.
  2. Serve dist/ with npx http-server -p 4200.
  3. Run Lighthouse CLI:
       npx lighthouse http://localhost:4200 --output json --output html \
         --output-path ./lighthouse-report \
         --only-categories=performance,accessibility,best-practices,seo,pwa
  4. Open lighthouse-report.html. Record scores. Target thresholds:
       Performance >= 80, Accessibility >= 90, Best Practices >= 90, SEO >= 80, PWA >= 80
  5. Fix every Accessibility failure (missing aria-labels, color contrast, focus order).
  6. Fix every Best Practices failure.
  7. For Performance: fix render-blocking resources, missing image dimensions, large layout shifts.
  8. Re-run Lighthouse and confirm all scores meet thresholds.
  9. Delete lighthouse-report.html and lighthouse-report.json before committing
     (add pattern to .gitignore).

  On completion mark TODO-026 as [x] in TODO.md.
  ```

---

*Total: 26 TODOs — 4 blockers, 6 core flows, 6 organiser tools, 3 member screens, 2 design/polish, 3 launch, 2 quality.*
