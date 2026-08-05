import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button/Button';
import { Input } from '../components/ui/Input/Input';
import { Logo } from '../components/ui/Logo/Logo';
import api from '../services/api';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs for Glassmorphism */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-indigo-900/10 rounded-[2rem] p-10 relative z-10">
        
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 flex justify-center">
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-gray-500 mt-2 text-sm text-center">Sign up to manage your pharmaceutical supply chain journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <Input 
              label="Full Name"
              type="text"
              name="name"
              placeholder="e.g. Acme Hospital"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-white/50"
            />
            
            <Input 
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white/50"
            />
            
            <Input 
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-white/50"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold shadow-lg shadow-indigo-600/20 rounded-xl" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};
