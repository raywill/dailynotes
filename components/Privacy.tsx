import React from 'react';
import { ShieldCheck, EyeOff, Lock, Code2 } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <section id="privacy" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mb-6">
            <ShieldCheck size={14} />
            Privacy First Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your Thoughts are Yours Alone.
          </h2>
          <p className="text-slate-400 text-lg">
            Zero data collection. Zero cloud uploads. Zero tracking. 
            In an age of surveillance capitalism, DailyNotes is your sanctuary.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="mb-4 text-emerald-400">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Local</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every note stays on your Mac. We never phone home. We don't even have servers to phone home to.
            </p>
          </div>

          <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="mb-4 text-emerald-400">
              <EyeOff size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Telemetry</h3>
            <p className="