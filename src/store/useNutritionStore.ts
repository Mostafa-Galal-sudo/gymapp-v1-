import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay } from 'date-fns';

export interface LoggedFood {
  foodId: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Pre-workout' | 'Post-workout';
  foods: LoggedFood[];
}

export interface NutritionDay {
  date: number; // Start of day timestamp
  meals: Meal[];
  waterMl: number;
}

interface NutritionState {
  history: Record<number, NutritionDay>; // Keyed by start of day timestamp
  getTargets: (weight: number) => { calories: number; protein: number; carbs: number; fats: number; fiber: number; water: number };
  addFood: (date: number, mealType: string, food: LoggedFood) => void;
  removeFood: (date: number, mealId: string, foodId: string) => void;
  addWater: (date: number, amount: number) => void;
  getTodayLog: () => NutritionDay;
  importData: (data: any) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      history: {},

      getTargets: (weight: number) => ({
        calories: 3200,
        protein: Math.round(weight * 2.05), // ~160g for 78kg
        carbs: 400,
        fats: 89,
        fiber: 30,
        water: 3500
      }),

      getTodayLog: () => {
        const today = startOfDay(new Date()).getTime();
        const history = get().history;
        if (!history[today]) {
          return {
            date: today,
            waterMl: 0,
            meals: [
              { id: generateId(), type: 'Breakfast', foods: [] },
              { id: generateId(), type: 'Lunch', foods: [] },
              { id: generateId(), type: 'Dinner', foods: [] },
              { id: generateId(), type: 'Snacks', foods: [] }
            ]
          };
        }
        return history[today];
      },

      addFood: (date, mealType, food) => set((state) => {
        const today = startOfDay(new Date(date)).getTime();
        const dayLog = state.history[today] || get().getTodayLog();
        
        let meal = dayLog.meals.find(m => m.type === mealType);
        if (!meal) {
          meal = { id: generateId(), type: mealType as any, foods: [] };
          dayLog.meals.push(meal);
        }
        
        meal.foods.push(food);
        
        return {
          history: { ...state.history, [today]: { ...dayLog, meals: [...dayLog.meals] } }
        };
      }),

      removeFood: (date, mealId, foodId) => set((state) => {
        const today = startOfDay(new Date(date)).getTime();
        const dayLog = state.history[today];
        if (!dayLog) return state;

        const meals = dayLog.meals.map(m => {
          if (m.id !== mealId) return m;
          return { ...m, foods: m.foods.filter(f => f.foodId !== foodId) };
        });

        return {
          history: { ...state.history, [today]: { ...dayLog, meals } }
        };
      }),

      addWater: (date, amount) => set((state) => {
        const today = startOfDay(new Date(date)).getTime();
        const dayLog = state.history[today] || get().getTodayLog();
        return {
          history: { ...state.history, [today]: { ...dayLog, waterMl: dayLog.waterMl + amount } }
        };
      }),

      importData: (data) => set({ history: data.history || {} })
    }),
    {
      name: 'omnibody-nutrition-storage',
    }
  )
);
