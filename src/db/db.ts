import Dexie, { type EntityTable } from 'dexie';
import { type UserProfile, type Supplement, type WeightEntry } from '../store/useUserStore';
import { type WorkoutSession } from '../store/useWorkoutStore';
import { type CustomExercise } from '../store/useExerciseStore';

// We define our tables based on the old Zustand structures so migration is easy
export interface InjuryEntry {
  id: string;
  bodyPart: string;
  severity: number; // 1-10
  status: 'Active' | 'Recovering' | 'Healed';
  notes: string;
  dateLogged: number;
}

const db = new Dexie('OmnibodyDB') as Dexie & {
  workouts: EntityTable<WorkoutSession, 'sessionId'>;
  custom_exercises: EntityTable<CustomExercise, 'id'>;
  injuries: EntityTable<InjuryEntry, 'id'>;
  user_profile: EntityTable<{ id: string; profile: UserProfile; supplements: Supplement[]; weightHistory: WeightEntry[] }, 'id'>;
};

// Schema version 1
db.version(1).stores({
  workouts: 'sessionId, date, type, phase', // Primary key and indexed props
  custom_exercises: 'id, name, category, muscleGroup',
  injuries: 'id, bodyPart, status',
  user_profile: 'id' // Singleton table with id="me"
});

export default db;
