import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Mail, KeyRound, Fingerprint, User, Apple, ShieldCheck, ArrowRight } from 'lucide-react';
import { useT } from '../hooks/useT';

export const Auth = () => {
  const t = useT();
  const login = useUserStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'login' | 'totp' | 'magic'>('login');
  const [totpCode, setTotpCode] = useState('');

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep('totp'); // Trigger 2FA
  };

  const handleTotpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length >= 4) {
      login();
    }
  };

  const handleBiometric = () => {
    // Mock WebAuthn
    alert('Biometric / Face ID prompt would appear here.');
    login();
  };

  const handleSocial = (provider: string) => {
    alert(`Redirecting to ${provider} OAuth...`);
    login();
  };

  const handleMagicLink = () => {
    if (!email) return alert('Enter email first');
    setStep('magic');
    setTimeout(() => login(), 3000); // Auto-login after 3s to mock clicking the email
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="display" style={{ fontSize: '3rem', letterSpacing: '0.1em' }}>
          <span className="neon-cyan">OMNI</span>BODY
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
          {t('auth.tagline')}
        </p>
      </div>

      <div className="glass-card" style={{ width: '100%', maxWidth: '360px', padding: '2rem' }}>
        {step === 'login' && (
          <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--cyan)" style={{ position: 'absolute', top: 12, left: 12 }} />
              <input 
                type="email" 
                placeholder={t('auth.email')} 
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, color: '#fff' }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--cyan)" style={{ position: 'absolute', top: 12, left: 12 }} />
              <input 
                type="password" 
                placeholder={t('auth.password')} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, color: '#fff' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>{t('auth.login')}</button>

            <button type="button" onClick={handleMagicLink} className="btn-secondary" style={{ border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              {t('auth.magic_link')}
            </button>

            <div style={{ margin: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t('auth.or')}</span>
            </div>

            <button type="button" onClick={handleBiometric} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--magenta)', color: 'var(--magenta)' }}>
              <Fingerprint size={18} /> {t('auth.face_id')}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => handleSocial('Google')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <User size={16} /> Google
              </button>
              <button type="button" onClick={() => handleSocial('Apple')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Apple size={16} /> Apple
              </button>
            </div>
          </form>
        )}

        {step === 'totp' && (
          <form onSubmit={handleTotpVerify} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
            <ShieldCheck size={48} color="var(--cyan)" />
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('auth.two_factor')}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('auth.enter_code')}</p>
            </div>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              style={{ width: '100%', padding: '1rem', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--cyan)', borderRadius: 8, color: '#fff' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>{t('auth.verify')}</button>
          </form>
        )}

        {step === 'magic' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0,240,255,0.1)', padding: '1.5rem', borderRadius: '50%' }}>
              <Mail size={32} color="var(--cyan)" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('auth.check_email')}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('auth.sent_magic')} <strong>{email}</strong>.</p>
            </div>
            <div className="alert-success" style={{ marginTop: '1rem' }}>
              <ArrowRight size={16} /> Mocking magic link verification... logging in.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default Auth;
