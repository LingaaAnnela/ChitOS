## Angular version
Angular 21 (November 2025). Zoneless by default — do NOT use 
provideExperimentalZonelessChangeDetection(). Use 
provideZonelessChangeDetection() (stable). File naming follows 
2025 style guide (app.ts not app.component.ts). Tests use Vitest 
with await fixture.whenStable() not fixture.detectChanges().
Signal Forms available at @angular/forms/signals for new forms.
Run `ng mcp` to connect Claude Code to this project.


## Design system & prototypes

All UI must match the warm functional theme exactly.
Prototype HTML files are in /design — reference them before 
building any component.

### Core design tokens
- Background page:     #F9F7F4  (warm off-white, never pure white)
- Background card:     #FFFFFF  (white cards on warm bg)
- Background surface:  #F2EFE9  (sidebar, section bands)
- Text primary:        #1A1A1A
- Text secondary:      #6B6B6B
- Text tertiary:       #A8A39A
- Border default:      rgba(0,0,0,0.07)   — 0.5px only
- Border emphasis:     rgba(0,0,0,0.13)
- Success green:       #16A34A  / bg #EAF5EE  / border rgba(22,163,74,0.2)
- Warning amber:       #D97706  / bg #FEF3C7  / border rgba(217,119,6,0.2)
- Danger red:          #DC2626  / bg #FEE2E2  / border rgba(220,38,38,0.2)
- Info blue:           #2563EB  / bg #EFF6FF  / border rgba(37,99,235,0.2)
- Saffron accent:      #E67C2A  / bg #FEF0E6  (celebration moments)

### Typography
- Headings:   Newsreader serif, font-weight 300, italic for emphasis
- Body:       DM Sans 300 / 400 / 500
- Mono/labels: JetBrains Mono 400
- Indian scripts: Noto Sans (te, hi, ta, kn, ml)

### Rules — never break these
- Border weight: always 0.5px — never 1px or 2px
- Border radius: 12px cards, 8px elements, 100px pills
- No box shadows, no gradients, no glow
- No hardcoded colors — always CSS custom properties
- All amounts: Indian number formatting ₹1,00,000 not ₹100,000
- Dates: DD MMM YYYY (15 Apr 2026)
- Mobile first — build 375px layout first, then md: 768px, lg: 1024px

### Layout rules
- Mobile:  single column, bottom nav (5 tabs), no horizontal overflow
- Tablet:  sidebar collapses to overlay, 2-col grids max
- Desktop: 220px sticky sidebar, main content scrolls

### Prototype reference
Before building any screen, read the matching HTML in /design/
The prototypes are the source of truth for spacing, component 
structure, and interaction patterns.