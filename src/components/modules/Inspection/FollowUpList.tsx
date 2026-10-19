import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Trash2,
  Search,
  Mail,
  Phone,
  EyeIcon,
  PhoneCall,
  MapPin,
  Clock,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useGetAllInspectionsQuery,
  useRemoveInspectionMutation,
  useUpdateInspectionMutation,
} from "@/redux/features/inspection/inspection.api";
import { IInspection } from "./inspections";
import InspectionSkeleton from "../loader/InspectionSkeleton";
import { formatDate } from "@/utils/getDateFormater";

const followUpTabs = [
  { label: "Needs Follow-Up (Unscheduled)", value: "Unscheduled" },
  { label: "Contacted Leads", value: "Contacted" },
  { label: "All Leads", value: "all" },
];

export default function FollowUpList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("-createdAt");
  const [statusFilter, setStatusFilter] = useState("Unscheduled");

  const queryParams: Record<string, any> = {
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  };

  if (statusFilter !== "all") {
    queryParams.status = statusFilter;
  }

  const { data, isLoading } = useGetAllInspectionsQuery(queryParams);
  const [updateInspection] = useUpdateInspectionMutation();
  const [removeInspection] = useRemoveInspectionMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  const handleTabChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleStatusChange = async (inspectionId: string, newStatus: string) => {
    const toastId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      const res = await updateInspection({
        inspectionId,
        inspectionInfo: { status: newStatus },
      }).unwrap();

      if (res.success) {
        toast.success(`Lead marked as ${newStatus}!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update lead status", { id: toastId });
    }
  };

  const handleRemoveLead = async (inspectionId: string) => {
    const toastId = toast.loading("Removing lead record...");
    try {
      const res = await removeInspection(inspectionId).unwrap();
      if (res.success) {
        toast.success("Lead removed successfully!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove lead", { id: toastId });
    }
  };

  const totalPage = data?.meta?.totalPage || 1;
  const totalLeads = data?.meta?.total || 0;

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 md:w-6 md:h-6 text-amber-500 shrink-0" />
            Lead Follow-Ups
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Prospects who submitted property info but haven't finalized an appointment. Reach out to lock in bookings!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="w-full pl-9 bg-gray-50 dark:bg-zinc-900 h-10 md:h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-amber-500 text-sm"
              type="text"
              placeholder="Search lead name, phone..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <Select onValueChange={handleSortChange} value={sortOrder}>
            <SelectTrigger className="w-full sm:w-[160px] bg-gray-50 dark:bg-zinc-900 h-10 md:h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-amber-500 text-sm">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Order By</SelectLabel>
                <SelectItem value="-createdAt">Most Recent First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 md:p-3.5 mb-4 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>Lead Capture Active:</strong> Every visitor who fills in their contact info is captured here immediately. You can call or email them right away to lock in their inspection date.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-gray-100 dark:border-zinc-800/60">
        {followUpTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
              statusFilter === tab.value
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800"
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:block">
          Showing <strong>{totalLeads}</strong> leads
        </div>
      </div>

      {/* Main Content Section */}
      {isLoading ? (
        <InspectionSkeleton />
      ) : (
        <>
          {/* ================= 1. MOBILE CARD VIEW (< md) ================= */}
          <div className="block md:hidden space-y-3.5">
            {data?.data?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 dark:bg-zinc-900/30 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 text-gray-500">
                <UserCheck className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-base text-gray-800 dark:text-gray-200">No follow-up leads</p>
                <p className="text-xs text-gray-400 mt-1">All prospective clients are up to date!</p>
              </div>
            ) : (
              data?.data.map((lead: IInspection) => (
                <div
                  key={lead._id}
                  className="bg-gray-50/40 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-all space-y-3.5"
                >
                  {/* Top Header: Lead Name, Service & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base capitalize leading-tight">
                        {lead.firstName} {lead.lastName || ""}
                      </h3>
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {lead.serviceType || "Roofing Inquiry"}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(lead.createdAt)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-200/80 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-mono text-[9px] font-semibold">
                          {lead.sender}
                        </span>
                      </div>
                    </div>

                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0",
                      lead.status?.toLowerCase() === "unscheduled"
                        ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                        : lead.status?.toLowerCase() === "contacted"
                          ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                    )}>
                      {lead.status}
                    </span>
                  </div>

                  {/* 1-Tap Direct Call & Email Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Call {lead.phone}</span>
                    </a>
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-600 active:bg-sky-700 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Email Lead</span>
                    </a>
                  </div>

                  {/* Property Location */}
                  <div className="flex items-start gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/80 text-xs">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{lead.address}</p>
                      <p className="text-[11px] text-gray-500">{lead.city}, {lead.state} {lead.zip}</p>
                    </div>
                  </div>

                  {/* Survey Details & Answers */}
                  {lead.notes && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Survey Details</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lead.notes.includes("|") ? (
                          lead.notes.split("|").map((item, idx) => {
                            const trimmed = item.trim();
                            if (!trimmed) return null;
                            return (
                              <span
                                key={idx}
                                className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 text-[11px] px-2 py-0.5 rounded-md leading-tight"
                              >
                                {trimmed}
                              </span>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-600 dark:text-gray-300 italic">{lead.notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Row: Status Change, Details & Delete */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      {lead.status === "Unscheduled" && (
                        <button
                          onClick={() => handleStatusChange(lead._id, "Contacted")}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50"
                        >
                          ✓ Mark Contacted
                        </button>
                      )}
                      {lead.status === "Contacted" && (
                        <button
                          onClick={() => handleStatusChange(lead._id, "Confirmed")}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50"
                        >
                          ✓ Mark Confirmed
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/inspection/view/${lead._id}`}
                        className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                        title="View Full Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <DeleteConfirmation onConfirm={() => handleRemoveLead(lead._id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================= 2. DESKTOP TABLE VIEW (>= md) ================= */}
          <div className="hidden md:block rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto">
            <Table className="w-full min-w-[950px]">
              <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[20%] min-w-[180px]">Lead / Contact</TableHead>
                  <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[18%] min-w-[150px]">Direct Actions</TableHead>
                  <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[18%] min-w-[160px]">Property Location</TableHead>
                  <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[24%] min-w-[220px] max-w-[260px]">Notes / Survey</TableHead>
                  <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[12%] min-w-[130px]">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300 w-[8%] min-w-[90px]">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UserCheck className="w-8 h-8 text-gray-400" />
                        <p className="font-medium">No follow-up leads in this category.</p>
                        <p className="text-xs text-gray-400">All prospective clients are up to date!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((lead: IInspection) => (
                    <TableRow key={lead._id} className="hover:bg-amber-50/30 dark:hover:bg-zinc-900/50 transition-colors">

                      {/* Lead Info */}
                      <TableCell className="align-top pt-4">
                        <p className="font-bold text-gray-900 dark:text-white capitalize text-base">
                          {lead.firstName} {lead.lastName || ""}
                        </p>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                          {lead.serviceType || "Roofing Inquiry"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Captured {formatDate(lead.createdAt)}</span>
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                          {lead.sender}
                        </span>
                      </TableCell>

                      {/* Direct Contact Buttons */}
                      <TableCell className="align-top pt-4">
                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm w-fit"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap">Call {lead.phone}</span>
                          </a>
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-sm w-fit"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[130px]">{lead.email}</span>
                          </a>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="align-top pt-4">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                              {lead.address}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {lead.city}, {lead.state} {lead.zip}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Form Answers / Notes */}
                      <TableCell className="align-top pt-4 max-w-[260px]">
                        {lead.notes ? (
                          <div className="flex flex-col gap-1.5 max-w-[240px]">
                            {lead.notes.includes("|") ? (
                              lead.notes.split("|").map((item, idx) => {
                                const trimmed = item.trim();
                                if (!trimmed) return null;
                                return (
                                  <div
                                    key={idx}
                                    className="bg-gray-50 dark:bg-zinc-900/80 px-2.5 py-1 rounded-md border border-gray-200/60 dark:border-zinc-800 text-[11px] text-gray-700 dark:text-gray-300 leading-snug break-words whitespace-normal"
                                  >
                                    {trimmed}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="bg-gray-50 dark:bg-zinc-900/80 p-2.5 rounded-md border border-gray-200/60 dark:border-zinc-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words whitespace-normal">
                                {lead.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No additional notes</span>
                        )}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell className="align-top pt-4 whitespace-nowrap min-w-[130px]">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border",
                            lead.status?.toLowerCase() === "unscheduled"
                              ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                              : lead.status?.toLowerCase() === "contacted"
                                ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                          )}>
                            {lead.status}
                          </span>

                          {lead.status === "Unscheduled" && (
                            <button
                              onClick={() => handleStatusChange(lead._id, "Contacted")}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold text-left mt-1 whitespace-nowrap"
                            >
                              ✓ Mark Contacted
                            </button>
                          )}
                          {lead.status === "Contacted" && (
                            <button
                              onClick={() => handleStatusChange(lead._id, "Confirmed")}
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-left mt-1 whitespace-nowrap"
                            >
                              ✓ Mark Confirmed
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top pt-3 text-right whitespace-nowrap min-w-[90px]">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/inspection/view/${lead._id}`}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                            title="View Full Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <DeleteConfirmation onConfirm={() => handleRemoveLead(lead._id)}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DeleteConfirmation>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="flex justify-between sm:justify-end items-center mt-6">
          <div className="text-xs text-gray-500 sm:hidden">
            Page <strong>{currentPage}</strong> of <strong>{totalPage}</strong>
          </div>
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                  }
                />
              </PaginationItem>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                  (page) => (
                    <PaginationItem key={page} onClick={() => setCurrentPage(page)}>
                      <PaginationLink
                        className={cn(
                          "cursor-pointer rounded-xl transition-colors",
                          currentPage === page
                            ? "bg-amber-500 text-white hover:bg-amber-600 hover:text-white border-transparent"
                            : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                        )}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
              </div>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPage))}
                  className={
                    currentPage === totalPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
