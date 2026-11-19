import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/common/Logo';

const inputClass = "block w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all duration-300 border focus:border-onyx-purple focus:ring-0";

const AuthInput = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--onyx-text)' }}>{label}</label>
    {children}
  </div>
);

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or expired reset link. Request a new one.');
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await updatePassword(oobCode, password);
      // Success - redirect to login after a brief delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Reset failed. The link may have expired.');
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
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--onyx-bg)' }}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20" style={{ background: 'var(--onyx-purple-glow)', filter: 'blur(120px)' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-10" style={{ background: 'var(--onyx-purple-glow)', filter: 'blur(100px)' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-12 animate-entry-float">
          <Logo size={80} className="mb-4" />
          <h2 className="text-2xl font-black tracking-widest" style={{ color: 'var(--onyx-text)' }}>ONYX</h2>
        </div>

        <div className="relative p-10 md:p-14 rounded-[3rem] overflow-hidden shadow-2xl border" style={{ background: 'var(--onyx-glass)', backdropFilter: 'blur(40px)', borderColor: 'var(--onyx-border)' }}>
          <div className="mb-10">
            <h1 className="text-3xl font-black mb-2 tracking-tighter" style={{ color: 'var(--onyx-text)' }}>New Credentials</h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--onyx-text)' }}>Authority Re-Authentication</p>
          </div>

          {error && (
            <div className="border rounded-2xl p-4 mb-8 text-[10px] font-bold text-center uppercase tracking-widest animate-shake text-red-400" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {!oobCode ? (
            <div className="flex flex-col items-center gap-6 mt-4">
              <Link to="/forgot-password" 
                className="w-full py-4 text-center rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-white opacity-80 hover:opacity-100 transition-all"
                style={{ background: 'var(--onyx-purple)' }}
              >
                REQUEST NEW LINK
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <AuthInput label="New Password">
                <input
                  type="password"
                  required
                  className={inputClass}
                  style={getInputStyle('password')}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </AuthInput>

              <AuthInput label="Verify Password">
                <input
                  type="password"
                  required
                  className={inputClass}
                  style={getInputStyle('confirmEmail')}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmEmail')}
                  onBlur={() => setFocusedField(null)}
                />
              </AuthInput>

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.25)' }}
              >
                {loading ? 'MODIFING...' : 'UPDATE ARCHIVE'}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 hover:text-onyx-purple transition-all duration-300">
              Abort to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
