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
  Musicality = 'Musicality & Expression',
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

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  category: ExerciseCategory;
  difficulty: Difficulty;
  key: string;
  notes: string[]; // List of notes for visualizer, e.g., ["B3", "C#4", "D#4"...]
  fingerings: KeyFinger[]; // Visual cues
  tips: string[]; // Chopin method specific tips
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface PracticeSession {
  date: string;
  durationMinutes: number;
  focus: string;
}