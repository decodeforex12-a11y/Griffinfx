import React, { useState, useEffect } from 'react';
import { Activity, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">TradeFlow</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Confluence & Journal</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {['Dashboard', 'Add Trade', 'Risk Calculator'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </button>
          ))}
          
          {/* User Profile */}
          {user && (
             <div className="relative ml-4">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm hover:border-blue-200 transition-colors"
                  />
                  <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
             </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-lg py-4 px-4 flex flex-col gap-4">
           {['Dashboard', 'Add Trade', 'Risk Calculator'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
              className="text-left text-sm font-medium text-slate-600 hover:text-blue-600 py-2"
            >
              {item}
            </button>
          ))}
          {user && (
            <div className="pt-4 border-t border-slate-100 mt-2">
               <div className="flex items-center gap-3 mb-4">
                   <img src={user.photoUrl} alt="User" className="w-10 h-10 rounded-full" />
                   <div>
                     <p className="text-sm font-bold text-slate-900">{user.name}</p>
                     <p className="text-xs text-slate-500">{user.email}</p>
                   </div>
               </div>
               <button 
                  onClick={onLogout}
                  className="w-full text-center bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold"
                >
                  Sign Out
                </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
