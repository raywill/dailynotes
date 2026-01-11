import React from 'react';
import { FileText, Bot, Cloud, Command, BarChart3, Share2 } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, className = "" }) => (
  <div className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group ${className}`}>
    <div className="mb-6 p-3 bg-slate-50 w-fit rounded-xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Radical Openness
          </h2>
          <p className="text-lg text-slate-600">
            Your notes, your tools, your way. DailyNotes is a hub, not a prison. 
            We embrace the filesystem and plain text.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<FileText size={28} />}
            title="Markdown Native"
            description="Your notes are just .md files. Edit them in Obsidian, VS Code, Typora, or Vim. We just provide the daily structure."
          />
          <FeatureCard 
            icon={<Bot size={28} />}
            title="AI Ready"
            description="Since notes are plain text, they are prompt-ready for tools like Cursor AI to summarize weeks or extract insights."
          />
          <FeatureCard 
            icon={<Cloud size={28} />}
            title="Cloud Agnostic"
            description="Notes live in ~/Documents/DailyNotes. Sync via iCloud, Dropbox, Google Drive, or Git. You control the data transport."
          />
          <FeatureCard 
            icon={<Command size={28} />}
            title="Launcher Friendly"
            description="Integrate with Alfred or Raycast. Search your daily logs instantly without even opening the app window."
          />
          <FeatureCard 
            icon={<BarChart3 size={28} />}
            title="Scriptable"
            description="Write Python or Bash scripts to analyze your productivity, track habits, or generate custom reports from your text files."
          />
          <FeatureCard 
            icon={<Share2 size={28} />}
            title="Ecosystem Compatible"
            description="Works perfectly with Hazel for automation, Keyboard Maestro for workflows, and Shortcuts for quick capture."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;