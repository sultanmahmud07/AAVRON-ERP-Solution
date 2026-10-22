import { Link, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/getDateFormater";
import Loader from "@/pages/Spinner";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  ClipboardCheck,
  FileText,
  Building,
  AlertTriangle,
  PhoneCall,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useGetInspectionDetailsQuery, useUpdateInspectionMutation } from "@/redux/features/inspection/inspection.api";
import { IInspection } from "./inspections";

const ViewInspectDetails = () => {
  const { id } = useParams();
  const { data: responseData, isLoading } = useGetInspectionDetailsQuery(id);
  const [updateInspection] = useUpdateInspectionMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  const inspection: IInspection = responseData;

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-2">
          <ClipboardCheck className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Record not found</p>
        <Link to="/inspection-requests">
          <Button variant="outline" className="mt-2"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Inspections</Button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      const res = await updateInspection({
        inspectionId: inspection._id,
        inspectionInfo: { status: newStatus },
      }).unwrap();

      if (res.success) {
        toast.success(`Status updated to ${newStatus}!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status", { id: toastId });
    }
  };

  // Helper function to format the scheduled date nicely
  const formatScheduleDate = (dateStr?: string) => {
    if (!dateStr) return "Awaiting Booking";
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    try {
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  const isUnscheduled = inspection.status?.toLowerCase() === "unscheduled" || !inspection.scheduledDate;

  return (
    <div className="w-full max-w-6xl mx-auto p-0 md:p-6 lg:p-8">

      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              to="/inspection-requests"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              All Inspections
            </Link>
            <span className="text-gray-300 dark:text-zinc-700">•</span>
            <Link
              to="/follow-ups"
              className="flex items-center text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1" />
              Follow-ups & Leads
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {isUnscheduled ? "Lead & Inquiry Details" : "Inspection Details"}
            <span className={cn(
              "inline-flex items-center px-3 py-1 text-sm rounded-full font-bold uppercase tracking-wide border",
              inspection.status?.toLowerCase().trim() === "unscheduled"
                ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                : inspection.status?.toLowerCase().trim() === "contacted"
                  ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50"
                  : inspection.status?.toLowerCase().trim() === "pending"
                    ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50"
                    : inspection.status?.toLowerCase().trim() === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                      : ["cancelled", "canceled"].includes(inspection.status?.toLowerCase().trim())
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
            )}>
              {inspection.status}
            </span>
          </h1>
        </div>

        {/* Quick Follow-up Call/Email Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${inspection.phone}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Customer</span>
          </a>
          <a
            href={`mailto:${inspection.email}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span>Send Email</span>
          </a>
        </div>
      </div>

      {/* Unscheduled Follow-up Alert Banner */}
      {isUnscheduled && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-md p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Unscheduled Lead: Customer submitted information without booking an appointment slot
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Contact the customer directly using the phone or email above to schedule their onsite inspection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {inspection.status === "Unscheduled" && (
              <Button
                onClick={() => handleStatusChange("Contacted")}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-9 rounded-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark as Contacted
              </Button>
            )}
            {inspection.status !== "Confirmed" && (
              <Button
                onClick={() => handleStatusChange("Confirmed")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 rounded-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark as Confirmed
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

        {/* ================= LEFT COLUMN: CLIENT & CONTACT INFO ================= */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#1BAE70]" /> Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">

              {/* Name */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                  {inspection.firstName} {inspection.lastName || ""}
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</p>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`mailto:${inspection.email}`} className="hover:text-blue-600 transition-colors font-semibold">
                      {inspection.email}
                    </a>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</p>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <a href={`tel:${inspection.phone}`} className="hover:text-blue-600 transition-colors font-semibold">
                      {inspection.phone}
                    </a>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Submission Meta Data */}
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden">
            <CardContent className="p-5 space-y-4 text-sm">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <span className="text-gray-500 font-medium">Requested On</span>
                <span className="text-gray-900 dark:text-white font-semibold">{formatDate(inspection.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <span className="text-gray-500 font-medium">Source / Funnel</span>
                <span className="text-gray-900 dark:text-white font-semibold px-2 py-0.5 bg-gray-100 dark:bg-zinc-900 rounded text-xs">{inspection.sender}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Record ID</span>
                <span className="text-gray-400 font-mono text-xs">{inspection._id.slice(-8)}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ================= RIGHT COLUMN: APPOINTMENT DETAILS ================= */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Primary Schedule Card */}
          <Card className="border-blue-100 dark:border-blue-900 shadow-sm rounded-md bg-blue-50/30 dark:bg-blue-950/10 overflow-hidden">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 py-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <CalendarDays className="w-5 h-5" /> Appointment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {inspection.scheduledDate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-blue-100 dark:border-blue-900 shrink-0">
                      <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Scheduled Date</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatScheduleDate(inspection.scheduledDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-blue-100 dark:border-blue-900 shrink-0">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estimated Arrival</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {inspection.scheduledTime || "Not specified"}
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-900/30 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">No Scheduled Appointment Slot</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Customer completed contact step but has not picked a calendar date.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service & Location Details */}
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-[#1BAE70]" /> Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Service Type */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requested Service</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1BAE70]/10 text-[#1BAE70] dark:bg-[#1BAE70]/20 rounded-lg font-semibold border border-[#1BAE70]/20">
                  <ClipboardCheck className="w-4 h-4" />
                  {inspection.serviceType || "Roofing Inspection"}
                </div>
              </div>

              {/* Address */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Property Address</p>
                <div className="flex items-start gap-3 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-md border border-gray-100 dark:border-zinc-800/50">
                  <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                      {inspection.address}
                    </p>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                      {inspection.city}, {inspection.state} {inspection.zip}
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Customer Notes */}
          {inspection.notes && (
            <Card className="border-amber-100 dark:border-amber-900/50 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 py-4">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-500">
                  <FileText className="w-5 h-5" /> Form Survey & Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap italic border-l-4 border-amber-300 dark:border-amber-700 pl-4 py-1">
                  "{inspection.notes}"
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewInspectDetails;