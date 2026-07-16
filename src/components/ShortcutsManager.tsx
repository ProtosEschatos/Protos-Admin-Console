import React, { useState } from "react";
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Briefcase, 
  DollarSign, 
  Globe, 
  Shield, 
  Layers, 
  ExternalLink, 
  Edit3, 
  Check, 
  X,
  Plus,
  Link2
} from "lucide-react";
import { Shortcut } from "../types";

// Helper function to render correct Lucide icon
export const getIconComponent = (iconName: string) => {
  const props = { className: "w-5 h-5" };
  switch (iconName) {
    case "Linkedin": return <Linkedin {...props} />;
    case "Twitter": return <Twitter {...props} />;
    case "Github": return <Github {...props} />;
    case "Briefcase": return <Briefcase {...props} />;
    case "DollarSign": return <DollarSign {...props} />;
    case "Globe": return <Globe {...props} />;
    case "Shield": return <Shield {...props} />;
    case "Layers": return <Layers {...props} />;
    default: return <Link2 {...props} />;
  }
};

interface ShortcutsManagerProps {
  shortcuts: Shortcut[];
  onUpdateShortcut: (id: string, url: string, name: string) => void;
}

export const ShortcutsManager: React.FC<ShortcutsManagerProps> = ({ shortcuts, onUpdateShortcut }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editName, setEditName] = useState("");

  const startEditing = (shortcut: Shortcut) => {
    setEditingId(shortcut.id);
    setEditUrl(shortcut.url);
    setEditName(shortcut.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSave = (id: string) => {
    onUpdateShortcut(id, editUrl, editName);
    setEditingId(null);
  };

  const categories = [
    { key: "freelance", label: "Freelance Platforms & Contracts" },
    { key: "social", label: "Professional & Social Networks" }
  ];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catShortcuts = shortcuts.filter(s => s.category === cat.key);
        return (
          <div key={cat.key} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              {cat.label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catShortcuts.map((shortcut) => {
                const isEditing = editingId === shortcut.id;
                
                return (
                  <div 
                    key={shortcut.id}
                    id={`shortcut-${shortcut.id}`}
                    className="relative group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-sm overflow-hidden"
                  >
                    {/* Corner accent glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 group-hover:text-indigo-300 group-hover:border-indigo-500/30 transition-all">
                          {getIconComponent(shortcut.icon)}
                        </div>
                        
                        {!isEditing ? (
                          <div>
                            <h4 className="font-medium text-slate-200 group-hover:text-indigo-200 transition-colors">
                              {shortcut.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-mono truncate max-w-[150px]">
                              {shortcut.url.replace(/^https?:\/\//, "")}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                              placeholder="Name"
                            />
                            <input 
                              type="text" 
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                              placeholder="https://..."
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEditing(shortcut)}
                              className="p-1.5 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-950/60 transition-all"
                              title="Edit link"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={shortcut.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded text-slate-500 hover:text-emerald-400 hover:bg-slate-950/60 transition-all"
                              title="Open platform"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSave(shortcut.id)}
                              className="p-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              title="Save"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 hover:bg-rose-500/20 transition-all"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    {shortcut.badge && (
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] text-slate-500 font-mono">Status:</span>
                        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full ${
                          shortcut.badgeType === "alert" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          shortcut.badgeType === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          shortcut.badgeType === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {shortcut.badge}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
