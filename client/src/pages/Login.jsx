import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/ui/Logo/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, getRoleHomePath } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate(getRoleHomePath(result.role));
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-600">
      
      {/* The Canvas: Light Ambient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 ml-40 mt-20"></div>
        <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-cyan-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 -ml-40 -mt-20"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      </div>

      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white/60 hover:bg-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-slate-200">
        <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* Header/Logo */}
      <div className="relative z-10 mb-10 flex flex-col items-center">
        <Link to="/" className="group flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white shadow-lg shadow-blue-900/5 group-hover:shadow-xl group-hover:shadow-blue-900/10 transition-all duration-500">
            <Logo size={32} className="text-blue-600" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">Global Pharma</span>
        </Link>
      </div>

      {/* The Core: Glass Card */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white/60 backdrop-blur-3xl border border-white p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-blue-900/10">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Access your intelligent supply chain.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-sm flex items-center gap-2 animate-fade-in-up">
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            {/* Custom Minimalist Light Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1 uppercase tracking-wide">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full bg-white/80 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                  <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/80 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-slate-900/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          New to Global Pharma?{' '}
          <Link to="/register" className="text-slate-900 hover:text-blue-600 font-bold transition-colors ml-1">
            Create an account
          </Link>
        </p>
      </div>
      
    </div>
  );
};
