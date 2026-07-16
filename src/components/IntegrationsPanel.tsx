import React, { useState, useEffect } from "react";
import { 
  Github, 
  Layers, 
  CloudLightning, 
  AlertOctagon, 
  CreditCard, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Plus, 
  Check, 
  DollarSign, 
  ArrowUpRight, 
  Activity, 
  Zap, 
  Globe, 
  Shield 
} from "lucide-react";

interface IntegrationsPanelProps {
  onRefreshAllLogs: () => void;
}

export const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ onRefreshAllLogs }) => {
  const [subTab, setSubTab] = useState<"git-vercel" | "cloudflare-sentry" | "stripe" | "seo-socials">("git-vercel");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  
  // States for data
  const [github, setGithub] = useState<any>(null);
  const [vercel, setVercel] = useState<any>(null);
  const [cloudflare, setCloudflare] = useState<any>(null);
  const [sentry, setSentry] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [socials, setSocials] = useState<any>(null);

  // Input states
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState("LinkedIn");
  const [stripeSimAmount, setStripeSimAmount] = useState("450.00");
  const [stripeSimClient, setStripeSimClient] = useState("Nova Kreativna Kampanja");

  // Fetch all integration states
  const fetchData = async () => {
    try {
      const [gitRes, vercelRes, cfRes, sentryRes, stripeRes, socialRes] = await Promise.all([
        fetch("/api/integrations/github"),
        fetch("/api/integrations/vercel"),
        fetch("/api/integrations/cloudflare"),
        fetch("/api/integrations/sentry"),
        fetch("/api/integrations/stripe"),
        fetch("/api/integrations/socials")
      ]);

      if (gitRes.ok) setGithub(await gitRes.json());
      if (vercelRes.ok) setVercel(await vercelRes.json());
      if (cfRes.ok) setCloudflare(await cfRes.json());
      if (sentryRes.ok) setSentry(await sentryRes.json());
      if (stripeRes.ok) setStripe(await stripeRes.json());
      if (socialRes.ok) setSocials(await socialRes.json());
    } catch (err) {
      console.error("Error fetching integration metrics:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-poll to see Vercel deployment completion
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Action: GitHub Sync
  const handleGitSync = async () => {
    setLoading(prev => ({ ...prev, gitSync: true }));
    try {
      const res = await fetch("/api/integrations/github/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setGithub(data.repo);
        onRefreshAllLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, gitSync: false }));
    }
  };

  // Action: Vercel Redeploy
  const handleVercelDeploy = async () => {
    setLoading(prev => ({ ...prev, deploy: true }));
    try {
      const res = await fetch("/api/integrations/vercel/deploy", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        // Insert mock deployment to state immediately
        setVercel((prev: any) => ({
          deployments: [data.deployment, ...(prev?.deployments || [])]
        }));
        onRefreshAllLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, deploy: false }));
    }
  };

  // Action: Cloudflare Purge Cache
  const handleCfPurge = async () => {
    setLoading(prev => ({ ...prev, purge: true }));
    try {
      const res = await fetch("/api/integrations/cloudflare/purge", { method: "POST" });
      if (res.ok) {
        onRefreshAllLogs();
        alert("Cloudflare Edge Cache je uspješno očišćen za domenu protosweb.eu!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, purge: false }));
    }
  };

  // Action: Cloudflare DDoS toggle
  const handleCfDdosToggle = async () => {
    setLoading(prev => ({ ...prev, ddos: true }));
    try {
      const res = await fetch("/api/integrations/cloudflare/ddos", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCloudflare(data.status);
        onRefreshAllLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, ddos: false }));
    }
  };

  // Action: Sentry Resolve
  const handleSentryResolve = async (id: string) => {
    try {
      const res = await fetch("/api/integrations/sentry/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setSentry({ issues: data.issues });
        onRefreshAllLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Stripe Webhook simulation
  const handleStripeSim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, stripe: true }));
    try {
      const res = await fetch("/api/integrations/stripe/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: stripeSimAmount })
      });
      if (res.ok) {
        const data = await res.json();
        setStripe(data.updatedData);
        onRefreshAllLogs();
        setStripeSimAmount("450.00");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, stripe: false }));
    }
  };

  // Action: Schedule social post
  const handleSchedulePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setLoading(prev => ({ ...prev, post: true }));
    try {
      const res = await fetch("/api/integrations/socials/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: newPostPlatform, content: newPostContent })
      });
      if (res.ok) {
        const data = await res.json();
        setSocials({ queue: data.queue });
        setNewPostContent("");
        onRefreshAllLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, post: false }));
    }
  };

  // SEO Audit scores mock
  const seoAudits = [
    { name: "Brzina učitavanja (Time to Interactive)", score: 98, rating: "Izvrsno", detail: "0.8s na stolnim računalima, iznimno brzi odaziv rubnih Cloudflare servera." },
    { name: "SSL certifikat (HTTPS)", score: 100, rating: "Sigurno", detail: "Aktivna TLS 1.3 enkripcija s automatskim preusmjeravanjem." },
    { name: "Mobilna prilagođenost (Responsive)", score: 96, rating: "Izvrsno", detail: "Svi elementi prilagođeni su touch-target standardu i malim zaslonima." },
    { name: "Meta-oznake i OpenGraph", score: 92, rating: "Dobro", detail: "Konfiguriran og:image i opis za društvene mreže na protosweb.eu." },
    { name: "Struktura naslova (H1-H4)", score: 100, rating: "Izvrsno", detail: "Savršeno indeksirana hijerarhija naslova za Google tražilicu." }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
        <button
          onClick={() => setSubTab("git-vercel")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all border ${
            subTab === "git-vercel"
              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Github className="w-3.5 h-3.5 text-slate-300" />
            GitHub & Vercel
          </span>
        </button>

        <button
          onClick={() => setSubTab("cloudflare-sentry")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all border ${
            subTab === "cloudflare-sentry"
              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
            Cloudflare & Sentry
          </span>
        </button>

        <button
          onClick={() => setSubTab("stripe")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all border ${
            subTab === "stripe"
              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            Stripe Financije
          </span>
        </button>

        <button
          onClick={() => setSubTab("seo-socials")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition-all border ${
            subTab === "seo-socials"
              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
              : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            Socijalni Planer & SEO
          </span>
        </button>
      </div>

      {/* SUBTAB 1: GITHUB & VERCEL */}
      {subTab === "git-vercel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GitHub Section */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">GitHub repozitorij</h3>
                  <p className="text-xs text-slate-500 font-mono">protosweb / protosweb-agency-website</p>
                </div>
              </div>
              <button
                onClick={handleGitSync}
                disabled={loading.gitSync}
                className="p-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading.gitSync ? "animate-spin text-indigo-400" : ""}`} />
                Usklađivanje
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Status veze:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Povezano (Webhook aktivan)
                </span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Zadnje usklađivanje:</span>
                <span className="text-slate-300">{github?.lastSyncedAt || "Nije usklađeno"}</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Aktivna grana:</span>
                <span className="text-indigo-400 font-bold">{github?.branch || "main"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">Zadnje izmjene (Commits)</h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {github?.commits?.map((commit: any) => (
                  <div key={commit.sha} className="bg-slate-900/60 border border-slate-900 p-2.5 rounded-lg flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-200 font-medium leading-normal">{commit.message}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span className="text-slate-400">{commit.author}</span>
                        <span>•</span>
                        <span>{commit.date}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-400 font-mono px-1.5 py-0.5 rounded">
                      {commit.sha}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vercel Section */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Vercel hostanje & gradnja</h3>
                  <p className="text-xs text-slate-500 font-mono">protosweb-agency-production</p>
                </div>
              </div>
              <button
                onClick={handleVercelDeploy}
                disabled={loading.deploy}
                className="p-1.5 px-3 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                Pokreni izgradnju
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Projekt:</span>
                <span className="text-slate-200">protosweb-agency</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Glavni domenski usmjerivač:</span>
                <a href="https://protosweb.eu" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  protosweb.eu
                </a>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Okruženje:</span>
                <span className="text-slate-400 uppercase tracking-wide text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-bold text-indigo-400">
                  Production (Live)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">Zadnje isporuke (Deployments)</h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {vercel?.deployments?.map((dep: any) => (
                  <div key={dep.id} className="bg-slate-900/60 border border-slate-900 p-2.5 rounded-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-mono truncate max-w-[200px]" title={dep.url}>
                        {dep.url}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        <span>Commit: {dep.commit}</span>
                        <span>•</span>
                        <span>{dep.createdAt}</span>
                      </div>
                    </div>
                    
                    <div>
                      {dep.status === "READY" ? (
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                          Spremno
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          Gradi se...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CLOUDFLARE & SENTRY */}
      {subTab === "cloudflare-sentry" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cloudflare CDN Control */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-500">
                  <CloudLightning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">Cloudflare integracija</h3>
                  <p className="text-xs text-slate-500 font-mono">DDoS i CDN za protosweb.eu</p>
                </div>
              </div>
              <button
                onClick={handleCfPurge}
                disabled={loading.purge}
                className="p-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-slate-100 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                {loading.purge ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Prazni Cache"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Cache Hit Rate</span>
                <span className="text-xl font-bold text-slate-200 font-mono">{cloudflare?.cachedPercentage}%</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Ušteđen promet</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{cloudflare?.savedBandwidthGb} GB</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">SSL Razina:</span>
                <span className="text-slate-200 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  {cloudflare?.sslLevel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">DNSSEC zaštita:</span>
                <span className="text-emerald-400 font-bold">{cloudflare?.dnsSec}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">DDoS napad obrana:</span>
                  <span className="text-[10px] text-slate-500">
                    {cloudflare?.ddosUnderAttack ? "Aktivan Under Attack izazov" : "Standardna zaštita u pozadini"}
                  </span>
                </div>
                <button
                  onClick={handleCfDdosToggle}
                  disabled={loading.ddos}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    cloudflare?.ddosUnderAttack
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {cloudflare?.ddosUnderAttack ? "Isključi 'Under Attack'" : "Uključi 'Under Attack'"}
                </button>
              </div>
            </div>
          </div>

          {/* Sentry Crash Logging Section */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-rose-500">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Sentry praćenje iznimaka</h3>
                <p className="text-xs text-slate-500 font-mono">Greške i upozorenja aplikacije protosweb.eu</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">Aktivni problemi (Sentry Issues)</h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {sentry?.issues?.map((issue: any) => (
                  <div key={issue.id} className="bg-slate-900/60 border border-slate-900 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-rose-400 font-mono font-semibold break-all leading-relaxed">
                          {issue.errorName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Datoteka: <span className="text-slate-400">{issue.file}</span>
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-2 py-0.5 rounded-full border border-slate-800 whitespace-nowrap">
                        {issue.occurrences} puta
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-900">
                      <span className="text-[10px] font-mono text-slate-500">Zadnji put: {issue.lastSeen}</span>
                      {issue.status === "resolved" ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                          <Check className="w-3 h-3" /> Riješeno
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSentryResolve(issue.id)}
                          className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                        >
                          Označi kao riješeno
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: STRIPE FINANCIJE */}
      {subTab === "stripe" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Stripe MRR</span>
                <span className="text-2xl font-bold text-slate-100 font-mono mt-1 block">
                  {stripe?.mrr?.toLocaleString("hr-HR", { style: "currency", currency: stripe?.currency || "EUR" })}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5 mt-2">
                  +12.4% ovaj mjesec
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Trenutni saldo</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                  {stripe?.balance?.toLocaleString("hr-HR", { style: "currency", currency: stripe?.currency || "EUR" })}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-2">
                  Dostupno za isplatu
                </span>
              </div>

              <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 relative overflow-hidden">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Aktivne pretplate</span>
                <span className="text-2xl font-bold text-indigo-400 font-mono mt-1 block">
                  {stripe?.activeSubscriptions} klijenata
                </span>
                <span className="text-[10px] text-slate-500 font-mono block mt-2">
                  Ugovori o podršci i retainer
                </span>
              </div>
            </div>

            {/* Recent payments */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-slate-200 text-sm">Zadnje Stripe naplate (Live Feed)</h3>
              <div className="space-y-2">
                {stripe?.charges?.map((charge: any) => (
                  <div key={charge.id} className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-200 font-medium">{charge.customer}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        <span>{charge.id}</span>
                        <span>•</span>
                        <span>{charge.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-200 font-mono block">
                        +{charge.amount.toLocaleString("hr-HR", { style: "currency", currency: stripe?.currency || "EUR" })}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/15">
                        Uspješno
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Webhook Test Simulator */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Simulacija Webhook naplate</h3>
              <p className="text-xs text-slate-400 font-mono">Testirajte kako nadzorna ploča reagira na novu Stripe uplatu</p>
            </div>

            <form onSubmit={handleStripeSim} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">Naziv klijenta</label>
                <input
                  type="text"
                  value={stripeSimClient}
                  onChange={(e) => setStripeSimClient(e.target.value)}
                  placeholder="npr. Studio Nord d.o.o."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-500 uppercase block mb-1">Iznos (EUR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={stripeSimAmount}
                    onChange={(e) => setStripeSimAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 pl-7 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.stripe}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {loading.stripe ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Odašilji Stripe Webhook
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-900/30 border border-slate-900 rounded-lg p-3 text-[11px] text-slate-400 leading-relaxed font-mono">
              <span className="text-indigo-400 font-bold block mb-1">Napomena:</span>
              Ovaj simulator šalje realan JSON payload <span className="text-slate-300">payment_intent.succeeded</span> na lokalni Express server koji ga dešifrira i ažurira ukupno stanje.
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: SEO & SOC_NETWORKS */}
      {subTab === "seo-socials" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEO Auditor */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">SEO & PageSpeed Revizija</h3>
                <p className="text-xs text-slate-500 font-mono">Optimizacijski indeks za protosweb.eu</p>
              </div>
            </div>

            <div className="space-y-3">
              {seoAudits.map((audit, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-900 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-200">{audit.name}</span>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded font-mono">
                      {audit.score}/100 ({audit.rating})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                    {audit.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Planer */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-pink-500">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Planer i optimizacija objava</h3>
                <p className="text-xs text-slate-500 font-mono">Upravljanje sadržajem za društvene kanale</p>
              </div>
            </div>

            {/* Schedule form */}
            <form onSubmit={handleSchedulePost} className="space-y-3">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <select
                    value={newPostPlatform}
                    onChange={(e) => setNewPostPlatform(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter / X">Twitter / X</option>
                    <option value="Behance">Behance</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <input
                    type="text"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Podijelite novost ili studiju slučaja..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/40"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading.post}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-800 rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Zakakaži Objavu
              </button>
            </form>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold font-mono text-slate-400 uppercase tracking-wider">Planirano u redu (Buffer Queue)</h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {socials?.queue?.map((post: any) => (
                  <div key={post.id} className="bg-slate-900/60 border border-slate-900 p-2.5 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {post.platform}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {post.scheduledFor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
