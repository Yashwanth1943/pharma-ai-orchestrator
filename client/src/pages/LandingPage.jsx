import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button/Button';
import { Logo } from '../components/ui/Logo/Logo';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Logo size={40} />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Global Pharma</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary" className="shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Introducing AI-Powered Orchestration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            The future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              pharmaceutical supply.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed">
            Seamlessly orchestrate the entire product journey from raw materials to patient delivery, powered by intelligent enterprise systems.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="h-14 px-8 text-lg font-medium shadow-xl shadow-blue-200 flex items-center gap-2">
                Create an Account <ArrowRight size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="h-14 px-8 text-lg font-medium border border-gray-200 hover:bg-gray-50">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Architecture</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Built for modern pharmaceutical companies demanding security, speed, and transparency.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Globe size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Global Tracking</h3>
                <p className="text-gray-500 leading-relaxed">End-to-end visibility across your entire supply chain, from production to warehouse dispatch.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Cpu size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Intelligence</h3>
                <p className="text-gray-500 leading-relaxed">Generative AI insights and automated complaint summaries designed to reduce resolution times.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Access</h3>
                <p className="text-gray-500 leading-relaxed">Strict Role-Based Access Control ensures sensitive data remains protected at all times.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-gray-900">Global Pharma Inc.</span>
          </div>
          <p>© 2026 Global Pharma. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
