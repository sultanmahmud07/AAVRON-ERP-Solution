import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { MapPin, Save, Loader2, Building } from "lucide-react";
// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { IApiError } from "@/types";
import { useGetAllAddressesQuery, useUpdateAddressMutation } from "@/redux/features/address/address";

const locationSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "ZIP code is required"),
  type: z.string().min(1, "Location type is required"),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function CreateAddress() {
  // --- API Hooks ---
  // Assuming a single configuration endpoint for the service location
  const { data: apiResponse, isLoading: isFetching } = useGetAllAddressesQuery(undefined);
  const [updateLocation, { isLoading: isSubmitting }] = useUpdateAddressMutation();

  const locationData = apiResponse?.data;

  // --- Form Initialization ---
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zip: "",
      type: "",
    },
  });

  // Populate form when data is fetched from the server
  useEffect(() => {
    if (locationData) {
      form.reset({
        street: locationData.street || "",
        city: locationData.city || "",
        state: locationData.state || "",
        zip: locationData.zip || "",
        type: locationData.type || "",
      });
    }
  }, [locationData, form]);

  // --- Submit Handler ---
  const onSubmit: SubmitHandler<LocationFormValues> = async (data) => {
    const toastId = toast.loading("Saving location details...");

    try {
      // Pass the ID if updating an existing record, otherwise handle accordingly
      const res = await updateLocation({ 
        id: locationData?._id, 
        payload: data 
      }).unwrap();

      if (res.success) {
        toast.success("Service location updated successfully!", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to update location", { id: toastId });
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#1BAE70]" />
        <p className="text-gray-500 font-medium">Loading location settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-7 h-7 text-[#1BAE70]" />
          Service Location
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          Manage the primary address and service region for your estimates and operations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-5">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <CardTitle className="text-lg">Location Details</CardTitle>
              </div>
              <CardDescription>
                This address is used to determine your local service area.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 space-y-6">
              
              {/* Street Address */}
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">Street Address</Label>
                    <FormControl>
                      <Input 
                        placeholder="123 Dallas Parkway" 
                        className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">City</Label>
                      <FormControl>
                        <Input 
                          placeholder="Dallas" 
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">State</Label>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Texas" 
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">ZIP Code</Label>
                      <FormControl>
                        <Input 
                          placeholder="75201" 
                          className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-[#1BAE70]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Type */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300 font-medium">Location Region Type</Label>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-50 dark:bg-zinc-900 h-12 rounded-xl border-gray-200 dark:border-zinc-800 focus:ring-[#1BAE70] md:w-1/2">
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="DFW_ESTIMATE">Dallas-Fort Worth Estimate Region</SelectItem>
                            <SelectItem value="AUSTIN_ESTIMATE">Austin Estimate Region</SelectItem>
                            <SelectItem value="HOUSTON_ESTIMATE">Houston Estimate Region</SelectItem>
                            <SelectItem value="NATIONAL_HQ">National Headquarters</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Determines the pricing and availability logic tied to this address.
                      </p>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting}
              className="bg-[#1BAE70] hover:bg-[#16965f] text-white px-8 h-12 rounded-xl font-semibold shadow-md w-full md:w-auto transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Location Details</>
              )}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}