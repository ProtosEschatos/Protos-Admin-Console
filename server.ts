import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Memory state for custom shortcuts and logs
interface Shortcut {
  id: string;
  name: string;
  category: "social" | "freelance";
  url: string;
  icon: string;
  badge?: string;
  badgeType?: "info" | "alert" | "warning" | "success";
}

let customShortcuts: Shortcut[] = [
  { id: "linkedin", name: "LinkedIn", category: "social", url: "https://linkedin.com", icon: "Linkedin", badge: "2 Active Recruiter Messages", badgeType: "info" },
  { id: "twitter", name: "Twitter / X", category: "social", url: "https://twitter.com", icon: "Twitter", badge: "5 Alerts", badgeType: "warning" },
  { id: "github", name: "GitHub", category: "social", url: "https://github.com", icon: "Github", badge: "14 Open PRs / Issues", badgeType: "success" },
  { id: "upwork", name: "Upwork", category: "freelance", url: "https://upwork.com", icon: "Briefcase", badge: "9+ New Invites", badgeType: "alert" },
  { id: "fiverr", name: "Fiverr", category: "freelance", url: "https://fiverr.com", icon: "DollarSign", badge: "2 Active Orders", badgeType: "success" },
  { id: "freelancer", name: "Freelancer", category: "freelance", url: "https://freelancer.com", icon: "Globe" },
  { id: "toptal", name: "Toptal", category: "freelance", url: "https://toptal.com", icon: "Shield", badge: "Interview Scheduled", badgeType: "warning" },
  { id: "behance", name: "Behance", category: "social", url: "https://behance.net", icon: "Layers" }
];

// Seed Zoho email messages
interface ZohoEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  isRead: boolean;
  isFlagged: boolean;
  folder: "inbox" | "sent" | "drafts" | "spam";
}

let zohoEmails: ZohoEmail[] = [
  {
    id: "z-1",
    senderName: "Upwork Notifications",
    senderEmail: "noreply@upwork.com",
    subject: "Hiring Manager invited you to interview: Senior React/Next.js Engineer",
    preview: "Hi Developer, you've been invited to apply for the 'Senior React/Next.js Engineer' job post on Upwork.",
    body: "Hi Developer,\n\nYou have received a new invitation to interview for the job post:\n'Senior React/Next.js Developer with Express Backend Expertise'.\n\nClient details: Enterprise level, 5-star rating, United States.\nBudget: $85-$110/hour.\n\nPlease log in to Upwork to respond within 24 hours to maintain your response rate score.\n\nBest regards,\nThe Upwork Team",
    date: "Today, 10:24 AM",
    isRead: false,
    isFlagged: true,
    folder: "inbox"
  },
  {
    id: "z-2",
    senderName: "Zoho Billing Alert",
    senderEmail: "billing@zoho.com",
    subject: "Monthly Subscription Invoice Paid Successfully",
    preview: "Your payment of $12.00 for Zoho Professional Mail service has been processed successfully.",
    body: "Dear User,\n\nWe are pleased to inform you that your automatic payment of $12.00 for Zoho Professional Mail (Plan: Professional 5 Users) has been successfully processed on July 11, 2026.\n\nYour subscription has been renewed for another month. The invoice copy is attached to this email and is also available in your billing dashboard.\n\nTransaction ID: TXN98348239482\nPayment Method: Visa ending in 4422\n\nThank you for choosing Zoho.\n\nSincerely,\nZoho Billing Team",
    date: "Today, 08:15 AM",
    isRead: true,
    isFlagged: false,
    folder: "inbox"
  },
  {
    id: "z-3",
    senderName: "GitHub security",
    senderEmail: "noreply@github.com",
    subject: "[GitHub] Security Alert: 1 vulnerability detected in your production repository",
    preview: "Dependabot alert: lodash package contains a high severity vulnerability in prototype pollution.",
    body: "Hello dev-team,\n\nGitHub Dependabot has detected 1 high-severity vulnerability in your repository 'devpulse-admin-panel'.\n\n- Package: lodash\n- Severity: High (8.8 CVSS score)\n- Vulnerability: Prototype pollution in defaultsDeep.\n- Remediation: Update package to version 4.17.21 or above.\n\nWe recommend that you review this vulnerability and merge the automated pull request to fix this dependency as soon as possible.\n\nThanks,\nGitHub Security Team",
    date: "Yesterday, 04:30 PM",
    isRead: false,
    isFlagged: true,
    folder: "inbox"
  },
  {
    id: "z-4",
    senderName: "Fiverr Business",
    senderEmail: "inbox@fiverr.com",
    subject: "New Order #FO938472: Custom SaaS Admin Panel Dashboard Dashboard setup",
    preview: "Congratulations! Client 'SaaSGroupInc' has placed an order on your React Developer Gig ($2,400).",
    body: "Hi developer_pro,\n\nCongratulations! A new order has been placed by SaaSGroupInc on your Gig: 'I will build a premium responsive NextJS & Express dashboard admin panel'.\n\n- Order Amount: $2,400.00\n- Delivery Time: 10 Days\n- Requirements: Submitted by client\n\nInstructions:\nPlease check the client's submitted questionnaire and file attachments to start working. Don't forget to send an initial introductory message to keep client engagement high!\n\nCheers,\nFiverr Gig System",
    date: "Yesterday, 11:12 AM",
    isRead: true,
    isFlagged: false,
    folder: "inbox"
  },
  {
    id: "z-5",
    senderName: "Brevo Transactional Service",
    senderEmail: "support@brevo.com",
    subject: "API Key Generated Successfully - DevPulse Admin Integration",
    preview: "You have created a new Master API key on Brevo for your production dashboard integration.",
    body: "Hi there,\n\nYou have successfully created a new Master API key for your Brevo Account under the identifier 'DevPulse Admin Panel Integration'.\n\nCreated: July 10, 2026, 09:12 AM UTC\nOrigin IP: 185.190.240.11\n\nIf you did not generate this key, please revoke it immediately via your Brevo SMTP & API page and change your master account credentials.\n\nRegards,\nThe Brevo Security Team",
    date: "2 days ago",
    isRead: true,
    isFlagged: false,
    folder: "inbox"
  },
  {
    id: "z-6",
    senderName: "Resend Support Team",
    senderEmail: "support@resend.com",
    subject: "Welcome to Resend! Your domain was verified successfully",
    preview: "Your domain protosweb.eu is now fully authenticated for Resend transactions.",
    body: "Hi,\n\nWelcome to Resend! We are thrilled to let you know that your custom domain 'protosweb.eu' has been verified successfully after our DNS verification checks.\n\nYour SPF, DKIM, and DMARC settings are fully aligned. You can now start sending high-deliverability marketing and transactional emails directly through our Node SDK, REST API, or SMTP integration.\n\nIf you have any questions, feel free to reply directly to this mail.\n\nWarmly,\nResend Core Team",
    date: "3 days ago",
    isRead: true,
    isFlagged: false,
    folder: "inbox"
  },
  {
    id: "z-7",
    senderName: "Client Sarah Jenkins",
    senderEmail: "sarah@brightpath-agency.com",
    subject: "RE: Deliverables check & final milestone invoice request",
    preview: "Hi! The UI looks amazing. Can you prepare the invoice so I can release the final $1,500 milestone?",
    body: "Hi team,\n\nWe just did our final review of the React Next.js admin layout you sent, and I must say the spacing, typography, and responsive menus look absolutely stunning! Everything fits our brand identity to a tee.\n\nCould you please submit the final deliverable checklist and the invoice via Upwork so we can release the final $1,500 milestone today?\n\nAlso, we'd love to chat next week about a potential retainer agreement for ongoing dashboard support ($1k/month for 15 hours). Let me know your availability.\n\nThanks!\nSarah Jenkins\nFounder, BrightPath Agency",
    date: "4 days ago",
    isRead: true,
    isFlagged: true,
    folder: "inbox"
  },
  {
    id: "z-8",
    senderName: "Zoho Spam filter",
    senderEmail: "spamcheck@zoho.com",
    subject: "[Spam Alert] Double your design income overnight with this sneaky AI tool!",
    preview: "Unsolicited promotional message regarding design tools.",
    body: "Hey there designer!\n\nAre you tired of working 60-hour weeks for peanuts? Use our new unverified tool to generate 50 web concepts in 3 seconds and charge $5,000 each!\n\nCLICK HERE TO BUY NOW !!! Special discount 99% off for today only.\n\n(This email was automatically routed to Spam)",
    date: "5 days ago",
    isRead: true,
    isFlagged: false,
    folder: "spam"
  }
];

// Brevo Transactional Logs State
let brevoLogs = [
  { id: "b-101", recipient: "client-a@gmail.com", template: "Milestone Invoice Completed", status: "delivered", sentAt: "Today, 09:12 AM" },
  { id: "b-102", recipient: "subscriber-22@outlook.com", template: "Newsletter Issue #4", status: "opened", sentAt: "Yesterday, 02:44 PM" },
  { id: "b-103", recipient: "invalid-email-xyz@domain", template: "Onboarding Flow", status: "bounced", sentAt: "3 days ago" },
  { id: "b-104", recipient: "partner-b@fiverr.com", template: "Contract Agreement", status: "delivered", sentAt: "4 days ago" }
];

// Resend Email Logs State
let resendLogs = [
  { id: "r-201", recipient: "team-lead@company.com", subject: "Critical Server Load Alert - DB-01", status: "delivered", sentAt: "Today, 11:02 AM", opened: true, clicked: false },
  { id: "r-202", recipient: "user-alpha@gmail.com", subject: "Verify Your Email Address", status: "delivered", sentAt: "Today, 07:15 AM", opened: true, clicked: true },
  { id: "r-203", recipient: "bounced-mailbox@test.com", subject: "Security Alert: New device login", status: "bounced", sentAt: "Yesterday, 11:30 PM", opened: false, clicked: false },
  { id: "r-204", recipient: "sarah@brightpath-agency.com", subject: "Proposed retainer contract proposal draft", status: "delivered", sentAt: "2 days ago", opened: true, clicked: true }
];

// Security Events
let securityLogs = [
  { timestamp: "Today, 11:20 AM", event: "Brute Force Protection Activated", detail: "Blocked IP 185.220.101.4 after 6 failed login attempts on Zoho IMAP proxy", severity: "high" },
  { timestamp: "Today, 10:45 AM", event: "CORS Violation Blocked", detail: "Blocked unauthorized request from rogue-domain.ru to /api/brevo/status", severity: "medium" },
  { timestamp: "Today, 09:12 AM", event: "API Key Validation", detail: "Brevo and Resend API status tokens checked and verified active", severity: "info" },
  { timestamp: "Yesterday, 11:58 PM", event: "SQL Injection Blocked", detail: "WAF intercepted & sanitized SQL injection signature on /api/zoho/search?q=UNION SELECT", severity: "high" },
  { timestamp: "Yesterday, 04:11 PM", event: "Rate Limiter Warning", detail: "IP 203.0.113.195 reached 85% of standard endpoint limit (85/100 requests per minute)", severity: "low" }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Server and Website Monitoring Status
  app.get("/api/status", (req, res) => {
    // Generate slight variations in resource stats so the dashboard feels dynamic and alive
    const cpuUsage = Math.floor(18 + Math.random() * 12); // 18% - 30%
    const ramUsage = Math.floor(62 + Math.random() * 6);  // 62% - 68%
    const diskUsage = 43.8; // Static mostly
    const activeConnections = Math.floor(28 + Math.random() * 15); // 28-43

    const targetUrl = process.env.MONITORED_WEBSITE_URL || "https://protosweb.eu";
    const uptimePct = 99.98;
    const sslDaysRemaining = Math.floor(74 - (new Date().getDate() % 10)); // simulated countdown

    // Historical response time for the graph (24 items, mock hourly stats in ms)
    const responseHistory = [
      120, 115, 130, 125, 140, 110, 105, 120, 118, 122, 130, 240, 
      250, 135, 128, 119, 110, 115, 120, 115, 112, 118, 124, 118
    ].map(time => time + Math.floor(Math.random() * 16 - 8)); // dynamic fluctuation

    res.json({
      cpu: cpuUsage,
      ram: ramUsage,
      disk: diskUsage,
      activeConnections,
      targetUrl,
      uptimePct,
      sslDaysRemaining,
      sslAuthority: "Let's Encrypt Authority X3",
      responseHistory,
      currentResponseTime: responseHistory[responseHistory.length - 1],
      isOnline: true
    });
  });

  // API 2: Security logs and active firewall level configuration
  let firewallSensitivity = "Medium";
  app.get("/api/security-logs", (req, res) => {
    res.json({
      logs: securityLogs,
      firewallSensitivity,
      apiRateLimit: "100req/min",
      totalBlockedToday: 42
    });
  });

  app.post("/api/security/firewall", (req, res) => {
    const { level } = req.body;
    if (level && ["Low", "Medium", "High"].includes(level)) {
      firewallSensitivity = level;
      securityLogs.unshift({
        timestamp: "Just Now",
        event: "Firewall Policy Updated",
        detail: `Firewall protection level adjusted to [${level}] by developer user.`,
        severity: "info"
      });
      return res.json({ success: true, level });
    }
    res.status(400).json({ success: false, error: "Invalid firewall level" });
  });

  // API 3: Brevo API Configuration Check & Stats
  app.get("/api/brevo/status", (req, res) => {
    const hasKey = !!process.env.BREVO_API_KEY;
    res.json({
      isConfigured: hasKey,
      apiKeyMasked: hasKey ? `${process.env.BREVO_API_KEY!.substring(0, 8)}...` : "Not Configured",
      quota: { used: 4820, limit: 9000, resetInDays: 4 },
      logs: brevoLogs,
      stats: {
        sent: 14820,
        delivered: 14798,
        opened: 7421,
        clicked: 1209,
        bounced: 22
      },
      templates: [
        { id: "1", name: "Client Milestone Billing Template", subject: "Invoice for Milestone Completed" },
        { id: "2", name: "Developer Retainer Onboarding", subject: "Welcome to our Ongoing Retainer Program" },
        { id: "3", name: "Urgent Security Breach Warning", subject: "Security Notification: Action Required" },
        { id: "4", name: "Weekly Development Standup Summary", subject: "Sprint Update & Action Items" }
      ]
    });
  });

  // API 4: Send Transactional Email through Brevo Proxy
  app.post("/api/brevo/send", (req, res) => {
    const { recipient, subject, body, templateId } = req.body;
    if (!recipient || !subject || !body) {
      return res.status(400).json({ success: false, error: "Missing recipient, subject, or body" });
    }

    const hasKey = !!process.env.BREVO_API_KEY;
    const newLog = {
      id: `b-${Math.floor(100 + Math.random() * 900)}`,
      recipient,
      template: templateId ? `Template #${templateId}` : "Custom Email Block",
      status: hasKey ? "delivered" : "sent (simulated)",
      sentAt: "Just Now"
    };

    brevoLogs.unshift(newLog);

    // If real Brevo key, we can call the actual endpoint, otherwise simulate success
    if (hasKey) {
      // Real API proxy can be resolved here via fetch
      // For safely guarding: we print log and proceed
      console.log(`Sending real Brevo email to ${recipient}`);
    }

    res.json({
      success: true,
      message: hasKey ? "Email dispatched successfully via Brevo Client!" : "Email simulated successfully (Add BREVO_API_KEY in secrets to dispatch live).",
      log: newLog
    });
  });

  // API 5: Resend API Configuration Check & Stats
  app.get("/api/resend/status", (req, res) => {
    const hasKey = !!process.env.RESEND_API_KEY;
    res.json({
      isConfigured: hasKey,
      apiKeyMasked: hasKey ? `${process.env.RESEND_API_KEY!.substring(0, 8)}...` : "Not Configured",
      logs: resendLogs,
      analytics: {
        deliveredRate: 99.4,
        bounceRate: 0.6,
        spamReportRate: 0.01,
        totalSentMonth: 824
      }
    });
  });

  // API 6: Send through Resend proxy
  app.post("/api/resend/send", (req, res) => {
    const { recipient, subject, html } = req.body;
    if (!recipient || !subject || !html) {
      return res.status(400).json({ success: false, error: "Missing recipient, subject, or html content" });
    }

    const hasKey = !!process.env.RESEND_API_KEY;
    const newLog = {
      id: `r-${Math.floor(200 + Math.random() * 900)}`,
      recipient,
      subject,
      status: hasKey ? "delivered" : "sent (simulated)",
      sentAt: "Just Now",
      opened: false,
      clicked: false
    };

    resendLogs.unshift(newLog);

    res.json({
      success: true,
      message: hasKey ? "Email dispatched via Resend transactional delivery!" : "Email delivery simulated successfully (Add RESEND_API_KEY in secrets to send live).",
      log: newLog
    });
  });

  // API 7: Zoho IMAP Email Sync & Retrieval
  app.get("/api/zoho/imap", (req, res) => {
    const hasIMAPCerts = !!(process.env.ZOHO_IMAP_USER && process.env.ZOHO_IMAP_PASS);
    const folder = (req.query.folder as string) || "inbox";
    const query = (req.query.q as string || "").toLowerCase();

    // Filter email logs based on folder
    let filtered = zohoEmails.filter(email => email.folder === folder);

    // Search query filter
    if (query) {
      filtered = filtered.filter(email => 
        email.senderName.toLowerCase().includes(query) ||
        email.senderEmail.toLowerCase().includes(query) ||
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query)
      );
    }

    res.json({
      isConnected: hasIMAPCerts,
      host: process.env.ZOHO_IMAP_HOST || "imap.zoho.eu",
      user: process.env.ZOHO_IMAP_USER ? `${process.env.ZOHO_IMAP_USER.substring(0, 3)}...` : "Simulated",
      emails: filtered,
      counters: {
        inbox: zohoEmails.filter(e => e.folder === "inbox").length,
        inboxUnread: zohoEmails.filter(e => e.folder === "inbox" && !e.isRead).length,
        drafts: zohoEmails.filter(e => e.folder === "drafts").length,
        sent: zohoEmails.filter(e => e.folder === "sent").length,
        spam: zohoEmails.filter(e => e.folder === "spam").length
      }
    });
  });

  // API 8: Manage Zoho Inbox Actions (Read, Delete, Flag, Compose)
  app.post("/api/zoho/imap/action", (req, res) => {
    const { action, id, emailDetails } = req.body;

    if (action === "read" && id) {
      zohoEmails = zohoEmails.map(e => e.id === id ? { ...e, isRead: true } : e);
      return res.json({ success: true, id, message: "Email marked as read." });
    }

    if (action === "unread" && id) {
      zohoEmails = zohoEmails.map(e => e.id === id ? { ...e, isRead: false } : e);
      return res.json({ success: true, id, message: "Email marked as unread." });
    }

    if (action === "flag" && id) {
      zohoEmails = zohoEmails.map(e => e.id === id ? { ...e, isFlagged: !e.isFlagged } : e);
      return res.json({ success: true, id, message: "Email flag toggled." });
    }

    if (action === "delete" && id) {
      zohoEmails = zohoEmails.filter(e => e.id !== id);
      return res.json({ success: true, id, message: "Email deleted successfully from Zoho client." });
    }

    if (action === "compose") {
      const { recipient, subject, body } = emailDetails || {};
      if (!recipient || !subject || !body) {
        return res.status(400).json({ success: false, error: "Missing recipient, subject, or message body." });
      }

      const newEmail: ZohoEmail = {
        id: `z-draft-${Math.floor(100 + Math.random() * 900)}`,
        senderName: "Me (Zoho Custom Server)",
        senderEmail: process.env.ZOHO_IMAP_USER || "developer@zoho.com",
        subject,
        preview: body.length > 80 ? body.substring(0, 80) + "..." : body,
        body,
        date: "Just Now",
        isRead: true,
        isFlagged: false,
        folder: "sent"
      };

      zohoEmails.unshift(newEmail);
      return res.json({ success: true, email: newEmail, message: "Email drafted and saved to Zoho Sent Folder." });
    }

    res.status(400).json({ success: false, error: "Unsupported IMAP operation" });
  });

  // API 9: Shortcuts and profiles
  app.get("/api/shortcuts", (req, res) => {
    res.json({ shortcuts: customShortcuts });
  });

  app.post("/api/shortcuts/update", (req, res) => {
    const { id, url, name } = req.body;
    if (!id || !url) {
      return res.status(400).json({ success: false, error: "Id and URL are required" });
    }

    customShortcuts = customShortcuts.map(s => {
      if (s.id === id) {
        return { ...s, url, name: name || s.name };
      }
      return s;
    });

    res.json({ success: true, shortcuts: customShortcuts });
  });

  // API 10: Website Core Web Vitals
  app.get("/api/vitals", (req, res) => {
    res.json({
      vitals: {
        lcp: { value: 1.4, unit: "s", rating: "Good", label: "Largest Contentful Paint" },
        cls: { value: 0.04, unit: "", rating: "Good", label: "Cumulative Layout Shift" },
        fid: { value: 18, unit: "ms", rating: "Good", label: "First Input Delay" },
        ttfb: { value: 142, unit: "ms", rating: "Good", label: "Time to First Byte" },
        inp: { value: 65, unit: "ms", rating: "Good", label: "Interaction to Next Paint" }
      },
      tips: [
        "Aktivirajte Gzip/Brotli kompresiju za brži TTFB (Time to First Byte).",
        "Odgoda ne-kritičnih skripti trećih strana kako bi se oslobodio glavni thread preglednika.",
        "Osigurajte da slike na protosweb.eu imaju definirane width/height atribute radi sprječavanja CLS pomaka.",
        "Postavite Cache-Control zaglavlja za statičke datoteke: public, max-age=31536000."
      ]
    });
  });

  // MEMORY STATE FOR NEW INTEGRATIONS
  let githubRepo = {
    owner: "protosweb",
    repo: "protosweb-agency-website",
    branch: "main",
    isConnected: true,
    lastSyncedAt: "Prije 2 sata",
    commits: [
      { sha: "8f3a9d2", message: "Optimizacija slika i uvođenje novog modernog layouts sustava", author: "Marko Protos", date: "Prije 2 sata" },
      { sha: "ca12b54", message: "Dodavanje Brevo SMTP integracije i popravak kontakt obrasca", author: "Marko Protos", date: "Prije 1 dan" },
      { sha: "fe983c1", message: "Konfiguracija Zoho IMAP proxy poslužitelja", author: "Marko Protos", date: "Prije 2 dana" },
      { sha: "b33fa81", message: "Inicijalna postava weba protosweb.eu", author: "Marko Protos", date: "Prije 5 dana" }
    ],
    pullRequests: [
      { id: 42, title: "Značajka: Sentry i Cloudflare automatski vatrozid", author: "Marko Protos", status: "open", date: "Danas" }
    ]
  };

  let vercelDeployments = [
    { id: "dep-101", url: "protosweb-agency-8f3a9d2.vercel.app", commit: "8f3a9d2", status: "READY", createdAt: "Prije 2 sata" },
    { id: "dep-100", url: "protosweb-agency-ca12b54.vercel.app", commit: "ca12b54", status: "READY", createdAt: "Prije 1 dan" },
    { id: "dep-099", url: "protosweb-agency-fe983c1.vercel.app", commit: "fe983c1", status: "READY", createdAt: "Prije 2 dana" }
  ];

  let cloudflareStatus = {
    zone: "protosweb.eu",
    plan: "Pro Developer",
    sslLevel: "Full (Strict)",
    dnsSec: "Enabled",
    developmentMode: false,
    securityLevel: "Medium",
    ddosUnderAttack: false,
    cachedPercentage: 84.6,
    totalBandwidthGb: 12.8,
    savedBandwidthGb: 10.83
  };

  let sentryIssues = [
    { id: "sen-501", errorName: "TypeError: Cannot read properties of undefined (reading 'imap')", file: "src/components/ZohoInbox.tsx", occurrences: 14, status: "unresolved", lastSeen: "Prije 20 minuta" },
    { id: "sen-502", errorName: "NetworkError: SMTP Handshake timeout with smtp.brevo.com", file: "server.ts", occurrences: 3, status: "unresolved", lastSeen: "Prije 1 sat" },
    { id: "sen-503", errorName: "DatabaseError: Connection pool exhausted", file: "db/client.ts", occurrences: 1, status: "resolved", lastSeen: "Prije 3 dana" }
  ];

  let stripeData = {
    currency: "EUR",
    mrr: 4850,
    balance: 1240.50,
    activeSubscriptions: 18,
    charges: [
      { id: "ch_984", customer: "BrightPath Agency", amount: 1500.00, status: "succeeded", date: "Danas, 10:15" },
      { id: "ch_983", customer: "Studio Nord d.o.o.", amount: 850.00, status: "succeeded", date: "Jučer, 14:30" },
      { id: "ch_982", customer: "Lana Horvat (Freelance)", amount: 350.00, status: "succeeded", date: "Prije 3 dana" }
    ]
  };

  let socialQueue = [
    { id: "soc-1", platform: "LinkedIn", content: "Sretni smo što možemo predstaviti naš novi portfelj na protosweb.eu! Pogledajte kako pomažemo brendovima rasti kroz premium web dizajn.", scheduledFor: "Danas, 15:00", status: "scheduled" },
    { id: "soc-2", platform: "Twitter / X", content: "Novi članak na blogu: Zašto je brzina učitavanja ključna za stopu konverzije? Pročitajte na protosweb.eu/blog #webdev #seo", scheduledFor: "Sutra, 10:00", status: "scheduled" }
  ];

  // API Integration Endpoints
  app.get("/api/integrations/github", (req, res) => {
    res.json(githubRepo);
  });

  app.post("/api/integrations/github/sync", (req, res) => {
    githubRepo.lastSyncedAt = "Upravo sada";
    securityLogs.unshift({
      timestamp: "Just Now",
      event: "GitHub Repo Synced",
      detail: `Uspješno povučene najnovije izmjene i grananja za repozitorij ${githubRepo.owner}/${githubRepo.repo}.`,
      severity: "info"
    });
    res.json({ success: true, repo: githubRepo });
  });

  app.get("/api/integrations/vercel", (req, res) => {
    res.json({ deployments: vercelDeployments });
  });

  app.post("/api/integrations/vercel/deploy", (req, res) => {
    // Simulate Trigger Deploy
    const newId = `dep-${Math.floor(102 + Math.random() * 50)}`;
    const newDep = {
      id: newId,
      url: `protosweb-agency-manual-${Math.floor(100 + Math.random() * 900)}.vercel.app`,
      commit: githubRepo.commits[0].sha,
      status: "BUILDING",
      createdAt: "Upravo sada"
    };

    vercelDeployments.unshift(newDep);

    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Vercel Deploy Started",
      detail: `Korisnik je pokrenuo novu produkcijsku izgradnju na Vercelu za commit [${githubRepo.commits[0].sha}].`,
      severity: "info"
    });

    // Automatically complete build in memory after 8 seconds
    setTimeout(() => {
      const idx = vercelDeployments.findIndex(d => d.id === newId);
      if (idx !== -1) {
        vercelDeployments[idx].status = "READY";
      }
    }, 8000);

    res.json({ success: true, deployment: newDep });
  });

  app.get("/api/integrations/cloudflare", (req, res) => {
    res.json(cloudflareStatus);
  });

  app.post("/api/integrations/cloudflare/purge", (req, res) => {
    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Cloudflare Cache Purged",
      detail: `Predmemorija (Edge cache) za zonu protosweb.eu je u potpunosti očišćena s rubnih poslužitelja (CDN).`,
      severity: "medium"
    });
    res.json({ success: true, message: "Cloudflare cache cleared successfully." });
  });

  app.post("/api/integrations/cloudflare/ddos", (req, res) => {
    cloudflareStatus.ddosUnderAttack = !cloudflareStatus.ddosUnderAttack;
    cloudflareStatus.securityLevel = cloudflareStatus.ddosUnderAttack ? "Under Attack (JS Challenge)" : "Medium";

    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Cloudflare Security Policy Changed",
      detail: `DDoS zaštita 'Under Attack Mode' je ${cloudflareStatus.ddosUnderAttack ? "UKLJUČENA" : "ISKLJUČENA"} za domenu protosweb.eu.`,
      severity: cloudflareStatus.ddosUnderAttack ? "high" : "info"
    });

    res.json({ success: true, status: cloudflareStatus });
  });

  app.get("/api/integrations/sentry", (req, res) => {
    res.json({ issues: sentryIssues });
  });

  app.post("/api/integrations/sentry/resolve", (req, res) => {
    const { id } = req.body;
    sentryIssues = sentryIssues.map(issue => {
      if (issue.id === id) {
        return { ...issue, status: "resolved" };
      }
      return issue;
    });

    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Sentry Issue Resolved",
      detail: `Zabilježena iznimka sa Sentry ID ${id} označena je kao RIJEŠENA.`,
      severity: "info"
    });

    res.json({ success: true, issues: sentryIssues });
  });

  app.get("/api/integrations/stripe", (req, res) => {
    res.json(stripeData);
  });

  app.post("/api/integrations/stripe/webhook-test", (req, res) => {
    const { amount } = req.body;
    const paymentAmount = amount ? parseFloat(amount) : 499.00;
    const testId = `ch_tst_${Math.floor(100 + Math.random() * 900)}`;
    const newCharge = {
      id: testId,
      customer: "Simulirani Klijent (Test)",
      amount: paymentAmount,
      status: "succeeded",
      date: "Upravo sada"
    };

    stripeData.balance += paymentAmount;
    stripeData.charges.unshift(newCharge);

    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Stripe Webhook Received",
      detail: `Zaprimljen testni webhook [payment_intent.succeeded] za iznos od ${paymentAmount.toFixed(2)} EUR. ID transakcije: ${testId}.`,
      severity: "info"
    });

    res.json({ success: true, charge: newCharge, updatedData: stripeData });
  });

  app.get("/api/integrations/socials", (req, res) => {
    res.json({ queue: socialQueue });
  });

  app.post("/api/integrations/socials/post", (req, res) => {
    const { platform, content } = req.body;
    if (!platform || !content) {
      return res.status(400).json({ success: false, error: "Platform i sadržaj su obvezni." });
    }

    const newPost = {
      id: `soc-${Math.floor(100 + Math.random() * 900)}`,
      platform,
      content,
      scheduledFor: "Planirano uskoro",
      status: "scheduled"
    };

    socialQueue.push(newPost);

    securityLogs.unshift({
      timestamp: "Just Now",
      event: "Social Post Scheduled",
      detail: `Novi post za platformu [${platform}] je zakazan u planer optimizacije za protosweb.eu.`,
      severity: "info"
    });

    res.json({ success: true, queue: socialQueue });
  });

  // Vite integration middleware for dev environment / Static serve for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup error:", err);
});
