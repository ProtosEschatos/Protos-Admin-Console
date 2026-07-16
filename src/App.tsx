import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Mail, 
  Send, 
  Shield, 
  Cpu, 
  ExternalLink, 
  Settings, 
  Activity, 
  Terminal, 
  Sparkles, 
  Briefcase, 
  RefreshCw,
  Clock,
  Menu,
  ChevronRight,
  Monitor,
  Zap,
  Lock,
  Plus
} from "lucide-react";

import { StatusWidgets } from "./components/StatusWidgets";
import { ZohoInbox } from "./components/ZohoInbox";
import { BrevoResendHub } from "./components/BrevoResendHub";
import { ShortcutsManager } from "./components/ShortcutsManager";
import { SecurityTerminal } from "./components/SecurityTerminal";
import { IntegrationsPanel } from "./components/IntegrationsPanel";
import { ServerStatus, ZohoEmail, SecurityLog, Shortcut, CoreWebVital } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "zoho" | "smtp" | "security" | "shortcuts" | "integracije">("dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Server state
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  
  // Vitals state
  const [vitals, setVitals] = useState<Record<string, CoreWebVital>>({});
  const [tips, setTips] = useState<string[]>([]);

  // Zoho states
  const [zohoFolder, setZohoFolder] = useState<"inbox" | "sent" | "drafts" | "spam">("inbox");
  const [zohoEmails, setZohoEmails] = useState<ZohoEmail[]>([]);
  const [zohoCounters, setZohoCounters] = useState<Record<string, number>>({ inbox: 0, inboxUnread: 0, drafts: 0, sent: 0, spam: 0 });
  const [zohoConnected, setZohoConnected] = useState(false);
  const [zohoHost, setZohoHost] = useState("imap.zoho.eu");
  const [zohoUser, setZohoUser] = useState("Simulated");
  const [zohoSearchQuery, setZohoSearchQuery] = useState("");

  // Brevo & Resend states
  const [brevoStatus, setBrevoStatus] = useState<any>(null);
  const [resendStatus, setResendStatus] = useState<any>(null);

  // Security states
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [firewallSensitivity, setFirewallSensitivity] = useState("Medium");
  const [totalBlockedToday, setTotalBlockedToday] = useState(42);
  const [apiRateLimit, setApiRateLimit] = useState("100req/min");

  // Shortcuts state
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  // Poll server state initially and every 10 seconds
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch server status
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const data = await statusRes.json();
        setServerStatus(data);
      }

      // 2. Fetch Core Web Vitals
      const vitalsRes = await fetch("/api/vitals");
      if (vitalsRes.ok) {
        const data = await vitalsRes.json();
        setVitals(data.vitals);
        setTips(data.tips);
      }

      // 3. Fetch Zoho Mailbox
      await fetchZohoMailbox(zohoFolder, zohoSearchQuery);

      // 4. Fetch Brevo Status
      const brevoRes = await fetch("/api/brevo/status");
      if (brevoRes.ok) {
        const data = await brevoRes.json();
        setBrevoStatus(data);
      }

      // 5. Fetch Resend Status
      const resendRes = await fetch("/api/resend/status");
      if (resendRes.ok) {
        const data = await resendRes.json();
        setResendStatus(data);
      }

      // 6. Fetch Security Logs
      const secRes = await fetch("/api/security-logs");
      if (secRes.ok) {
        const data = await secRes.json();
        setSecurityLogs(data.logs);
        setFirewallSensitivity(data.firewallSensitivity);
        setTotalBlockedToday(data.totalBlockedToday);
        setApiRateLimit(data.apiRateLimit);
      }

      // 7. Fetch Shortcuts
      const shortRes = await fetch("/api/shortcuts");
      if (shortRes.ok) {
        const data = await shortRes.json();
        setShortcuts(data.shortcuts);
      }

    } catch (err) {
      console.error("Error synchronizing developer metrics:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchZohoMailbox = async (folder: string, search: string = "") => {
    try {
      const res = await fetch(`/api/zoho/imap?folder=${folder}&q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setZohoEmails(data.emails);
        setZohoCounters(data.counters);
        setZohoConnected(data.isConnected);
        setZohoHost(data.host);
        setZohoUser(data.user);
      }
    } catch (err) {
      console.error("Error reading Zoho IMAP folder:", err);
    }
  };

  // Run on tab switch or search query update
  useEffect(() => {
    fetchZohoMailbox(zohoFolder, zohoSearchQuery);
  }, [zohoFolder, zohoSearchQuery]);

  useEffect(() => {
    fetchAllData();
    
    // Set current formatted date
    const dateOpts: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      timeZoneName: 'short'
    };
    setCurrentTime(new Date().toLocaleDateString('hr-HR', dateOpts));

    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleDateString('hr-HR', dateOpts));
    }, 1000);

    // Auto refresh status every 8 seconds for real-time vibe
    const pollTimer = setInterval(() => {
      fetchServerStatusQuick();
    }, 8000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(pollTimer);
    };
  }, []);

  const fetchServerStatusQuick = async () => {
    try {
      const statusRes = await fetch("/api/status");
      if (statusRes.ok) {
        const data = await statusRes.json();
        setServerStatus(data);
      }
    } catch (err) {
      console.log("Quick ping failed silently.", err);
    }
  };

  // Zoho Inbox operation dispatch proxy
  const handleZohoAction = async (action: string, id?: string, details?: any) => {
    try {
      const res = await fetch("/api/zoho/imap/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, emailDetails: details })
      });
      if (res.ok) {
        await fetchZohoMailbox(zohoFolder, zohoSearchQuery);
      }
    } catch (err) {
      console.error("Failed Zoho operation action:", err);
    }
  };

  // Brevo transactional email sender proxy
  const handleSendBrevo = async (data: { recipient: string; subject: string; body: string }) => {
    const res = await fetch("/api/brevo/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      // refresh brevo status to get new log
      const statusRes = await fetch("/api/brevo/status");
      if (statusRes.ok) {
        const d = await statusRes.json();
        setBrevoStatus(d);
      }
    }
  };

  // Resend transactional email sender proxy
  const handleSendResend = async (data: { recipient: string; subject: string; html: string }) => {
    const res = await fetch("/api/resend/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      // refresh resend status to get new log
      const statusRes = await fetch("/api/resend/status");
      if (statusRes.ok) {
        const d = await statusRes.json();
        setResendStatus(d);
      }
    }
  };

  // Custom shortcuts update handler
  const handleUpdateShortcut = async (id: string, url: string, name: string) => {
    try {
      const res = await fetch("/api/shortcuts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url, name })
      });
      if (res.ok) {
        const data = await res.json();
        setShortcuts(data.shortcuts);
      }
    } catch (err) {
      console.error("Failed to update shortcut config link:", err);
    }
  };

  // WAF sensitivity adjustment proxy
  const handleChangeFirewallSensitivity = async (level: "Low" | "Medium" | "High") => {
    try {
      const res = await fetch("/api/security/firewall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level })
      });
      if (res.ok) {
        const data = await res.json();
        setFirewallSensitivity(data.level);
        // Refresh security logs to list policy change
        const secRes = await fetch("/api/security-logs");
        if (secRes.ok) {
          const d = await secRes.json();
          setSecurityLogs(d.logs);
        }
      }
    } catch (err) {
      console.error("Failed to change WAF firewall sensitivity:", err);
    }
  };

  return (
    <div id="admin-main-container" className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Professional Navigation Header */}
      <header id="admin-header" className="bg-slate-900/60 backdrop-blur-md border-b border-slate-900 sticky top-0 z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/30 text-indigo-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              Protosweb
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Console v3.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Creative Studio Suite & Website Monitor
            </p>
          </div>
        </div>

        {/* Global time and system metrics indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden xl:flex flex-col items-end border-r border-slate-800 pr-4">
            <span className="text-slate-500 text-[10px] uppercase">Aktivno vrijeme (Lokalno)</span>
            <span className="text-slate-300 font-medium">{currentTime || "Učitavanje..."}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={isRefreshing}
              className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all flex items-center gap-2 text-xs"
              title="Sinhroniziraj sve kanale"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden sm:inline">Sinkroniziraj</span>
            </button>
          </div>
        </div>

      </header>

      {/* Main dashboard content & layout split */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation panel columns */}
        <aside id="dashboard-sidebar" className="lg:w-64 shrink-0 space-y-2">
          
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block px-3 mb-2">
            Nadzorni Moduli
          </span>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
              activeTab === "dashboard"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Activity className="w-4 h-4 text-sky-400" />
            Nadzorna Ploča
          </button>

          <button
            onClick={() => setActiveTab("integracije")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
              activeTab === "integracije"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            Integracije & Optimizacija
          </button>

          <button
            onClick={() => setActiveTab("zoho")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center justify-between border ${
              activeTab === "zoho"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-violet-400" />
              Zoho IMAP Inbox
            </div>
            {zohoCounters.inboxUnread > 0 && (
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full font-mono">
                {zohoCounters.inboxUnread}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("smtp")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
              activeTab === "smtp"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Send className="w-4 h-4 text-emerald-400" />
            Brevo & Resend SMTP
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
              activeTab === "security"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            Sigurnosni vatrozid
          </button>

          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex items-center gap-3 border ${
              activeTab === "shortcuts"
                ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-400 shadow-inner font-semibold"
                : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            Freelance & Prečaci
          </button>

          {/* Core system metrics preview */}
          <div className="bg-slate-900/35 border border-slate-900 rounded-xl p-4 mt-6 space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Sistemska memorija
            </span>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-400" /> Server CPU</span>
                <span className="text-slate-300 font-semibold">{serverStatus?.cpu || 0}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-sky-400" /> RAM</span>
                <span className="text-slate-300 font-semibold">{serverStatus?.ram || 0}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-emerald-400" /> Latency</span>
                <span className="text-slate-300 font-semibold">{serverStatus?.currentResponseTime || 0} ms</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Dynamic Panel Workspace */}
        <main id="dashboard-content" className="flex-1 min-w-0">
          
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 tracking-tight">Korisnički Nadzorni Panel</h2>
                  <p className="text-xs text-slate-400 font-mono">Pratite performanse web lokacije, Core Web Vitals i resursne statistike u realnom vremenu.</p>
                </div>
              </div>

              <StatusWidgets 
                status={serverStatus} 
                vitals={vitals} 
                tips={tips}
                onRefresh={fetchServerStatusQuick}
                isRefreshing={isRefreshing}
              />

              {/* Fast platforms shortcuts view right inside Overview */}
              <div className="border-t border-slate-900 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">Brzi prečaci platformi</h3>
                    <p className="text-[11px] text-slate-500 font-mono">Brzi pristup freelance profilima, ugovorima i društvenim mrežama s ugrađenim statusnim značkama.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("shortcuts")} 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition-all"
                  >
                    Uredi prečace <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ShortcutsManager shortcuts={shortcuts} onUpdateShortcut={handleUpdateShortcut} />
              </div>
            </div>
          )}

          {/* Integracije & Optimizacija Tab */}
          {activeTab === "integracije" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Integracije i Optimizacija Alata</h2>
                <p className="text-xs text-slate-400 font-mono">Povežite GitHub repozitorij, Vercel deployments, Cloudflare CDN i Sentry izvješća s integriranim Stripe platnim sustavom za protosweb.eu.</p>
              </div>

              <IntegrationsPanel onRefreshAllLogs={fetchAllData} />
            </div>
          )}

          {/* Zoho IMAP Tab */}
          {activeTab === "zoho" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Zoho Profesionalni Poštanski Sandučić</h2>
                <p className="text-xs text-slate-400 font-mono">IMAP sinkronizacija pošte, pretraživanje, arhiviranje i slanje odgovora preko Zoho SMTP gateway-a.</p>
              </div>

              <ZohoInbox 
                emails={zohoEmails}
                counters={zohoCounters}
                isConnected={zohoConnected}
                host={zohoHost}
                user={zohoUser}
                currentFolder={zohoFolder}
                onChangeFolder={setZohoFolder}
                onSearch={setZohoSearchQuery}
                onRefresh={fetchAllData}
                isRefreshing={isRefreshing}
                onAction={handleZohoAction}
              />
            </div>
          )}

          {/* SMTP Marketing & Trans Tab */}
          {activeTab === "smtp" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Služba za dostavu pošte: Brevo & Resend</h2>
                <p className="text-xs text-slate-400 font-mono">Dostava marketinške i transakcijske pošte, praćenje kvota, statistike otvaranja i analiza logova.</p>
              </div>

              <BrevoResendHub 
                brevoStatus={brevoStatus}
                resendStatus={resendStatus}
                onSendBrevo={handleSendBrevo}
                onSendResend={handleSendResend}
                onRefresh={fetchAllData}
                isRefreshing={isRefreshing}
              />
            </div>
          )}

          {/* Firewall / Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight font-sans">Vatrozid i Sigurnosni Dnevnik (WAF)</h2>
                <p className="text-xs text-slate-400 font-mono">Praćenje upada u sustav, blokiranje zlonamjernih SQL injekcija i CORS validacija zaglavlja u realnom vremenu.</p>
              </div>

              <SecurityTerminal 
                logs={securityLogs}
                firewallSensitivity={firewallSensitivity}
                apiRateLimit={apiRateLimit}
                totalBlockedToday={totalBlockedToday}
                onChangeFirewall={handleChangeFirewallSensitivity}
                onRefresh={fetchAllData}
                isRefreshing={isRefreshing}
              />
            </div>
          )}

          {/* Config / Link manager Tab */}
          {activeTab === "shortcuts" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Upravitelj Platformskih Profila</h2>
                <p className="text-xs text-slate-400 font-mono">Konfigurirajte i upravljajte izravnim poveznicama do freelance ugovora, ponuda, repozitorija i društvenih profila.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-slate-200">Kako funkcionira upravitelj prečaca?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    Sve navedene poveznice bit će pohranjene u privremenu memoriju poslužitelja. Klikom na olovku možete izmijeniti ciljanu URL adresu. Prečaci s crvenim ili žutim statusnim značkama automatski će istaknuti važne obavijesti (kao što su nepročitane poruke regrutera ili pristigle freelance ponude) izravno na vašoj nadzornoj ploči.
                  </p>
                </div>
              </div>

              <ShortcutsManager shortcuts={shortcuts} onUpdateShortcut={handleUpdateShortcut} />
            </div>
          )}

        </main>

      </div>

      {/* Footer Credentials Info */}
      <footer id="admin-footer" className="bg-slate-950 border-t border-slate-900 py-6 px-8 mt-12 text-center text-[11px] text-slate-500 font-mono">
        <p className="max-w-xl mx-auto leading-relaxed">
          DevPulse Dashboard je u potpunosti opremljen s Express i React tehnološkim stekom.
          Transakcijski SMTP i IMAP proxy poslužitelji osigurani su TLS standardom.
        </p>
      </footer>

    </div>
  );
}
