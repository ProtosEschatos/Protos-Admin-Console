import React, { useState } from "react";
import { 
  Inbox, 
  Send, 
  File, 
  AlertOctagon, 
  Search, 
  Trash2, 
  Flag, 
  Mail, 
  MailOpen, 
  RefreshCw, 
  Eye, 
  ArrowLeft,
  ChevronRight,
  Plus,
  Compass,
  CheckCircle,
  HelpCircle,
  Lock
} from "lucide-react";
import { ZohoEmail } from "../types";

interface ZohoInboxProps {
  emails: ZohoEmail[];
  counters: Record<string, number>;
  isConnected: boolean;
  host: string;
  user: string;
  currentFolder: "inbox" | "sent" | "drafts" | "spam";
  onChangeFolder: (folder: "inbox" | "sent" | "drafts" | "spam") => void;
  onSearch: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onAction: (action: string, id?: string, details?: any) => Promise<void>;
}

export const ZohoInbox: React.FC<ZohoInboxProps> = ({
  emails,
  counters,
  isConnected,
  host,
  user,
  currentFolder,
  onChangeFolder,
  onSearch,
  onRefresh,
  isRefreshing,
  onAction
}) => {
  const [searchVal, setSearchVal] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<ZohoEmail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  
  // Compose form states
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeSuccess, setComposeSuccess] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleEmailSelect = async (email: ZohoEmail) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      await onAction("read", email.id);
    }
  };

  const handleCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) return;

    setComposeLoading(true);
    try {
      await onAction("compose", undefined, {
        recipient: composeTo,
        subject: composeSubject,
        body: composeBody
      });
      setComposeSuccess(true);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      setTimeout(() => {
        setComposeSuccess(false);
        setIsComposing(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setComposeLoading(false);
    }
  };

  const getFolderIcon = (f: string) => {
    switch (f) {
      case "inbox": return <Inbox className="w-4 h-4" />;
      case "sent": return <Send className="w-4 h-4" />;
      case "drafts": return <File className="w-4 h-4" />;
      case "spam": return <AlertOctagon className="w-4 h-4" />;
      default: return <Inbox className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
      
      {/* Sidebar - Folders & Setup Check */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Connection status card */}
        <div className={`p-4 rounded-xl border relative overflow-hidden shadow-sm ${
          isConnected 
            ? "bg-emerald-500/5 border-emerald-500/20" 
            : "bg-indigo-500/5 border-indigo-500/20"
        }`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-lg pointer-events-none" />
          
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase">IMAP Configuration</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"}`} />
          </div>

          <h4 className="text-xs font-semibold text-slate-200 font-mono truncate">
            {host}
          </h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Port: 993 (SSL)
          </p>

          <div className="mt-3 text-[10px] bg-slate-950/60 p-2.5 rounded border border-slate-800 font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className={isConnected ? "text-emerald-400 font-bold" : "text-indigo-400 font-bold"}>
                {isConnected ? "LIVE ZOHO" : "SANDBOX"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Account:</span>
              <span className="text-slate-300 truncate max-w-[80px]">{user}</span>
            </div>
          </div>

          {!isConnected && (
            <p className="text-[9px] text-indigo-400/80 mt-2 font-mono leading-relaxed">
              * Add Zoho IMAP keys in secrets for live syncs. Running in secure offline testing sandbox.
            </p>
          )}
        </div>

        {/* Compose Button & Mailbox Folders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
          <button
            onClick={() => {
              setIsComposing(true);
              setSelectedEmail(null);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Compose Message
          </button>

          <div className="space-y-1 font-mono text-xs">
            {(["inbox", "sent", "drafts", "spam"] as const).map((folderKey) => {
              const count = folderKey === "inbox" ? counters.inboxUnread : counters[folderKey];
              const isSelected = currentFolder === folderKey;
              
              return (
                <button
                  key={folderKey}
                  onClick={() => {
                    onChangeFolder(folderKey);
                    setSelectedEmail(null);
                    setIsComposing(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isSelected 
                      ? "bg-slate-950 text-indigo-400 border border-indigo-500/20 shadow-inner font-semibold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 capitalize">
                    {getFolderIcon(folderKey)}
                    <span>{folderKey}</span>
                  </div>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      folderKey === "inbox" && count > 0
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-slate-800 text-slate-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Mailbox Workspace */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px]">
        
        {/* Inbox Header with Search and controls */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {selectedEmail && (
              <button
                onClick={() => setSelectedEmail(null)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm font-mono">
              <Mail className="w-4 h-4 text-indigo-400" />
              {selectedEmail ? "Message Viewer" : isComposing ? "Draft New Mail" : `Zoho Folder: ${currentFolder}`}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs">
            {!selectedEmail && !isComposing && (
              <form onSubmit={handleSearchSubmit} className="relative w-full flex">
                <input
                  type="text"
                  placeholder="Search sender, subject..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-slate-300 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all shrink-0"
              title="Sync Zoho mailbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Working View Area */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* 1. Composing Email View */}
          {isComposing && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {composeSuccess ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-slate-200">Email Dispatched Successfully!</h4>
                  <p className="text-xs text-slate-400 font-mono">Dispatched through Zoho SMTP client, saved to Sent folder.</p>
                </div>
              ) : (
                <form onSubmit={handleCompose} className="space-y-4 font-mono text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold">To Recipient:</label>
                    <input
                      type="email"
                      required
                      placeholder="client-name@agency.com"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold">Subject Line:</label>
                    <input
                      type="text"
                      required
                      placeholder="Proposed next development sprint goals"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-500 font-bold">Body Content:</label>
                    <textarea
                      required
                      rows={8}
                      placeholder="Dear Client, write your email pitch, proposal details or updates here..."
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={composeLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {composeLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Dispatch Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsComposing(false)}
                      className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs px-4 py-2 rounded-lg transition-all"
                    >
                      Cancel Draft
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. Selected Email View */}
          {selectedEmail && !isComposing && (
            <div className="flex-1 flex flex-col h-full">
              
              {/* Actions Header */}
              <div className="bg-slate-950/60 border-b border-slate-850 px-4 py-2.5 flex justify-between items-center text-xs">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-all font-mono"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to List
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAction("flag", selectedEmail.id)}
                    className={`p-1.5 rounded-lg border hover:bg-slate-950 transition-all ${
                      selectedEmail.isFlagged 
                        ? "text-amber-400 border-amber-500/20 bg-amber-500/5" 
                        : "text-slate-500 border-slate-800"
                    }`}
                    title="Toggle Flag"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onAction("unread", selectedEmail.id);
                      setSelectedEmail(null);
                    }}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-950 transition-all"
                    title="Mark Unread"
                  >
                    <MailOpen className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onAction("delete", selectedEmail.id);
                      setSelectedEmail(null);
                    }}
                    className="p-1.5 rounded-lg border border-rose-950/40 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                    title="Delete Email"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Email Content Details */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="border-b border-slate-800/80 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-base font-bold text-slate-100 font-sans leading-snug">
                      {selectedEmail.subject}
                    </h2>
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap pt-1">
                      {selectedEmail.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3 font-mono text-xs">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      {selectedEmail.senderName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-200 font-bold">{selectedEmail.senderName}</div>
                      <div className="text-[10px] text-slate-500">From: {selectedEmail.senderEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-sans pt-1">
                  {selectedEmail.body}
                </div>
              </div>

              {/* Reply Trigger Footer */}
              <div className="bg-slate-950/40 border-t border-slate-850 p-4 flex gap-3">
                <button
                  onClick={() => {
                    setIsComposing(true);
                    setComposeTo(selectedEmail.senderEmail);
                    setComposeSubject(`RE: ${selectedEmail.subject}`);
                    setComposeBody(`\n\nOn ${selectedEmail.date}, ${selectedEmail.senderName} <${selectedEmail.senderEmail}> wrote:\n> ${selectedEmail.preview}`);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition-all"
                >
                  Reply to Sender
                </button>
                <button
                  onClick={() => {
                    onAction("delete", selectedEmail.id);
                    setSelectedEmail(null);
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Archive/Delete
                </button>
              </div>
            </div>
          )}

          {/* 3. Email List View */}
          {!selectedEmail && !isComposing && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-sans scrollbar-thin">
              {emails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500 space-y-2">
                  <Mail className="w-8 h-8 text-slate-600" />
                  <p className="font-mono text-xs">No email messages found in {currentFolder}.</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailSelect(email)}
                    className={`p-3.5 hover:bg-slate-950/50 cursor-pointer transition-all flex justify-between gap-4 relative group ${
                      !email.isRead ? "bg-indigo-500/[0.02]" : ""
                    }`}
                  >
                    {/* Unread indicator border */}
                    {!email.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500" />
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs truncate font-semibold font-mono ${
                          !email.isRead ? "text-indigo-300 font-bold" : "text-slate-300"
                        }`}>
                          {email.senderName}
                        </span>
                        
                        {email.isFlagged && (
                          <Flag className="w-3 h-3 text-amber-500 fill-amber-500/20 shrink-0" />
                        )}
                      </div>

                      <h4 className={`text-xs truncate leading-snug ${
                        !email.isRead ? "text-slate-100 font-semibold" : "text-slate-400 font-normal"
                      }`}>
                        {email.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate max-w-xl">
                        {email.preview}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between items-end shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {email.date}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Mailbox status bar */}
        <div className="bg-slate-950 border-t border-slate-850 px-4 py-2 font-mono text-[10px] text-slate-500 flex justify-between">
          <span>Synced: {emails.length} files available</span>
          <span>Security Protocol: TLS v1.3</span>
        </div>

      </div>

    </div>
  );
};
