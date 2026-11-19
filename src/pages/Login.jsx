import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';

const inputClass = "block w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all duration-300 border focus:border-onyx-purple focus:ring-0";


const AuthInput = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--onyx-text)' }}>{label}</label>
    {children}
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Check your email and password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field) => ({
    background: focusedField === field ? 'var(--onyx-glass)' : 'var(--onyx-input-bg)',
    color: 'var(--onyx-text)',
    boxShadow: focusedField === field ? '0 0 0 1px var(--onyx-purple), 0 0 20px var(--onyx-purple-glow)' : 'none',
    borderColor: focusedField === field ? 'var(--onyx-purple)' : 'var(--onyx-border)',
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden" style={{ background: 'var(--onyx-bg)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden" style={{ background: 'var(--onyx-deep)' }}>
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full animate-pulse-slow" style={{ background: 'var(--onyx-purple-glow)', filter: 'blur(120px)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full" style={{ background: 'var(--onyx-purple-glow)', filter: 'blur(100px)', opacity: 0.5 }}></div>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--onyx-text) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

        <div className="relative z-10 flex flex-col items-center animate-entry-float">
          <Logo size={380} className="mb-8" style={{ color: 'var(--onyx-text)' }} />
          <div className="text-center">
            <h2 className="text-5xl font-black tracking-[0.2em] mb-4" style={{ color: 'var(--onyx-text)' }}>ONYX</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12" style={{ background: 'var(--onyx-border)' }}></span>
              <p className="text-xs font-black uppercase tracking-[0.5em]" style={{ color: 'var(--onyx-purple)' }}>Anthology Core</p>
              <span className="h-px w-12" style={{ background: 'var(--onyx-border)' }}></span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 font-mono text-[8px] tracking-tighter leading-relaxed uppercase opacity-15" style={{ color: 'var(--onyx-text)' }}>
          Sys.Auth.Protocol: Absolute_Grade<br />
          Identity_Sync: Active<br />
          Core_Encryption: Layer_9
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 relative" style={{ background: 'var(--onyx-bg)' }}>
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <Logo size={80} className="mb-4" style={{ color: 'var(--onyx-text)' }} />
          <div className="text-2xl font-black tracking-widest" style={{ color: 'var(--onyx-text)' }}>ONYX</div>
        </div>

        <div className="w-full max-w-md">
          <div className="relative p-10 md:p-14 rounded-[3rem] overflow-hidden shadow-2xl border" style={{ background: 'var(--onyx-glass)', backdropFilter: 'blur(40px)', borderColor: 'var(--onyx-border)' }}>
            <div className="absolute -inset-x-full top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent group-hover:inset-x-full transition-all duration-1000"></div>

            <div className="mb-10">
              <h1 className="text-4xl font-black mb-2 tracking-tighter" style={{ color: 'var(--onyx-text)' }}>Enter Onyx.</h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--onyx-text)' }}>High-Refraction Cinematic Access</p>
            </div>

            {error && (
              <div className="border rounded-2xl p-4 mb-8 text-[10px] font-bold text-center uppercase tracking-widest animate-shake text-red-400" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <AuthInput label="Email">
                <input
                  type="email"
                  required
                  className={inputClass}
                  style={getInputStyle('email')}
                  placeholder="name@anthology.core"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </AuthInput>

              <AuthInput label="Password">
                <div className="flex justify-end mb-1">
                  <Link to="/forgot-password" size={14} className="text-[9px] font-bold opacity-30 hover:text-onyx-purple hover:opacity-100 uppercase tracking-wider transition-all duration-300" style={{ color: 'var(--onyx-text)' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={inputClass + ' pr-12'}
                    style={getInputStyle('password')}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity duration-300"
                    style={{ color: 'var(--onyx-text)' }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </AuthInput>

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.25)' }}
              >
                {loading ? 'SYNCING...' : 'INITIALIZE'}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] font-bold opacity-25 uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--onyx-text)' }}>Unregistered Entity?</p>
              <Link to="/signup" className="hover:text-onyx-purple text-xs font-black transition-all duration-300 border-b border-onyx-border pb-1" style={{ color: 'var(--onyx-text)' }}>
                CLAIM IDENTITY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
