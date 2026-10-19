import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, MapPin, Trash2, Search, Plus, MapPinned, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router";
import { formatDate } from "@/utils/getDateFormater";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IApiError } from "@/types";
import { cn } from "@/lib/utils";

// Assuming you have the add mutation in your API slice
import {
  useGetAllAddressesQuery,
  useRemoveAddressMutation,
  useAddAddressMutation // Added this import
} from "@/redux/features/address/address";
import AddressSkeleton from "../loader/AddressSkeleton";
import AddStateModal, { IState } from "./AddStateModal";
import { useGetAllStatesQuery, useRemoveStateMutation } from "@/redux/features/state/state";

export interface ILocation {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function AvailabilitiesList() {
  // --- List State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9); // Changed to 12 so grid of 3 looks even (4 rows)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("-createdAt");
  const [activeTab, setActiveTab] = useState<"LOCATIONS" | "STATES">("STATES");

  // --- Modal Form State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddStateModalOpen, setIsAddStateModalOpen] = useState(false);
  const [stateToEdit, setStateToEdit] = useState<IState | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "TX",
    zip: "",
    type: "STANDARD_ESTIMATE"
  });

  // --- API Hooks ---
  const { data, isLoading } = useGetAllAddressesQuery({
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  });
  const [removeLocation] = useRemoveAddressMutation();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();

  const { data: statesData, isLoading: isStatesLoading } = useGetAllStatesQuery({
    page: currentPage,
    limit,
    searchTerm,
    sort: sortOrder,
  });
  const [removeState] = useRemoveStateMutation();

  const totalPage = activeTab === "LOCATIONS"
    ? (data?.meta?.totalPage || 1)
    : (statesData?.meta?.totalPage || 1);

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSortChange = (value: string) => setSortOrder(value);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value });
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Adding new location...");

    try {
      const res = await addAddress(formData).unwrap();
      if (res.success) {
        toast.success("Location added successfully!", { id: toastId });
        setIsAddModalOpen(false);
        setFormData({ street: "", city: "", state: "TX", zip: "", type: "STANDARD_ESTIMATE" }); // Reset
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to add location", { id: toastId });
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    const toastId = toast.loading("Removing location...");
    try {
      const res = await removeLocation(locationId).unwrap();
      if (res.success) {
        toast.success("Location deleted successfully", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to delete location", { id: toastId });
    }
  };

  const handleRemoveState = async (stateId: string) => {
    const toastId = toast.loading("Removing state...");
    try {
      const res = await removeState(stateId).unwrap();
      if (res.success) {
        toast.success("Available state deleted successfully", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to delete state", { id: toastId });
    }
  };

  const handleEditState = (state: IState) => {
    setStateToEdit(state);
    setIsAddStateModalOpen(true);
  };

  const handleAddStateClick = () => {
    setStateToEdit(null);
    setIsAddStateModalOpen(true);
  };


  return (
    <div className="w-full bg-white dark:bg-zinc-950 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Manage Service Locations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage your available service areas and branches.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="w-full pl-9 bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-primary"
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Sort Dropdown */}
          <Select onValueChange={handleSortChange} value={sortOrder}>
            <SelectTrigger className="w-full md:py-5 sm:w-[160px] bg-gray-50 dark:bg-zinc-900 h-11 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-primary">
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

          {activeTab === "LOCATIONS" ? (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-[#16965f] text-white h-11 rounded-xl px-6 cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border-gray-100 dark:border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <MapPinned className="w-5 h-5 text-primary" />
                    Add New Location
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLocation} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input
                      name="street"
                      placeholder="e.g. 1900 N Akard St"
                      value={formData.street}
                      onChange={handleFormChange}
                      required
                      className="bg-gray-50 dark:bg-zinc-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        name="city"
                        placeholder="e.g. Dallas"
                        value={formData.city}
                        onChange={handleFormChange}
                        required
                        className="bg-gray-50 dark:bg-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        name="state"
                        placeholder="e.g. Texas"
                        defaultValue="TX"
                        value={formData.state}
                        onChange={handleFormChange}
                        required
                        className="bg-gray-50 dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input
                        name="zip"
                        placeholder="e.g. 75201"
                        value={formData.zip}
                        onChange={handleFormChange}
                        required
                        className="bg-gray-50 dark:bg-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Type</Label>
                      <Select value={formData.type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="bg-gray-50 dark:bg-zinc-900">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DFW_ESTIMATE">DFW Estimate</SelectItem>
                          <SelectItem value="STANDARD_ESTIMATE">Standard Estimate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-[#16965f] text-white" disabled={isAdding}>
                      {isAdding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Location"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button
                onClick={handleAddStateClick}
                className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white h-11 rounded-xl px-6 cursor-pointer animate-in fade-in duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add State
              </Button>
              <AddStateModal
                isOpen={isAddStateModalOpen}
                onOpenChange={setIsAddStateModalOpen}
                stateToEdit={stateToEdit}
              />
            </>
          )}

        </div>
      </div>
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-100 dark:border-zinc-800/80 mb-6 gap-6 items-center">
        <button
          onClick={() => { setActiveTab("STATES"); setCurrentPage(1); }}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === "STATES"
              ? "border-primary text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Available States
        </button>
        <span className="pb-3 text-xs font-bold text-gray-400 dark:text-zinc-600">
          OR
        </span>
        <button
          onClick={() => { setActiveTab("LOCATIONS"); setCurrentPage(1); }}
          className={cn(
            "pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === "LOCATIONS"
              ? "border-primary text-gray-900 dark:text-white"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          Areas with ZIP Code
        </button>
      </div>

      {/* Grid Data */}
      {isLoading || isStatesLoading ? (
        <AddressSkeleton /> // You might want to create a GridSkeleton later, but this works for now
      ) : activeTab === "LOCATIONS" ? (
        <>
          {data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
              <MapPinned className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No locations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {data?.data.map((location: ILocation) => (
                <Card key={location._id} className="border border-gray-200 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-secondary/60 hover:shadow-md transition-all gap-0 md:gap-2 group overflow-hidden flex flex-col">

                  {/* Header: Title, Badge, and Address */}
                  <CardHeader className="p-3 md:px-5  flex flex-row items-start justify-between gap-2">
                    <div className="space-y-2 overflow-hidden w-full">
                      <div className="flex items-start justify-between gap-2 w-full">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white truncate" title={location.street}>
                          {location.street}
                        </CardTitle>
                        {/* Tiny Type Badge */}
                        <span className={cn(
                          "shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold tracking-wide uppercase border",
                          location.type === "DFW_ESTIMATE"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                            : "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900"
                        )}>
                          {location.type.split('_')[0]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {location.city}, {location.state} {location.zip}
                      </p>
                    </div>
                  </CardHeader>

                  <div className="flex-1" />

                  {/* Footer: Small Date and Actions */}
                  <CardFooter className="p-2 py-0 bg-gray-50/50 dark:bg-zinc-900/30 border-t border-gray-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-2 mt-auto">
                    {/* Small Date */}
                    <p className="text-xs text-gray-400 text-start dark:text-zinc-500 font-medium">
                      Added {formatDate(location.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link to={`/locations/edit/${location._id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      </Link>

                      <DeleteConfirmation onConfirm={() => handleRemoveLocation(location._id)}>
                        <Button variant="ghost" size="sm" className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </CardFooter>

                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {statesData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl animate-in fade-in duration-200">
              <MapPinned className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No available states found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 animate-in fade-in duration-200">
              {statesData?.data.map((stateItem: IState) => (
                <Card key={stateItem._id} className="border border-green-200 dark:border-green-900/40 shadow-sm rounded-2xl bg-white dark:bg-secondary/60 hover:shadow-md transition-all gap-0 md:gap-2 group overflow-hidden flex flex-col">

                  {/* Header: Title, Badge, and Details */}
                  <CardHeader className="p-3 md:px-5 flex flex-row items-start justify-between gap-2">
                    <div className="space-y-2 overflow-hidden w-full">
                      <div className="flex items-start justify-between gap-2 w-full">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          Statewide - <span className="text-primary uppercase">{stateItem.state}</span>
                        </CardTitle>
                        {/* Tiny Type Badge */}
                        <span className={cn(
                          "shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold tracking-wide uppercase border",
                          stateItem.type === "DFW_ESTIMATE"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                            : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-100 dark:border-green-900"
                        )}>
                          {stateItem.type.split('_')[0]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {stateItem.zip ? `Statewide coverage (ZIP: ${stateItem.zip})` : "State-wide Coverage"}
                      </p>
                    </div>
                  </CardHeader>

                  <div className="flex-1" />

                  {/* Footer: Actions */}
                  <CardFooter className="p-2 py-0 bg-gray-50/50 dark:bg-zinc-900/30 border-t border-gray-100 dark:border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-2 mt-auto">
                    {/* Small Date */}
                    <p className="text-xs text-gray-400 text-start dark:text-zinc-500 font-medium">
                      Added {formatDate(stateItem.createdAt)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button onClick={() => handleEditState(stateItem)} variant="ghost" size="sm" className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer">
                        <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>

                      <DeleteConfirmation onConfirm={() => handleRemoveState(stateItem._id)}>
                        <Button variant="ghost" size="sm" className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </Button>
                      </DeleteConfirmation>
                    </div>
                  </CardFooter>

                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPage > 1 && (
        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
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
                          ? "bg-primary text-white hover:bg-[#16965f] hover:text-white border-transparent"
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