# Chopin's Touch: Product Critique & Roadmap

**Date:** 2026-03-07
**Status:** Working prototype, runs on iPad via Capacitor

---

## Executive Summary

Chopin's Touch has a genuine differentiator: it is the only piano learning app built on Chopin's actual pedagogy (B major first, singing tone, finger individuality). Every competitor starts with C major. None teach expression. The foundation is solid, but the app is roughly **60% complete as a product** and has critical gaps that would cause user drop-off within the first week.

This document synthesizes findings from five parallel research streams: codebase audit, competitor analysis (Simply Piano, Flowkey, Piano Marvel, Synthesia, Yousician), curriculum review, production readiness assessment, and iPad UX research.

---

## Part 1: What Works

1. **Authentic pedagogy.** B major first, natural hand position, legato focus, cantabile as the goal. No other app does this. This is not a gimmick; it is historically validated by Chopin's own teaching practice.

2. **Clean architecture.** React 19, Vite 6, Tailwind v4, Capacitor 8. Zero npm vulnerabilities. 275 KB bundle (82 KB gzipped). No bloat.

3. **Thoughtful audio engine.** Three-layer synthesis (sine body, triangle warmth, sawtooth attack) produces a convincing piano tone. Drift-free metronome using Web Audio look-ahead scheduling. Silent buffer iOS unlock pattern.

4. **Solid Daily Dozen.** The 12-exercise warm-up routine follows Chopin's actual lesson structure: natural position, then technique, then musicality. Exercises have specific, actionable tips ("the thumb moves laterally like a crab").

5. **Piece selection.** Musically accurate note sequences for Ode to Joy, Fur Elise, Bach Prelude, Chopin Nocturne Op.9 No.2. Good motivational range from beginner to advanced.

6. **Fully client-side.** No server, no API, no account required. Works offline in Capacitor. This is a feature, not a limitation.

---

## Part 2: Critical Problems

### 2.1 Zero Hands-Together Content (SEVERITY: CRITICAL)

A learner can complete every exercise and every piece without ever coordinating both hands. This is the single biggest curriculum gap. Chopin himself structured every lesson around two-hand playing. The app teaches left hand and right hand separately but never combines them.

**Impact:** Users will hit a wall and have no path forward. They cannot play real music.

**Fix:** Add 3-5 hands-together pieces starting at Level 2. Add a "Hand Coordination" exercise category with simple patterns (RH melody + LH whole notes, then RH melody + LH Alberti bass).

### 2.2 Pieces Too Short to Build Muscle Memory (SEVERITY: HIGH)

Ode to Joy is 15 notes (9 seconds at 100 BPM). Fur Elise opening is 9 notes (7 seconds). These are too short to develop the muscle memory or stamina that actual piano playing requires. Competitors offer full arrangements.

**Impact:** Users feel like they "finished" a piece without actually learning it.

**Fix:** Extend each piece to 30-60 notes minimum. Add repeats and variations. Level 4 pieces should be 60-100+ notes.

### 2.3 No Error Boundary (SEVERITY: HIGH)

If any React component throws during render, the entire app crashes to a white screen with no recovery. No error boundary exists anywhere in the component tree.

**Fix:** Add a root ErrorBoundary component wrapping `<App />` with a "Something went wrong, tap to restart" fallback.

### 2.4 Microphone UX is Broken (SEVERITY: HIGH)

- No loading indicator while mic initializes (100-300ms delay with no feedback)
- If mic permission is denied, user gets a red error banner but no guidance on how to fix it (must go to iOS Settings)
- No visual/audio indication that the mic is actively listening
- No sensitivity adjustment for noisy environments

**Fix:** Add mic initialization spinner, permission recovery guidance, active listening indicator, and noise threshold slider in Settings.

### 2.5 First-Tap Audio Silence on iPad (SEVERITY: HIGH)

Despite the silent buffer unlock pattern, the first "Hear Demo" tap on a cold launch may not produce sound because the AudioContext hasn't fully transitioned to `'running'` state. The `statechange` listener approach helps but hasn't been confirmed working on device.

**Fix:** Verify the statechange listener works. If not, fall back to playing the first note after a 200ms delay on first use. Consider a native Capacitor audio plugin if Web Audio latency remains problematic.

---

## Part 3: Missing Features (Priority Order)

### P0 — Required Before Shipping

| Feature | Why | Effort |
|---------|-----|--------|
| Error boundary | App crashes are unrecoverable without it | 30 min |
| Mic loading state | Users think the app is broken when mic takes time to init | 1 hour |
| Hands-together content | Core piano skill completely absent | 4 hours |
| Longer piece arrangements | Current pieces too short to teach anything | 3 hours |
| Stop demo button | Already done | Done |
| LocalStorage quota handling | `setItem` throws `QuotaExceededError` if full | 30 min |

### P1 — Required for Retention

| Feature | Why | Effort |
|---------|-----|--------|
| Practice streak tracker | Research shows 7+ day streaks increase completion 4.2x (Duolingo data). Calendar visualization with streak freeze | 4 hours |
| Session timer with history | Track minutes practiced per day. Show weekly graph | 3 hours |
| Note accuracy feedback | Show green/red on each note in practice mode. Post-exercise accuracy percentage | 3 hours |
| Achievements | "First Song," "7-Day Streak," "All Scales Learned," "Perfect Score." Simple badge system stored in localStorage | 4 hours |
| Spaced repetition | Re-surface exercises the user hasn't practiced in 3+ days. Research shows 3x retention improvement | 6 hours |
| Minor scales + all 12 keys | Only 7 keys covered. Missing A minor, E minor, F major, Bb major, and others | 3 hours |

### P2 — Differentiators

| Feature | Why | Effort |
|---------|-----|--------|
| Accompaniment mode | App plays LH while user plays RH (or vice versa). Flowkey's "Wait Mode" is their killer feature | 6 hours |
| Falling notes visualization | Notes fall toward the piano keys. Standard in Synthesia, expected by users. Can coexist with current highlight mode | 8 hours |
| Dynamics teaching | Show target volume (pp/p/mf/f/ff) per note. Use mic amplitude to detect actual volume. No competitor does this well | 6 hours |
| MIDI input support | Capacitor plugin for USB/Bluetooth MIDI keyboards. Eliminates mic unreliability. Piano Marvel and Synthesia are MIDI-first | 8 hours |
| Rhythm exercises | Dotted rhythms, syncopation, triplets. Currently all exercises assume quarter-note resolution | 4 hours |
| Pedal instruction | Text-based guidance on when and how to use the sustain pedal. No interactive component needed initially | 2 hours |

### P3 — Polish

| Feature | Why | Effort |
|---------|-----|--------|
| Responsive piano height | Currently fixed at 200px. Should scale to 40vh on landscape iPad for larger keys | 1 hour |
| Key resize / pinch-to-zoom | Let users trade octave range for larger keys. Current 2-octave default gives ~17.6mm per white key on 11" iPad | 4 hours |
| Haptic feedback on key press | Capacitor Haptics API. Subtle tap on each note | 2 hours |
| Bluetooth headphone warning | Bluetooth adds ~178ms latency (unacceptable for real-time playing). Detect and warn | 2 hours |
| ARIA labels | Every button, piano key, and state needs screen reader labels | 3 hours |
| TypeScript strict mode | Enable `strict: true` in tsconfig. Fix resulting type errors | 2 hours |
| App icon (1024x1024) | Required for App Store submission | 1 hour |
| Privacy manifest | `PrivacyInfo.xcprivacy` required by Apple since iOS 17 | 30 min |

---

## Part 4: Competitive Positioning

### What Every Competitor Gets Wrong

| Competitor | Price | Strength | Critical Weakness |
|-----------|-------|----------|-------------------|
| Simply Piano | $120/yr | Beginner-friendly, gamified | Shallow depth, no technique feedback, chord recognition errors |
| Flowkey | $120/yr | 1,500+ songs, Wait Mode | Weak for total beginners, inconsistent course sequencing |
| Piano Marvel | $111/yr | SASR sight-reading, 25K+ songs | No video instruction, poor onboarding, requires MIDI |
| Synthesia | $39 once | Fun falling notes, infinite MIDI library | Zero theory, terrible fingerings, creates app dependency |
| Yousician | $140-180/yr | Most gamified, multi-instrument | Surface-level feedback, predatory billing, star-collecting replaces learning |

### Chopin's Touch Positioning

**"The only piano app that teaches you to play music, not just notes."**

No competitor teaches expression, dynamics, or phrasing. Every competitor treats note accuracy as binary (right/wrong). Chopin's Touch can own the "musical depth" position by:

1. Teaching dynamics from Day 1 (Exercise 10: pp to ff and Back)
2. Teaching phrasing through linguistic metaphor (Exercise 11: "Think of the scale as a spoken sentence")
3. Starting with B major (physically correct, historically authentic, differentiating)
4. Never requiring mindless repetition (Chopin's explicit principle)
5. Offering a one-time purchase or free app (users despise piano app subscriptions)

### Pricing Recommendation

**Free.** Open source it. The app's value is as a portfolio piece and as a genuine contribution to piano education. Alternatively, one-time $9.99 (Synthesia's model is explicitly beloved by users; subscriptions generate resentment across all competitors).

---

## Part 5: Technical Debt

### Code Quality

| Issue | Location | Fix |
|-------|----------|-----|
| `any` types for WebAudio | `audio.ts:22`, `metronome.ts:23`, `pitchDetection.ts:110` | Define `webkitAudioContext` type at module level |
| `icon` prop typed as `any` | `App.tsx:117` | Type as `React.ComponentType<LucideProps>` |
| Unused import `ChevronDown` | `PiecePlayer.tsx:4` | Remove |
| No `useMemo` on key arrays | `PianoVisualizer.tsx:28-42` | Memoize `allKeys` with `[startOctave, octaveCount]` |
| `DailyStats` and `PracticeSession` types defined but unused | `types.ts:75-86` | Either implement or remove |
| Two separate AudioContexts | `audio.ts` and `pitchDetection.ts` each create their own | Share one context (iOS allows max 4) |
| `CategoryView` returns null for empty categories | `CategoryView.tsx:23` | Show "No exercises yet" message |

### Production Blockers for App Store

| Requirement | Status |
|------------|--------|
| Privacy manifest (`PrivacyInfo.xcprivacy`) | Missing |
| App Store icon (1024x1024) | Missing |
| Version numbers in Xcode | Not set |
| Privacy policy URL | Not written |
| iPad screenshots (11" and 13") | Not captured |
| Build with iOS 26 SDK | Deadline: April 28, 2026 |
| `NSMicrophoneUsageDescription` | Done |
| Error boundary | Missing |

---

## Part 6: Chopin's Method as Design Law

From his unfinished *Projet de Methode* and student accounts (Eigeldinger, 1987):

| Chopin's Principle | Current State | Action |
|-------------------|---------------|--------|
| "Start with B major, not C major" | Done. B major is Exercise 1 | Keep |
| "The piano should sing" | Cantabile is Exercise 12 | Move singing tone earlier; integrate into every exercise tip |
| "No mindless repetition" | Exercises are single-pass | Add variation: "Now play it slower," "Now play it louder," "Now play it with eyes closed" |
| "Cultivate finger inequality" | Exercises 5 (3-4 trill) and supplementary (4-5 trill) | Add exercises that deliberately use each finger's character |
| "Music is a language" | Exercise 11 uses linguistic metaphor | Extend metaphors: "This phrase asks a question. The next one answers it." |
| "Sound first, technique second" | Exercises mix technical and musical | Reorder: every technical exercise should end with a musical application |
| "Patience and personalization" | No adaptive difficulty | P2: Track which exercises the user struggles with, suggest focused practice |
| "Exercises should engage the will" | Tips explain purpose | Add "Why this matters" one-liner to each exercise |
| Bach was central to his curriculum | No Bach in exercises | Add simplified Bach Invention fragments as advanced exercises |

---

## Part 7: Implementation Priority

### Week 1: Ship-Ready Fixes
- Error boundary
- Mic loading state + permission guidance
- LocalStorage quota handling
- Extend all pieces to 30+ notes
- Add 3 hands-together exercises
- Fix any remaining first-tap audio silence

### Week 2: Retention Features
- Practice streak calendar
- Session timer with daily history
- Note accuracy percentage after practice
- 3-5 achievement badges
- Add A minor + E minor scales

### Week 3: Differentiators
- Accompaniment mode (app plays one hand)
- Dynamics detection via mic amplitude
- Responsive piano height for iPad
- App Store preparation (icon, privacy manifest, screenshots)

### Week 4: Polish & Submit
- ARIA labels
- TypeScript strict mode
- Haptic feedback
- Bluetooth headphone warning
- App Store submission

---

## Sources

- [Apple HIG - Designing for iPadOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados)
- [Chopin: Pianist and Teacher — Eigeldinger (1987)](https://spot.colorado.edu/~korevaar/Chopin%20talk.htm)
- [Duolingo Gamification Case Study — StriveCloud](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [Spaced Repetition Promotes Efficient Learning — SAGE Journals](https://journals.sagepub.com/doi/abs/10.1177/2372732215624708)
- [CREPE: Pitch Estimation — arXiv](https://arxiv.org/abs/1802.06182)
- [Web Audio API Latency — jamieonkeys](https://www.jamieonkeys.dev/posts/web-audio-api-output-latency/)
- [Simply Piano Review — Pianoers](https://pianoers.com/simply-piano-review-the-honest-truth-about-learning-piano-with-an-app/)
- [Flowkey Review — Piano Dreamers](https://www.pianodreamers.com/flowkey-review/)
- [Piano Marvel SASR — Piano Marvel](https://pianomarvel.com/en/feature/sasr)
- [Why Piano Apps Fail — Newstrail](https://www.newstrail.com/why-many-piano-learning-apps-struggle-to-teach-music/)
- [Capacitor iOS Deployment — Capacitor Docs](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- Full competitor research with 40+ sources: `competitor-research.md`


Upon further testing, 