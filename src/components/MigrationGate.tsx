import { useEffect, useState } from 'react';
import db from '../db/db';
import { Shield } from 'lucide-react';

export const MigrationGate = ({ children }: { children: React.ReactNode }) => {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const checkMigration = async () => {
      const isMigrated = localStorage.getItem('dexie_migration_complete');
      if (isMigrated === 'true') return;

      setMigrating(true);
      
      try {
        // Step 1: Read old data
        setProgress(10);
        const userRaw = localStorage.getItem('omnibody-user-storage');
        const workoutRaw = localStorage.getItem('omnibody-workout-storage');
        const exerciseRaw = localStorage.getItem('omnibody-exercise-storage');

        // Step 2: Parse
        setProgress(30);
        const userState = userRaw ? JSON.parse(userRaw).state : null;
        const workoutState = workoutRaw ? JSON.parse(workoutRaw).state : null;
        const exerciseState = exerciseRaw ? JSON.parse(exerciseRaw).state : null;

        // Step 3: Write to Dexie
        setProgress(50);
        if (userState) {
          await db.user_profile.put({
            id: 'me',
            profile: userState.profile,
            supplements: userState.supplements,
            weightHistory: userState.weightHistory
          });
        }

        setProgress(70);
        if (workoutState?.history?.length) {
          await db.workouts.bulkPut(workoutState.history);
        }

        setProgress(90);
        if (exerciseState?.customExercises?.length) {
          await db.custom_exercises.bulkPut(exerciseState.customExercises);
        }

        // Step 4: Finish
        setProgress(100);
        localStorage.setItem('dexie_migration_complete', 'true');
        
        // Wait a beat so the user sees 100%
        setTimeout(() => setMigrating(false), 500);

      } catch (err) {
        console.error('Migration failed:', err);
        alert('Failed to migrate old data. Starting fresh database.');
        localStorage.setItem('dexie_migration_complete', 'true');
        setMigrating(false);
      }
    };

    checkMigration();
  }, []);

  if (migrating) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem', textAlign: 'center' }}>
        <Shield size={48} color="var(--cyan)" style={{ marginBottom: '1.5rem', animation: 'pulse 2s infinite' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>Upgrading Database</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Migrating your data to OMNIBODY V2 Engine...<br/>Please do not close the app.
        </p>
        <div className="xp-bar-track" style={{ width: '100%', maxWidth: 300 }}>
          <div className="xp-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
