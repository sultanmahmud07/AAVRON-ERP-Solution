import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IApiError } from "@/types";
import { useNavigate, useParams, Link } from "react-router";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";

// Import your GET and UPDATE hooks for Addresses/Locations
import {
  useGetAddressDetailsQuery,
  useUpdateAddressMutation
} from "@/redux/features/address/address"; // Adjust path if needed

// 1. Zod schema matched to your Address Model
const addressSchema = z.object({
  street: z.string().min(2, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP code is required"),
  type: z.enum(["DFW_ESTIMATE", "STANDARD_ESTIMATE"]),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const UpdateAddress = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Using 'id' based on standard REST routing

  // Fetch existing data
  const { data: responseData, isLoading: isFetching } = useGetAddressDetailsQuery(id);
  const existingData = responseData; // Extracting data from the wrapper

  // Use Update mutation
  const [updateAddress, { isLoading: isSubmitting }] = useUpdateAddressMutation();
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zip: "",
      type: "STANDARD_ESTIMATE",
    },
  });

  // 2. Populate form with fetched data
  useEffect(() => {
    if (existingData) {
      form.reset({
        street: existingData.street || "",
        city: existingData.city || "",
        state: existingData.state || "",
        zip: existingData.zip || "",
        type: existingData.type as "DFW_ESTIMATE" | "STANDARD_ESTIMATE",
      });
    }
  }, [existingData, form]);

  const onSubmit = async (data: AddressFormValues) => {
    const toastId = toast.loading("Updating location...");
    try {
      // Send JSON data (No FormData needed since there are no images)
      const res = await updateAddress({
        addressId: existingData?._id,
        addressInfo: data
      }).unwrap();

      if (res.success) {
        toast.success("Location updated successfully!", { id: toastId });
        navigate("/available-locations"); // Adjust redirect path as needed
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to update location", { id: toastId });
    }
  };

  // Show a loading state while fetching the initial data
  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">Loading location details...</p>
      </div>
    );
  }

  if (!existingData && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Location not found</p>
        <Link to="/available-locations">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Locations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("max-w-4xl mx-auto p-4 md:p-8", className)}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Update Location
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Modify the details for this service area or branch.
          </p>
        </div>
        <Link to="/available-locations">
          <Button variant="outline" className="h-10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800/50 flex flex-col gap-6">

          {/* Street Address */}
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Street Address</FormLabel>
                <FormControl>
                  <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" placeholder="e.g. 123 Dallas Parkway" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">City</FormLabel>
                  <FormControl>
                    <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" placeholder="e.g. Dallas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State & Zip Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">State</FormLabel>
                    <FormControl>
                      <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" placeholder="e.g. Texas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ZIP */}
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">ZIP Code</FormLabel>
                    <FormControl>
                      <Input className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl" placeholder="e.g. 75201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {/* Location Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Location Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DFW_ESTIMATE">DFW Estimate</SelectItem>
                      <SelectItem value="STANDARD_ESTIMATE">Standard Estimate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
            <Button
              type="submit"
              className="w-full md:w-auto px-10 h-12 bg-primary hover:bg-[#16965f] cursor-pointer text-white rounded-xl font-medium text-base transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...</>
              ) : (
                "Update Location"
              )}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
};

export default UpdateAddress;