import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EXERCISE_DATABASE, WORKOUT_SCHEDULES, type Exercise } from '../data/exercises';

export interface CustomExercise extends Exercise {
  isCustom: boolean;
  equipment: string[];
  description: string;
  createdAt: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exerciseIds: string[];
  description?: string;
}

interface ExerciseState {
  customExercises: CustomExercise[];
  customTemplates: WorkoutTemplate[];
  favoriteExerciseIds: string[];
  
  // Getters
  getAllExercises: () => (Exercise | CustomExercise)[];
  getAllTemplates: () => Record<string, string[]>;
  
  // Setters
  addCustomExercise: (ex: CustomExercise) => void;
  deleteCustomExercise: (id: string) => void;
  duplicateExercise: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addTemplate: (template: WorkoutTemplate) => void;
  deleteTemplate: (id: string) => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      customExercises: [],
      customTemplates: [],
      favoriteExerciseIds: [],

      getAllExercises: () => {
        return [...EXERCISE_DATABASE, ...get().customExercises];
      },

      getAllTemplates: () => {
        const base: Record<string, string[]> = { ...WORKOUT_SCHEDULES };
        get().customTemplates.forEach(t => {
          base[t.name] = t.exerciseIds;
        });
        return base;
      },

      addCustomExercise: (ex) => set((state) => ({
        customExercises: [...state.customExercises, ex]
      })),

      deleteCustomExercise: (id) => set((state) => ({
        customExercises: state.customExercises.filter(e => e.id !== id)
      })),

      duplicateExercise: (id) => set((state) => {
        const all = get().getAllExercises();
        const existing = all.find(e => e.id === id);
        if (!existing) return state;
        const dup: CustomExercise = {
          ...existing,
          id: `custom_${Date.now()}`,
          name: `${existing.name} (Copy)`,
          isCustom: true,
          equipment: (existing as CustomExercise).equipment || [],
          description: (existing as CustomExercise).description || '',
          createdAt: Date.now()
        };
        return { customExercises: [...state.customExercises, dup] };
      }),

      toggleFavorite: (id) => set((state) => {
        const isFav = state.favoriteExerciseIds.includes(id);
        return {
          favoriteExerciseIds: isFav
            ? state.favoriteExerciseIds.filter(fId => fId !== id)
            : [...state.favoriteExerciseIds, id]
        };
      }),

      addTemplate: (template) => set((state) => ({
        customTemplates: [...state.customTemplates, template]
      })),

      deleteTemplate: (id) => set((state) => ({
        customTemplates: state.customTemplates.filter(t => t.id !== id)
      }))
    }),
    {
      name: 'omnibody-exercise-storage'
    }
  )
);
