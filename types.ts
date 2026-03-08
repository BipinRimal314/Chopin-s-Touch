import type { DynamicLevel } from './utils/dynamics';

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum ExerciseType {
  Scale = 'Scale',
  Arpeggio = 'Arpeggio',
  Chord = 'Chord',
  Etude = 'Etude',
  Drill = 'Drill',
  Concept = 'Concept',
  Mental = 'Mental',
}

export enum ExerciseCategory {
  Technical = 'Technical Skills',
  HandCoordination = 'Hand Coordination',
  Musicality = 'Musicality & Expression',
  Rhythm = 'Rhythm & Time',
  Habits = 'Practice Habits',
  Theory = 'Music Theory & Ear Training',
  Performance = 'Performance & Mindset',
}

export interface NoteConfig {
  name: string; // e.g., "B", "C#", "D#"
  isBlack: boolean;
  midi?: number;
}

export interface KeyFinger {
  note: string; // e.g., "B3"
  finger: number; // 1-5
  hand: 'left' | 'right';
}

// Hand indicator
export type Hand = 'left' | 'right' | 'both';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  category: ExerciseCategory;
  difficulty: Difficulty;
  key: string;
  hand?: Hand; // defaults to 'right' if not specified
  notes: string[]; // List of notes for visualizer, e.g., ["B3", "C#4", "D#4"...]
  durations?: number[]; // Note duration multipliers relative to a quarter note (1=quarter, 0.5=eighth, 2=half, 4=whole, 0.333=triplet, 1.5=dotted quarter). When undefined, all notes are quarter notes.
  fingerings: KeyFinger[]; // Visual cues
  tips: string[]; // Chopin method specific tips
  targetDynamic?: DynamicLevel[]; // One per note, or a single value for the whole exercise
}

// Piece system
export interface PieceSection {
  name: string;          // e.g., "Measures 1-4", "A Section"
  notes: string[];       // Note IDs like "C4", "E4"
  fingerings: KeyFinger[];
  hand: Hand;
  accompaniment?: {
    notes: string[];
    durations?: number[];  // same format as Exercise durations (1=quarter, 2=half, 4=whole)
  };
}

export interface Piece {
  id: string;
  title: string;
  composer: string;
  difficulty: Difficulty;
  level: 1 | 2 | 3 | 4;   // Progressive difficulty
  key: string;
  tempo: number;            // Suggested BPM
  description: string;
  sections: PieceSection[];
  tips: string[];
}
