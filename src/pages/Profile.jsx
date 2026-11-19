import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useWatchlist } from '../hooks/useWatchlist';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

const StatCard = ({ label, value, icon }) => (
  <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-onyx-border text-center" style={{ background: 'var(--onyx-glass)' }}>
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-2xl font-black mb-1" style={{ color: 'var(--onyx-text)' }}>{value}</div>
    <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--onyx-text-dim)' }}>{label}</div>
  </div>
);

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { items } = useWatchlist();
  const { includeAdult, toggleAdult } = useSettings();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [focused, setFocused] = useState(false);

  // OTP Reset states
  const [resetStep, setResetStep] = useState(0); // 0: inactive, 1: enter OTP, 2: enter new password
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpNotification, setOtpNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const otpInputs = useRef([]);

  // Live Stats Calculation
  const watchlistCount = items?.length || 0;
  const watchedCount = JSON.parse(localStorage.getItem('onyx_continue_watching') || '[]').length;
  const legacyPoints = (watchedCount * 15) + (watchlistCount * 5);
  const isPasswordProvider = currentUser?.providerData?.[0]?.providerId === 'password' || 
                            !currentUser?.providerData?.[0]?.providerId;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateName = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setIsEditingName(false);
      setMessage({ type: 'success', text: 'Name updated successfully.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Update failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setLoading(true);
    setOtpError('');
    setMessage({ type: '', text: '' });
    try {
      if (currentUser?.email) {
        await sendPasswordResetEmail(auth, currentUser.email);
        setMessage({ type: 'success', text: 'Secure password reset link has been dispatched to your email. Check your inbox.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 6000);
      } else {
        throw new Error('No verified email found for this session.');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Email transmission failed: ' + err.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleStartReset = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setEnteredOtp(Array(6).fill(''));
    setOtpError('');
    setNewPassword('');
    setConfirmPassword('');
    setResetStep(1);
    setOtpNotification(`A secure OTP credential has been generated: ${otp}`);
    setShowNotification(true);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.join('') === generatedOtp) {
      setResetStep(2);
      setOtpError('');
      setShowNotification(false);
    } else {
      setOtpError('Decryption code mismatch. Sync failed.');
    }
  };

  const handleConfirmReset = async () => {
    if (newPassword !== confirmPassword) {
      setOtpError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setOtpError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setResetStep(0);
        setMessage({ type: 'success', text: 'Password reset completed successfully.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        throw new Error('No user is currently authenticated.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setOtpError('Security timeout. Please sign out and sign back in to reset password.');
      } else {
        setOtpError('Update failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const otpArray = [...enteredOtp];
    otpArray[index] = cleanValue.slice(-1);
    setEnteredOtp(otpArray);

    // Auto-focus next input
    if (otpArray[index] !== '' && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const otpArray = [...enteredOtp];
      if (otpArray[index] === '') {
        // If current is empty, focus previous and clear it
        if (index > 0) {
          otpInputs.current[index - 1]?.focus();
          otpArray[index - 1] = '';
          setEnteredOtp(otpArray);
        }
      } else {
        // Just clear current
        otpArray[index] = '';
        setEnteredOtp(otpArray);
      }
    }
  };

  const avatarSeed = currentUser?.email || 'onyx';
  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="min-h-screen pt-28 pb-20 px-6" style={{ background: 'var(--onyx-bg)' }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* --- SYSTEM OTP NOTIFICATION --- */}
        {showNotification && (
          <div className="rounded-3xl border p-5 flex items-center justify-between gap-6 animate-entry-float text-xs font-black uppercase tracking-wider relative overflow-hidden"
               style={{ 
                 background: 'var(--onyx-glass)', 
                 borderColor: 'var(--onyx-purple)', 
                 boxShadow: '0 0 20px var(--onyx-purple-glow)' 
               }}>
            {/* Pulsing decoration bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--onyx-purple)] animate-pulse" />
            <div className="flex items-center gap-4 pl-2">
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-[10px] text-[var(--onyx-purple)] font-black uppercase tracking-[0.3em] mb-1">Secure Core Dispatch</p>
                <p style={{ color: 'var(--onyx-text)' }} className="font-mono text-sm leading-relaxed">{otpNotification}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-onyx-border hover:border-onyx-text/30 hover:bg-black/10 dark:hover:bg-white/5 cursor-pointer text-white/50 hover:text-white"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* --- HERO CARD --- */}
        <div className="relative rounded-[2.5rem] overflow-hidden border p-8 md:p-12 reveal" style={{ background: 'var(--onyx-glass)', borderColor: 'var(--onyx-border)', backdropFilter: 'blur(40px)' }}>
          {/* Purple ambient */}
          <div className="absolute top-0 right-0 w-[40%] h-[200%] opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--onyx-purple), transparent 70%)', filter: 'blur(60px)' }}></div>

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 shadow-2xl" style={{ borderColor: 'rgba(139,92,246,0.3)', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                Verified
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: 'var(--onyx-purple)' }}>Identity Dossier</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2" style={{ color: 'var(--onyx-text)' }}>
                {currentUser?.displayName || 'Anonymous User'}
              </h1>
              <p className="text-sm font-medium mb-6" style={{ color: 'var(--onyx-text-dim)' }}>
                {currentUser?.email}
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border" style={{ borderColor: 'var(--onyx-purple-glow)', color: 'var(--onyx-purple)', background: 'var(--onyx-glass)' }}>
                  Class: Absolute
                </span>
                <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border" style={{ borderColor: 'var(--onyx-border)', color: 'var(--onyx-text-dim)', background: 'var(--onyx-glass)' }}>
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 reveal">
          <StatCard label="Streaming Activity" value={watchedCount} icon="🎬" />
          <StatCard label="Queue Size" value={watchlistCount} icon="📌" />
          <StatCard label="Legacy Points" value={legacyPoints} icon="✍️" />
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 reveal">

          {/* Primary Attributes */}
          <div className="rounded-[2rem] border p-8 space-y-6" style={{ background: 'var(--onyx-glass)', borderColor: 'var(--onyx-border)' }}>
            {resetStep === 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--onyx-text-dim)' }}>Account Details</h2>
                  <button
                    onClick={() => { setIsEditingName(!isEditingName); setMessage({ type: '', text: '' }); }}
                    className="text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                    style={{ color: 'var(--onyx-purple)' }}
                  >
                    {isEditingName ? 'Cancel' : 'Edit Name'}
                  </button>
                </div>

                {message.text && (
                  <div className="rounded-2xl px-4 py-3 text-[10px] font-bold uppercase tracking-wider animate-entry-float" style={{
                    background: message.type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)',
                    borderLeft: `3px solid ${message.type === 'success' ? '#4ade80' : '#ef4444'}`,
                    color: message.type === 'success' ? '#4ade80' : '#ef4444'
                  }}>
                    {message.text}
                  </div>
                )}

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--onyx-text-dim)' }}>Display Name</label>
                  {isEditingName ? (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="flex-1 block rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all"
                        style={{
                          background: 'var(--onyx-input-bg)',
                          color: 'var(--onyx-text)',
                          borderColor: focused ? 'var(--onyx-purple)' : 'var(--onyx-border)',
                        }}
                        placeholder="Your name"
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={loading}
                        className="px-5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50 transition-opacity cursor-pointer"
                        style={{ background: 'var(--onyx-purple)' }}
                      >
                        {loading ? '...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xl font-black tracking-tight" style={{ color: 'var(--onyx-text)' }}>
                      {currentUser?.displayName || <span style={{ color: 'var(--onyx-text-dim)' }}>Not set</span>}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--onyx-text-dim)' }}>Email</label>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-mono font-medium flex-1" style={{ color: 'var(--onyx-text-dim)' }}>
                      {currentUser?.email}
                    </p>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.8)' }}></div>
                  </div>
                </div>

                {/* Provider */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--onyx-text-dim)' }}>Auth Provider</label>
                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--onyx-text-dim)' }}>
                    {currentUser?.providerData?.[0]?.providerId || 'Email / Password'}
                  </p>
                </div>

                {/* Reset Password trigger buttons */}
                {isPasswordProvider && !isEditingName && (
                  <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--onyx-border)' }}>
                    <button
                      onClick={handleSendResetEmail}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-onyx-border hover:border-[var(--onyx-purple)] hover:bg-[var(--onyx-purple-glow)] disabled:opacity-50 cursor-pointer"
                      style={{ color: 'var(--onyx-text)' }}
                    >
                      {loading ? 'Transmitting Link...' : 'Send Reset Link to Email'}
                    </button>
                    <button
                      onClick={handleStartReset}
                      className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-onyx-border hover:border-[var(--onyx-purple)] hover:bg-[var(--onyx-purple-glow)] cursor-pointer text-white/70 hover:text-white"
                      style={{ background: 'rgba(139,92,246,0.05)' }}
                    >
                      Reset Password In-App (OTP Sync)
                    </button>
                  </div>
                )}
              </>
            ) : resetStep === 1 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--onyx-text-dim)' }}>OTP Verification</h2>
                  <button 
                    onClick={() => { setResetStep(0); setShowNotification(false); }} 
                    className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold leading-relaxed text-onyx-text-dim uppercase tracking-wider">
                    Enter the 6-digit synchronization code dispatched to your profile email to authorize password reset:
                  </p>

                  {otpError && (
                    <div className="border rounded-2xl p-4 text-[10px] font-bold text-center uppercase tracking-widest animate-shake text-red-400" 
                         style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
                      {otpError}
                    </div>
                  )}

                  {/* OTP digits input grid */}
                  <div className="flex gap-2 justify-between">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        ref={el => otpInputs.current[idx] = el}
                        type="text"
                        maxLength="1"
                        value={enteredOtp[idx] || ''}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 rounded-xl text-center font-black text-lg outline-none border transition-all"
                        style={{
                          background: 'var(--onyx-input-bg)',
                          color: 'var(--onyx-text)',
                          borderColor: enteredOtp[idx] ? 'var(--onyx-purple)' : 'var(--onyx-border)',
                          boxShadow: enteredOtp[idx] ? '0 0 10px var(--onyx-purple-glow)' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={enteredOtp.some(val => val === '') || loading}
                    className="w-full mt-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.25)' }}
                  >
                    VERIFY CODE
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--onyx-text-dim)' }}>Set New Password</h2>
                  <button 
                    onClick={() => { setResetStep(0); setShowNotification(false); }} 
                    className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  {otpError && (
                    <div className="border rounded-2xl p-4 text-[10px] font-bold text-center uppercase tracking-widest animate-shake text-red-400" 
                         style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
                      {otpError}
                    </div>
                  )}

                  {/* New Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--onyx-text-dim)' }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all"
                      style={{
                        background: 'var(--onyx-input-bg)',
                        color: 'var(--onyx-text)',
                        borderColor: newPassword ? 'var(--onyx-purple)' : 'var(--onyx-border)',
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--onyx-text-dim)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-xl px-4 py-3 text-sm font-medium outline-none border transition-all"
                      style={{
                        background: 'var(--onyx-input-bg)',
                        color: 'var(--onyx-text)',
                        borderColor: confirmPassword ? 'var(--onyx-purple)' : 'var(--onyx-border)',
                      }}
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    onClick={handleConfirmReset}
                    disabled={!newPassword || newPassword !== confirmPassword || loading}
                    className="w-full mt-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 20px 40px rgba(139,92,246,0.25)' }}
                  >
                    {loading ? 'SYNCHRONIZING...' : 'CONFIRM RESET'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings & Danger Zone */}
          <div className="space-y-4">
            {/* Content Filters */}
            <div className="rounded-[2rem] border p-6" style={{ background: 'var(--onyx-glass)', borderColor: 'var(--onyx-border)' }}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: 'var(--onyx-text-dim)' }}>Content Controls</h2>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--onyx-text)' }}>
                    Every Age Content
                  </p>
                  <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: includeAdult ? 'var(--onyx-purple)' : 'var(--onyx-text-dim)' }}>
                    {includeAdult ? 'Mature content unlocked' : 'Family-safe mode active'}
                  </p>
                </div>
                <button
                  onClick={toggleAdult}
                  className="relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer"
                  style={{
                    background: includeAdult ? 'rgba(139,92,246,0.3)' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                    borderColor: includeAdult ? 'rgba(139,92,246,0.5)' : (isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                  }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
                    style={{
                      left: includeAdult ? 'calc(100% - 24px)' : '4px',
                      background: includeAdult ? '#8b5cf6' : (isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
                    }}
                  ></div>
                </button>
              </div>

              <div className="h-px bg-onyx-border mb-6"></div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--onyx-text)' }}>
                    Platform Aesthetic
                  </p>
                  <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--onyx-text-dim)' }}>
                    {isDarkMode ? 'Obsidian theme active' : 'Pearl theme active'}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer"
                  style={{
                    background: isDarkMode ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.08)',
                    borderColor: isDarkMode ? 'rgba(139,92,246,0.5)' : 'rgba(0,0,0,0.1)'
                  }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
                    style={{
                      left: isDarkMode ? 'calc(100% - 24px)' : '4px',
                      background: isDarkMode ? '#8b5cf6' : 'rgba(0,0,0,0.3)'
                    }}
                  ></div>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-[2rem] border p-6 space-y-4" style={{ background: 'var(--onyx-glass)', borderColor: 'var(--onyx-border)' }}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--onyx-text-dim)' }}>Session</h2>

              <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ background: isDarkMode ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.15)' }}>
                <div>
                  <p className="text-sm font-bold text-red-400">Sign Out</p>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(239,68,68,0.5)' }}>End your current session</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
