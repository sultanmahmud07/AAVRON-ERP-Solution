import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Sliders,
  Shield,
  Bell,
  Blocks,
  Save,
  Building,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const { tab = "integrations" } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const validTabs = ["general", "security", "notifications", "integrations"];
  const activeTab = validTabs.includes(tab.toLowerCase()) ? tab.toLowerCase() : "general";

  // General Settings State
  const [companyName, setCompanyName] = useState("Falcon LLP Enterprise");
  const [companyEmail, setCompanyEmail] = useState("admin@falconllp.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [timezone, setTimezone] = useState("UTC+06:00 (Almaty, Dhaka)");
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY");

  // Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordMinLength, setPasswordMinLength] = useState("8");
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [purchaseApprovals, setPurchaseApprovals] = useState(true);
  const [systemAnnouncements, setSystemAnnouncements] = useState(false);

  // Integrations State
  const [integrations, setIntegrations] = useState([
    {
      id: "stripe",
      name: "Stripe Payments",
      desc: "Process customer card payments and point-of-sale reconciliations automatically.",
      connected: true,
      category: "Payment Gateway",
      iconColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      desc: "Sync ledgers, chart of accounts, and financial vouchers in real-time.",
      connected: true,
      category: "Accounting",
      iconColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      id: "sendgrid",
      name: "SendGrid Email API",
      desc: "Transactional email notifications for purchase invoices and reset links.",
      connected: false,
      category: "Communications",
      iconColor: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      id: "twilio",
      name: "Twilio SMS",
      desc: "SMS verification codes, customer due reminders, and dispatch status.",
      connected: true,
      category: "Messaging",
      iconColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
    },
    {
      id: "s3",
      name: "Amazon S3 Storage",
      desc: "Secure cloud bucket for product photos, employee avatars, and invoices.",
      connected: true,
      category: "Storage",
      iconColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      id: "slack",
      name: "Slack Webhooks",
      desc: "Post critical low-stock alerts and order updates into team channels.",
      connected: false,
      category: "Productivity",
      iconColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
    },
  ]);

  const handleToggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
    const item = integrations.find((i) => i.id === id);
    if (item) {
      toast.success(
        item.connected
          ? `${item.name} disconnected.`
          : `${item.name} connected successfully!`
      );
    }
  };

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure system parameters, security policies, and third-party integrations
          </p>
        </div>

        <button
          onClick={() => handleSave(activeTab.toUpperCase())}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs matching sidebar subitems: General, Security, Notifications, Integrations */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 dark:border-slate-800 pb-px overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => navigate("/system/settings/general")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "general"
              ? "border-[#0c6760] text-[#0c6760] dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>General</span>
        </button>

        <button
          onClick={() => navigate("/system/settings/security")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "security"
              ? "border-[#0c6760] text-[#0c6760] dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>

        <button
          onClick={() => navigate("/system/settings/notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-[#0c6760] text-[#0c6760] dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => navigate("/system/settings/integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "integrations"
              ? "border-[#0c6760] text-[#0c6760] dark:text-teal-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Blocks className="w-4 h-4" />
          <span>Integrations</span>
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-6 shadow-xs max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#0c6760]" />
              Enterprise Organization Details
            </h3>
            <p className="text-xs text-slate-400">
              Company profile information printed on invoices and purchase slips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Support Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="BDT (৳)">BDT (৳) - Bangladeshi Taka</option>
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                System Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Display Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
              >
                <option value="DD MMM YYYY">DD MMM YYYY (e.g. 21 Oct 2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-21)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/21/2026)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security */}
      {activeTab === "security" && (
        <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-6 shadow-xs max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0c6760]" />
              Authentication & Access Policies
            </h3>
            <p className="text-xs text-slate-400">
              Enforce enterprise-grade security rules across user logins.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#12141c]">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Enforce Two-Factor Authentication (2FA)
                </p>
                <p className="text-[11px] text-slate-400">
                  Require authenticator app verification code on every staff login.
                </p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Idle Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0c6760]/20 focus:border-[#0c6760]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#12141c]">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Require Special Characters & Numbers
                </p>
                <p className="text-[11px] text-slate-400">
                  Enforces passwords to have at least one numeric digit and special symbol.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireSpecialChar}
                onChange={(e) => setRequireSpecialChar(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-6 shadow-xs max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0c6760]" />
              System Alerts & Notification Channels
            </h3>
            <p className="text-xs text-slate-400">
              Manage automatic notifications dispatched to management and users.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12141c]/50">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Daily Accounting & Cashflow Summary Email
                </p>
                <p className="text-[11px] text-slate-400">
                  Receive a consolidated end-of-day ledger statement.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12141c]/50">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Inventory Low Stock & Reorder Triggers
                </p>
                <p className="text-[11px] text-slate-400">
                  Instant push notification when stock falls beneath threshold.
                </p>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12141c]/50">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Purchase Order Approval Requests
                </p>
                <p className="text-[11px] text-slate-400">
                  Notify managers when high-value purchase orders are submitted.
                </p>
              </div>
              <input
                type="checkbox"
                checked={purchaseApprovals}
                onChange={(e) => setPurchaseApprovals(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#12141c]/50">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Broadcast System Maintenance Announcements
                </p>
                <p className="text-[11px] text-slate-400">
                  Show banner messages to staff during scheduled maintenance windows.
                </p>
              </div>
              <input
                type="checkbox"
                checked={systemAnnouncements}
                onChange={(e) => setSystemAnnouncements(e.target.checked)}
                className="w-4 h-4 rounded text-[#0c6760] focus:ring-[#0c6760] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Integrations (Selected in Image 1) */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Blocks className="w-4 h-4 text-[#0c6760]" />
                Connected Applications & API Integrations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Extend your ERP with payment processors, communication gateways, and cloud storage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#181b24] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${item.iconColor}`}
                    >
                      <Blocks className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.connected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                          : "bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.connected ? "Active" : "Disconnected"}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {item.connected ? "v2.4 connected" : "Not configured"}
                  </span>
                  <button
                    onClick={() => handleToggleIntegration(item.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      item.connected
                        ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50"
                        : "bg-[#0c6760] hover:bg-[#09544e] text-white shadow-xs"
                    }`}
                  >
                    {item.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
