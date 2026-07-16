import React, { useState } from "react";
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  ChevronRight, 
  RefreshCw, 
  BarChart3, 
  Activity, 
  Check, 
  Clock,
  Layers,
  Sparkles,
  Lock
} from "lucide-react";

interface BrevoResendHubProps {
  brevoStatus: any;
  resendStatus: any;
  onSendBrevo: (data: { recipient: string; subject: string; body: string }) => Promise<void>;
  onSendResend: (data: { recipient: string; subject: string; html: string }) => Promise<void>;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const BrevoResendHub: React.FC<BrevoResendHubProps> = ({
  brevoStatus,
  resendStatus,
  onSendBrevo,
  onSendResend,
  onRefresh,
  isRefreshing
}) => {
  const [activeTab, setActiveTab] = useState<"brevo" | "resend">("brevo");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Sender Forms States
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      if (activeTab === "brevo") {
        await onSendBrevo({ recipient: to, subject, body });
        setSuccessMsg(
          brevoStatus.isConfigured 
            ? "Email successfully queued & dispatched via live Brevo SMTP client!" 
            : "Email sending simulated successfully! (Provide BREVO_API_KEY in settings to send live emails)."
        );
      } else {
        await onSendResend({ recipient: to, subject, html: `<div style='font-family: sans-serif; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;'><h2 style='color:#6366f1; margin-top:0;'>Resend Transactional Notification</h2><p style='color:#334155;'>${body}</p><hr style='border:0; border-top:1px solid #f1f5f9; margin: 20px 0;'/><p style='font-size:11px; color:#94a3b8;'>Delivered via Custom Admin Dashboard</p></div>` });
        setSuccessMsg(
          resendStatus.isConfigured 
            ? "Email successfully dispatched via live Resend REST proxy!" 
            : "Email sending simulated successfully! (Provide RESEND_API_KEY in settings to send live emails)."
        );
      }
      setTo("");
      setSubject("");
      setBody("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentConfigured = activeTab === "brevo" ? brevoStatus?.isConfigured : resendStatus?.isConfigured;

  return (
    <div className="space-y-6">
      
      {/* Platform toggle tabs */}
      <div className="flex border-b border-slate-800 pb-px">
        <button
          onClick={() => {
            setActiveTab("brevo");
            setSuccessMsg("");
          }}
          className={`px-5 py-3 text-xs font-mono font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
            activeTab === "brevo" 
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-900/10" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          Brevo Marketing SMTP Hub
        </button>
        <button
          onClick={() => {
            setActiveTab("resend");
            setSuccessMsg("");
          }}
          className={`px-5 py-3 text-xs font-mono font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
            activeTab === "resend" 
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-900/10" 
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          Resend Transactional API
        </button>
      </div>

      {/* Stats and delivery metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Statistics & config details card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase">SMTP Configuration</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                currentConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {currentConfigured ? "ACTIVE KEY" : "SIMULATOR MODE"}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-200">
              {activeTab === "brevo" ? "Brevo (formerly Sendinblue) Transactional" : "Resend Professional SMTP"}
            </h4>

            <div className="mt-4 space-y-3 font-mono text-xs text-slate-400">
              <div className="flex justify-between">
                <span>API Status:</span>
                <span className={currentConfigured ? "text-emerald-400 font-bold" : "text-amber-400"}>
                  {currentConfigured ? "Authenticated" : "Sandbox"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Key Token:</span>
                <span className="text-slate-500">
                  {activeTab === "brevo" ? brevoStatus?.apiKeyMasked : resendStatus?.apiKeyMasked}
                </span>
              </div>
              {activeTab === "brevo" && brevoStatus?.quota && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Monthly Quota:</span>
                    <span>{brevoStatus.quota.used} / {brevoStatus.quota.limit}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div 
                      className="bg-violet-500 h-full"
                      style={{ width: `${(brevoStatus.quota.used / brevoStatus.quota.limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-semibold text-slate-200 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Campaign Performance
            </h4>

            <div className="space-y-3 font-mono text-xs">
              {activeTab === "brevo" ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sent emails:</span>
                      <span className="text-slate-200 font-bold">{brevoStatus?.stats?.sent}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Open Rate:</span>
                      <span className="text-violet-400 font-bold">
                        {((brevoStatus?.stats?.opened / brevoStatus?.stats?.sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Click Rate:</span>
                      <span className="text-indigo-400 font-bold">
                        {((brevoStatus?.stats?.clicked / brevoStatus?.stats?.sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bounces:</span>
                      <span className="text-rose-400 font-bold">{brevoStatus?.stats?.bounced}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Rate:</span>
                      <span className="text-emerald-400 font-bold">{resendStatus?.analytics?.deliveredRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bounce Rate:</span>
                      <span className="text-rose-400 font-bold">{resendStatus?.analytics?.bounceRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spam Report:</span>
                      <span className="text-amber-400 font-bold">{resendStatus?.analytics?.spamReportRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Volume:</span>
                      <span className="text-indigo-400 font-bold">{resendStatus?.analytics?.totalSentMonth} / 3000</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Transactional sender form & Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick email composer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
              <Send className="w-4 h-4 text-indigo-400" />
              Dispatch Quick Transactional Alert
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 font-mono flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold">To Recipient:</label>
                  <input
                    type="email"
                    required
                    placeholder="client@fiverr.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-bold">Subject Line:</label>
                  <input
                    type="text"
                    required
                    placeholder="Milestone release confirmation notification"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-bold">Message Content / HTML:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hi, your milestone invoice is generated successfully. Best dev, Pro-Team."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500 font-sans text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <p className="text-[10px] text-slate-500 italic max-w-xs leading-relaxed font-mono">
                  * Triggers custom endpoint proxy. Logs will be updated dynamically in the feed below.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Send transactional
                </button>
              </div>
            </form>
          </div>

          {/* Active Logs lists */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Outgoing SMTP Log
              </h3>
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1 text-slate-500 hover:text-slate-300 transition-all"
                title="Sync logs"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60 font-mono text-[11px] max-h-[180px] overflow-y-auto scrollbar-thin">
              {activeTab === "brevo" ? (
                brevoStatus?.logs?.length === 0 ? (
                  <p className="p-4 text-center text-slate-500">No recent logs recorded.</p>
                ) : (
                  brevoStatus.logs.map((log: any) => (
                    <div key={log.id} className="p-3 flex justify-between items-center hover:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-bold">{log.recipient}</span>
                          <span className="text-[9px] text-slate-500 bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                            {log.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{log.template}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.status === "delivered" || log.status === "opened"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.status === "bounced"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {log.status}
                        </span>
                        <p className="text-[9px] text-slate-600 mt-0.5">{log.sentAt}</p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                resendStatus?.logs?.length === 0 ? (
                  <p className="p-4 text-center text-slate-500">No recent logs recorded.</p>
                ) : (
                  resendStatus.logs.map((log: any) => (
                    <div key={log.id} className="p-3 flex justify-between items-center hover:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-bold">{log.recipient}</span>
                          <span className="text-[9px] text-slate-500 bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                            {log.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans truncate max-w-[200px]">{log.subject}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : log.status === "bounced"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}>
                          {log.status}
                        </span>
                        <p className="text-[9px] text-slate-600 mt-0.5">{log.sentAt}</p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
