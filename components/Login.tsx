import React, { useState } from 'react';
import { Activity, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    // SIMULATION: In a real app, this would be the Google OAuth callback
    setTimeout(() => {
      const mockUser: User = {
        id: 'google_user_' + Math.floor(Math.random() * 10000),
        name: 'Demo Trader',
        email: 'trader@gmail.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Demo+Trader&background=0D8ABC&color=fff'
      };
      onLogin(mockUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-black/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-sm">
                <Activity className="text-white w-10 h-10" />
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight">TradeFlow</h1>
             <p className="text-blue-100 mt-2 text-sm font-medium">Professional Trading Journal & Analytics</p>
           </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to access your trading journal</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">Why TradeFlow?</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                   <ShieldCheck size={18} />
                 </div>
                 <div>
                   <h3 className="text-sm font-semibold text-slate-800">Secure Cloud Sync</h3>
                   <p className="text-xs text-slate-500">Your trades are saved to your account securely.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                   <TrendingUp size={18} />
                 </div>
                 <div>
                   <h3 className="text-sm font-semibold text-slate-800">Performance Tracking</h3>
                   <p className="text-xs text-slate-500">Automated equity curve and win-rate analysis.</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                   <Users size={18} />
                 </div>
                 <div>
                   <h3 className="text-sm font-semibold text-slate-800">Mentor AI</h3>
                   <p className="text-xs text-slate-500">Get instant AI feedback on your setups.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
