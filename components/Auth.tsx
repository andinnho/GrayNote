import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Mail, Lock, Eye, EyeOff, Loader, Book, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgMain px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center">
           <div className="p-2 bg-primary/10 rounded-xl mb-3">
              <Book className="w-8 h-8 text-primary" strokeWidth={2.5} />
           </div>
           <h1 className="text-2xl font-bold text-textMain font-serif">GrayNote</h1>
           <p className="text-sm text-textSecondary mt-1">
             {isSignUp ? 'Create your minimalist diary' : 'Welcome back to your thoughts'}
           </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-600 dark:text-green-400 text-center">
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textMain ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-textMain placeholder-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textMain ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-textMain placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-textMain transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 mt-2 text-base shadow-md hover:shadow-lg transform active:scale-[0.98]"
              label={loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
              icon={loading ? <Loader className="animate-spin" /> : undefined}
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-textSecondary">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 font-semibold text-primary hover:text-emerald-600 underline decoration-2 decoration-transparent hover:decoration-current transition-all"
              >
                {isSignUp ? 'Log in' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};