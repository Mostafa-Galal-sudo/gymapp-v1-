import { useRef, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useGamificationStore } from '../store/useGamificationStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { Download, Upload, Save, Trophy, Plus, ShieldAlert, Watch, Activity, HeartPulse, ShieldCheck, Globe } from 'lucide-react';
import { useT } from '../hooks/useT';
import { useLanguageStore } from '../store/useLanguageStore';

// ── Custom Recharts Tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(6,9,15,0.95)', border: '1px solid rgba(0,240,255,0.2)',
      borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.8rem',
    }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700 }}>
        {payload[0].value} kg
      </div>
    </div>
  );
};

// ── Trophy Room ───────────────────────────────────────────────────────────────
const TrophyRoom = () => {
  const { badges, xp, level } = useGamificationStore();
  const t = useT();
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges   = badges.filter(b => !b.unlocked);

  const levelNames = ['', t('dash.beginner'), t('dash.intermediate'), t('dash.advanced'), t('dash.elite'), t('dash.legend')];
  const levelName  = levelNames[Math.min(level, 5)] || t('dash.legend');
  const xpForLevel = level * level * 100;
  const xpPrev     = (level - 1) * (level - 1) * 100;
  const progress   = ((xp - xpPrev) / (xpForLevel - xpPrev)) * 100;

  return (
    <div>
      {/* Level Card */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          {t('profile.current_rank')}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '3.5rem',
          letterSpacing: '0.08em', lineHeight: 1,
        }} className="gradient-text">
          {levelName.toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0.5rem 0 1rem' }}>
          {t('dash.level')} {level} · {xp.toLocaleString()} {t('profile.total_xp')}
        </div>

        <div className="xp-bar-track" style={{ height: 10, borderRadius: 'var(--radius-full)', overflow: 'visible' }}>
          <div className="xp-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Lv {level}</span>
          <span>{xpForLevel.toLocaleString()} XP → Lv {level + 1}</span>
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="section-label" style={{ color: 'var(--gold)' }}>
            <Trophy size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            {t('profile.unlocked')} — {unlockedBadges.length}/{badges.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {unlockedBadges.map((badge, i) => (
              <div key={badge.id} className="badge-card unlocked animate-badge-pop"
                style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="badge-icon">{badge.icon}</span>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3 }}>
                  {badge.name}
                </div>
                {badge.unlockedAt && (
                  <div style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {format(new Date(badge.unlockedAt), 'MMM d')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <div className="section-label">{t('profile.locked')} — {lockedBadges.length} {t('profile.remaining')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {lockedBadges.map(badge => (
            <div key={badge.id} className="badge-card locked">
              <span style={{ fontSize: '2rem', lineHeight: 1 }}>{badge.icon}</span>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-heading)', textAlign: 'center', lineHeight: 1.3 }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                {badge.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Profile Page ──────────────────────────────────────────────────────────────
const Profile = () => {
  const userStore       = useUserStore();
  const workoutStore    = useWorkoutStore();
  const nutritionStore  = useNutritionStore();
  const gamification    = useGamificationStore();
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const t               = useT();
  const { lang, toggleLang } = useLanguageStore();

  const [newWeight, setNewWeight] = useState('');
  const [tab, setTab]            = useState<'stats' | 'trophies'>('trophies');
  
  // Injury State
  const [injuries, setInjuries] = useState([
    { id: '1', part: 'Right Shoulder', severity: 4, status: 'Recovering' },
    { id: '2', part: 'Lower Back', severity: 2, status: 'Active' }
  ]);
  const [showAddInjury, setShowAddInjury] = useState(false);
  const [newInjury, setNewInjury] = useState({ part: '', severity: 5 });

  const handleAddInjury = () => {
    if (!newInjury.part) return;
    setInjuries([...injuries, { id: Date.now().toString(), part: newInjury.part, severity: newInjury.severity, status: 'Active' }]);
    setShowAddInjury(false);
    setNewInjury({ part: '', severity: 5 });
  };

  const handleExport = () => {
    const data = {
      user:        JSON.parse(localStorage.getItem('omnibody-user-storage')      || '{}').state,
      workout:     JSON.parse(localStorage.getItem('omnibody-workout-storage')   || '{}').state,
      nutrition:   JSON.parse(localStorage.getItem('omnibody-nutrition-storage') || '{}').state,
      gamification:JSON.parse(localStorage.getItem('omnibody-gamification-storage') || '{}').state,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `omnibody-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.user)         userStore.importData(data.user);
        if (data.workout)      workoutStore.importData(data.workout);
        if (data.nutrition)    nutritionStore.importData(data.nutrition);
        if (data.gamification) gamification.importData(data.gamification);
        alert('Data restored successfully!');
      } catch {
        alert('Invalid backup file. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  const handleLogWeight = () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) { userStore.logWeight(w); setNewWeight(''); }
  };

  const chartData = userStore.weightHistory.map(e => ({
    date:   format(new Date(e.date), 'MMM d'),
    weight: e.weight,
  }));

  const { profile } = userStore;
  const totalSessions = workoutStore.history.length;
  const totalVolume   = workoutStore.history.reduce((a, s) => a + s.totalVolume, 0);

  const TabBtn = ({ id, label }: { id: 'stats' | 'trophies'; label: string }) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: '0.65rem', fontFamily: 'var(--font-heading)',
      fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase',
      background: tab === id ? 'rgba(0,240,255,0.1)' : 'transparent',
      color: tab === id ? 'var(--cyan)' : 'var(--color-text-muted)',
      borderBottom: `2px solid ${tab === id ? 'var(--cyan)' : 'transparent'}`,
      transition: 'all 0.2s',
    }}>{label}</button>
  );

  return (
    <div className="page">
      {/* Header */}
      <header style={{ marginBottom: '1.75rem' }}>
        <div className="section-label">{t('profile.athlete')}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.06em' }}>
          <span className="gradient-text">{t('profile.title')}</span>
        </h1>
      </header>

      {/* Profile Card */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Avatar circle */}
          <div style={{
            width: 70, height: 70, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--cyan), var(--magenta))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-cyan)',
            fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#000',
          }}>
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>{profile.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--cyan)', marginTop: '0.15rem' }}>
              {profile.age} {t('profile.age')} · {profile.weight}{t('common.kg')} · {profile.height}cm
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {t('dash.level')} {profile.level} · {profile.goals.map(g => t(`auth.goal.${g}` as any) || g).join(' · ')}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
          {[
            { label: t('dash.sessions'), val: totalSessions },
            { label: t('dash.volume'), val: `${(totalVolume/1000).toFixed(1)}T` },
            { label: 'XP', val: gamification.xp.toLocaleString() },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center', background: 'rgba(0,240,255,0.04)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan)' }}>{val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wearables Hub */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Watch size={18} /> {t('profile.wearables')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={16} /> {t('profile.apple_health')}</div>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => alert('Mock: Syncing with Apple Health...')}>{t('profile.connect')}</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><HeartPulse size={16} /> {t('profile.garmin')}</div>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>{t('profile.connected')}</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={16} /> {t('profile.whoop')}</div>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => alert('Mock: Syncing with Whoop API...')}>{t('profile.connect')}</button>
          </div>
        </div>
      </div>

      {/* Injury Management */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.05em', color: 'var(--magenta)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ShieldAlert size={18} /> {t('profile.injuries')}
          </h3>
          <button onClick={() => setShowAddInjury(!showAddInjury)} style={{ background: 'none', border: 'none', color: 'var(--cyan)' }}><Plus size={18} /></button>
        </div>

        {showAddInjury && (
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8, marginBottom: '1rem' }}>
            <input type="text" placeholder={t('profile.body_part')} value={newInjury.part} onChange={e => setNewInjury({ ...newInjury, part: e.target.value })} style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--magenta)', color: '#fff', borderRadius: 4 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{t('profile.severity')}: {newInjury.severity}/10</span>
              <input type="range" min="1" max="10" value={newInjury.severity} onChange={e => setNewInjury({ ...newInjury, severity: parseInt(e.target.value) })} style={{ flex: 1 }} />
            </div>
            <button className="btn-primary" onClick={handleAddInjury} style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>{t('profile.log_injury')}</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {injuries.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{t('profile.no_injuries')}</div>
          ) : (
            injuries.map(inj => (
              <div key={inj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8, borderLeft: `3px solid ${inj.status === 'Active' ? 'var(--magenta)' : 'var(--color-warning)'}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inj.part}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t('profile.severity')}: {inj.severity}/10</div>
                </div>
                <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setInjuries(injuries.map(i => i.id === inj.id ? { ...i, status: i.status === 'Active' ? 'Recovering' : 'Active' } : i))}>
                  {inj.status === 'Active' ? t('profile.active') : t('profile.recovering')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,240,255,0.1)', marginBottom: '1.25rem' }}>
        <TabBtn id="trophies" label={`🏆 ${t('profile.trophies')}`} />
        <TabBtn id="stats" label={`📈 ${t('profile.progress')}`} />
      </div>

      {tab === 'trophies' && <TrophyRoom />}

      {tab === 'stats' && (
        <div>
          {/* Weight Chart */}
          <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div className="section-label">{t('profile.weight_trend')}</div>
            <div style={{ height: 200, marginBottom: '1rem' }}>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.06)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-text-muted)' }} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--color-text-muted)' }} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="weight" stroke="var(--cyan)" strokeWidth={2.5}
                      dot={{ r: 5, fill: 'var(--bg-base)', stroke: 'var(--cyan)', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: 'var(--cyan)', stroke: 'var(--cyan)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {t('profile.log_weighins')}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input type="number" placeholder={t('profile.enter_weight')} value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogWeight()}
                style={{ flex: 1 }}
              />
              <button onClick={handleLogWeight} className="btn-primary" style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}>
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Settings (Always Visible) */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div className="section-label">{t('profile.app_settings')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--cyan)" />
            <span style={{ fontWeight: 600 }}>{t('common.language')}</span>
          </div>
          <button className="btn-secondary" onClick={toggleLang} style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>

      {/* Data Management (Always Visible) */}
      <div className="glass-card animate-fade-up" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div className="section-label">{t('profile.data_backup')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={handleExport} className="btn-secondary" style={{ width: '100%', padding: '1rem' }}>
            <Download size={18} /> {t('profile.export_json')}
          </button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
            }}>
            <Upload size={18} /> {t('profile.import_json')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
