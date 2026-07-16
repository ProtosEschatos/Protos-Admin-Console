import React from "react";
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Database, 
  Zap, 
  Compass, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { ServerStatus, CoreWebVital } from "../types";

interface StatusWidgetsProps {
  status: ServerStatus | null;
  vitals: Record<string, CoreWebVital>;
  tips: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const StatusWidgets: React.FC<StatusWidgetsProps> = ({
  status,
  vitals,
  tips,
  onRefresh,
  isRefreshing
}) => {
  if (!status) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Draw response time history SVG line
  const points = status.responseHistory || [];
  const maxVal = Math.max(...points, 200);
  const minVal = Math.min(...points, 50);
  const range = maxVal - minVal || 1;

  const svgWidth = 500;
  const svgHeight = 100;
  const padding = 10;

  const chartPoints = points.map((val, idx) => {
    const x = padding + (idx * (svgWidth - padding * 2)) / (points.length - 1);
    const y = svgHeight - padding - ((val - minVal) * (svgHeight - padding * 2)) / range;
    return `${x},${y}`;
  }).join(" ");

  const lastPointX = padding + ((points.length - 1) * (svgWidth - padding * 2)) / (points.length - 1);
  const lastPointY = svgHeight - padding - ((points[points.length - 1] - minVal) * (svgHeight - padding * 2)) / range;

  // Render score colors for web vitals
  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "good": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "needs improvement": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Monitored Domain Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Primary Site</span>
              <h4 className="text-sm font-semibold text-slate-200 mt-0.5 truncate max-w-[160px]" title={status.targetUrl}>
                {status.targetUrl.replace(/^https?:\/\//, "")}
              </h4>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Monitoring
            </span>
            <a 
              href={status.targetUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              Visit <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* SSL Status Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">SSL Certificate</span>
              <h4 className="text-sm font-semibold text-emerald-400 mt-0.5 font-mono">
                {status.sslDaysRemaining} Days Left
              </h4>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 truncate font-mono">
            {status.sslAuthority}
          </p>
        </div>

        {/* Page Uptime Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-lg pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Uptime Avg (30d)</span>
              <h4 className="text-sm font-bold text-teal-400 mt-0.5 font-mono">
                {status.uptimePct}%
              </h4>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">Status: </span>
            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">Operational</span>
          </div>
        </div>

        {/* Live HTTP Ping response */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-lg pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Current Response</span>
              <h4 className="text-sm font-bold text-sky-400 mt-0.5 font-mono">
                {status.currentResponseTime} ms
              </h4>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 font-mono">
            RTT via dev server gateway
          </p>
        </div>

      </div>

      {/* Resource Performance and Line Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Resource Usage Gauges */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-200">Server Backend Resources</h3>
          </div>

          <div className="space-y-4">
            {/* CPU */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" /> CPU Allocation
                </span>
                <span className="text-slate-300 font-semibold">{status.cpu}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${status.cpu}%` }}
                />
              </div>
            </div>

            {/* RAM */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-sky-400" /> RAM Consumption
                </span>
                <span className="text-slate-300 font-semibold">{status.ram}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className="bg-sky-500 h-full transition-all duration-500"
                  style={{ width: `${status.ram}%` }}
                />
              </div>
            </div>

            {/* Disk Space */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Disk Usage (Static SSD)
                </span>
                <span className="text-slate-300 font-semibold">{status.disk}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className="bg-emerald-500 h-full"
                  style={{ width: `${status.disk}%` }}
                />
              </div>
            </div>

            {/* Active Connections */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-teal-400" /> Active API Connections
                </span>
                <span className="text-slate-300 font-semibold">{status.activeConnections} active</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                <div 
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min((status.activeConnections / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                <h3 className="font-semibold text-slate-200">Response Latency (Last 24 Hours)</h3>
              </div>
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="text-xs bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded hover:bg-slate-900 hover:text-slate-200 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Logs
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Real-time response tracking metrics (ms). Spike indicators highlight heavy server task loading.
            </p>
          </div>

          <div className="w-full flex-1 min-h-[120px] flex items-center justify-center">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#1e293b" strokeWidth="1" />

              {/* Area Under Curve */}
              <path
                d={`M ${padding},${svgHeight - padding} ${chartPoints.replace(/[^,\s\d.]/g, "")} L ${lastPointX},${svgHeight - padding} Z`}
                fill="url(#gradient-area)"
                opacity="0.15"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="url(#gradient-stroke)"
                strokeWidth="2"
                points={chartPoints}
              />

              {/* Pulsing Dot on Last Value */}
              <circle
                cx={lastPointX}
                cy={lastPointY}
                r="4"
                className="fill-sky-400 animate-pulse"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-800/40">
            <span>24h ago</span>
            <span>Avg Response: 124ms</span>
            <span>Just Now</span>
          </div>
        </div>

      </div>

      {/* Core Web Vitals */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-200">Google Lighthouse Core Web Vitals</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Passed Check</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {(Object.entries(vitals) as [string, CoreWebVital][]).map(([key, vital]) => (
            <div 
              key={key}
              className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {key}
                </span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${getRatingColor(vital.rating)}`}>
                  {vital.rating}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-slate-100">{vital.value}</span>
                <span className="text-xs text-slate-500 font-mono">{vital.unit}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal truncate" title={vital.label}>
                {vital.label}
              </p>
            </div>
          ))}
        </div>

        {/* Web vital tips list */}
        <div className="border-t border-slate-800/60 pt-4">
          <span className="text-xs font-semibold text-slate-400 font-mono block mb-2">Performance Optimization Guidelines:</span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded border border-slate-800/40">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};
