import { Button } from "@/components/ui/button";
import {
      DropdownMenu,
      DropdownMenuItem,
      DropdownMenuContent,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
      DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
      MoreVertical,
      EyeIcon,
      CopyIcon,
      Phone,
      CheckCircle2,
      Clock,
      XCircle,
      CalendarCheck,
      Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { IApiError } from "@/types";

// Import your inspection interface and update mutation hook
import { useUpdateInspectionMutation } from "@/redux/features/inspection/inspection.api";
import { IInspection } from "./inspections";

export function InspectionActionMenu({ inspection }: { inspection: IInspection }) {
      const navigate = useNavigate();
      const [updateInspection, { isLoading: isUpdating }] = useUpdateInspectionMutation();

      // --- Utility actions ---
      const copyToClipboard = (text: string, label: string) => {
            navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`);
      };

      // --- Status Update Handler ---
      const handleStatusChange = async (newStatus: 'Unscheduled' | 'Contacted' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
            if (inspection.status === newStatus) return; // Prevent unnecessary API calls

            const toastId = toast.loading(`Updating status to ${newStatus}...`);
            try {
                  const res = await updateInspection({
                        inspectionId: inspection._id,               // Changed from 'id'
                        inspectionInfo: { status: newStatus }       // Changed from 'payload'
                  }).unwrap();

                  if (res.success) {
                        toast.success(`Status updated to ${newStatus}!`, { id: toastId });
                  }
            } catch (err) {
                  console.error(err);
                  const error = err as IApiError;
                  toast.error(error?.data?.message || "Failed to update status", { id: toastId });
            }
      };

      return (
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-zinc-800" disabled={isUpdating}>
                              {isUpdating ? (
                                    <Loader2 size={16} className="animate-spin text-gray-500" />
                              ) : (
                                    <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
                              )}
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800">

                        {/* --- View & Copy Actions --- */}
                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Quick Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                              onClick={() => navigate(`/inspection/view/${inspection._id}`)}
                        >
                              <EyeIcon className="mr-2 h-4 w-4 text-blue-500" />
                              <span>View Details</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                              onClick={() => copyToClipboard(inspection.email, "Email address")}
                        >
                              <CopyIcon className="mr-2 h-4 w-4 text-gray-500" />
                              <span>Copy Email</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                              onClick={() => copyToClipboard(inspection.phone, "Phone number")}
                        >
                              <Phone className="mr-2 h-4 w-4 text-gray-500" />
                              <span>Copy Phone</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />

                        {/* --- Status Update Actions --- */}
                        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Update Status
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                              <DropdownMenuItem
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    onClick={() => handleStatusChange('Contacted')}
                                    disabled={inspection.status === 'Contacted'}
                              >
                                    <Phone className="mr-2 h-4 w-4 text-sky-500" />
                                    <span>Mark as Contacted</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    onClick={() => handleStatusChange('Pending')}
                                    disabled={inspection.status === 'Pending'}
                              >
                                    <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                    <span>Mark as Pending</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    onClick={() => handleStatusChange('Confirmed')}
                                    disabled={inspection.status === 'Confirmed'}
                              >
                                    <CalendarCheck className="mr-2 h-4 w-4 text-blue-500" />
                                    <span>Mark as Confirmed</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900"
                                    onClick={() => handleStatusChange('Completed')}
                                    disabled={inspection.status === 'Completed'}
                              >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                    <span>Mark as Completed</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                    className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 focus:text-red-600"
                                    onClick={() => handleStatusChange('Cancelled')}
                                    disabled={inspection.status === 'Cancelled'}
                              >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Mark as Cancelled</span>
                              </DropdownMenuItem>
                        </DropdownMenuGroup>

                  </DropdownMenuContent>
            </DropdownMenu>
      );
}