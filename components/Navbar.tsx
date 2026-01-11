import React, { useState, useEffect } from 'react';
import { Menu, X, Github, Download } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Features', href: '#features' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Tags', href: '#tags' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <a href="#" className="font-bold text-xl tracking-tight text-slate-900">
              DailyNotes
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <a
                href="https://github.com/raywill/dailynotes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://github.com/raywill/dailynotes/releases"
                className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download size={16} />
                <span>Get Started</span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-600 hover:text-brand-600 py-2 border-b border-slate-50"
            >
              {link.name}
            </a>
          ))}
          <a
            href="https://github.com/raywill/dailynotes/releases"
            className="flex items-center justify-center gap-2 bg-brand-600 text-white w-full py-3 rounded-lg font-medium mt-2"
          >
            <Download size={18} />
            Download for macOS
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;