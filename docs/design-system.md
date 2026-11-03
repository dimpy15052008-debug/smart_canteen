# Campus Aurora Design System Documentation

## 1. Vision & Identity
- **Name:** Campus Aurora
- **Mission:** High-trust, luminous, calm, authoritative, human digital infrastructure for SmartUni.Ai.
- **Audience:** University administrators, students, faculty, regulatory inspection teams, and MPOnline Innovate 2026 judges.
- **Rule of Thumb:** Zero card-soup SaaS clutter, zero crypto/gaming glow, zero raw hex codes. Every value is tokenized.

---

## 2. Token Architecture

### 2.1 Color System
- **Brand Primary Anchor:** Electric Indigo `#4F46E5` (600)
  - `50`: `#EEF2FF`, `100`: `#E0E7FF`, `200`: `#C7D2FE`, `300`: `#A5B4FC`, `400`: `#818CF8`
  - `500`: `#6366F1`, `600`: `#4F46E5`, `700`: `#4338CA`, `800`: `#3730A3`, `900`: `#312E81`, `950`: `#1E1B4B`
- **AI Signature Accent:** Aurora Violet `#7C3AED` (Reserved strictly for AI interactions, predictions, intelligence badges, and avatar aura).
- **Semantics:**
  - *Success / Verified:* Emerald (`#10B981`, light bg `#ECFDF5`, dark bg `#064E3B/35`)
  - *Warning / Regulatory Risk:* Amber (`#F59E0B`, light bg `#FFFBEB`, dark bg `#78350F/35`)
  - *Critical / Detention / Overdue:* Rose (`#F43F5E`, light bg `#FFF1F2`, dark bg `#881337/35`)
  - *Informational:* Sky (`#0284C7`, light bg `#F0F9FF`, dark bg `#0C4A6E/35`)
- **Layered Surfaces (Elevation):**
  - *Light Mode:* Page `#F8FAFC` → Surface `#FFFFFF` → Raised `#FFFFFF` (subtle border) → Overlay `#FFFFFF` (with `shadow-md`)
  - *Dark Mode:* Page `#030712` → Surface `#0F172A` → Raised `#1E293B` → Overlay `#1E293B`

### 2.2 Typography Scale
- **Display:** `36px` / `44px` / `font-bold` / `-0.02em`
- **Page Title:** `24px` / `32px` / `font-bold` / `-0.015em`
- **Section Heading:** `18px` / `26px` / `font-semibold` / `-0.01em`
- **Card Title:** `15px` / `22px` / `font-semibold`
- **Body:** `14px` / `20px` / `font-normal`
- **Label / Code:** `12px` / `16px` / `font-medium` (JetBrains Mono for IDs, tokens, dates)
- **Caption:** `11px` / `14px` / `text-slate-500`

*Constraint:* All numerical metrics and percentages use `font-mono tabular-nums font-bold` for zero-jitter layout.

### 2.3 Motion System
- `duration-micro`: `120ms` (button clicks, toggles)
- `duration-standard`: `200ms` (dropdowns, cards, tabs)
- `duration-surface`: `320ms` (route transitions, sheet open)
- `useMotionPreset()`: Automatically respects `prefers-reduced-motion`. In reduced-motion mode:
  - Disables avatar procedural sway, confetti bursts, audio waveforms, and card spring movement.
  - Replaces motion with instant opacity crossfades.

---

## 3. Atomic Primitives Inventory (`src/components/ui/`)

1. **`Button`**: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `ai`), sizes (`sm`, `md`, `lg`), loading spinner.
2. **`IconButton`**: Enforces accessible `aria-label`, hover ring.
3. **`Card`**: Surface levels (`base`, `elevated`, `interactive`, `subtle`, `ai`).
4. **`Badge`**: Semantic badges (`default`, `primary`, `success`, `warning`, `danger`, `info`, `ai`).
5. **`StatusPill`**: Pulse dot + human label.
6. **`MetricCard`**: Count-up number animation, tabular font, trend indicators.
7. **`StepTimeline`**: Horizontal and vertical timeline for attendance, canteen, and certificates.
8. **`EmptyState`**: Illustrated icon, title, description, and primary recovery action.
9. **`ErrorState`**: Human sentence, retry trigger.
10. **`Skeleton`**: Shimmer layout placeholder honoring reduced motion.
11. **`PageHeader`**: Title, subtitle, badge, and contextual action slot.
12. **`SectionHeader`**: Clean section separation with title, subtitle, and action link.

---

## 4. State Mappings for CampusAI

| State | Stage Visuals | Procedural 3D Robot Pose | Audio Feedback |
|---|---|---|---|
| **Idle** | Calm breathing orb, ready badge | Rest stance, subtle breathing | None |
| **Listening** | Orb pulses with audio amplitude, "Listening..." | Attentive lean forward | Soft start chirp |
| **Thinking** | Slow orbit shimmer, response skeleton | Head tilt, thoughtful expression | None |
| **Speaking** | Waveform tied to amplitude, streaming reply | Lip-sync, expressive gestures | Speech synthesizer |
| **Success** | Emerald pulse, checkmark badge | Nod, smile | Confirm tone |
| **Error** | Amber state, human retry message | Concerned gesture | None |

---

## 5. Live Testbed Route
- Visit `/design-system` inside the application to preview all primitives, states, and tokens in both Light and Dark mode.
