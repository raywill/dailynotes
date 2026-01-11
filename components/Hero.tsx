import React from 'react';
import { ArrowRight, Github } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] opacity-50 mix-blend-multiply" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] opacity-50 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          v1.0 is now available for macOS
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
          Embrace the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
            Flow of Thoughts
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          Stop organizing. Stop categorizing. Just write. 
          DailyNotes removes the friction between your brain and the page, 
          creating a natural stream of consciousness for your daily life.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com/raywill/dailynotes/releases"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-1"
          >
            Download for macOS
            <ArrowRight size={18} />
          </a>
          <a
            href="https://github.com/raywill/dailynotes"
            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 hover:border-slate-300"
          >
            <Github size={20} />
            View on GitHub
          </a>
        </div>
        
        <div className="mt-12 text-sm text-slate-500">
          Open Source • Local Storage • Plain Text
        </div>
      </div>
    </section>
  );
};

export default Hero;