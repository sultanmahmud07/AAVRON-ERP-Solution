import React from "react";
import { toast } from "sonner";
import { ShieldCheck, HelpCircle, FileText } from "lucide-react";

export const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto bg-white dark:bg-[#12141c] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        {/* Left: Copyright Branding & Version */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <p className="font-medium text-slate-600 dark:text-slate-300">
            {currentYear} © <span className="font-bold text-slate-900 dark:text-white">NEXORA ERP</span>. All Rights Reserved.
          </p>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            v2.4.0 Enterprise
          </span>
        </div>

        {/* Right: Operational Status & Quick Links */}
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Systems Operational</span>
          </div>

          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

          <button
            type="button"
            onClick={() => toast.info("Privacy Policy: Enterprise Data Protection")}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Terms of Service: Standard SaaS Enterprise Agreement")}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Support Center: support@nexora-erp.com")}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
