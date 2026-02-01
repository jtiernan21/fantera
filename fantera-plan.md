# Fantera Website Implementation Plan

## Project Overview
Single-page website for Fantera — a football fan ownership platform. All code in one `index.html` file.

---

## Aesthetic Direction: **Cinematic Atmospheric**

Dark, immersive, mood-driven design inspired by premium tech/AI landing pages:

- **Deep black base** with dramatic atmospheric layers
- **Glowing focal element** — amber/orange arc evoking stadium floodlights
- **Atmospheric depth** — CSS gradient fog, layered transparencies
- **Narrative quality** — feels cinematic, creates emotional impact
- **Minimal UI over drama** — clean white typography floating on atmosphere

---

## Design Decisions

### Color Palette
```css
--color-base: #0a0a0a;           /* Deep black background */
--color-surface: #111111;         /* Slightly elevated surfaces */
--color-text: #ffffff;            /* Pure white primary text */
--color-text-muted: #888888;      /* Muted secondary text */
--color-glow: #ff6b35;            /* Warm orange glow (stadium lights) */
--color-glow-soft: #ff8c42;       /* Softer glow for gradients */
--color-ember: #e63946;           /* Deep ember red for atmosphere */
--color-glass: rgba(255,255,255,0.08); /* Glassmorphic surfaces */
```

Warm amber/orange glow on black = stadium floodlights at night. Cinematic, powerful.

### Typography (Google Fonts)
- **Display**: `Sora` — modern, clean, slightly geometric
- **Body**: `DM Sans` — clean, readable, pairs well

### Visual Elements
- **Glowing arc**: CSS radial/conic gradient creating a luminous ring in hero
- **Atmospheric fog**: Layered gradient overlays (dark → ember → transparent)
- **Glassmorphism**: Backdrop-blur cards and inputs
- **Subtle grain**: CSS noise texture for depth
- **Silhouette shapes**: CSS gradient stadium/crowd suggestions

---

## Section-by-Section Plan

### 1. Navigation
- Fixed header with `backdrop-filter: blur(12px)` glassmorphism
- Logo: "FANTERA" in Sora, letterspaced
- External links: Stats, Docs (subtle white text)
- "Launch App" CTA with glowing border/background
- Mobile: hamburger with slide-in dark panel

### 2. Hero
- Full viewport height, centered content
- **Glowing arc** behind content — CSS conic-gradient creating luminous orange ring
- **Atmospheric layers** — radial gradients suggesting fog/clouds from edges
- Large headline: "Own the Game" or "The Future of Football Ownership"
- Subheadline in muted text
- Staggered fade-in animations (0.1s delay increments)
- Subtle CSS grain overlay for texture

### 3. Product
- Section title with glow underline accent
- 3-4 glassmorphic cards with:
  - CSS icon (Unicode or pure CSS shapes)
  - Feature title
  - Brief description
- Features: Fractional Ownership, Governance Rights, Earn Dividends, Fan Community
- Cards have subtle glow on hover
- Scroll-triggered fade-up reveal

### 4. Clubs
- "Clubs on Fantera" heading
- **Infinite marquee** of club badges:
  - Manchester United, Borussia Dortmund, Juventus, Porto, Benfica
  - Braga, Sporting Lisbon, AS Roma, SS Lazio, Celtic
  - Olympique Lyon, AFC Ajax, FC Copenhagen, Club America, Bali United
- Badges as styled text/shields (CSS-only, no images)
- Two rows scrolling opposite directions

### 5. Stack
- Split layout: narrative left, stats right
- Architecture brief: "Built on [blockchain], powered by community"
- **Large glowing stats**: "10K+ Fans", "$2M+ Invested", "15 Clubs"
- Simple roadmap: 3-4 milestones as vertical timeline
- Glassmorphic stat cards

### 6. Closing
- Full viewport height
- Atmospheric gradient intensifies (more glow)
- Large statement: **"Football Belongs to the Fans"**
- Prominent "Launch App" CTA button with glow effect
- Feels like a climax moment

### 7. Footer
- Dark, minimal, slightly elevated surface
- Logo, copyright
- Secondary links: Terms, Privacy, Twitter, Discord
- Subtle top border with gradient

---

## Technical Implementation

### HTML Structure
```
<header> - Navigation
<main>
  <section id="hero">
  <section id="product">
  <section id="clubs">
  <section id="stack">
  <section id="closing">
</main>
<footer>
```

### CSS Approach
- CSS custom properties at top
- Tailwind CDN for utilities
- Custom `<style>` block for:
  - Glowing arc (conic-gradient + blur)
  - Atmospheric fog layers (radial gradients)
  - Glassmorphism (backdrop-filter)
  - Noise/grain texture overlay
  - Keyframe animations
  - Marquee animation

### JavaScript Features
- Mobile menu toggle with ARIA
- Smooth scroll for anchor links
- IntersectionObserver for scroll-triggered reveals
- Marquee pause on hover (optional)

### Animations
1. **Page load**: Hero elements fade-in with 0.1s staggered delays
2. **Glowing arc**: Subtle pulse animation
3. **Scroll reveal**: Sections fade-up + slight translate when entering viewport
4. **Hover states**: Buttons glow intensify, cards lift with shadow
5. **Marquee**: Infinite horizontal scroll, two rows opposite directions

---

## User Decisions (Confirmed)
- **Clubs**: 15 real clubs with CSS shield badges
- **Stats**: Placeholder numbers (10K+ Fans, $2M+ Invested, etc.)
- **Links**: Placeholder `#` hrefs

---

## Files to Create
- `index.html` — Single self-contained file

---

## Verification
1. Open `index.html` in browser
2. Test responsive: 375px, 768px, 1280px
3. Verify nav links work (external placeholders)
4. Check mobile menu with proper ARIA
5. Confirm scroll animations trigger
6. Validate: tab navigation, focus states visible
7. Check glowing arc renders correctly
8. Verify marquee scrolls smoothly
