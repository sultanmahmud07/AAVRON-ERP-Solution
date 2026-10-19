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
import { Trash2, MessageSquare, Search, Mail, Phone, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatDate } from "@/utils/getDateFormater";
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
import { useGetAllContactQuery, useRemoveContactMutation } from "@/redux/features/contact/contact.api";
import TableSkeleton from "../loader/Receiver/TableSkeleton";
import { cn } from "@/lib/utils";

// Ensure IContact matches your backend response
export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AllContactList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  
  const { data, isLoading } = useGetAllContactQuery({
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  });
  
  const [removeContact] = useRemoveContactMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  const handleRemoveContact = async (contactId: string) => {
    const toastId = toast.loading("Removing contact message...");
    try {
      const res = await removeContact(contactId).unwrap();

      if (res.success) {
        toast.success("Contact removed successfully!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove contact", { id: toastId });
    }
  };

  const totalPage = data?.meta?.totalPage || 1;

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Manage Inquiries
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and respond to customer messages and product inquiries.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="w-full pl-9 bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
              type="text"
              placeholder="Search name or email..."
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
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Contact Info</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Type</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Message</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-300 w-[120px]">Date</TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    No contact inquiries found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((contact: IContact) => (
                  <TableRow key={contact._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    
                    {/* Name */}
                    <TableCell className="font-bold text-gray-900 dark:text-white capitalize align-top pt-4">
                      {contact.name}
                    </TableCell>
                    
                    {/* Contact Info (Stacked Email & Phone) */}
                    <TableCell className="align-top pt-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`mailto:${contact.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[150px]" title={contact.email}>
                            {contact.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${contact.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    </TableCell>

                    {/* Inquiry Type Badge */}
                    <TableCell className="align-top pt-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border",
                        contact.inquiryType === "PRODUCT"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                      )}>
                        {contact.inquiryType}
                      </span>
                    </TableCell>

                    {/* Message (Truncated) */}
                    <TableCell className="align-top pt-4">
                      <p className="text-gray-600 dark:text-gray-300 text-sm max-w-[250px] md:max-w-xs lg:max-w-sm line-clamp-2" title={contact.message}>
                        {contact.message}
                      </p>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="align-top pt-4 text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                      {formatDate(contact.createdAt)}
                    </TableCell>

                    {/* Actions (View & Delete) */}
                    <TableCell className="align-top pt-2 text-right mt-0.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/contact/${contact._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer dark:hover:bg-blue-900/20">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        <DeleteConfirmation onConfirm={() => handleRemoveContact(contact._id)}>
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