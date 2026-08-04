import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { Lock, Mail } from 'lucide-react';
import { Logo } from '../components/ui/Logo/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs for Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-blue-900/10 rounded-[2rem] p-10 relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 flex justify-center">
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          <div className="space-y-5">
            <Input 
              label="Email address"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50"
            />
            
            <div>
              <Input 
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50"
              />
              <div className="flex justify-between items-center mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/50" />
                  Remember me
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg shadow-blue-600/20 rounded-xl" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};
