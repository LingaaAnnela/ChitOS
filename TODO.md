<!-- Read CLAUDE.md first — it has the full stack, design tokens, 
prototype references, and implementation order.

Design source of truth: /design/*.html
These HTML prototypes must be matched exactly — spacing, 
component structure, colors, typography. Do not deviate 
from the design system in CLAUDE.md.

Architecture rules:
- Angular 19 standalone components, zoneless, strict mode
- Tailwind CSS v4 — use CSS custom properties for colors
- NgRx SignalStore for all state — no component-level state
- Mobile first always — 375px base, md:768px, lg:1024px
- Mock data only (environment.useMockData = true) — 
  import from src/app/core/mock/seed.data.ts
- No Supabase calls yet — MockSupabaseService only
- No horizontal overflow anywhere on mobile
- Indian number formatting on all ₹ amounts
- Noto Sans for Telugu/Hindi/Tamil/Kannada/Malayalam text

Today's task: [REPLACE WITH CURRENT STEP]










Build the GroupCard component.
Reference: /design/desktop.html — look for .grp-card 
and .gc-* CSS classes.

It must:
- Accept a Group signal as input (typed from seed.data.ts)
- Show: name, strategy badge, contribution amount, 
  frequency, member count, progress bar, paid/overdue chips
- Mobile: full width card, tap anywhere navigates to group detail
- Desktop: same card used in the groups table row
- Strategy badge colors:
    auction  → blue  (#EFF6FF / #2563EB)
    lottery  → green (#EAF5EE / #16A34A)
    fixed    → amber (#FEF3C7 / #D97706)
    consensus→ grey  (#F1EFE8 / #5F5E5A)
- Progress bar: 3px height, green fill, shows cycle N of M
- Overdue chips: red background avatars, shift left overlapping
- No horizontal overflow — amounts stack, not expand
- Wire to ConsoleStore.selectedGroup signal on tap
- Use IndianCurrencyPipe for all ₹ amounts





We are on Step 18 — swapping mock data to real Supabase.

1. Run supabase/migrations/003_full_schema.sql in Supabase dashboard
2. Enable Supabase Auth (magic link / OTP)
3. Enable Realtime on: contributions, auction_bids, 
   notifications, group_members, announcements
4. Create storage buckets: avatars, logos (both public, 2MB max)
5. Set environment.useMockData = false
6. Replace MockSupabaseService with SupabaseService 
   — same interface (ISupabaseService token)
7. Wire AuthStore to Supabase Auth session
8. Test full flow: signup → create group → invite member 
   → approve → mark contribution → run auction → payout

Do one service at a time. Start with auth, 
confirm it works, then move to data.



/design/landing.html     ← marketing page reference
/design/desktop.html     ← organizer console reference  
/design/mobile.html      ← all 8 mobile screens reference
CLAUDE.md                ← master context for every session
tailwind.config.ts       ← design tokens as Tailwind
src/styles.scss          ← CSS custom properties
src/app/core/mock/       ← seed.data.ts + MockSupabaseService
supabase/migrations/     ← 003_full_schema.sql (run later)

Build flow:
  Prototype → Angular component → MockSupabaseService 
  → Supabase swap → PWA → Capacitor -->