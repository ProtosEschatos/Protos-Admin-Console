import React, { useState } from "react";
import { 
  ShieldAlert, 
  Terminal, 
  Settings, 
  AlertTriangle, 
  Info, 
  Flame, 
  ShieldCheck, 
  Globe, 
  Filter, 
  RefreshCw 
} from "lucide-react";
import { SecurityLog } from "../types";

interface SecurityTerminalProps {
  logs: SecurityLog[];
  firewallSensitivity: string;
  apiRateLimit: string;
  totalBlockedToday: number;
  onChangeFirewall: (level: "Low" | "Medium" | "High") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SecurityTerminal: React.FC<SecurityTerminalProps> = ({
  logs,
  firewallSensitivity,
  apiRateLimit,
  totalBlockedToday,
  onChangeFirewall,
  onRefresh,
  isRefreshing
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [corsDomain, setCorsDomain] = useState("");
  const [corsCheckResult, setCorsCheckResult] = useState<{ allowed: boolean; reason: string } | null>(null);

  const filteredLogs = logs.filter(log => {
    if (filterSeverity === "all") return true;
    return log.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">CRITICAL</span>;
      case "medium":
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">WARNING</span>;
      case "low":
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">LOW</span>;
      default:
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">INFO</span>;
    }
  };

  const checkCorsDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!corsDomain) return;

    // Standard logic to test origin check
    const allowedOrigins = [
      "https://example.com", 
      "https://upwork.com", 
      "https://fiverr.com", 
      "https://zoho.eu", 
      "https://zoho.com",
      "https://ais-dev"
    ];

    const parsedDomain = corsDomain.trim().toLowerCase().replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(origin => parsedDomain.startsWith(origin));

    if (isAllowed) {
      setCorsCheckResult({
        allowed: true,
        reason: "Origin fully complies with REST CORS policy rules. Access token permitted."
      });
    } else {
      setCorsCheckResult({
        allowed: false,
        reason: "Access denied: Unauthorized header source. Preflight checks will reject requests."
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Configuration Column */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* Firewall Policies */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-slate-200">WAF Web Application Firewall</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">Current Sensitivity:</span>
                <span className={`font-bold ${
                  firewallSensitivity === "High" ? "text-rose-400" :
                  firewallSensitivity === "Medium" ? "text-amber-400" :
                  "text-emerald-400"
                }`}>
                  {firewallSensitivity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => onChangeFirewall(level)}
                    className={`text-xs py-1.5 font-mono rounded border transition-all ${
                      firewallSensitivity === level
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">API Gateway Limit:</span>
                <span className="text-indigo-400 font-bold">{apiRateLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intrusions Prevented:</span>
                <span className="text-rose-400 font-bold">{totalBlockedToday} today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SSL Handshake Checks:</span>
                <span className="text-emerald-400 font-bold">100% Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* CORS Checker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-200">CORS Origin Validator</h3>
          </div>

          <form onSubmit={checkCorsDomain} className="space-y-3">
            <p className="text-xs text-slate-400">
              Test if an external origin domain matches configured CORS and security header requirements.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://client-domain.com"
                value={corsDomain}
                onChange={(e) => setCorsDomain(e.target.value)}
                className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg font-medium transition-all"
              >
                Validate
              </button>
            </div>

            {corsCheckResult && (
              <div className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                corsCheckResult.allowed 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/5 border-rose-500/20 text-rose-300"
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  {corsCheckResult.allowed ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  {corsCheckResult.allowed ? "ACCESS GRANTED" : "ACCESS BLOCKED"}
                </div>
                <p className="text-[10px] text-slate-400">{corsCheckResult.reason}</p>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Security Incident Logs Terminal */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col h-[400px]">
        
        {/* Terminal Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-400 font-mono text-xs ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              security_event_monitor.sh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <Filter className="w-3 h-3 text-slate-500" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-transparent text-[10px] text-slate-300 outline-none font-mono font-medium cursor-pointer"
              >
                <option value="all">ALL SEVERITIES</option>
                <option value="high">CRITICAL</option>
                <option value="medium">WARNING</option>
                <option value="low">LOW</option>
                <option value="info">INFO</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all text-slate-400 hover:text-slate-200"
              title="Refresh security feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Terminal logs area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 bg-slate-950/45 scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              No matching security entries found. Systems stable.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={index}
                className="p-3 bg-slate-900/60 rounded border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(log.severity)}
                    <span className="text-slate-200 font-bold">{log.event}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {log.detail}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Terminal status bar */}
        <div className="bg-slate-950 border-t border-slate-850 px-4 py-2 font-mono text-[10px] text-slate-500 flex justify-between">
          <span>SysLog daemon: online</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live listening...
          </span>
        </div>

      </div>

    </div>
  );
};
