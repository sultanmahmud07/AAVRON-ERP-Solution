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
import { EyeIcon, Trash2, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router";
import { formatDate } from "@/utils/getDateFormater";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserActionMenu } from "./UserActionMenu";
import { useGetAllUserQuery, useUpdateUserMutation } from "@/redux/features/user/user.api";
import { IApiError, IUser } from "@/types";
import TableSkeleton from "../loader/Receiver/TableSkeleton";
import { cn } from "@/lib/utils";

export default function AllUserList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  
  const { data, isLoading } = useGetAllUserQuery({
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  });
  
  const [updateUserByAdmin] = useUpdateUserMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  const handleRemoveUser = async (userId: string) => {
    const toastId = toast.loading("Removing user...");
    const userInfo = {
      isDeleted: true,
    };
    
    try {
      const res = await updateUserByAdmin({ userId, userInfo }).unwrap();
      if (res.success) {
        toast.dismiss(toastId);
        toast.success("User deleted successfully");
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to remove user", { id: toastId });
    }
  };

  const totalPage = data?.meta?.totalPage || 1;

  return (
    <div className="w-full min-h-full bg-white dark:bg-zinc-950 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1BAE70]" />
            Manage Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, search, and manage customer accounts in your system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="w-full pl-9 bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <Select onValueChange={handleSortChange} value={sortOrder}>
            <SelectTrigger className="w-full sm:w-[160px] bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-[#1BAE70]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Order By</SelectLabel>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Name</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Email</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Verify</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Join Date</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((user: IUser) => (
                  <TableRow key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    
                    {/* Name */}
                    <TableCell className="font-bold text-gray-900 dark:text-white capitalize">
                      {user.name}
                    </TableCell>
                    
                    {/* Email */}
                    <TableCell className="text-gray-500 dark:text-gray-400 font-medium">
                      {user.email}
                    </TableCell>
                    
                    {/* Role Badge */}
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </TableCell>
                    
                    {/* Date */}
                    <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    
                    {/* Status Badge */}
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                        user.isActive === "ACTIVE" // Check depends on your specific backend enum
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {user.isActive}
                      </span>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="flex items-center justify-end gap-1 mt-0.5">
                      <Link className="cursor-pointer" to={`/admin/user/${user._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <DeleteConfirmation onConfirm={() => handleRemoveUser(user._id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DeleteConfirmation>
                      
                      <UserActionMenu user={user} />
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="flex justify-end mt-6">
          <Pagination>
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
              {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem
                    key={page}
                    onClick={() => setCurrentPage(page)}
                  >
                    <PaginationLink 
                      className={cn(
                        "cursor-pointer rounded-xl transition-colors",
                        currentPage === page 
                          ? "bg-[#1BAE70] text-white hover:bg-[#16965f] hover:text-white border-transparent"
                          : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                      )} 
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
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