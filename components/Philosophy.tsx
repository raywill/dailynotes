import React from 'react';
import { Layers, Zap, Search, Clock } from 'lucide-react';

const Philosophy: React.FC = () => {
  const points = [
    {
      icon: <Layers className="w-6 h-6 text-brand-600" />,
      title: "No Folders, No Decisions",
      description: "Every day starts with a blank page. Yesterday is yesterday. This temporal organization removes decision fatigue."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: "Zero Friction Capture",
      description: "Open. Write. Close. The lowest barrier to entry ensures you actually capture your thoughts instead of organizing them."
    },
    {
      icon: <Search className="w-6 h-6 text-emerald-500" />,
      title: "Search > Structure",
      description: "Your brain remembers context and time. Powerful search and calendar views replace the need for complex folder hierarchies."
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "Embrace Impermanence",
      description: "Notes are a stream. Let old content fade naturally into the archive, keeping your mental workspace clutter-free."
    }
  ];

  return (
    <section id="philosophy" className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              A Stream, Not a Library
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              DailyNotes was born from a simple realization: the friction of organizing notes kills the habit of taking them. We spend more time deciding "where does this go?" than actually capturing thoughts.
            </p>
            <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
              <p className="font-medium text-brand-800 italic">
                "The best note-taking system is the one you actually use."
              </p>
            </div>
          </div>
          
          <div className="grid gap-6">
            {points.map((point, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-white border border-slate-100 shadow-sm rounded-lg flex items-center justify-center">
                  {point.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{point.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;