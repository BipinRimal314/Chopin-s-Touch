import { Exercise, ExerciseType, Difficulty, NoteConfig, ExerciseCategory } from './types';

export const PIANO_KEYS_OCTAVE: NoteConfig[] = [
  { name: 'C', isBlack: false },
  { name: 'C#', isBlack: true },
  { name: 'D', isBlack: false },
  { name: 'D#', isBlack: true },
  { name: 'E', isBlack: false },
  { name: 'F', isBlack: false },
  { name: 'F#', isBlack: true },
  { name: 'G', isBlack: false },
  { name: 'G#', isBlack: true },
  { name: 'A', isBlack: false },
  { name: 'A#', isBlack: true },
  { name: 'B', isBlack: false },
];

export const DAILY_DOZEN_IDS = [
  'dd-1-relaxation',
  'b-major-scale-rh', // Re-using existing
  'dd-3-thumb-pivot',
  'e-major-arpeggio-rh', // Re-using existing
  'dd-5-trill-3-4',
  'dd-6-chromatic',
  'dd-7-wrist-staccato',
  'dd-8-solid-chords',
  'dd-9-thirds',
  'rubato-breathing', // Re-using existing
  'dd-11-dynamics',
  'cantabile-phrasing' // Re-using existing
];

export const CHOPIN_EXERCISES: Exercise[] = [
  // --- DAILY DOZEN SPECIFIC ---
  {
    id: 'dd-1-relaxation',
    title: '1. The "Wet Rag" Drop',
    description: 'Before playing a single note, lift your arm and let it drop like a dead weight into your lap. This sensation of "heavy arm, light hand" is the core of tone production.',
    category: ExerciseCategory.Habits,
    type: ExerciseType.Mental,
    difficulty: Difficulty.Beginner,
    key: 'N/A',
    notes: [],
    fingerings: [],
    tips: [
      'Breathing out as you drop your arm.',
      'Ensure your shoulders are not raised.',
      'Feel gravity doing the work, not your muscles.',
    ],
  },
  {
    id: 'b-major-scale-rh',
    title: '2. B Major Five-Finger',
    description: 'The "ideal" hand position. The long fingers (2,3,4) rest naturally on the black keys (C#, D#, F#) while thumb and pinky find the white keys (B, E).',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Scale,
    difficulty: Difficulty.Beginner,
    key: 'B Major',
    notes: ['B3', 'C#4', 'D#4', 'E4', 'F#4'],
    fingerings: [
      { note: 'B3', finger: 1, hand: 'right' },
      { note: 'C#4', finger: 2, hand: 'right' },
      { note: 'D#4', finger: 3, hand: 'right' },
      { note: 'E4', finger: 1, hand: 'right' }, // Thumb passes under or just 5-finger pattern
      { note: 'F#4', finger: 2, hand: 'right' },
    ],
    tips: [
      'Mold the hand over the keys like a dome.',
      'Do not press; sink into the keys.',
    ],
  },
  {
    id: 'dd-3-thumb-pivot',
    title: '3. The Thumb Pivot',
    description: 'The thumb is the pivot of the hand. Practice passing the thumb under the 2nd and 3rd fingers smoothly without jerking the elbow.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Intermediate,
    key: 'C Major',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C4'],
    fingerings: [
      { note: 'C4', finger: 1, hand: 'right' },
      { note: 'D4', finger: 2, hand: 'right' },
      { note: 'E4', finger: 3, hand: 'right' },
      { note: 'F4', finger: 1, hand: 'right' }, // Thumb under
      { note: 'G4', finger: 2, hand: 'right' },
    ],
    tips: [
      'Keep the wrist loose.',
      'The thumb should move laterally, like a crab.',
    ],
  },
  {
    id: 'e-major-arpeggio-rh',
    title: '4. Arpeggio Extension',
    description: 'Expanding the hand gently. E Major places the hand in a comfortable open position.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Arpeggio,
    difficulty: Difficulty.Beginner,
    key: 'E Major',
    notes: ['E3', 'G#3', 'B3', 'E4'],
    fingerings: [
      { note: 'E3', finger: 1, hand: 'right' },
      { note: 'G#3', finger: 2, hand: 'right' },
      { note: 'B3', finger: 3, hand: 'right' },
      { note: 'E4', finger: 1, hand: 'right' }, // Extension
    ],
    tips: [
      'Move the wrist laterally to help the fingers reach.',
    ],
  },
  {
    id: 'dd-5-trill-3-4',
    title: '5. Weak Finger Trill (3-4)',
    description: 'Chopin noted that 3 and 4 are tied by a tendon. Practice a slow, controlled trill between them to build independence.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Advanced,
    key: 'C Major',
    notes: ['E4', 'F4', 'E4', 'F4', 'E4', 'F4'],
    fingerings: [
      { note: 'E4', finger: 3, hand: 'right' },
      { note: 'F4', finger: 4, hand: 'right' },
    ],
    tips: [
      'Do not force speed. Evenness is the goal.',
      'Keep the other fingers relaxed.',
    ],
  },
  {
    id: 'dd-6-chromatic',
    title: '6. Chromatic Slide',
    description: 'Using fingers 3, 4, and 5 on black and white keys to develop agility in the outer hand.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Scale,
    difficulty: Difficulty.Intermediate,
    key: 'Chromatic',
    notes: ['C4', 'C#4', 'D4', 'D#4', 'E4'],
    fingerings: [
      { note: 'C4', finger: 1, hand: 'right' },
      { note: 'C#4', finger: 3, hand: 'right' },
      { note: 'D4', finger: 1, hand: 'right' },
      { note: 'D#4', finger: 3, hand: 'right' },
      { note: 'E4', finger: 1, hand: 'right' },
    ],
    tips: [
      'Stay close to the keys.',
      'Minimise thumb movement.',
    ],
  },
  {
    id: 'dd-7-wrist-staccato',
    title: '7. Wrist Staccato Octaves',
    description: 'Bounce the hand from the wrist, like waving goodbye. The forearm should remain relatively still.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Intermediate,
    key: 'C Major',
    notes: ['C4', 'C4', 'C4', 'C4'], // Repetitive note for drill
    fingerings: [
      { note: 'C4', finger: 5, hand: 'right' }, // Simulating octave top note
    ],
    tips: [
      'The wrist acts as a spring.',
      'Action must be light and crisp.',
    ],
  },
  {
    id: 'dd-8-solid-chords',
    title: '8. Solid Chords & Weight',
    description: 'Play a full triad. Transfer the weight of the arm into the keys without pressing. Feel the "bottom" of the keybed.',
    category: ExerciseCategory.Musicality,
    type: ExerciseType.Chord,
    difficulty: Difficulty.Beginner,
    key: 'C Major',
    notes: ['C4', 'E4', 'G4'],
    fingerings: [
      { note: 'C4', finger: 1, hand: 'right' },
      { note: 'E4', finger: 3, hand: 'right' },
      { note: 'G4', finger: 5, hand: 'right' },
    ],
    tips: [
      'All notes must sound simultaneously.',
      'Relax immediately after the sound is produced.',
    ],
  },
  {
    id: 'dd-9-thirds',
    title: '9. Double Thirds',
    description: 'A prelude to advanced technique. Play legato thirds to ensure fingers act in coordinated pairs.',
    category: ExerciseCategory.Technical,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Advanced,
    key: 'C Major',
    notes: ['C4', 'E4', 'D4', 'F4', 'E4', 'G4'],
    fingerings: [
      { note: 'C4', finger: 1, hand: 'right' },
      { note: 'E4', finger: 3, hand: 'right' },
      { note: 'D4', finger: 2, hand: 'right' },
      { note: 'F4', finger: 4, hand: 'right' },
    ],
    tips: [
      'Listen for perfect unison in the attack.',
      'Keep the wrist flexible.',
    ],
  },
  {
    id: 'rubato-breathing',
    title: '10. Rubato Scale',
    description: 'Scales should not be mechanical. Play a scale with a slight breath (slow down) at the turn, and accelerate slightly in the middle.',
    category: ExerciseCategory.Musicality,
    type: ExerciseType.Scale,
    difficulty: Difficulty.Intermediate,
    key: 'A Minor',
    notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'],
    fingerings: [],
    tips: [
      'Think of the phrase as a spoken sentence.',
      'Do not lose the pulse, but let it be flexible.',
    ],
  },
  {
    id: 'dd-11-dynamics',
    title: '11. Dynamic Swell',
    description: 'Control your volume. Play a single note starting as soft as possible (pp) and growing to loud (ff) and back down.',
    category: ExerciseCategory.Musicality,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Beginner,
    key: 'C Major',
    notes: ['C4', 'C4', 'C4', 'C4', 'C4'], // Repetition
    fingerings: [{ note: 'C4', finger: 3, hand: 'right' }],
    tips: [
      'Control the speed of the key descent.',
      'Faster attack = louder sound.',
    ],
  },
  {
    id: 'cantabile-phrasing',
    title: '12. Cantabile Finale',
    description: 'End with beauty. Play a simple melody, focusing 100% of your attention on the quality of the tone.',
    category: ExerciseCategory.Musicality,
    type: ExerciseType.Concept,
    difficulty: Difficulty.Beginner,
    key: 'C Major',
    notes: ['E4', 'F4', 'G4', 'C5', 'G4'],
    fingerings: [
      { note: 'E4', finger: 1, hand: 'right' },
      { note: 'F4', finger: 2, hand: 'right' },
      { note: 'G4', finger: 3, hand: 'right' },
      { note: 'C5', finger: 5, hand: 'right' },
    ],
    tips: [
      'Listen to the decay.',
      'Connect the notes smoothly (Legato).',
    ],
  },

  // --- OTHER EXERCISES ---
  {
    id: 'slow-practice-c-major',
    title: 'Slow Practice Discipline',
    description: 'Mastery comes from accuracy. Play extremely slowly, verifying total relaxation between every single note.',
    category: ExerciseCategory.Habits,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Beginner,
    key: 'C Major',
    notes: ['C4', 'D4', 'E4', 'F4', 'G4'],
    fingerings: [
      { note: 'C4', finger: 1, hand: 'right' },
      { note: 'D4', finger: 2, hand: 'right' },
      { note: 'E4', finger: 3, hand: 'right' },
      { note: 'F4', finger: 4, hand: 'right' },
      { note: 'G4', finger: 5, hand: 'right' },
    ],
    tips: [
      'Play a note, then wiggle your wrist to ensure no tension.',
      'Only move to the next note when the hand is relaxed.',
      'Patience is your greatest tool.',
    ],
  },
  {
    id: 'identifying-intervals',
    title: 'Hearing Intervals',
    description: 'Listen to the distance between C and G (Perfect 5th) vs C and E (Major 3rd).',
    category: ExerciseCategory.Theory,
    type: ExerciseType.Drill,
    difficulty: Difficulty.Beginner,
    key: 'C Major',
    notes: ['C4', 'E4', 'G4'],
    fingerings: [],
    tips: [
      'Play C then E. Sing the pitch in your head.',
      'Play C then G. Feel the "hollow" stability of the 5th.',
    ],
  },
  {
    id: 'mental-play',
    title: 'Visualization',
    description: 'Close your eyes. Visualize playing the B Major scale without moving a muscle. Hear the notes clearly.',
    category: ExerciseCategory.Performance,
    type: ExerciseType.Mental,
    difficulty: Difficulty.Advanced,
    key: 'N/A',
    notes: [],
    fingerings: [],
    tips: [
      'If you cannot hear it clearly in your mind, you do not know it yet.',
      'Visualize the sensation of the black keys under your fingers.',
    ],
  },
];
