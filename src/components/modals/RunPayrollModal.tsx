import React, { useState } from "react";
import { X, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface RunPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunPayrollModal: React.FC<RunPayrollModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompleted(true);
      toast.success("Payroll batch processed successfully!");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-md bg-white dark:bg-[#161821] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Process Payroll Batch
              </h3>
              <p className="text-xs text-slate-500">March 2026 Monthly Pay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!completed ? (
            <>
              <div className="rounded-md bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Eligible Employees</span>
                  <span className="font-bold text-slate-900 dark:text-white">1,196</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Total Gross Pay</span>
                  <span className="font-bold text-slate-900 dark:text-white">$1,248,000.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Tax Withholdings</span>
                  <span className="font-bold text-slate-900 dark:text-white">-$187,200.00</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Net Disbursement</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    $1,060,800.00
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Direct deposits will be scheduled to employee verified bank accounts across 7 departments.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing Batch..." : "Authorize & Run Payroll"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Batch Executed!</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                $1,248,000 has been approved for transfer. Payslips have been dispatched to 1,196 employee portals.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-md hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunPayrollModal;
