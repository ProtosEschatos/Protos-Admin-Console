export interface Shortcut {
  id: string;
  name: string;
  category: "social" | "freelance";
  url: string;
  icon: string;
  badge?: string;
  badgeType?: "info" | "alert" | "warning" | "success";
}

export interface ZohoEmail {
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

export interface SecurityLog {
  timestamp: string;
  event: string;
  detail: string;
  severity: "high" | "medium" | "low" | "info";
}

export interface ServerStatus {
  cpu: number;
  ram: number;
  disk: number;
  activeConnections: number;
  targetUrl: string;
  uptimePct: number;
  sslDaysRemaining: number;
  sslAuthority: string;
  responseHistory: number[];
  currentResponseTime: number;
  isOnline: boolean;
}

export interface CoreWebVital {
  value: number;
  unit: string;
  rating: string;
  label: string;
}

export interface SecurityStats {
  logs: SecurityLog[];
  firewallSensitivity: string;
  apiRateLimit: string;
  totalBlockedToday: number;
}
