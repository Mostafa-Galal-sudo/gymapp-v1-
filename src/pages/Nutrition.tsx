import { useState } from 'react';
import { useNutritionStore } from '../store/useNutritionStore';
import type { LoggedFood } from '../store/useNutritionStore';
import { useUserStore } from '../store/useUserStore';
import { startOfDay } from 'date-fns';
import { FOOD_DATABASE } from '../data/foods';
import type { Food } from '../data/foods';
import { useGamificationStore } from '../store/useGamificationStore';
import { Search, Plus, X, Droplet, Check, ChevronDown } from 'lucide-react';
import { useT } from '../hooks/useT';

// ── Macro Liquid Bar ──────────────────────────────────────────────────────────
const MacroBar = ({ label, current, target, gradient, unit = 'g' }: {
  label: string; current: number; target: number; gradient: string; unit?: string;
}) => {
  const pct = Math.min(100, (current / target) * 100);
  const over = pct >= 100;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: over ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
          {Math.round(current)}<span style={{ opacity: 0.5 }}>/{target}{unit}</span>
        </span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill"
          style={{ width: `${pct}%`, background: over ? 'linear-gradient(90deg,#ffaa00,#ff6600)' : gradient }}
        />
      </div>
    </div>
  );
};

// ── Water Bottle Visual ───────────────────────────────────────────────────────
const WaterBottle = ({ current, target }: { current: number; target: number }) => {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: 36, height: 64, flexShrink: 0 }}>
        <svg viewBox="0 0 36 64" style={{ width: '100%', height: '100%' }}>
          {/* Bottle outline */}
          <rect x="10" y="0" width="16" height="8" rx="3" fill="rgba(0,240,255,0.15)" stroke="rgba(0,240,255,0.3)" strokeWidth="1"/>
          <rect x="4"  y="8" width="28" height="54" rx="6" fill="rgba(0,240,255,0.06)" stroke="rgba(0,240,255,0.25)" strokeWidth="1"/>
          {/* Water fill */}
          <clipPath id="bottleClip">
            <rect x="4" y="8" width="28" height="54" rx="6" />
          </clipPath>
          <rect x="4" y={8 + 54 * (1 - pct/100)} width="28" height={54 * pct/100} rx="0"
            fill="rgba(0,240,255,0.25)" clipPath="url(#bottleClip)"
            style={{ transition: 'y 0.6s ease, height 0.6s ease' }}
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Droplet size={14} color="var(--cyan)" />Water</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{current}ml <span style={{ opacity: 0.5 }}>/ {target}ml</span></span>
        </div>
        <div className="macro-bar-track">
          <div className="macro-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--cyan), #0044ff)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          {[250, 500, 750].map(ml => (
            <button key={ml} onClick={() => addWaterFn(ml)}
              style={{
                flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)', fontWeight: 700,
                border: '1px solid rgba(0,240,255,0.2)', borderRadius: 'var(--radius-md)',
                color: 'var(--cyan)', background: 'rgba(0,240,255,0.05)',
                transition: 'all 0.2s',
              }}
            >+{ml}ml</button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Temp global fn ref (passed via closure)
let addWaterFn = (_ml: number) => {};

// ── Supplement Checklist ──────────────────────────────────────────────────────
const Supplements = () => {
  const t              = useT();
  const supplements    = useUserStore(s => s.supplements);
  const toggle         = useUserStore(s => s.toggleSupplement);
  const unlockBadge    = useGamificationStore(s => s.unlockBadge);
  const addXP          = useGamificationStore(s => s.addXP);

  const handleToggle = (id: string, idx: number, isTaken: boolean) => {
    toggle(id, idx);
    if (!isTaken) {
      addXP(5);
      const allTaken = supplements.every(s => s.taken.every(t => t));
      if (allTaken) unlockBadge('supplement_king');
    }
  };

  return (
    <div>
      <div className="section-label" style={{ color: 'var(--magenta)' }}>{t('nutrition.supplements')}</div>
      <div className="glass-card" style={{ padding: '1rem' }}>
        {supplements.map((sup, si) => (
          <div key={sup.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: si < supplements.length - 1 ? '1px solid rgba(0,240,255,0.06)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sup.name}
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: '0.5rem' }}>{sup.dose}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{sup.timing}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {sup.taken.map((isTaken, di) => (
                <button key={di} onClick={() => handleToggle(sup.id, di, isTaken)} style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: isTaken ? 'var(--color-success)' : 'rgba(0,240,255,0.05)',
                  border: `1px solid ${isTaken ? 'var(--color-success)' : 'rgba(0,240,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isTaken ? '0 0 8px rgba(0,255,136,0.4)' : 'none',
                  transition: 'all 0.2s',
                  color: isTaken ? '#000' : 'var(--color-text-muted)',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {isTaken ? <Check size={16} strokeWidth={3} /> : `${di+1}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Nutrition Page ────────────────────────────────────────────────────────────
const Nutrition = () => {
  const t            = useT();
  const profile      = useUserStore(s => s.profile);
  const getTodayLog  = useNutritionStore(s => s.getTodayLog);
  const historyData  = useNutritionStore(s => s.history);
  const getTargets   = useNutritionStore(s => s.getTargets);
  const addFood      = useNutritionStore(s => s.addFood);
  const removeFood   = useNutritionStore(s => s.removeFood);
  const addWater     = useNutritionStore(s => s.addWater);
  const addXP        = useGamificationStore(s => s.addXP);
  const unlockBadge  = useGamificationStore(s => s.unlockBadge);

  const todayStr = startOfDay(new Date()).getTime();
  const todayLog = historyData[todayStr] || getTodayLog();
  const targets  = getTargets(profile.weight);
  addWaterFn     = (ml) => { addWater(todayLog.date, ml); };

  const [search, setSearch]       = useState('');
  const [mealType, setMealType]   = useState('Breakfast');
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({ Breakfast: true });

  let totalCal = 0, totalPro = 0, totalCarbs = 0, totalFats = 0;
  todayLog.meals.forEach(m => m.foods.forEach(f => {
    totalCal   += f.calories;
    totalPro   += f.protein;
    totalCarbs += f.carbs;
    totalFats  += f.fats;
  }));

  const filtered = search.length > 1
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : [];

  const handleAdd = (food: Food) => {
    const logged: LoggedFood = {
      foodId: food.id, name: food.name,
      amount: food.servingSize, unit: food.servingUnit,
      calories: food.calories, protein: food.protein,
      carbs: food.carbs, fats: food.fats,
    };
    addFood(todayLog.date, mealType, logged);
    addXP(2);
    if (totalPro + food.protein >= targets.protein) unlockBadge('hydration_hero');
    setSearch('');
  };

  const toggleMeal = (type: string) =>
    setOpenMeals(o => ({ ...o, [type]: !o[type] }));

  const MEAL_TYPES = [
    t('nutrition.breakfast', 'Breakfast'),
    t('nutrition.lunch', 'Lunch'),
    t('nutrition.dinner', 'Dinner'),
    t('nutrition.snacks', 'Snacks'),
    t('nutrition.pre_workout', 'Pre-workout'),
    t('nutrition.post_workout', 'Post-workout')
  ];

  const categoryColor = (cat: string) => ({
    Local: 'var(--gold)', International: 'var(--magenta)',
    Raw: 'var(--color-success)', Supplement: 'var(--cyan)',
  }[cat] || 'var(--color-text-muted)');

  return (
    <div className="page">
      {/* Header */}
      <header style={{ marginBottom: '1.75rem' }}>
        <div className="section-label">{t('nutrition.daily_fuel')}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.06em' }}>
          {t('nutrition.title')} <span className="neon-magenta">{t('nutrition.log')}</span>
        </h1>
      </header>

      {/* Macro Summary */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem',
          textAlign: 'center', gap: '0.5rem',
        }}>
          {[
            { label: t('dash.calories'), val: Math.round(totalCal), unit: t('common.kcal'), color: 'var(--cyan)' },
            { label: t('dash.protein'), val: Math.round(totalPro), unit: 'g', color: 'var(--color-success)' },
            { label: t('nutrition.carbs'), val: Math.round(totalCarbs), unit: 'g', color: 'var(--color-warning)' },
            { label: t('nutrition.fats'), val: Math.round(totalFats), unit: 'g', color: 'var(--magenta)' },
          ].map(({ label, val, unit, color }) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: '0.65rem', color, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{unit}</div>
            </div>
          ))}
        </div>
        <MacroBar label={t('dash.calories')} current={totalCal} target={targets.calories} gradient="linear-gradient(90deg,var(--cyan),#0080ff)" unit={` ${t('common.kcal')}`} />
        <MacroBar label={t('dash.protein')} current={totalPro} target={targets.protein} gradient="linear-gradient(90deg,#00ff88,var(--cyan))" />
        <MacroBar label={t('nutrition.carbs')} current={totalCarbs} target={targets.carbs} gradient="linear-gradient(90deg,var(--color-warning),#ff6600)" />
        <MacroBar label={t('nutrition.fats')} current={totalFats} target={targets.fats} gradient="linear-gradient(90deg,var(--magenta),#8800aa)" />
      </div>

      {/* Water */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <WaterBottle current={todayLog.waterMl} target={targets.water} />
      </div>

      {/* Food Search + Add */}
      <div className="animate-fade-up" style={{ marginBottom: '1.25rem' }}>
        <div className="section-label">{t('nutrition.log_food')}</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <select value={mealType} onChange={e => setMealType(e.target.value)} style={{ width: '45%' }}>
            {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder={t('nutrition.search')} value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="glass-card" style={{ maxHeight: 240, overflowY: 'auto', borderRadius: 'var(--radius-md)' }}>
            {filtered.map((f, i) => (
              <div key={f.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,240,255,0.06)' : 'none',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{f.name}</span>
                    <span style={{ fontSize: '0.6rem', color: categoryColor(f.category), fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{f.category}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                    {f.calories}kcal · {f.protein}g P · {f.carbs}g C · {f.fats}g F · {f.servingSize}{f.servingUnit}
                  </div>
                </div>
                <button onClick={() => handleAdd(f)} style={{
                  background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.25)',
                  borderRadius: 'var(--radius-full)', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cyan)', flexShrink: 0, marginLeft: '0.75rem',
                }}>
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meal Logs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-label">{t('nutrition.meals')}</div>
        {MEAL_TYPES.map(type => {
          const meal = todayLog.meals.find(m => m.type === type);
          if (!meal || meal.foods.length === 0) return null;
          const isOpen = openMeals[type] !== false;
          const mealCal = meal.foods.reduce((a, f) => a + f.calories, 0);
          return (
            <div key={type} className="glass-card" style={{ marginBottom: '0.75rem' }}>
              <button onClick={() => toggleMeal(type)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.25rem', color: 'var(--color-text)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{type}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan)' }}>{Math.round(mealCal)} kcal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{meal.foods.length} {t('common.items')}</span>
                  <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: '0 1.25rem 1rem' }}>
                  {meal.foods.map((food, fi) => (
                    <div key={fi} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.5rem 0',
                      borderTop: '1px solid rgba(0,240,255,0.05)',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem' }}>{food.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {food.amount}{food.unit} · {food.calories}kcal · {Math.round(food.protein)}g P
                        </div>
                      </div>
                      <button onClick={() => removeFood(todayLog.date, meal.id, food.foodId)}>
                        <X size={16} color="rgba(255,0,110,0.6)" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Supplements */}
      <Supplements />
    </div>
  );
};

export default Nutrition;
