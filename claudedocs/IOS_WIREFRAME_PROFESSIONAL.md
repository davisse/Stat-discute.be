# Stat Discute iOS - Professional Design Specification

**Version:** 2.0 | **Status:** Production Ready | **Last Updated:** November 30, 2025

---

## Document Purpose

This specification provides everything needed to build the Stat Discute iOS app without ambiguity. Every measurement is exact. Every state is defined. Every interaction is specified. This document serves as the single source of truth for designers, developers, and QA.

---

# Part 1: Strategy & Foundation

## 1.1 User Personas

### Primary: "The Sharp" (70% of users)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | Male, 25-40, college-educated, disposable income |
| **Betting Style** | Data-driven, bankroll management focused, seeks +EV |
| **Device Usage** | Checks 5-10x daily, peak 2-3h before games |
| **Session Length** | Quick scans (30s) + deep dives (5-10min) |
| **Technical Comfort** | Understands eFG%, pace, Monte Carlo basics |
| **Primary Goal** | Find profitable bets before line movement |
| **Key Frustration** | "I want signal, not noise. Show me the edge." |

**Jobs to Be Done:**
1. Quickly assess tonight's best betting opportunities
2. Understand WHY a bet has value (methodology transparency)
3. Track my performance with honest, unflattering data
4. Access analysis faster than competing bettors

### Secondary: "The Enthusiast" (25% of users)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | Male/Female, 21-35, NBA fan first, bettor second |
| **Betting Style** | Entertainment-focused, smaller stakes, follows favorites |
| **Device Usage** | Weekend-heavy, during games |
| **Session Length** | Medium (2-3min) |
| **Technical Comfort** | Basic stats, prefers visual verdicts |
| **Primary Goal** | Make informed fun bets on games they watch |
| **Key Frustration** | "Too many numbers. Just tell me what to bet." |

**Jobs to Be Done:**
1. Get a clear recommendation without complexity
2. Feel confident in betting decisions
3. Track bets for bragging rights with friends

### Tertiary: "The Analyst" (5% of users)

| Attribute | Detail |
|-----------|--------|
| **Demographics** | Male, 30-50, builds own models, data professional |
| **Betting Style** | Compares app to personal analysis |
| **Device Usage** | Long research sessions, exports data |
| **Session Length** | Extended (15-30min) |
| **Technical Comfort** | Expert - wants raw data access |
| **Primary Goal** | Validate/compare analysis methodology |
| **Key Frustration** | "Show me the underlying data, not just conclusions." |

---

## 1.2 Design Principles

### Principle 1: Verdict First, Evidence Second

> **Every screen leads with the actionable insight. Supporting data is one tap away.**

**Application:**
- Hero element = Verdict badge (STRONG BET OVER)
- Key metrics visible without scrolling
- Detailed analysis in expandable sections
- Never show raw data without context

**Rationale:** Betting decisions are time-sensitive. Users need to scan quickly and drill down only when interested.

---

### Principle 2: Quantify Uncertainty

> **Never present a prediction without showing confidence bounds.**

**Application:**
- Probability bars instead of single numbers
- 95% confidence intervals on projections
- "68% Over" not "Projected: 224.3"
- Kelly criterion shows risk-adjusted sizing

**Rationale:** Betting is about expected value over many decisions. Overconfidence in any single prediction is dangerous.

---

### Principle 3: Time-Aware Density

> **Information needs change as game time approaches.**

| Time to Game | Information Priority |
|--------------|---------------------|
| >6 hours | Full methodology, historical context |
| 2-6 hours | Key verdict, top factors, line movement |
| <2 hours | Verdict only, final line, quick action |
| During game | Live score, bet tracking, outcome projection |
| Post-game | Result, P&L, lesson learned |

**Application:**
- Automatic UI density adjustment
- Time-based notification content
- Live Activity changes at game start

---

### Principle 4: Bankroll Consciousness

> **Always surface the responsible stake, not just the opportunity.**

**Application:**
- Kelly criterion shown for every bet
- Cumulative performance never hidden
- No "hot streak" psychology exploitation
- Loss streaks shown honestly

**Rationale:** Long-term users require sustainable betting behavior. Churn from blown bankrolls helps no one.

---

### Principle 5: Data Provenance

> **Every number links to its source. Transparency builds trust.**

**Application:**
- "Last updated" timestamps on all data
- Tap any stat to see calculation method
- Differentiate: Historical | Projected | Simulated
- Source attribution (NBA API, Pinnacle, Monte Carlo)

---

### Principle 6: Accessibility as Feature

> **Design for all abilities from the start, not as an afterthought.**

**Application:**
- VoiceOver announces verdicts naturally
- Dynamic Type scales all text
- Color never sole indicator (icons + text)
- 44pt minimum touch targets
- Reduce Motion respected

---

# Part 2: Information Architecture

## 2.1 Navigation Model

```
                    ┌─────────────────────────────────────┐
                    │           TAB BAR (4 items)         │
                    │   Today │ Analysis │ Bets │ More   │
                    └─────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
   │  TODAY  │          │ANALYSIS │          │  BETS   │
   │         │          │         │          │         │
   │ Games   │          │ Segment │          │ Stats   │
   │ Carousel│          │ Picker  │          │ Cards   │
   │         │          │         │          │         │
   │ Top     │          │ Totals  │          │ Trend   │
   │ Picks   │          │ or      │          │ Chart   │
   │         │          │ Props   │          │         │
   │ Props   │          │         │          │ History │
   │ Preview │          │ Games   │          │ List    │
   └────┬────┘          │ List    │          └────┬────┘
        │               └────┬────┘                │
        │                    │                     │
   ┌────▼────────────────────▼─────────────────────▼────┐
   │                    SHEETS & DETAILS                │
   │                                                    │
   │  GameDetailSheet    PropDetailSheet   BetDetail    │
   │  AddBetSheet        PlayerSheet       Settings     │
   └────────────────────────────────────────────────────┘
```

**Navigation Rules:**
1. Tab switching = no animation on content, instant swap
2. Drill-down = push navigation within tab
3. Cross-cutting actions = sheet presentation
4. Back always available via gesture or button

---

## 2.2 Screen Inventory

| Screen | Tab | Type | Priority | Notes |
|--------|-----|------|----------|-------|
| TodayView | Today | Root | P0 | Entry point, daily workflow |
| GameDetailSheet | Today | Sheet | P0 | Full game analysis |
| TotalsAnalysisView | Analysis | Segment | P0 | Monte Carlo results |
| PropsAnalysisView | Analysis | Segment | P0 | Player props |
| PropDetailSheet | Analysis | Sheet | P1 | Deep prop analysis |
| MyBetsView | Bets | Root | P0 | Performance tracking |
| BetDetailView | Bets | Push | P0 | Individual bet analysis |
| AddBetSheet | Bets | Sheet | P0 | Record new bet |
| MoreView | More | Root | P2 | Settings, about |
| PlayersListView | More | Push | P1 | Player browser |
| PlayerDetailSheet | More | Sheet | P1 | Player stats |
| SettingsView | More | Push | P2 | Preferences |

---

## 2.3 Information Hierarchy Per Screen

### TodayView Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 1: Navigation Context                                 │
│ "Today" + Date                                              │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 2: Primary Content (Above Fold)                       │
│ Tonight's Games Carousel                                    │
│ - Each card: Teams + Time + Verdict Preview                │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 3: Actionable Insights                                │
│ Top Value Plays                                             │
│ - Verdict Badge (hero)                                      │
│ - Matchup + Line                                           │
│ - Probability Bar                                          │
│ - EV + Kelly (supporting)                                  │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 4: Secondary Content                                  │
│ Props Highlights                                            │
│ - Player + Line + Edge                                     │
│ - Defense matchup (compact)                                │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 5: Tertiary (Discoverable)                           │
│ Footer: Last updated timestamp                              │
│ Settings: Notification preferences                          │
└─────────────────────────────────────────────────────────────┘
```

---

# Part 3: Visual Specifications

## 3.1 Layout Grid

**Base Unit:** 8pt

**Screen Margins:**
- Leading/Trailing: 16pt (2 units)
- Safe area respected on all edges

**Component Spacing:**
- Section gap: 24pt (3 units)
- Card internal padding: 16pt (2 units)
- Element gap within card: 12pt (1.5 units)
- Text line spacing: 4pt (0.5 units)

**Content Width:**
- Maximum: 428pt (iPhone 15 Pro Max)
- Minimum: 343pt (iPhone SE with margins)
- Cards: Full width minus margins

---

## 3.2 Typography System

| Token | Font | Size | Weight | Line Height | Tracking | Use |
|-------|------|------|--------|-------------|----------|-----|
| `display` | SF Pro Display | 34pt | Bold | 41pt | -0.4pt | Screen titles |
| `title1` | SF Pro Display | 28pt | Bold | 34pt | -0.4pt | Section headers |
| `title2` | SF Pro Text | 22pt | Bold | 28pt | -0.3pt | Card titles |
| `title3` | SF Pro Text | 20pt | Semibold | 25pt | -0.2pt | Subsections |
| `headline` | SF Pro Text | 17pt | Semibold | 22pt | -0.2pt | Emphasis |
| `body` | SF Pro Text | 17pt | Regular | 22pt | 0pt | Default text |
| `callout` | SF Pro Text | 16pt | Regular | 21pt | 0pt | Secondary |
| `subhead` | SF Pro Text | 15pt | Regular | 20pt | 0pt | Tertiary |
| `footnote` | SF Pro Text | 13pt | Regular | 18pt | 0pt | Captions |
| `caption1` | SF Pro Text | 12pt | Regular | 16pt | 0pt | Labels |
| `caption2` | SF Pro Text | 11pt | Regular | 13pt | 0.2pt | Fine print |
| `statLarge` | SF Mono | 32pt | Bold | 38pt | 0pt | Hero numbers |
| `statMedium` | SF Mono | 24pt | Bold | 29pt | 0pt | Key metrics |
| `statSmall` | SF Mono | 17pt | Semibold | 22pt | 0pt | Table values |
| `badge` | SF Pro Text | 11pt | Bold | 13pt | 0.5pt | Verdict text |

**Dynamic Type Scaling:**

| Style | Default | AX-M | AX-L | AX-XL | AX-XXL | AX-XXXL |
|-------|---------|------|------|-------|--------|---------|
| display | 34pt | 38pt | 40pt | 44pt | 48pt | 52pt |
| body | 17pt | 19pt | 21pt | 23pt | 27pt | 33pt |
| statLarge | 32pt | 36pt | 40pt | 44pt | 48pt | 52pt |
| caption1 | 12pt | 14pt | 16pt | 18pt | 22pt | 28pt |

**Layout Adaptations at AX-XL and above:**
- Horizontal stat grids → Vertical stacks
- Probability bar labels move below bar
- Cards expand to accommodate text
- Game carousel becomes vertical list

---

## 3.3 Color System

### Semantic Palette

| Token | Light Mode | Dark Mode | Use |
|-------|------------|-----------|-----|
| `background` | #FFFFFF | #000000 | App background |
| `backgroundElevated` | #F2F2F7 | #1C1C1E | Cards, sheets |
| `backgroundSecondary` | #E5E5EA | #2C2C2E | Grouped content |
| `foreground` | #000000 | #FFFFFF | Primary text |
| `foregroundSecondary` | #3C3C43/60% | #EBEBF5/60% | Secondary text |
| `foregroundTertiary` | #3C3C43/30% | #EBEBF5/30% | Tertiary text |
| `separator` | #3C3C43/20% | #545458/60% | Dividers |
| `positive` | #34C759 | #30D158 | Wins, overs, profit |
| `negative` | #FF3B30 | #FF453A | Losses, unders, loss |
| `warning` | #FF9500 | #FF9F0A | Caution, pending |
| `accent` | #007AFF | #0A84FF | Interactive elements |
| `monteCarlo` | #AF52DE | #BF5AF2 | MC-specific features |

### Contrast Ratios (WCAG 2.1)

| Combination | Ratio | Compliance |
|-------------|-------|------------|
| foreground on background | 21:1 | AAA |
| positive on background | 4.6:1 | AA |
| negative on background | 4.5:1 | AA |
| foregroundSecondary on background | 7.2:1 | AAA |
| positive on backgroundElevated | 4.1:1 | AA (Large text) |

### Color Blind Safe Palette (Alternative)

| Standard | Protanopia/Deuteranopia Safe |
|----------|------------------------------|
| positive (#30D158) | Blue (#0A84FF) |
| negative (#FF453A) | Orange (#FF9F0A) |

**Implementation:** Toggle in Settings → Accessibility → Color Blind Mode

---

## 3.4 Component Specifications

### 3.4.1 Verdict Badge

```
┌─────────────────────────────────────┐
│  ▲  STRONG BET OVER                │
└─────────────────────────────────────┘

Dimensions:
- Height: 36pt (min touch target with container)
- Horizontal padding: 12pt
- Vertical padding: 8pt
- Corner radius: 18pt (fully rounded)
- Icon-text gap: 6pt

Typography:
- Font: SF Pro Text 11pt Bold
- Letter spacing: 0.5pt
- All caps: YES

Colors by Verdict:
┌────────────────────┬─────────────────────┬──────────────┐
│ Verdict            │ Background          │ Foreground   │
├────────────────────┼─────────────────────┼──────────────┤
│ STRONG_BET_OVER    │ positive/15%        │ positive     │
│ BET_OVER           │ positive/10%        │ positive     │
│ LEAN_OVER          │ positive/5%         │ positive/80% │
│ NEUTRAL            │ foreground/5%       │ foreground/50%│
│ LEAN_UNDER         │ negative/5%         │ negative/80% │
│ BET_UNDER          │ negative/10%        │ negative     │
│ STRONG_BET_UNDER   │ negative/15%        │ negative     │
│ NO_BET             │ foreground/5%       │ foreground/40%│
└────────────────────┴─────────────────────┴──────────────┘

Icons:
- STRONG_*: Filled triangle (▲/▼)
- BET_*: Outline triangle (△/▽)
- LEAN_*: Small dot (·)
- NEUTRAL: Em dash (—)
- NO_BET: Circle (○)

Accessibility:
- VoiceOver: "[Verdict]. Recommended betting action."
- Touch target: Extend to 44pt with padding
```

---

### 3.4.2 Probability Bar

```
┌─────────────────────────────────────────────────────────────┐
│ ████████████████████████████░░░░░░░░░░░░  68%      32%     │
│         OVER                              UNDER             │
└─────────────────────────────────────────────────────────────┘

Dimensions:
- Bar height: 8pt
- Corner radius: 4pt (fully rounded)
- Label margin top: 4pt
- Total component height: 28pt

Bar Fill:
- Over (left): LinearGradient
  - Start: positive/80%
  - End: positive/100%
  - Direction: leading → trailing
- Under (right): LinearGradient
  - Start: negative/100%
  - End: negative/80%
  - Direction: leading → trailing

Animation:
- Duration: 600ms
- Curve: easeOut
- Fill from 0% → actual value
- Stagger: Over fills first, then Under

Labels:
- Font: SF Mono 11pt Medium
- Over label: positive color, leading aligned
- Under label: negative color, trailing aligned
- Format: "[percentage]% [O/U]"

Accessibility:
- VoiceOver: "[X] percent over, [Y] percent under"
- Trait: .updatesFrequently (for live games)
```

---

### 3.4.3 Game Card (Carousel)

```
┌─────────────────────────────────────┐
│                                     │
│     [Away Logo]    @    [Home Logo] │
│         BOS              MIA        │
│                                     │
│           7:30 PM ET                │
│                                     │
│     ─────────────────────────────   │
│                                     │
│         O/U 221.5                   │
│                                     │
│     ████████████░░░░░ 68%           │
│                                     │
│       [ STRONG OVER ▲ ]             │
│                                     │
└─────────────────────────────────────┘

Dimensions:
- Width: 156pt
- Height: 200pt
- Corner radius: 20pt
- Padding: 16pt all sides
- Card gap in carousel: 12pt

Background:
- .ultraThinMaterial
- iOS 26: .glassEffect() modifier

Content Spacing:
- Logos section: 48pt height
- Logo size: 36×36pt
- Time: 8pt below logos
- Divider: 12pt vertical margin
- O/U line: 4pt below divider
- Probability bar: 8pt below O/U
- Verdict badge: 12pt below bar (centered)

States:
┌──────────────┬─────────────────────────────────┐
│ State        │ Visual Change                   │
├──────────────┼─────────────────────────────────┤
│ Default      │ Standard appearance             │
│ Pressed      │ scale(0.95), 150ms spring       │
│ Highlighted  │ Border: accent/30%, 2pt         │
│ Live         │ Pulsing dot next to time        │
│ Final        │ Score replaces time             │
└──────────────┴─────────────────────────────────┘

Accessibility:
- Group all content as single element
- Label: "[Away] at [Home], [Time]. [Line]. [Probability]% [verdict]."
- Hint: "Double tap to view game details"
- Trait: .button
```

---

### 3.4.4 Value Play Card

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  [ ▲ STRONG BET OVER ]                                             │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│                                                                     │
│  BOS @ MIA                                           O 221.5       │
│                                                                     │
│  ████████████████████████████░░░░░░░░░░░░  68%              32%   │
│                OVER                                   UNDER         │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ EV          │  │ Kelly       │  │ Mean        │  │ Std Dev   │ │
│  │ +2.1%       │  │ 3.2%        │  │ 224.3       │  │ 12.4      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
│                                                                     │
│                                             7:30 PM ET  ▸          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Dimensions:
- Width: Full width - 32pt margins
- Min height: 180pt
- Corner radius: 16pt
- Padding: 16pt

Layout (top to bottom):
1. Verdict badge: Top left
2. Divider line: 12pt below badge, full width
3. Matchup row: 12pt below divider
   - Teams: Leading
   - Line: Trailing
4. Probability bar: 16pt below matchup
5. Stats grid: 16pt below bar
   - 4 columns, equal width
   - 8pt gap between items
6. Footer: 12pt below grid
   - Time: Trailing
   - Chevron: Trailing edge

Stats Grid Item:
- Label: caption1, foregroundTertiary
- Value: statSmall, foreground (positive/negative for EV)
- Alignment: Leading

Background:
- backgroundElevated
- Border: separator, 1pt

Interaction:
- Tap: Opens GameDetailSheet
- Long press: Context menu (Share, Add to bet slip)
```

---

### 3.4.5 Stat Grid Component

```
┌───────────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │ BANKROLL        │  │ TOTAL P/L       │  │ WIN RATE        │   │
│  │                 │  │                 │  │                 │   │
│  │ 112.50€         │  │ +12.50€         │  │ 62.5%           │   │
│  │ ↑ +12.5%        │  │                 │  │ 5W-3L           │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└───────────────────────────────────────────────────────────────────┘

Grid Configuration:
- Columns: 2 (compact) or 3 (regular) based on width
- Column threshold: <350pt = 2 columns
- Row gap: 12pt
- Column gap: 12pt

Individual Stat Card:
- Min width: 100pt
- Height: 88pt
- Corner radius: 12pt
- Padding: 12pt
- Background: backgroundSecondary

Content Stack:
1. Label: caption1, foregroundSecondary, top
2. Value: statMedium, foreground (or semantic color)
3. Subtitle: caption2, foregroundTertiary

Value Colors:
- Neutral metrics: foreground
- Positive values: positive
- Negative values: negative

Trend Indicator:
- Arrow: ↑ or ↓
- Size: caption1
- Color: matches value color
- Position: Leading of subtitle
```

---

## 3.5 Touch Targets & Interaction Areas

| Element | Visual Size | Touch Target | Method |
|---------|-------------|--------------|--------|
| Tab bar item | 24×24pt icon | 80×49pt | Centered in tab area |
| Game card | 156×200pt | 156×200pt | Full card |
| Verdict badge | ~120×36pt | ~120×48pt | 6pt vertical extension |
| Stat grid item | Variable | Full card | Entire card tappable |
| Table row | Full width × 64pt | Full width × 64pt | Row highlight |
| Close button | 30×30pt | 44×44pt | Centered invisible area |
| Refresh button | 24×24pt | 44×44pt | Centered invisible area |
| Chart data point | 6pt | 44pt radius | Circular hit area |

---

# Part 4: Screen Specifications

## 4.1 Today View

### Layout Specification

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  SAFE AREA TOP (59pt on iPhone 15)                                │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Today                                                  [display]  │
│  Thursday, November 30                           [footnote, gray]  │
│                                                                    │
│  ← 16pt margin                                    16pt margin →    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TONIGHT'S GAMES                                    [title3, 17pt] │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  [Card]  [Card]  [Card]  [Card]  [Card]                   │   │
│  │  156pt   156pt   156pt   156pt   156pt                    │   │
│  │          ← 12pt gap →                                      │   │
│  │                                                            │   │
│  │  ← Horizontal scroll, 16pt leading inset →                │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Section height: 224pt (200pt card + 24pt header)                  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TOP VALUE PLAYS                                    [title3, 17pt] │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  [Value Play Card #1 - Full width]                        │   │
│  │  Height: ~180pt                                           │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ← 12pt gap →                                                      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  [Value Play Card #2 - Full width]                        │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  PROPS HIGHLIGHTS                                   [title3, 17pt] │
│                                                                    │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ J. Tatum PTS        │  │ A. Davis REB        │               │
│  │ O 27.5  (+3.2)      │  │ U 11.5  (-2.1)      │               │
│  │ vs MIA (weak)       │  │ vs GSW (strong)     │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                    │
│  Card width: (screen - 32pt - 12pt) / 2                           │
│  Card height: 80pt                                                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Last updated: 5:32 PM                              [caption2]     │
│                                                                    │
│  SAFE AREA BOTTOM (34pt) + TAB BAR (60pt) = 94pt                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### State Definitions

| State | Trigger | Visual | Duration |
|-------|---------|--------|----------|
| Loading | Initial load, pull refresh | Skeleton screens | Until data |
| Empty | No games today | Empty state illustration | Persistent |
| Loaded | Data received | Full content | Persistent |
| Refreshing | Pull down | Refresh indicator + old data | Until complete |
| Error | Network/server fail | Error banner + cached data | Until refresh |
| Stale | Data >30min old | Warning banner | Until refresh |

### Empty State

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                           🌙                                       │
│                                                                    │
│                    No Games Tonight                                │
│                                                                    │
│              The NBA takes a breather.                             │
│              Check back tomorrow for                               │
│              fresh analysis.                                       │
│                                                                    │
│            ┌─────────────────────────────┐                        │
│            │  Set Reminder for Tomorrow  │                        │
│            └─────────────────────────────┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Specs:
- Icon: 64pt, centered
- Title: title2, 8pt below icon
- Body: body, foregroundSecondary, 8pt below title, center aligned
- Button: Primary style, 24pt below body
```

---

## 4.2 Analysis View - Totals Segment

### Layout Specification

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Analysis                                               [display]  │
│  Monte Carlo powered insights                     [footnote, MC]   │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │          [ Totals ]              [ Props ]                 │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Segmented Control:                                               │
│  - Style: .automatic (iOS 26 material)                            │
│  - Height: 32pt                                                   │
│  - Margin: 16pt horizontal                                        │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │              DISTRIBUTION CHART                            │   │
│  │                                                            │   │
│  │      BOS @ MIA - Total Points Distribution                │   │
│  │                                                            │   │
│  │   ┌────────────────────────────────────────────────────┐  │   │
│  │   │                                                    │  │   │
│  │   │              ╭─────────────╮                      │  │   │
│  │   │            ╭─┤             ├─╮                    │  │   │
│  │   │          ╭─┤ │     ██     │ ├─╮                  │  │   │
│  │   │        ╭─┤ │ │     ██     │ │ ├─╮                │  │   │
│  │   │      ╭─┤ │ │ │     ██     │ │ │ ├─╮              │  │   │
│  │   │    ╭─┤ │ │ │ │     ██     │ │ │ │ ├─╮            │  │   │
│  │   │────┴─┴─┴─┴─┴─┴─────┼┼─────┴─┴─┴─┴─┴─┴────        │  │   │
│  │   │                    ││                            │  │   │
│  │   │    200  210  220  ││230  240  250               │  │   │
│  │   │                   ↑│                             │  │   │
│  │   │               Line: 221.5                        │  │   │
│  │   │                                                    │  │   │
│  │   └────────────────────────────────────────────────────┘  │   │
│  │                                                            │   │
│  │   Mean: 224.3  │  Std: 12.4  │  95% CI: [201, 248]       │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Chart Card:                                                       │
│  - Height: 280pt                                                   │
│  - Chart area: 200pt                                              │
│  - Title: 12pt top margin                                         │
│  - Stats row: 12pt below chart                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TONIGHT'S GAMES (3)                                [title3]       │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ BOS @ MIA                                    7:30 PM ET   │   │
│  │ ────────────────────────────────────────────────────────  │   │
│  │ Line: 221.5    Over: 1.91    Under: 1.91                  │   │
│  │                                                            │   │
│  │ ████████████████████░░░░░░░  68%          32%             │   │
│  │                                                            │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │   │
│  │ │ EV Over  │ │ EV Under │ │  Kelly   │                   │   │
│  │ │  +2.1%   │ │  -4.2%   │ │  3.2%    │                   │   │
│  │ └──────────┘ └──────────┘ └──────────┘                   │   │
│  │                                                            │   │
│  │ ┌─────────────────────────────────────────┐               │   │
│  │ │         STRONG BET OVER    ▲            │               │   │
│  │ └─────────────────────────────────────────┘               │   │
│  │                                                      ▸    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Game Row:                                                         │
│  - Height: ~200pt                                                  │
│  - Separator: 1pt, separator color                                │
│  - Tappable: Full row → GameDetailSheet                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Chart Interaction Specification

| Gesture | Action | Visual Feedback |
|---------|--------|-----------------|
| Tap on chart | Show tooltip at touch point | Tooltip with value |
| Pan horizontally | Select different games | Chart morphs to new data |
| Pinch | Zoom x-axis | Scale factor 0.5× to 2× |
| Long press | Show full stats overlay | Modal overlay |

**Tooltip Design:**
```
┌─────────────────────┐
│ 224 pts            │
│ 52nd percentile    │
│ P(Over): 68%       │
└─────────────────────┘

- Background: backgroundElevated
- Corner radius: 8pt
- Padding: 8pt
- Shadow: medium
- Position: Above touch point, centered
- Dismiss: Tap anywhere else
```

---

## 4.3 My Bets View

### Layout Specification

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  My Bets                                    [+]         [display]  │
│  One bet per day tracking                         [footnote]       │
│                                                                    │
│  Add button: 30×30pt visual, 44×44pt touch target                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                         │
│  │ BANKROLL        │  │ TOTAL P/L       │                         │
│  │                 │  │                 │                         │
│  │ 112.50€         │  │ +12.50€         │                         │
│  │ ↑ +12.5%        │  │ ▸ ROI: +10.4%   │                         │
│  └─────────────────┘  └─────────────────┘                         │
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐                         │
│  │ WIN RATE        │  │ TOTAL BETS      │                         │
│  │                 │  │                 │                         │
│  │ 62.5%           │  │ 12              │                         │
│  │ 5W - 3L - 0P    │  │ 1 pending       │                         │
│  └─────────────────┘  └─────────────────┘                         │
│                                                                    │
│  Grid: 2 columns, 12pt gap                                        │
│  Card height: 88pt                                                │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  PERFORMANCE TREND                                        │   │
│  │                                                            │   │
│  │   +15€│                              ●                    │   │
│  │       │                    ●                              │   │
│  │   +10€│              ●                                    │   │
│  │       │        ●                                          │   │
│  │    +5€│  ●                                                │   │
│  │       │                                                   │   │
│  │     0€│────────────────────────────────────               │   │
│  │       │      ●                                            │   │
│  │    -5€│            ●                                      │   │
│  │       └─────────────────────────────────────              │   │
│  │        Mon  Tue  Wed  Thu  Fri  Sat  Sun                 │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Chart:                                                            │
│  - Height: 180pt                                                   │
│  - Type: LineMark + AreaMark + PointMark                          │
│  - Y-axis: Currency with +/- sign                                 │
│  - X-axis: Day abbreviations                                      │
│  - Zero line: Dashed, gray                                        │
│  - Fill: Gradient, positive above 0, negative below               │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  BET HISTORY                                         [title3]      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Nov 29 • BOS vs MIA                         [✓ WON]       │   │
│  │ Under 221.5 @ 2.07                          +2.14€        │   │
│  │ ──────────────────────────────────────────────────────    │   │
│  │ Final: 108-110 = 218 pts                                  │   │
│  │                                                      ▾    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  Row states:                                                       │
│  - Collapsed: 80pt height                                         │
│  - Expanded: Variable based on analysis content                   │
│  - Tap anywhere: Toggle expansion                                 │
│                                                                    │
│  Result badge:                                                     │
│  - WON: positive background, "✓ WON"                              │
│  - LOST: negative background, "✗ LOST"                            │
│  - PUSH: warning background, "= PUSH"                             │
│  - PENDING: foreground/10%, "⏳ PENDING"                          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Expanded Bet Detail

```
┌────────────────────────────────────────────────────────────────────┐
│ Nov 29 • BOS vs MIA                                    [✓ WON]    │
│ Under 221.5 @ 2.07                                     +2.14€     │
│ ─────────────────────────────────────────────────────────────     │
│                                                                    │
│ FINAL RESULT                                                       │
│ ┌────────────────────────────────────────────────────────────┐    │
│ │                                                            │    │
│ │        BOS 108  —  110 MIA                                │    │
│ │                                                            │    │
│ │        Total: 218 pts                                     │    │
│ │        Line:  221.5 pts                                   │    │
│ │        Diff:  -3.5 ✓                                      │    │
│ │                                                            │    │
│ └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│ KEY FACTORS                                                        │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│ │ Injury     │ │ Trend      │ │ Pace       │ │ H2H        │      │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│                                                                    │
│ ANALYSIS STEPS (11)                                     [▾]       │
│                                                                    │
│  ① Player Impact                                                  │
│     Joel Embiid OUT - PHI averages 9.9 fewer PPG                  │
│                                                                    │
│  ② Historical Pattern                                             │
│     PHI without Embiid: 5 of 6 games went UNDER                   │
│                                                                    │
│  ...                                                              │
│                                                                    │
│ Confidence: 8/10 ████████░░                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

# Part 5: Interaction Specifications

## 5.1 Animation Timing

| Animation | Duration | Easing | Parameters |
|-----------|----------|--------|------------|
| Tab switch | 0ms | instant | Content swap only |
| Card press | 150ms | spring | response: 0.2, damping: 0.7 |
| Sheet present | 500ms | spring | response: 0.5, damping: 0.85 |
| Sheet dismiss | 300ms | spring | response: 0.3, damping: 0.9 |
| List row expand | 300ms | spring | response: 0.35, damping: 0.8 |
| Probability bar fill | 600ms | easeOut | — |
| Chart line draw | 800ms | easeInOut | — |
| Chart point appear | 50ms each | spring | Staggered 50ms delay |
| Verdict badge pulse | 200ms | easeInOut | 2 repetitions |
| Pull refresh | 300ms | linear | — |
| Error shake | 400ms | spring | response: 0.1, damping: 0.2 |
| Success checkmark | 250ms | spring | Scale 0→1.2→1 |

---

## 5.2 Haptic Feedback

| Trigger | Type | Intensity | When |
|---------|------|-----------|------|
| Tab selection | selection | default | On release |
| Game card tap | impact light | 0.5 | On press |
| Game card long press | impact medium | 0.7 | After 0.5s |
| Pull refresh threshold | impact heavy | 1.0 | At trigger point |
| Refresh complete | notification success | default | On data load |
| Refresh fail | notification error | default | On error |
| Bet recorded | notification success | default | After save |
| Bet confirmed win | notification success ×2 | staggered | 0ms, 150ms |
| Invalid input | notification warning | default | On validation fail |
| Slider tick | selection | light | Per value change |
| Context menu open | impact rigid | 0.8 | On menu appear |
| Toggle switch | impact light | 0.4 | On value change |

---

## 5.3 Gesture Priority

```
Priority 1 (System - Never Override):
├── Swipe from left edge (back navigation)
├── Swipe from top (notification center)
├── Swipe from bottom (home indicator/control center)
└── Three-finger gestures (undo/redo)

Priority 2 (Modal Dismissal):
├── Sheet drag down
└── Full screen cover swipe

Priority 3 (Scroll Views):
├── Vertical scroll
├── Horizontal scroll (carousels)
└── Pull to refresh

Priority 4 (Interactive Content):
├── Card tap/long press
├── Chart pan/pinch
├── Slider drag
└── Button press

Priority 5 (Decorative):
└── Parallax effects
```

**Conflict Resolution:**
- Scroll views use `simultaneousGesture` for chart interactions
- Long press requires 500ms to avoid conflict with scroll
- Carousel uses paging, not free scroll

---

## 5.4 Keyboard & Input

**Numeric Input (Stakes, Lines):**
- Keyboard: `.decimalPad`
- Format: 2 decimal places
- Validation: >0, ≤max bankroll

**Search:**
- Keyboard: `.default`
- Behavior: Instant search on type
- Debounce: 300ms

**Focus Order:**
- Tab through form fields top to bottom
- Return key advances to next field
- Final field dismisses keyboard

---

# Part 6: Advanced Features

## 6.1 Live Activities

### Compact Presentation (Lock Screen)

```
┌────────────────────────────────────────────────────────────────────┐
│ 🏀 BOS 78 - 72 MIA   Q3 4:32          Your bet: U221.5 ✓ 150    │
└────────────────────────────────────────────────────────────────────┘

Height: 36pt
Leading: App icon (20×20pt) + sport emoji
Center: Score + Quarter + Time
Trailing: Bet status + current total
Update frequency: Every possession (~30s)
```

### Expanded Presentation (Dynamic Island)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│   🏀 BOS              Q3  4:32              MIA 🏀                 │
│      78                                      72                    │
│                                                                    │
│   ─────────────────────────────────────────────────────────────   │
│                                                                    │
│   Your Bet: Under 221.5 @ 2.07                                    │
│   Current Total: 150 pts                                          │
│   Status: ✓ On pace for UNDER                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Dimensions: Full expanded island
Update: Real-time score updates
Tap action: Opens GameDetailSheet
```

### State Transitions

| Game State | Live Activity State |
|------------|---------------------|
| Not started | Countdown to tip-off |
| Q1-Q4 | Live score + bet tracking |
| Halftime | Score + "Halftime" label |
| OT | Score + "OT" indicator |
| Final | Final score + bet result |
| Bet won | Celebratory state |
| Bet lost | Muted state |

---

## 6.2 Widgets

### Small Widget (141×141pt)

```
┌───────────────────────────┐
│                           │
│  🏀 TOP PICK              │
│                           │
│  BOS @ MIA                │
│  O 221.5                  │
│                           │
│  ████████░░░  68%         │
│                           │
│  STRONG OVER              │
│                           │
└───────────────────────────┘

Content:
- Header: Sport icon + "TOP PICK" label
- Matchup: Teams
- Line: Over/Under value
- Probability: Compact bar
- Verdict: Badge text only
```

### Medium Widget (329×141pt)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🏀 TONIGHT'S PICKS                                                 │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │ BOS @ MIA       │  │ LAL @ GSW       │  │ PHX @ DEN       │    │
│  │ O 221.5         │  │ O 234.5         │  │ U 225.0         │    │
│  │ 68% OVER        │  │ 55% OVER        │  │ 72% UNDER       │    │
│  │ STRONG ▲        │  │ LEAN △          │  │ BET ▼           │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Content:
- Header: Sport icon + title
- 3 game previews in horizontal layout
- Each: Matchup, line, verdict mini-badge
```

### Large Widget (329×345pt)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🏀 STAT DISCUTE                                                    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ TOP VALUE PLAY                                                │ │
│  │                                                               │ │
│  │ BOS @ MIA                                        O 221.5      │ │
│  │                                                               │ │
│  │ ████████████████████░░░░░░░  68%              32%            │ │
│  │                                                               │ │
│  │ EV: +2.1%    Kelly: 3.2%    Mean: 224.3                      │ │
│  │                                                               │ │
│  │                    [ STRONG BET OVER ▲ ]                      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ BANKROLL             │  │ TODAY'S RECORD       │               │
│  │ 112.50€ (+12.5%)     │  │ 2W - 1L              │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                     │
│  Next game in 2h 15m                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6.3 Push Notifications

| Trigger | Timing | Title | Body |
|---------|--------|-------|------|
| New strong pick | 3h before game | Strong Edge Found | BOS@MIA O221.5 has +2.1% EV. 68% probability. |
| Line movement | On significant move | Line Moving | BOS@MIA total dropped 221.5 → 219.5. Your edge increased. |
| Game starting | 15min before | Game Starting Soon | BOS@MIA tips off in 15 minutes. |
| Halftime update | At halftime | Halftime: On Track | BOS@MIA at 98 pts. Your Under 221.5 looking good. |
| Bet won | At final | You Won! | BOS@MIA Under hit. Total: 218. Profit: +2.14€ |
| Bet lost | At final | Tough Loss | BOS@MIA Over hit. Total: 229. Don't chase. |
| Weekly summary | Monday 9am | Weekly Performance | Last week: 5-3, +8.50€, 12.5% ROI. |

**Notification Settings (User Configurable):**
- [ ] New value plays
- [ ] Line movements
- [ ] Game reminders
- [ ] Bet tracking (halftime/final)
- [ ] Weekly summaries
- Quiet hours: 11pm - 8am (default)

---

## 6.4 Siri Shortcuts

| Phrase | Action | Response |
|--------|--------|----------|
| "What's the best bet tonight?" | Fetch top EV pick | "[Matchup] [verdict] at [odds]. [EV]% expected value." |
| "How are my bets doing?" | Fetch bankroll status | "You're at [amount], [direction] [percent] overall. [Record] this week." |
| "Show tonight's games" | Open TodayView | Opens app to Today tab |
| "Record a bet on [team]" | Open AddBetSheet with team pre-filled | Opens bet form |

---

## 6.5 Deep Linking

| URL | Destination | Parameters |
|-----|-------------|------------|
| `statdiscute://` | TodayView | — |
| `statdiscute://game/{id}` | GameDetailSheet | game_id |
| `statdiscute://analysis` | AnalysisView | — |
| `statdiscute://analysis/totals` | TotalsAnalysisView | — |
| `statdiscute://analysis/props` | PropsAnalysisView | — |
| `statdiscute://analysis/props?game={id}` | PropsAnalysisView (filtered) | game_id |
| `statdiscute://bets` | MyBetsView | — |
| `statdiscute://bets/{id}` | BetDetailView | bet_id |
| `statdiscute://bets/add` | AddBetSheet | — |
| `statdiscute://bets/add?game={id}` | AddBetSheet (pre-filled) | game_id |
| `statdiscute://player/{id}` | PlayerDetailSheet | player_id |
| `statdiscute://settings` | SettingsView | — |

---

# Part 7: Accessibility

## 7.1 VoiceOver

### Screen Announcements

**TodayView Load:**
> "Today, Thursday November 30. 3 games tonight. Showing top value plays."

**Game Card:**
> "Boston at Miami, 7:30 PM Eastern. Over Under 221 point 5. 68 percent probability over. Strong bet over. Double tap for details."

**Probability Bar:**
> "68 percent over, 32 percent under."

**Verdict Badge:**
> "Strong bet over. Recommended action based on Monte Carlo analysis."

**Bet Row:**
> "November 29. Boston versus Miami. Under 221 point 5 at 2.07 odds. Won. Plus 2 euros 14 cents profit. Double tap to expand."

### Chart Accessibility

**Distribution Chart:**
> "Distribution chart showing projected total points for Boston at Miami. Mean projection 224 point 3 points. 95 percent confidence interval from 201 to 248 points. Betting line at 221 point 5. Use rotor to navigate data points."

**Rotor Navigation:**
- Swipe up/down: Move between percentiles
- At each percentile: "[X]th percentile: [value] points"

### Traits

| Element | Traits |
|---------|--------|
| Game card | .button |
| Verdict badge | .staticText |
| Probability bar | .updatesFrequently |
| Chart | .image (with audio graph) |
| Bet row | .button, .header |
| Stat card | .staticText |
| Refresh button | .button |

---

## 7.2 Dynamic Type

### Layout Adaptations

**At AX-XL (23pt body):**
- Stat grid: 2 columns → 1 column
- Game card carousel: Horizontal → Vertical list
- Probability bar labels: Inline → Below bar
- Value play card stats: 4 columns → 2 columns

**At AX-XXL (27pt body):**
- All above plus:
- Navigation becomes scrollable
- Sheet detents increase to .large minimum

**At AX-XXXL (33pt body):**
- All above plus:
- Cards become single-column lists
- Charts show only key values, details in separate view

### Minimum Touch Targets at Large Text

All interactive elements maintain 44×44pt minimum regardless of text size.

---

## 7.3 Color Blindness

### Standard vs. Color Blind Modes

| Standard | Protanopia/Deuteranopia | Tritanopia |
|----------|-------------------------|------------|
| positive (#30D158) | Blue (#0A84FF) | Cyan (#64D2FF) |
| negative (#FF453A) | Orange (#FF9F0A) | Magenta (#FF6482) |

### Non-Color Indicators

Every color-coded element also has:
- **Text label**: "WON", "LOST", "OVER", "UNDER"
- **Icon**: ▲, ▼, ✓, ✗
- **Pattern** (charts): Solid vs. dashed lines

---

## 7.4 Reduce Motion

When `UIAccessibility.isReduceMotionEnabled`:

| Standard | Reduced |
|----------|---------|
| Spring animations | Instant transitions |
| Chart draw animations | Immediate render |
| Card scale press effect | Opacity change (1.0 → 0.8) |
| Pull refresh bounce | Standard indicator |
| Probability bar fill | Immediate fill |
| Sheet present spring | Crossfade |

---

# Part 8: Technical Architecture

## 8.1 Project Structure

```
StatDiscute/
├── App/
│   ├── StatDiscuteApp.swift
│   └── ContentView.swift
│
├── Features/
│   ├── Today/
│   │   ├── TodayView.swift
│   │   ├── TodayViewModel.swift
│   │   ├── Components/
│   │   │   ├── GameCard.swift
│   │   │   ├── ValuePlayCard.swift
│   │   │   └── PropsHighlightCard.swift
│   │   └── TodayView+Accessibility.swift
│   │
│   ├── Analysis/
│   │   ├── AnalysisView.swift
│   │   ├── TotalsAnalysisView.swift
│   │   ├── TotalsViewModel.swift
│   │   ├── PropsAnalysisView.swift
│   │   ├── PropsViewModel.swift
│   │   └── Components/
│   │       ├── MonteCarloChart.swift
│   │       ├── GameAnalysisRow.swift
│   │       └── PropsTable.swift
│   │
│   ├── Bets/
│   │   ├── MyBetsView.swift
│   │   ├── BetsViewModel.swift
│   │   ├── BetDetailView.swift
│   │   ├── AddBetSheet.swift
│   │   └── Components/
│   │       ├── BankrollDashboard.swift
│   │       ├── PerformanceChart.swift
│   │       └── BetHistoryRow.swift
│   │
│   └── More/
│       ├── MoreView.swift
│       ├── PlayersListView.swift
│       ├── PlayerDetailSheet.swift
│       └── SettingsView.swift
│
├── Core/
│   ├── DesignSystem/
│   │   ├── Colors.swift
│   │   ├── Typography.swift
│   │   ├── Spacing.swift
│   │   └── Animations.swift
│   │
│   ├── Components/
│   │   ├── VerdictBadge.swift
│   │   ├── ProbabilityBar.swift
│   │   ├── StatCard.swift
│   │   ├── GlassCard.swift
│   │   └── FloatingTabBar.swift
│   │
│   ├── Charts/
│   │   ├── DistributionChart.swift
│   │   ├── TrendChart.swift
│   │   └── StatsBarChart.swift
│   │
│   └── Extensions/
│       ├── View+Haptics.swift
│       ├── View+Accessibility.swift
│       └── Color+Hex.swift
│
├── Domain/
│   ├── Models/
│   │   ├── Game.swift
│   │   ├── MonteCarloResult.swift
│   │   ├── Bet.swift
│   │   ├── Player.swift
│   │   └── PlayerProp.swift
│   │
│   ├── UseCases/
│   │   ├── GetTodayGamesUseCase.swift
│   │   ├── GetTotalsAnalysisUseCase.swift
│   │   ├── RecordBetUseCase.swift
│   │   └── GetBetHistoryUseCase.swift
│   │
│   └── Repositories/
│       ├── GamesRepositoryProtocol.swift
│       ├── BetsRepositoryProtocol.swift
│       └── PlayersRepositoryProtocol.swift
│
├── Data/
│   ├── Network/
│   │   ├── APIClient.swift
│   │   ├── Endpoints.swift
│   │   └── DTOs/
│   │       ├── GameDTO.swift
│   │       ├── MonteCarloDTO.swift
│   │       └── BetDTO.swift
│   │
│   ├── Persistence/
│   │   ├── SwiftDataContainer.swift
│   │   ├── CachedGame.swift
│   │   └── CachedBet.swift
│   │
│   └── Repositories/
│       ├── GamesRepository.swift
│       ├── BetsRepository.swift
│       └── PlayersRepository.swift
│
├── LiveActivity/
│   ├── GameLiveActivity.swift
│   └── GameActivityAttributes.swift
│
├── Widget/
│   ├── StatDiscuteWidget.swift
│   ├── SmallWidget.swift
│   ├── MediumWidget.swift
│   └── LargeWidget.swift
│
└── Resources/
    ├── Assets.xcassets
    ├── Localizable.strings
    └── team_logos/
```

---

## 8.2 State Management

### ViewState Pattern

```swift
@Observable
final class TodayViewModel {
    private(set) var state: ViewState<TodayData> = .idle

    private let getTodayGamesUseCase: GetTodayGamesUseCaseProtocol

    func load() async {
        state = .loading
        do {
            let data = try await getTodayGamesUseCase.execute()
            state = .loaded(data)
        } catch {
            state = .error(error)
        }
    }

    func refresh() async {
        guard case .loaded(let currentData) = state else { return }
        state = .refreshing(currentData)
        // ... refresh logic
    }
}

enum ViewState<T> {
    case idle
    case loading
    case loaded(T)
    case refreshing(T)
    case error(Error)

    var data: T? {
        switch self {
        case .loaded(let data), .refreshing(let data): return data
        default: return nil
        }
    }

    var isLoading: Bool {
        if case .loading = self { return true }
        return false
    }
}
```

---

## 8.3 Performance Targets

| Metric | Target | Maximum | Measurement |
|--------|--------|---------|-------------|
| Cold launch | <1.0s | 2.0s | Time to interactive |
| Warm launch | <0.3s | 0.5s | Time to interactive |
| Tab switch | <50ms | 100ms | Frame completion |
| Data refresh | <500ms | 2.0s | API response + render |
| Chart render | <16ms | 33ms | Single frame |
| Memory (idle) | <50MB | 100MB | Instruments |
| Memory (active) | <150MB | 250MB | Instruments |
| Battery (1h) | <5% | 10% | Battery level delta |

---

## 8.4 Testing Strategy

| Layer | Type | Coverage | Tools |
|-------|------|----------|-------|
| ViewModels | Unit | 90%+ | XCTest |
| UseCases | Unit | 95%+ | XCTest |
| Repositories | Integration | 80%+ | XCTest + Mock Server |
| API Client | Unit | 85%+ | XCTest + URLProtocol |
| Views | Snapshot | Key screens | swift-snapshot-testing |
| E2E | UI Tests | Happy paths | XCUITest |
| Accessibility | Audit | All screens | Accessibility Inspector |
| Performance | Benchmark | Critical paths | XCTest + Instruments |

---

# Part 9: Implementation Checklist

## Phase 1: Foundation (Week 1-2)
- [ ] Project setup with SwiftUI + SwiftData
- [ ] Design system (Colors, Typography, Spacing)
- [ ] Core components (VerdictBadge, ProbabilityBar, GlassCard)
- [ ] Tab bar navigation
- [ ] API client with basic caching
- [ ] Error handling infrastructure

## Phase 2: Core Screens (Week 3-5)
- [ ] TodayView with game carousel
- [ ] TotalsAnalysisView with Monte Carlo chart
- [ ] PropsAnalysisView with table
- [ ] MyBetsView with dashboard
- [ ] AddBetSheet form
- [ ] GameDetailSheet

## Phase 3: Data & Offline (Week 6-7)
- [ ] SwiftData persistence layer
- [ ] Offline-first data flow
- [ ] Background refresh
- [ ] Cache invalidation
- [ ] Sync conflict resolution

## Phase 4: Advanced Features (Week 8-9)
- [ ] Live Activities
- [ ] Widgets (Small, Medium, Large)
- [ ] Push notifications
- [ ] Deep linking
- [ ] Siri shortcuts
- [ ] Spotlight indexing

## Phase 5: Accessibility & Polish (Week 10-11)
- [ ] VoiceOver audit
- [ ] Dynamic Type testing
- [ ] Color blind mode
- [ ] Reduce Motion support
- [ ] Haptic feedback refinement
- [ ] Animation polish

## Phase 6: Testing & Launch (Week 12)
- [ ] Unit test completion
- [ ] UI test automation
- [ ] Performance optimization
- [ ] App Store assets
- [ ] TestFlight beta
- [ ] Launch

---

# Appendix A: Measurement Reference

## Device Dimensions

| Device | Screen | Safe Top | Safe Bottom | Width Class |
|--------|--------|----------|-------------|-------------|
| iPhone SE (3rd) | 375×667 | 20pt | 0pt | Compact |
| iPhone 15 | 393×852 | 59pt | 34pt | Compact |
| iPhone 15 Plus | 430×932 | 59pt | 34pt | Compact |
| iPhone 15 Pro | 393×852 | 59pt | 34pt | Compact |
| iPhone 15 Pro Max | 430×932 | 59pt | 34pt | Compact |

## Color Hex Reference

```swift
// Primary
let background = Color(hex: "000000")
let foreground = Color(hex: "FFFFFF")

// Semantic
let positive = Color(hex: "30D158")
let negative = Color(hex: "FF453A")
let warning = Color(hex: "FF9F0A")
let accent = Color(hex: "0A84FF")
let monteCarlo = Color(hex: "BF5AF2")

// Grays
let gray1 = Color(hex: "8E8E93")
let gray2 = Color(hex: "636366")
let gray3 = Color(hex: "48484A")
let gray4 = Color(hex: "3A3A3C")
let gray5 = Color(hex: "2C2C2E")
let gray6 = Color(hex: "1C1C1E")
```

---

**Document End**

*This specification represents a complete design system for the Stat Discute iOS application. Every measurement, color, animation, and interaction has been specified to enable implementation without ambiguity.*
