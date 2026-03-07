import { Piece, Difficulty } from '../types';

export const PIECES: Piece[] = [
  // ========================================
  // LEVEL 1 — Beginner (single hand, narrow range)
  // ========================================
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    composer: 'Ludwig van Beethoven',
    difficulty: Difficulty.Beginner,
    level: 1,
    key: 'C Major',
    tempo: 100,
    description: 'One of the most recognizable melodies in Western music. Uses only five notes in C Major — the perfect first piece.',
    sections: [
      {
        name: 'First Ending',
        notes: [
          'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
          'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 4, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Second Ending',
        notes: [
          'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
          'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 4, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Play legato — each note connects smoothly to the next.',
      'This melody uses only 5 notes: C, D, E, F, G.',
      'Focus on even tone. No note should be louder than another.',
      'The second ending resolves to C instead of D. Listen for the difference.',
    ],
  },

  {
    id: 'mary-little-lamb',
    title: 'Mary Had a Little Lamb',
    composer: 'Traditional',
    difficulty: Difficulty.Beginner,
    level: 1,
    key: 'C Major',
    tempo: 90,
    description: 'A three-note melody that teaches smooth finger transitions. Chopin believed simple melodies should be mastered before scales.',
    sections: [
      {
        name: 'Verse 1',
        notes: [
          'E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4',
          'D4', 'D4', 'D4', 'E4', 'G4', 'G4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Verse 2',
        notes: [
          'E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4',
          'E4', 'D4', 'D4', 'E4', 'D4', 'C4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Keep the hand in one position — no shifting needed.',
      'Listen for consistency between the repeated E notes.',
      'The second verse ends differently — on C, not G. Feel the resolution.',
    ],
  },

  {
    id: 'twinkle-star',
    title: 'Twinkle Twinkle Little Star',
    composer: 'Traditional (Mozart variations)',
    difficulty: Difficulty.Beginner,
    level: 1,
    key: 'C Major',
    tempo: 80,
    description: 'Mozart wrote 12 variations on this melody. Start with the theme. Simplicity reveals everything about your touch.',
    sections: [
      {
        name: 'A Section',
        notes: [
          'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4',
          'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 4, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
          { note: 'A4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'B Section (Bridge)',
        notes: [
          'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4',
          'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4',
        ],
        fingerings: [
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 4, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: "A' Section (Return)",
        notes: [
          'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4',
          'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4',
        ],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'D4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 4, hand: 'right' },
          { note: 'G4', finger: 5, hand: 'right' },
          { note: 'A4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Practice each section separately before combining.',
      'The jump from C to G requires a hand shift — keep the wrist loose.',
      'The bridge section (B) is the same pattern twice. Use this repetition to refine your touch.',
      'ABA form: the return of A should feel like coming home.',
    ],
  },

  // ========================================
  // LEVEL 2 — Beginner+ (wider range, more patterns)
  // ========================================
  {
    id: 'bach-prelude-c',
    title: 'Prelude in C Major (Simplified)',
    composer: 'Johann Sebastian Bach',
    difficulty: Difficulty.Beginner,
    level: 2,
    key: 'C Major',
    tempo: 70,
    description: 'The opening of Bach\'s most famous prelude — a broken chord pattern that teaches the hand to open and close like breathing.',
    sections: [
      {
        name: 'C Major',
        notes: ['C4', 'E4', 'G4', 'C5', 'E5', 'C5', 'G4', 'E4'],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'E4', finger: 2, hand: 'right' },
          { note: 'G4', finger: 3, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
          { note: 'E5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'D minor',
        notes: ['D4', 'F4', 'A4', 'D5', 'F5', 'D5', 'A4', 'F4'],
        fingerings: [
          { note: 'D4', finger: 1, hand: 'right' },
          { note: 'F4', finger: 2, hand: 'right' },
          { note: 'A4', finger: 3, hand: 'right' },
          { note: 'D5', finger: 5, hand: 'right' },
          { note: 'F5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'G7',
        notes: ['G3', 'B3', 'D4', 'F4', 'D4', 'B3', 'D4', 'F4'],
        fingerings: [
          { note: 'G3', finger: 1, hand: 'right' },
          { note: 'B3', finger: 2, hand: 'right' },
          { note: 'D4', finger: 3, hand: 'right' },
          { note: 'F4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'C Major (Resolution)',
        notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'G4', 'C5'],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'E4', finger: 2, hand: 'right' },
          { note: 'G4', finger: 3, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Each pattern is a broken chord. Feel the harmony as you play.',
      'The shape of the hand stays consistent — only the position shifts.',
      'Play slowly enough that each note rings clearly.',
      'This is the harmonic journey: home (C) → away (Dm) → tension (G7) → home (C).',
    ],
  },

  {
    id: 'fur-elise-opening',
    title: 'Fur Elise (Opening)',
    composer: 'Ludwig van Beethoven',
    difficulty: Difficulty.Intermediate,
    level: 2,
    key: 'A Minor',
    tempo: 75,
    description: 'The most recognizable piano opening in history. A simple oscillating pattern that teaches finger independence and musical phrasing.',
    sections: [
      {
        name: 'Opening Motif',
        notes: ['E5', 'D#5', 'E5', 'D#5', 'E5', 'B4', 'D5', 'C5', 'A4'],
        fingerings: [
          { note: 'E5', finger: 5, hand: 'right' },
          { note: 'D#5', finger: 4, hand: 'right' },
          { note: 'B4', finger: 2, hand: 'right' },
          { note: 'D5', finger: 4, hand: 'right' },
          { note: 'C5', finger: 3, hand: 'right' },
          { note: 'A4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Resolution A',
        notes: ['C4', 'E4', 'A4', 'B4', 'E4', 'G#4', 'B4', 'C5'],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'E4', finger: 2, hand: 'right' },
          { note: 'A4', finger: 4, hand: 'right' },
          { note: 'B4', finger: 5, hand: 'right' },
          { note: 'G#4', finger: 3, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Motif Repeat',
        notes: ['E5', 'D#5', 'E5', 'D#5', 'E5', 'B4', 'D5', 'C5', 'A4'],
        fingerings: [
          { note: 'E5', finger: 5, hand: 'right' },
          { note: 'D#5', finger: 4, hand: 'right' },
          { note: 'B4', finger: 2, hand: 'right' },
          { note: 'D5', finger: 4, hand: 'right' },
          { note: 'C5', finger: 3, hand: 'right' },
          { note: 'A4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Resolution B (Final)',
        notes: ['C4', 'E4', 'A4', 'B4', 'E4', 'C5', 'B4', 'A4'],
        fingerings: [
          { note: 'C4', finger: 1, hand: 'right' },
          { note: 'E4', finger: 2, hand: 'right' },
          { note: 'A4', finger: 4, hand: 'right' },
          { note: 'B4', finger: 5, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'The E-D#-E oscillation must be perfectly even.',
      'This is a study in finger 4-5 independence — Chopin\'s obsession.',
      'The resolution phrase descends then rises. Shape it like a question and answer.',
      'The final resolution ends on A — home. Feel the arrival.',
    ],
  },

  {
    id: 'minuet-g-major',
    title: 'Minuet in G Major',
    composer: 'Christian Petzold (attr. Bach)',
    difficulty: Difficulty.Intermediate,
    level: 2,
    key: 'G Major',
    tempo: 90,
    description: 'From the Anna Magdalena Notebook. A graceful dance in 3/4 time that teaches phrasing in groups of three.',
    sections: [
      {
        name: 'First Phrase',
        notes: [
          'D5', 'G4', 'A4', 'B4', 'C5', 'D5', 'G4', 'G4',
          'E5', 'C5', 'D5', 'C5', 'B4', 'A4',
        ],
        fingerings: [
          { note: 'D5', finger: 5, hand: 'right' },
          { note: 'G4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 2, hand: 'right' },
          { note: 'B4', finger: 3, hand: 'right' },
          { note: 'C5', finger: 4, hand: 'right' },
          { note: 'E5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Second Phrase',
        notes: [
          'B4', 'A4', 'G4', 'F#4', 'G4', 'A4', 'B4', 'G4',
          'B4', 'A4', 'D4', 'A4', 'B4', 'G4',
        ],
        fingerings: [
          { note: 'D4', finger: 1, hand: 'right' },
          { note: 'F#4', finger: 2, hand: 'right' },
          { note: 'G4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 2, hand: 'right' },
          { note: 'B4', finger: 3, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Feel the waltz: ONE-two-three, ONE-two-three. Slight emphasis on beat one.',
      'The descending line in the second phrase should sing — cantabile.',
      'Chopin loved dance forms. This minuet teaches musical architecture.',
    ],
  },

  // ========================================
  // LEVEL 3 — Intermediate (expressive, rubato, wider range)
  // ========================================
  {
    id: 'chopin-prelude-em',
    title: 'Prelude in E minor, Op. 28 No. 4',
    composer: 'Frederic Chopin',
    difficulty: Difficulty.Intermediate,
    level: 3,
    key: 'E Minor',
    tempo: 60,
    description: 'Chopin requested this be played at his funeral. The right hand melody is one of the most expressive in all of piano literature — just a few notes that say everything.',
    sections: [
      {
        name: 'Opening Melody',
        notes: [
          'B4', 'B4', 'B4', 'B4', 'B4', 'B4', 'C5', 'B4',
          'B4', 'A4', 'G4', 'A4', 'B4',
        ],
        fingerings: [
          { note: 'B4', finger: 4, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
          { note: 'A4', finger: 3, hand: 'right' },
          { note: 'G4', finger: 2, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Descent',
        notes: [
          'G4', 'F#4', 'F#4', 'E4', 'F#4', 'G4', 'A4',
          'G4', 'F#4', 'E4', 'D4', 'E4',
        ],
        fingerings: [
          { note: 'G4', finger: 3, hand: 'right' },
          { note: 'F#4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 4, hand: 'right' },
          { note: 'D4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Final Phrase',
        notes: [
          'B4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F#4', 'G4',
          'A4', 'G4', 'F#4', 'E4',
        ],
        fingerings: [
          { note: 'B4', finger: 4, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
          { note: 'A4', finger: 3, hand: 'right' },
          { note: 'G4', finger: 2, hand: 'right' },
          { note: 'F#4', finger: 2, hand: 'right' },
          { note: 'E4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'This piece is about dying — literally. Play with deep feeling.',
      'The repeated B notes are not monotonous. Each one should have slightly different weight.',
      'Rubato is essential. Let the melody breathe.',
      'Chopin said: "Simplicity is the final achievement."',
    ],
  },

  {
    id: 'gymnopedie-1',
    title: 'Gymnopedie No. 1',
    composer: 'Erik Satie',
    difficulty: Difficulty.Intermediate,
    level: 3,
    key: 'D Major',
    tempo: 66,
    description: 'Satie called this "lent et douloureux" — slow and mournful. The melody floats above simple harmonies. A study in touch and restraint.',
    sections: [
      {
        name: 'Main Theme',
        notes: [
          'F#5', 'E5', 'D5', 'C#5', 'E5', 'D5',
          'C#5', 'B4', 'D5', 'C#5', 'B4', 'A4',
        ],
        fingerings: [
          { note: 'F#5', finger: 5, hand: 'right' },
          { note: 'E5', finger: 4, hand: 'right' },
          { note: 'D5', finger: 3, hand: 'right' },
          { note: 'C#5', finger: 2, hand: 'right' },
          { note: 'B4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Return',
        notes: [
          'B4', 'C#5', 'D5', 'E5', 'F#5', 'E5',
          'D5', 'C#5', 'B4', 'A4', 'F#4',
        ],
        fingerings: [
          { note: 'F#4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 2, hand: 'right' },
          { note: 'B4', finger: 3, hand: 'right' },
          { note: 'C#5', finger: 2, hand: 'right' },
          { note: 'D5', finger: 3, hand: 'right' },
          { note: 'E5', finger: 4, hand: 'right' },
          { note: 'F#5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'Play as quietly as you possibly can. This piece lives in pianissimo.',
      'Each descending group of four notes is one breath.',
      'Satie and Chopin shared a belief: the piano should sing, not shout.',
    ],
  },

  {
    id: 'chopin-waltz-am',
    title: 'Waltz in A minor (Simplified)',
    composer: 'Frederic Chopin',
    difficulty: Difficulty.Intermediate,
    level: 3,
    key: 'A Minor',
    tempo: 80,
    description: 'A melancholy waltz that teaches rubato — Chopin\'s signature rhythmic freedom. The melody stretches and compresses like breathing.',
    sections: [
      {
        name: 'A Section',
        notes: [
          'E5', 'D5', 'C5', 'B4', 'A4', 'B4', 'C5',
          'D5', 'E5', 'E5', 'D5', 'C5', 'B4', 'A4',
        ],
        fingerings: [
          { note: 'E5', finger: 5, hand: 'right' },
          { note: 'D5', finger: 4, hand: 'right' },
          { note: 'C5', finger: 3, hand: 'right' },
          { note: 'B4', finger: 2, hand: 'right' },
          { note: 'A4', finger: 1, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'B Section',
        notes: [
          'A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4',
          'G#4', 'A4', 'B4', 'C5', 'A4',
        ],
        fingerings: [
          { note: 'G#4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 1, hand: 'right' },
          { note: 'B4', finger: 2, hand: 'right' },
          { note: 'C5', finger: 3, hand: 'right' },
          { note: 'D5', finger: 4, hand: 'right' },
          { note: 'E5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'ONE-two-three waltz feel. The first beat is grounded, beats two and three float.',
      'The descending line should slow slightly (rubato), then the ascending line accelerates.',
      'The B section introduces G# — a chromatic color that deepens the sadness.',
      'This is Chopin\'s heartbeat made audible.',
    ],
  },

  // ========================================
  // LEVEL 4 — Advanced (Chopin originals, expressive depth)
  // ========================================
  {
    id: 'nocturne-op9-no2',
    title: 'Nocturne Op. 9 No. 2',
    composer: 'Frederic Chopin',
    difficulty: Difficulty.Advanced,
    level: 4,
    key: 'Eb Major',
    tempo: 56,
    description: 'Perhaps the most beautiful piano melody ever written. The right hand sings a vocal line while the left provides harmonic support. This simplified version focuses on the unforgettable opening melody.',
    sections: [
      {
        name: 'Opening Theme',
        notes: [
          'Bb4', 'G4', 'Bb4', 'Bb4', 'C5', 'Bb4', 'Ab4',
          'G4', 'F4', 'G4', 'Bb4', 'Ab4', 'G4',
        ],
        fingerings: [
          { note: 'F4', finger: 1, hand: 'right' },
          { note: 'G4', finger: 2, hand: 'right' },
          { note: 'Ab4', finger: 3, hand: 'right' },
          { note: 'Bb4', finger: 4, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Continuation',
        notes: [
          'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Bb4',
          'Ab4', 'G4', 'F4', 'Eb4', 'F4', 'G4', 'Eb4',
        ],
        fingerings: [
          { note: 'Eb4', finger: 1, hand: 'right' },
          { note: 'F4', finger: 1, hand: 'right' },
          { note: 'G4', finger: 2, hand: 'right' },
          { note: 'Ab4', finger: 3, hand: 'right' },
          { note: 'Bb4', finger: 4, hand: 'right' },
          { note: 'C5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'This melody must sing — cantabile above all.',
      'Play the Bb-G-Bb opening as if you are saying "hello" to someone you love.',
      'Every note in Chopin has a specific dynamic. No two notes are the same volume.',
      'The ornaments (trills, turns) come later. First: master the naked melody.',
    ],
  },

  {
    id: 'waltz-op64-no2',
    title: 'Waltz Op. 64 No. 2 (A Section)',
    composer: 'Frederic Chopin',
    difficulty: Difficulty.Advanced,
    level: 4,
    key: 'C# Minor',
    tempo: 72,
    description: 'Chopin\'s most intimate waltz. The C# minor melody spirals downward with restrained passion — technically moderate but musically profound.',
    sections: [
      {
        name: 'Main Theme',
        notes: [
          'C#5', 'B4', 'A4', 'G#4', 'A4', 'B4', 'C#5',
          'D#5', 'E5', 'D#5', 'C#5', 'B4', 'A4', 'G#4',
        ],
        fingerings: [
          { note: 'G#4', finger: 1, hand: 'right' },
          { note: 'A4', finger: 2, hand: 'right' },
          { note: 'B4', finger: 3, hand: 'right' },
          { note: 'C#5', finger: 4, hand: 'right' },
          { note: 'D#5', finger: 5, hand: 'right' },
          { note: 'E5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Response',
        notes: [
          'F#4', 'G#4', 'A4', 'B4', 'C#5', 'B4', 'A4',
          'G#4', 'F#4', 'E4', 'F#4', 'G#4', 'A4',
        ],
        fingerings: [
          { note: 'E4', finger: 1, hand: 'right' },
          { note: 'F#4', finger: 1, hand: 'right' },
          { note: 'G#4', finger: 2, hand: 'right' },
          { note: 'A4', finger: 3, hand: 'right' },
          { note: 'B4', finger: 4, hand: 'right' },
          { note: 'C#5', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'The waltz feel must be subtle. This is not a dance hall — it is a private room.',
      'The ascending C#-D#-E is the emotional peak. Shape it with a slight crescendo.',
      'Rubato: the melody sways like a pendulum, never metronomic.',
    ],
  },

  {
    id: 'raindrop-prelude',
    title: 'Raindrop Prelude, Op. 28 No. 15',
    composer: 'Frederic Chopin',
    difficulty: Difficulty.Advanced,
    level: 4,
    key: 'Db Major',
    tempo: 60,
    description: 'Composed during a storm in Majorca. The repeated Ab represents raindrops. The melody rises above this ostinato — a masterpiece of layered texture.',
    sections: [
      {
        name: 'Opening Melody',
        notes: [
          'F4', 'Ab4', 'Ab4', 'Ab4', 'Ab4', 'Bb4', 'Ab4',
          'Gb4', 'F4', 'Eb4', 'F4', 'Ab4',
        ],
        fingerings: [
          { note: 'Eb4', finger: 1, hand: 'right' },
          { note: 'F4', finger: 2, hand: 'right' },
          { note: 'Gb4', finger: 3, hand: 'right' },
          { note: 'Ab4', finger: 4, hand: 'right' },
          { note: 'Bb4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
      {
        name: 'Continuation',
        notes: [
          'Bb4', 'Ab4', 'Gb4', 'F4', 'Eb4', 'F4', 'Gb4',
          'Ab4', 'Bb4', 'Ab4', 'Gb4', 'F4',
        ],
        fingerings: [
          { note: 'Eb4', finger: 1, hand: 'right' },
          { note: 'F4', finger: 2, hand: 'right' },
          { note: 'Gb4', finger: 3, hand: 'right' },
          { note: 'Ab4', finger: 4, hand: 'right' },
          { note: 'Bb4', finger: 5, hand: 'right' },
        ],
        hand: 'right',
      },
    ],
    tips: [
      'The repeated Ab notes are the "raindrops" — they must be steady and quiet.',
      'The melody notes (F, Bb, Gb) sing ABOVE the rain. Bring them out.',
      'Chopin wrote this while listening to actual rain. Listen to rain while you practice.',
    ],
  },
];
