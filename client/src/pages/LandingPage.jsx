import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Globe, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button/Button';
import { Logo } from '../components/ui/Logo/Logo';
import { useEffect, useState } from 'react';

export const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-6'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center px-6 transition-all duration-300 border ${
            scrolled 
              ? 'h-16 bg-white/70 backdrop-blur-xl border-white/50 shadow-lg shadow-blue-900/5 rounded-2xl' 
              : 'h-16 bg-transparent border-transparent rounded-2xl'
          }`}>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
                <Logo size={24} />
              </div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">Global Pharma</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 rounded-xl px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 lg:pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-blue-700 text-sm font-semibold mb-10 animate-fade-in-up">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Introducing AI-Powered Orchestration
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              pharmaceutical supply.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Seamlessly orchestrate the entire product journey from raw materials to patient delivery, powered by intelligent enterprise systems.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/register" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <button className="relative h-14 px-8 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-300">
                Start Orchestrating <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/login">
              <button className="h-14 px-8 text-lg font-bold text-slate-700 bg-white/80 backdrop-blur-md border border-slate-200 hover:bg-white hover:text-blue-600 hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300 rounded-2xl flex items-center gap-2">
                Sign In to Dashboard
              </button>
            </Link>
          </div>
          
          {/* Dashboard Preview Image Mockup (Abstracted) */}
          <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/60 bg-white/40 backdrop-blur-lg p-2 md:p-4 aspect-video flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10"></div>
              <div className="relative w-full h-full rounded-2xl bg-gray-50/90 border border-white shadow-inner overflow-hidden flex flex-col">
                <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 p-6 flex gap-6">
                  <div className="w-1/4 flex flex-col gap-3">
                    <div className="h-24 rounded-xl bg-blue-50 border border-blue-100 p-4">
                       <div className="w-8 h-8 rounded-lg bg-blue-200 mb-2"></div>
                       <div className="h-2 w-1/2 bg-blue-200 rounded"></div>
                    </div>
                    <div className="h-24 rounded-xl bg-purple-50 border border-purple-100 p-4">
                       <div className="w-8 h-8 rounded-lg bg-purple-200 mb-2"></div>
                       <div className="h-2 w-1/2 bg-purple-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="h-48 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 flex items-end gap-2">
                      <div className="w-1/6 h-1/3 bg-blue-300 rounded-t-md"></div>
                      <div className="w-1/6 h-2/3 bg-blue-400 rounded-t-md"></div>
                      <div className="w-1/6 h-1/2 bg-indigo-300 rounded-t-md"></div>
                      <div className="w-1/6 h-full bg-indigo-500 rounded-t-md"></div>
                      <div className="w-1/6 h-3/4 bg-blue-300 rounded-t-md"></div>
                    </div>
                    <div className="flex-1 rounded-xl bg-white border border-gray-100 p-6">
                      <div className="h-4 w-1/4 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                        <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Features Section */}
        <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Enterprise-Grade Architecture</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Built for modern pharmaceutical companies demanding security, speed, and transparency.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Tracking</h3>
              <p className="text-gray-500 leading-relaxed mb-6">End-to-end visibility across your entire supply chain, from production to warehouse dispatch.</p>
              <Link to="/register" className="inline-flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700">
                Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="group bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-indigo-900/10 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl group-hover:bg-indigo-400/20 transition-colors"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Cpu size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">AI Intelligence</h3>
              <p className="text-gray-500 leading-relaxed mb-6 relative z-10">Generative AI insights and automated complaint summaries designed to reduce resolution times.</p>
              <Link to="/register" className="inline-flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700 relative z-10">
                Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Access</h3>
              <p className="text-gray-500 leading-relaxed mb-6">Strict Role-Based Access Control ensures sensitive data remains protected at all times.</p>
              <Link to="/register" className="inline-flex items-center text-sm font-bold text-purple-600 group-hover:text-purple-700">
                Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-lg border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
              <Logo size={16} />
            </div>
            <span className="font-bold text-gray-900 text-base">Global Pharma</span>
          </div>
          <div className="flex gap-6 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <p>© 2026 Global Pharma. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
