import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, User, Lock, Eye, EyeOff } from 'lucide-react';
import { userService } from '../services/api';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const user = await userService.login({ username: username.trim(), password });
        onLogin(user);
        toast.success(`Welcome back, ${user.username}!`);
      } else {
        const user = await userService.createUser({ username: username.trim(), password });
        onLogin(user);
        toast.success('Account created — welcome!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'var(--sp-base)' }}
    >
      {/* Subtle radial gradient backdrop */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(30,215,96,0.07) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--sp-green)' }}
            >
              <MessageSquare className="w-8 h-8" style={{ color: '#000' }} />
            </div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--sp-text)', fontFamily: 'var(--sp-font)' }}
            >
              VibeChat
            </h1>
          </motion.div>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{
            background: 'var(--sp-surface)',
            boxShadow: 'var(--sp-shadow-heavy)',
          }}
        >
          {/* Tab switcher */}
          <div
            className="flex mb-8 rounded-full p-1 gap-1"
            style={{ background: 'var(--sp-elevated)' }}
          >
            {(['Sign in', 'Sign up'] as const).map((label, idx) => {
              const active = idx === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  id={`auth-tab-${idx}`}
                  onClick={() => setIsLogin(idx === 0)}
                  className="flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200"
                  style={{
                    background: active ? 'var(--sp-text)' : 'transparent',
                    color: active ? '#000' : 'var(--sp-text-muted)',
                    letterSpacing: '0.5px',
                    fontFamily: 'var(--sp-font)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {/* Username field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="auth-username"
                  className="text-sm font-bold"
                  style={{ color: 'var(--sp-text)', fontFamily: 'var(--sp-font)' }}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--sp-text-muted)' }}
                  />
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                    required
                    autoComplete="username"
                    className="sp-input"
                    style={{ paddingLeft: '44px', paddingRight: '16px', borderRadius: 'var(--sp-r-std)' }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="auth-password"
                  className="text-sm font-bold"
                  style={{ color: 'var(--sp-text)', fontFamily: 'var(--sp-font)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--sp-text-muted)' }}
                  />
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
                    required
                    minLength={6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className="sp-input"
                    style={{ paddingLeft: '44px', paddingRight: '48px', borderRadius: 'var(--sp-r-std)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--sp-text-muted)' }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                id="auth-submit"
                type="submit"
                disabled={loading}
                className="sp-btn sp-btn-green w-full mt-2"
                style={{ padding: '14px 32px', fontSize: '14px' }}
                whileHover={!loading ? { scale: 1.03 } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
              >
                {loading ? (
                  <span className="sp-spinner" />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Switch link */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: 'var(--sp-text-muted)', fontFamily: 'var(--sp-font)' }}
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold underline underline-offset-2 hover:no-underline transition-all"
              style={{ color: 'var(--sp-text)' }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--sp-text-dim)', fontFamily: 'var(--sp-font)' }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
