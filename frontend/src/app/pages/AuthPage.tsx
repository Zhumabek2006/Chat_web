import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, User, Lock, Eye, EyeOff, Camera, X, Upload } from 'lucide-react';
import { userService } from '../services/api';
import { toast } from 'sonner';
import axios from 'axios';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

const API_BASE = 'http://localhost:8000';

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Avatar upload state (signup only)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3 MB.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }, []);

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
        // 1. Create account
        let user = await userService.createUser({ username: username.trim(), password });

        // 2. Upload avatar if one was chosen
        if (avatarFile && user.id) {
          try {
            const form = new FormData();
            form.append('file', avatarFile);
            const res = await axios.patch(`${API_BASE}/users/${user.id}/avatar`, form, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            user = res.data;
          } catch {
            // Non-fatal — avatar upload failed, still log in
            toast.error('Avatar upload failed. You can set it later.');
          }
        }

        onLogin(user);
        toast.success('Account created — welcome!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset avatar when switching tabs
  const switchTab = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4"
      style={{ background: 'var(--sp-base)' }}
    >
      {/* Radial accent backdrop */}
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
        className="relative w-full max-w-[440px]"
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
                  onClick={() => switchTab(idx === 0)}
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
              {/* ── Avatar Upload (signup only) ── */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-3 overflow-hidden"
                >
                  <p
                    className="text-xs font-bold uppercase self-start"
                    style={{
                      color: 'var(--sp-text-muted)',
                      letterSpacing: '1.5px',
                      fontFamily: 'var(--sp-font)',
                    }}
                  >
                    Profile Picture
                    <span
                      className="ml-2 normal-case font-normal"
                      style={{ color: 'var(--sp-text-dim)', letterSpacing: 0 }}
                    >
                      (optional)
                    </span>
                  </p>

                  {/* Drop zone */}
                  <input
                    ref={fileInputRef}
                    id="avatar-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) pickFile(f);
                    }}
                  />

                  <motion.div
                    id="avatar-drop-zone"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload profile picture"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    className="relative w-28 h-28 rounded-full flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0"
                    animate={{
                      borderColor: isDragging
                        ? 'var(--sp-green)'
                        : avatarPreview
                        ? 'var(--sp-green)'
                        : 'var(--sp-border)',
                      scale: isDragging ? 1.04 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      border: '2px dashed var(--sp-border)',
                      background: 'var(--sp-elevated)',
                    }}
                  >
                    {avatarPreview ? (
                      <>
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(0,0,0,0.55)' }}
                        >
                          <Camera className="w-6 h-6" style={{ color: '#fff' }} />
                        </div>
                        {/* Remove badge */}
                        <button
                          type="button"
                          id="avatar-remove-btn"
                          onClick={clearAvatar}
                          className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10"
                          style={{ background: 'var(--sp-error)' }}
                        >
                          <X className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center px-2">
                        <Upload
                          className="w-7 h-7"
                          style={{
                            color: isDragging ? 'var(--sp-green)' : 'var(--sp-text-dim)',
                          }}
                        />
                        <span
                          className="text-[10px] leading-tight"
                          style={{ color: 'var(--sp-text-dim)', fontFamily: 'var(--sp-font)' }}
                        >
                          {isDragging ? 'Drop it!' : 'Click or drag'}
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* File name chip */}
                  <AnimatePresence>
                    {avatarFile && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs truncate max-w-[200px]"
                        style={{ color: 'var(--sp-green)', fontFamily: 'var(--sp-font)' }}
                      >
                        {avatarFile.name}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Divider */}
                  <div className="w-full" style={{ borderTop: '1px solid #282828' }} />
                </motion.div>
              )}

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
              onClick={() => switchTab(!isLogin)}
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
