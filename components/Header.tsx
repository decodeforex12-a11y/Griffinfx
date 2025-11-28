import React, { useState, useEffect } from 'react';
import { Activity, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex gap-8">
          {['Dashboard', 'Add Trade', 'Risk Calculator'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </button>
          ))}
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
        </div>
      )}
    </header>
  );
};

export default Header;
