# Story 1.7: Club Search & Filter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to search and filter clubs in the marketplace by name or ticker,
so that I can quickly find the specific club I'm looking for.

## Acceptance Criteria

### AC1: Search Input Visible at Top of Marketplace

**Given** a user is on the marketplace page
**When** a search input is visible at the top of the club list
**Then** the input has a glass background (`rgba(255, 255, 255, 0.08)`), glass-border (`rgba(255, 255, 255, 0.12)`), and coral focus ring (`#F46D5B`, 2px)
**And** placeholder text reads "Search clubs..."

### AC2: Real-Time Client-Side Filtering

**Given** a user types in the search input
**When** they enter text (e.g., "Juv" or "BVB")
**Then** the club list filters in real-time (client-side) to show only clubs matching by name or ticker
**And** filtering is case-insensitive

### AC3: Empty State for No Results

**Given** a search returns no results
**When** no clubs match the query
**Then** "No clubs match your search" is displayed in text-secondary, centered
**And** a ghost "Clear search" button is available to reset the list

### AC4: Clear Search Functionality

**Given** a user wants to clear the search
**When** they tap "Clear search" or clear the input
**Then** the full club list is restored immediately

### AC5: Desktop Auto-Focus Prevention

**Given** the marketplace is viewed on desktop
**When** the page loads
**Then** the search input does not auto-focus (to avoid disrupting tab navigation)

## Tasks / Subtasks

- [x] Task 1: Add search state to marketplace page (AC: #1, #2, #5)
  - [x] 1.1: In `src/app/(main)/clubs/page.tsx`, add a `searchQuery` state variable using `useState('')`
  - [x] 1.2: Import and render the shadcn `Input` component above the club list with placeholder "Search clubs..." and glass styling
  - [x] 1.3: Style the Input: `bg-glass border-glass-border focus-visible:ring-coral focus-visible:ring-2 text-text placeholder:text-text-secondary`
  - [x] 1.4: Bind the Input's `onChange` to update `searchQuery` state
  - [x] 1.5: Do NOT set `autoFocus` on the input — desktop must not auto-focus (AC5)

- [x] Task 2: Implement client-side filtering logic (AC: #2)
  - [x] 2.1: Create a `filteredClubs` derived value using `useMemo` that filters the clubs array from `useClubs()` based on `searchQuery`
  - [x] 2.2: Filter logic: `club.name.toLowerCase().includes(query.toLowerCase()) || club.ticker.toLowerCase().includes(query.toLowerCase())`
  - [x] 2.3: Pass `filteredClubs` to the `ClubCrestRow` rendering loop instead of the raw clubs array
  - [x] 2.4: Preserve the existing sort order (price highest first) — filtering removes non-matching clubs but does not re-sort

- [x] Task 3: Implement empty state (AC: #3, #4)
  - [x] 3.1: When `filteredClubs.length === 0` AND `searchQuery.length > 0`, render the empty state instead of the club list
  - [x] 3.2: Empty state content: "No clubs match your search" in `text-text-secondary`, centered (`text-center`)
  - [x] 3.3: Below the message, render a ghost button (secondary style): "Clear search" using the shadcn `Button` with `variant="ghost"` and coral text
  - [x] 3.4: "Clear search" button `onClick` sets `searchQuery` to `''`
  - [x] 3.5: Also add a clear icon (X) inside the search input (using `lucide-react` `X` icon) that appears when `searchQuery.length > 0` — tapping it clears the input

- [x] Task 4: Write co-located tests (AC: all)
  - [x] 4.1: Create `src/app/(main)/clubs/page.test.tsx` (or add to existing test file if one exists from Story 1.4)
  - [x] 4.2: Test: search input renders with correct placeholder "Search clubs..."
  - [x] 4.3: Test: typing in search input filters club list — only matching clubs shown
  - [x] 4.4: Test: filtering is case-insensitive (typing "juv" matches "Juventus")
  - [x] 4.5: Test: filtering by ticker works (typing "BVB" matches Borussia Dortmund)
  - [x] 4.6: Test: empty state shows "No clubs match your search" when no matches
  - [x] 4.7: Test: "Clear search" button resets the list to all clubs
  - [x] 4.8: Test: search input does NOT have `autoFocus` attribute

- [x] Task 5: Integration verification (AC: all)
  - [x] 5.1: Load marketplace page — search input visible at top with glass styling
  - [x] 5.2: Type "Juv" — only Juventus row visible
  - [x] 5.3: Type "BVB" — only Borussia Dortmund visible
  - [x] 5.4: Type "zzzzz" — empty state with "No clubs match your search" + "Clear search" button
  - [x] 5.5: Click "Clear search" — full club list restored
  - [x] 5.6: On desktop, verify search input does NOT auto-focus on page load
  - [x] 5.7: Verify `npm run build` succeeds
  - [x] 5.8: Verify `npm run test:ci` passes (all existing + new tests)
  - [x] 5.9: Verify ESLint passes with zero errors

## Dev Notes

### Implementation Approach

This story is **purely client-side** — no new API routes, no database changes, no new hooks. It adds search/filter functionality to the existing marketplace page built in Story 1.4.

The search filters the **already-loaded** clubs array in memory. Since the marketplace loads all ~15 clubs at once (not paginated), client-side filtering is the correct approach — no server-side search needed.

### Search Input Styling

The search input must match the Fantera design system. Use the existing shadcn `Input` component (already installed at `src/components/ui/input.tsx`) with glass styling overrides:

```tsx
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

// Inside the marketplace page component:
const [searchQuery, setSearchQuery] = useState('');

<div className="relative">
  <Input
    type="text"
    placeholder="Search clubs..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="bg-glass border-glass-border focus-visible:ring-coral focus-visible:ring-2 text-text placeholder:text-text-secondary"
  />
  {searchQuery.length > 0 && (
    <button
      onClick={() => setSearchQuery('')}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
      aria-label="Clear search"
    >
      <X className="h-4 w-4" />
    </button>
  )}
</div>
```

**Key styling notes:**
- `bg-glass` = `rgba(255, 255, 255, 0.08)` — matches glassmorphism pattern
- `border-glass-border` = `rgba(255, 255, 255, 0.12)` — matches all interactive glass surfaces
- `focus-visible:ring-coral` = `#F46D5B` focus ring — matches all Fantera inputs
- The X clear button is positioned inside the input on the right — standard search pattern
- Verify these Tailwind utility classes exist in the project's Tailwind config (from Story 1.1). If custom classes like `bg-glass` aren't defined, use the raw values: `bg-[rgba(255,255,255,0.08)]` `border-[rgba(255,255,255,0.12)]` `focus-visible:ring-[#F46D5B]`

### Filtering Logic

```tsx
import { useMemo, useState } from 'react';

// Inside the marketplace page component:
const { data: clubsData, isPending } = useClubs();
const { data: pricesData } = usePrices(); // From Story 1.6

const [searchQuery, setSearchQuery] = useState('');

const filteredClubs = useMemo(() => {
  const clubs = clubsData?.data ?? [];
  if (!searchQuery.trim()) return clubs;

  const query = searchQuery.toLowerCase().trim();
  return clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(query) ||
      club.ticker.toLowerCase().includes(query)
  );
}, [clubsData?.data, searchQuery]);
```

**Key notes:**
- Uses `useMemo` to avoid filtering on every render — only recomputes when `clubsData` or `searchQuery` change
- Trims whitespace from the query to prevent filtering on accidental spaces
- Empty/whitespace-only query returns the full list (no unnecessary filtering)
- Preserves the original sort order (highest price first, established in Story 1.4)
- Matches against both `name` (e.g., "Juventus") AND `ticker` (e.g., "JUVE") — case-insensitive

### Empty State

```tsx
{filteredClubs.length === 0 && searchQuery.length > 0 ? (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <p className="text-text-secondary text-center">
      No clubs match your search
    </p>
    <Button
      variant="ghost"
      onClick={() => setSearchQuery('')}
      className="text-coral hover:text-coral/80"
    >
      Clear search
    </Button>
  </div>
) : (
  // Render filteredClubs list...
)}
```

**Key notes:**
- Only shows empty state when there IS a search query but zero results — not on initial load
- "Clear search" ghost button uses coral text — matches the CTA color system
- Generous padding (`py-16`) keeps the empty state centered and not cramped
- Uses shadcn `Button` with `variant="ghost"` — already styled for the design system

### Project Structure After This Story

```
fantera/src/
├── app/
│   ├── (main)/
│   │   ├── clubs/
│   │   │   ├── page.tsx            ← MODIFIED: add search state, Input, filtering logic, empty state
│   │   │   ├── page.test.tsx       ← MODIFIED or NEW: add search/filter tests
│   │   │   └── [clubId]/
│   │   │       └── page.tsx        ← unchanged
```

**This story touches exactly ONE file** (plus its test file). No new components, no new hooks, no new API routes.

### Architecture Compliance

**Naming conventions (enforced):**
- State variable: camelCase (`searchQuery`)
- Event handler: camelCase, verb-first (`setSearchQuery`)
- Component usage: PascalCase (`<Input />`, `<Button />`)

**Anti-patterns to PREVENT:**
- DO NOT create a separate search component — the search is simple enough to live inline in the marketplace page
- DO NOT create a custom `useSearch()` hook — this is a single `useState` + `useMemo`, no abstraction needed
- DO NOT add debouncing — with ~15 clubs filtering in memory, there's zero performance concern. Debouncing would only add input latency.
- DO NOT add server-side search/API endpoint — the full club list is already loaded client-side
- DO NOT add sorting controls or sort toggles — not in scope for this story
- DO NOT add filters beyond text search (e.g., by league, country) — not in MVP scope (FR9 only specifies search by name/ticker)
- DO NOT auto-focus the search input — AC5 explicitly prevents this on desktop. Mobile keyboard should not pop up unexpectedly either.
- DO NOT install any search library (Fuse.js, etc.) — simple string `includes()` is sufficient for ~15 items

**Patterns to FOLLOW:**
- `useMemo` for derived/computed values (filtering the clubs array)
- `useState` for local UI state (search query)
- shadcn/ui `Input` and `Button` components — never install additional UI libraries
- `lucide-react` icons for the clear (X) button — already installed
- Glass styling tokens from the design system (Story 1.1)

### Library & Framework Requirements

| Library | Status | Used For |
|---|---|---|
| `react` | Already installed | `useState`, `useMemo` |
| `shadcn/ui Input` | Already installed (src/components/ui/input.tsx) | Search input with glass styling |
| `shadcn/ui Button` | Already installed | "Clear search" ghost button |
| `lucide-react` | Already installed | X icon for clearing the search input |

**No new dependencies needed for this story.**

### Testing Requirements

**Co-located tests required for this story:**

1. `src/app/(main)/clubs/page.test.tsx` — Search & filter tests:
   - Search input renders with placeholder "Search clubs..."
   - Typing filters the club list to matching results
   - Filtering is case-insensitive ("juv" matches "Juventus")
   - Filtering by ticker works ("BVB" matches Borussia Dortmund)
   - Non-matching query shows empty state: "No clubs match your search"
   - "Clear search" button resets to full list
   - Clear X icon in input resets to full list
   - Search input does NOT have `autoFocus` attribute
   - Empty search query (spaces only) shows full list

**All existing tests must continue to pass** (from Stories 1.1, 1.2, 1.3, 1.4, 1.5, 1.6).

### Previous Story Intelligence

**From Story 1.6 (Real-Time Price Feed — ready-for-dev):**
- `usePrices()` hook with `refetchInterval: 30000` — search should filter against the club names/tickers, not the prices
- Price overlay logic: `useClubs()` provides base data, `usePrices()` overlays live prices — filtering applies to the club data, not the price data
- The filtering should occur BEFORE the price overlay merge, or on the merged result — either works since filtering is by name/ticker, not price

**From Story 1.4 (Club Marketplace — ready-for-dev):**
- `useClubs()` hook with `['clubs']` query key — provides the clubs array to filter
- `ClubCrestRow` component renders each club row — this story doesn't modify it, just controls which clubs are passed to it
- Marketplace page sorts clubs by price (highest first) — filtering preserves this sort order
- Clubs data shape includes `name` and `ticker` fields — confirmed by the Prisma Club model and API response

**From Story 1.2 (Auth — done):**
- Marketplace page is behind auth guard — search only available to authenticated users (no change needed)

**From Story 1.1 (Foundation — done):**
- Design system tokens: `glass`, `glass-border`, `coral`, `text-secondary` — use these for search input styling
- shadcn/ui `Input` component already installed and themed
- `lucide-react` already installed for icons

**Key dependency:** Stories 1.4, 1.5, and 1.6 should be completed before starting 1.7. The search builds on the existing marketplace page with the club list, ClubCrestRow component, and price overlay. Without these, there's nothing to search.

### Git Intelligence

Recent commits are landing page related (HTML, fonts, CNAME). The Next.js app lives in `fantera/`. No recent app code commits visible. The dev agent should verify that Stories 1.4-1.6 have been implemented and their tests pass before beginning 1.7 work.

### Latest Tech Information (as of Feb 2026)

**React 19.2 — useMemo:**
- `useMemo` is stable and recommended for derived computations
- React 19 does NOT change the `useMemo` API — same usage as React 18
- For ~15 items, even without `useMemo` the performance would be fine, but it's good practice and prevents unnecessary re-renders of the list

**shadcn/ui Input — Tailwind v4:**
- The shadcn `Input` component uses Tailwind classes for styling
- In Tailwind v4, `focus-visible:ring-*` works the same as v3
- Glass styling may need raw CSS values if custom utility classes aren't set up: `bg-[rgba(255,255,255,0.08)]`

**Next.js 16 — Client Components:**
- The marketplace page needs `'use client'` directive since it uses `useState` and `useMemo`
- This should already be set from Story 1.4 (which added `useClubs()`)

### References

- [Source: planning-artifacts/epics.md#Story 1.7] — full acceptance criteria, user story statement
- [Source: planning-artifacts/architecture.md#Frontend Architecture] — component structure, marketplace page location
- [Source: planning-artifacts/architecture.md#Implementation Patterns] — naming conventions, shadcn/ui as base, no additional UI libraries
- [Source: planning-artifacts/architecture.md#Core Architectural Decisions] — TanStack Query for server data, React useState for client state
- [Source: planning-artifacts/ux-design-specification.md#No Results] — "No clubs match your search" (text-secondary, centered), ghost "Clear search" button
- [Source: planning-artifacts/ux-design-specification.md#Design System] — glass (rgba(255,255,255,0.08)), glass-border (rgba(255,255,255,0.12)), coral (#F46D5B) focus ring
- [Source: planning-artifacts/ux-design-specification.md#Marketplace: Dense List] — marketplace is a dense list of ClubCrestRow components, single column
- [Source: planning-artifacts/ux-design-specification.md#Input Styling] — all inputs use surface bg, glass-border, coral focus ring (2px)
- [Source: planning-artifacts/prd.md#FR9] — "Users can search and filter clubs in the marketplace"
- [Source: implementation-artifacts/1-6-real-time-price-feed.md] — usePrices() hook, price overlay logic on marketplace page
- [Source: implementation-artifacts/1-4-club-marketplace.md] — useClubs() hook, ClubCrestRow component, marketplace page structure

## Senior Developer Review (AI)

**Review Date:** 2026-02-07
**Reviewer Model:** Claude Opus 4.6
**Review Outcome:** Changes Requested (auto-fixed)

### Action Items

- [x] [MED] Missing `focus-visible` styling on X clear button — WCAG AA violation (page.tsx:50-56)
- [x] [MED] Ambiguous accessible names — both X icon and ghost button say "Clear search" (page.tsx:53,93)
- [x] [MED] `priceMap` not memoized — inconsistent with `filteredClubs` useMemo approach (page.tsx:18-20)
- [x] [LOW] Test doesn't verify input value cleared after X icon click (page.test.tsx:160-175)
- [x] [LOW] No test coverage for AC1 glass styling requirements (page.test.tsx)
- [ ] [LOW] Conditional rendering uses fragile mutual exclusion — 4 separate blocks re-check `data?.data` (page.tsx:77-114)

### Resolution Summary

5 of 6 issues auto-fixed. 1 LOW (conditional refactor) deferred — risk of introducing bugs outweighs benefit for this story.

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Test failure: "Clear search" button query matched both the X icon (aria-label) and the ghost Button text. Fixed by using `getByText("Clear search")` to target the ghost button specifically.

### Completion Notes List

- Task 1: Added `useState('')` for `searchQuery`, imported and rendered shadcn `Input` with glass styling (`bg-glass border-glass-border focus-visible:ring-coral focus-visible:ring-2`), bound `onChange`, no `autoFocus`. Added `X` icon clear button inside input.
- Task 2: Added `useMemo`-based `filteredClubs` derived from `data?.data` and `searchQuery`. Case-insensitive match on `name` and `ticker`. Whitespace-only queries return full list. Sort order preserved.
- Task 3: Empty state renders "No clubs match your search" in `text-text-secondary text-center` when `filteredClubs.length === 0 && searchQuery.length > 0`. Ghost `Button` with coral text clears search. X icon in input clears on tap.
- Task 4: Created `page.test.tsx` with 9 tests covering: placeholder rendering, name filtering, case-insensitive filtering, ticker filtering, empty state message, "Clear search" button reset, X icon reset, no autoFocus, spaces-only query.
- Task 5: `npm run build` succeeds, `vitest run` passes 189/189 tests (24 files), ESLint zero errors.
- No new dependencies added. No new files besides the test file. Implementation is purely client-side.
- **Code Review Fixes:** Added focus-visible styling to X clear button, disambiguated aria-labels ("Clear search input" vs "Clear search"), memoized priceMap with useMemo, added input value assertion to X icon test, added 2 new tests for glass styling and focus-visible classes. 191/191 tests passing post-review.

### Change Log

- 2026-02-07: Implemented Story 1.7 — Club Search & Filter. Added search input with glass styling, client-side filtering by name/ticker, empty state with "Clear search" button, and X clear icon. 9 new tests, 0 regressions.
- 2026-02-07: Code review fixes — 5 issues resolved: WCAG focus-visible on X button, disambiguated aria-labels, memoized priceMap, added input value assertion, added 2 styling tests. 191/191 passing.

### File List

- `fantera/src/app/(main)/clubs/page.tsx` — MODIFIED: added search state, Input, filtering logic, empty state, review fixes (focus-visible, aria-label, useMemo)
- `fantera/src/app/(main)/clubs/page.test.tsx` — NEW: 11 tests for search/filter functionality (9 original + 2 review additions)
