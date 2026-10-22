/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Trash2,
  AlertCircle,
  Loader2,
  Plus,
  CheckCheck,
  RotateCcw,
  Copy,
  CalendarDays,
  Sparkles,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddAvailabilityMutation, useGetAllAvailabilitiesQuery } from "@/redux/features/availability/availability";
import { useGetBookedSlotsQuery } from "@/redux/features/inspection/inspection.api";
import { IApiError } from "@/types";
import { IAvailability } from "@/types/availability.interface";
import AvailableSkeleton from "../loader/AvailableSkeleton";

// Default standard time slots (9:00 AM to 6:00 PM with 1.5h intervals)
const DEFAULT_SLOTS = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00"
];

// Helper to format 24h time to 12h time for display (e.g., "09:00" -> "9:00 AM")
const formatTimeDisplay = (time24: string) => {
  if (!time24 || !time24.includes(':')) return time24;
  const [h, m] = time24.split(':');
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${m} ${ampm}`;
};

// Helper to format Date object to YYYY-MM-DD local string safely
const formatDateString = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to parse YYYY-MM-DD safely into local Date object
const parseDateString = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Helper to normalize scheduled time string (e.g. "3:00 PM CDT" -> "3:00 PM")
const normalizeScheduledTime = (scheduledTime: string): string => {
  const parts = scheduledTime.trim().split(/\s+/);
  if (parts.length >= 2) {
    const timePart = parts[0];
    const ampmPart = parts[1].toUpperCase();
    const [h, m] = timePart.split(':');
    const displayHours = parseInt(h, 10).toString();
    return `${displayHours}:${m} ${ampmPart}`;
  }
  return scheduledTime;
};

interface IBookedSlot {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
}

export default function ManageAvailability() {
  const { data: apiData, isLoading: isGetLoading } = useGetAllAvailabilitiesQuery(null);
  const { data: bookedSlotsData, isLoading: isBookedLoading } = useGetBookedSlotsQuery(undefined);
  const bookedSlots: IBookedSlot[] = bookedSlotsData?.data || [];

  const [createAvailability, { isLoading }] = useAddAvailabilityMutation();

  // --- Calendar State ---
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [timezone, setTimezone] = useState("America/Chicago");

  // --- Data State ---
  // Structure: { "2026-04-20": ["09:00", "10:30", ...], "2026-04-21": [...] }
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, string[]>>({});
  // Pool of known slot chips for each date
  const [customSlotsMap, setCustomSlotsMap] = useState<Record<string, string[]>>({});

  // Modal State for adding custom time slot
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [targetDateForSlot, setTargetDateForSlot] = useState<string | null>(null);
  const [newSlotTime, setNewSlotTime] = useState("08:00");

  // --- INITIALIZE PREVIOUS DATA FROM BACKEND ---
  useEffect(() => {
    if (apiData?.data && Array.isArray(apiData.data)) {
      const initialMap: Record<string, string[]> = {};
      const initialCustomPool: Record<string, string[]> = {};

      apiData.data.forEach((schedule: IAvailability) => {
        if (schedule.date && Array.isArray(schedule.slots)) {
          initialMap[schedule.date] = schedule.slots;
          // Store any non-default slots in the custom pool for that date
          const nonDefaults = schedule.slots.filter(s => !DEFAULT_SLOTS.includes(s));
          if (nonDefaults.length > 0) {
            initialCustomPool[schedule.date] = nonDefaults;
          }
        }
      });

      setSelectedDatesMap(initialMap);
      setCustomSlotsMap(initialCustomPool);

      if (apiData.data.length > 0 && apiData.data[0].timezone) {
        setTimezone(apiData.data[0].timezone);
      }
    }
  }, [apiData]);

  // --- Calendar Logic ---
  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(currentYear, currentMonth, i));
  }

  const prevMonth = () => setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));

  // Helper to check if a specific date and time slot is booked by a customer
  const getIsBooked = (dateStr: string, slot24: string) => {
    return bookedSlots.some((booked) => {
      if (booked.scheduledDate !== dateStr) return false;
      return formatTimeDisplay(slot24) === normalizeScheduledTime(booked.scheduledTime);
    });
  };

  // Helper to check if a date has any booked slots
  const hasBookedAppointments = (dateStr: string) => {
    return bookedSlots.some((booked) => booked.scheduledDate === dateStr);
  };

  // --- Handlers: Date Selection & Removal ---
  const toggleDateSelection = (date: Date) => {
    const dateStr = formatDateString(date);

    // Prevent deselecting a date with active booked slots
    if (hasBookedAppointments(dateStr) && selectedDatesMap[dateStr]) {
      toast.warning("This date contains booked appointments and cannot be deselected.");
      return;
    }

    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      if (newMap[dateStr]) {
        // Deselect / Remove entirely
        delete newMap[dateStr];
      } else {
        // Select and assign default slots
        newMap[dateStr] = [...DEFAULT_SLOTS];
      }
      return newMap;
    });
  };

  const removeDate = (dateStr: string) => {
    if (hasBookedAppointments(dateStr)) {
      toast.warning("This date contains active booked appointments and cannot be removed.");
      return;
    }

    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[dateStr];
      return newMap;
    });
    toast.info(`Removed ${dateStr} from schedule. Click Publish to save changes.`);
  };

  // Quick Calendar Bulk Selectors
  const selectAllDaysInMonth = () => {
    const todayStr = formatDateString(new Date());
    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentYear, currentMonth, day);
        const dateStr = formatDateString(d);
        if (dateStr >= todayStr && !newMap[dateStr]) {
          newMap[dateStr] = [...DEFAULT_SLOTS];
        }
      }
      return newMap;
    });
    toast.success(`Selected all available days in ${currentMonthDate.toLocaleString('default', { month: 'long' })}.`);
  };

  const selectWeekdaysInMonth = () => {
    const todayStr = formatDateString(new Date());
    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentYear, currentMonth, day);
        const dayOfWeek = d.getDay();
        const dateStr = formatDateString(d);
        // 1 = Monday, 5 = Friday
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && dateStr >= todayStr && !newMap[dateStr]) {
          newMap[dateStr] = [...DEFAULT_SLOTS];
        }
      }
      return newMap;
    });
    toast.success(`Selected weekdays in ${currentMonthDate.toLocaleString('default', { month: 'long' })}.`);
  };

  const clearCurrentMonthDates = () => {
    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentYear, currentMonth, day);
        const dateStr = formatDateString(d);
        if (newMap[dateStr] && !hasBookedAppointments(dateStr)) {
          delete newMap[dateStr];
        }
      }
      return newMap;
    });
    toast.info(`Cleared unbooked dates for ${currentMonthDate.toLocaleString('default', { month: 'long' })}.`);
  };

  const clearAllDates = () => {
    setSelectedDatesMap((prev) => {
      const newMap: Record<string, string[]> = {};
      // Retain only dates that have booked appointments
      Object.keys(prev).forEach((dateStr) => {
        if (hasBookedAppointments(dateStr)) {
          newMap[dateStr] = prev[dateStr];
        }
      });
      return newMap;
    });
    toast.info("Cleared all unbooked dates.");
  };

  // --- Handlers: Slot Configuration ---
  const toggleTimeSlot = (dateStr: string, slot: string) => {
    setSelectedDatesMap((prev) => {
      const currentSlots = prev[dateStr] || [];
      const newMap = { ...prev };

      if (currentSlots.includes(slot)) {
        newMap[dateStr] = currentSlots.filter((s) => s !== slot);
      } else {
        newMap[dateStr] = [...currentSlots, slot].sort();
      }
      return newMap;
    });
  };

  const selectAllSlotsForDate = (dateStr: string, allPossibleSlots: string[]) => {
    setSelectedDatesMap((prev) => ({
      ...prev,
      [dateStr]: [...allPossibleSlots].sort()
    }));
  };

  const clearAllSlotsForDate = (dateStr: string) => {
    setSelectedDatesMap((prev) => {
      const currentSlots = prev[dateStr] || [];
      // Retain only booked slots
      const remainingSlots = currentSlots.filter(slot => getIsBooked(dateStr, slot));
      return {
        ...prev,
        [dateStr]: remainingSlots
      };
    });
  };

  const resetSlotsToDefault = (dateStr: string) => {
    setSelectedDatesMap((prev) => ({
      ...prev,
      [dateStr]: [...DEFAULT_SLOTS]
    }));
  };

  // Custom Slot Modal
  const handleOpenAddSlotModal = (dateStr: string) => {
    setTargetDateForSlot(dateStr);
    setNewSlotTime("08:00");
    setIsAddSlotModalOpen(true);
  };

  const handleAddCustomSlot = () => {
    if (!targetDateForSlot || !newSlotTime) return;

    // Validate 24h format HH:mm
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(newSlotTime)) {
      toast.error("Please enter a valid time in HH:mm format (e.g. 08:00 or 17:30)");
      return;
    }

    // Add to custom slots pool
    setCustomSlotsMap((prev) => {
      const existing = prev[targetDateForSlot] || [];
      if (!existing.includes(newSlotTime)) {
        return { ...prev, [targetDateForSlot]: [...existing, newSlotTime].sort() };
      }
      return prev;
    });

    // Add and select for the date
    setSelectedDatesMap((prev) => {
      const existing = prev[targetDateForSlot] || [];
      if (!existing.includes(newSlotTime)) {
        return { ...prev, [targetDateForSlot]: [...existing, newSlotTime].sort() };
      }
      return prev;
    });

    toast.success(`Added slot ${formatTimeDisplay(newSlotTime)} for ${targetDateForSlot}`);
    setIsAddSlotModalOpen(false);
  };

  // Batch Apply: Apply one date's slot setup to all selected dates in current month
  const handleApplySlotsToAllMonthDates = (sourceDateStr: string) => {
    const sourceSlots = selectedDatesMap[sourceDateStr] || [];
    const sourceCustom = customSlotsMap[sourceDateStr] || [];

    const visibleDates = sortedSelectedDates.filter((dateStr) => {
      const d = parseDateString(dateStr);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    setSelectedDatesMap((prev) => {
      const newMap = { ...prev };
      visibleDates.forEach((dateStr) => {
        // Keep any slots that are booked on this specific date
        const bookedOnThisDay = (prev[dateStr] || []).filter(s => getIsBooked(dateStr, s));
        const merged = Array.from(new Set([...sourceSlots, ...bookedOnThisDay])).sort();
        newMap[dateStr] = merged;
      });
      return newMap;
    });

    setCustomSlotsMap((prev) => {
      const newMap = { ...prev };
      visibleDates.forEach((dateStr) => {
        newMap[dateStr] = Array.from(new Set([...(newMap[dateStr] || []), ...sourceCustom])).sort();
      });
      return newMap;
    });

    toast.success(`Applied ${sourceSlots.length} slot(s) to all ${visibleDates.length} selected days in this month!`);
  };

  // --- Save / Publish Availability ---
  const handleSaveAvailability = async () => {
    const dates = Object.keys(selectedDatesMap);

    const schedulesArray = dates.map((dateStr) => ({
      date: dateStr,
      timezone: timezone,
      slots: selectedDatesMap[dateStr] || [],
      bookingMode: "EXACT_TIME",
      serviceType: "Roofing"
    }));

    const payload = {
      schedules: schedulesArray
    };
    const toastId = toast.loading("Publishing schedule changes to database...");

    try {
      const res = await createAvailability(payload).unwrap();
      if (res.success) {
        toast.success(`Successfully saved ${schedulesArray.length} day(s) of availability!`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      const error = err as IApiError;
      toast.error(error?.data?.message || "Failed to publish availability", { id: toastId });
      if (error?.data?.errorSources) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?.data?.errorSources.forEach((er: any) => toast.error(er.message));
      }
    }
  };

  // --- Render Helpers ---
  const isDateSelected = (date: Date) => !!selectedDatesMap[formatDateString(date)];
  const isToday = (date: Date) => formatDateString(date) === formatDateString(new Date());

  const sortedSelectedDates = useMemo(() => {
    return Object.keys(selectedDatesMap).sort();
  }, [selectedDatesMap]);

  // Show dates in right panel that match the current month view
  const visibleSelectedDates = useMemo(() => {
    return sortedSelectedDates.filter((dateStr) => {
      const d = parseDateString(dateStr);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [sortedSelectedDates, currentYear, currentMonth]);

  if (isGetLoading || isBookedLoading) {
    return <AvailableSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-0 md:p-5 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 md:w-7 md:h-7 text-[#1BAE70]" />
            Manage Availability
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Select dates, customize appointment time slots, and publish your live schedule.
          </p>
        </div>

        {/* Global Settings */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-md px-3 py-1.5 w-full md:w-auto shadow-sm">
            <div className="flex w-full items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500 shrink-0" />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 w-full sm:w-[200px] h-8 px-1 text-sm font-medium">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Phoenix">Arizona (no DST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii Time (HT)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        {/* ================= LEFT: INTERACTIVE CALENDAR ================= */}
        <Card className="lg:col-span-5 border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden lg:sticky top-6">
          <CardHeader className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#1BAE70]" />
                Select Dates
              </CardTitle>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg dark:border-zinc-700">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg dark:border-zinc-700">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-center font-semibold text-gray-900 dark:text-white text-base md:text-lg mt-2">
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardDescription>

            {/* Quick Bulk Selection Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectWeekdaysInMonth}
                className="h-7 px-2.5 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#1BAE70] hover:border-[#1BAE70]/50"
              >
                + Weekdays
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllDaysInMonth}
                className="h-7 px-2.5 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:text-[#1BAE70] hover:border-[#1BAE70]/50"
              >
                + All Days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCurrentMonthDates}
                className="h-7 px-2 text-xs font-medium rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Clear Month
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-5 pb-6">

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
              {calendarCells.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="w-8 h-8 md:w-10 md:h-10" />;

                const selected = isDateSelected(date);
                const today = isToday(date);
                const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);

                const dateStr = formatDateString(date);
                const hasBooked = hasBookedAppointments(dateStr);

                return (
                  <button
                    key={index}
                    onClick={() => toggleDateSelection(date)}
                    disabled={isPast}
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 flex flex-col items-center justify-center rounded-md text-xs md:text-sm font-semibold transition-all relative group",
                      isPast && "text-gray-300 dark:text-zinc-700 cursor-not-allowed",
                      !isPast && !selected && "hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300",
                      selected && "bg-[#1BAE70] text-white shadow-sm hover:bg-[#16965f]",
                      today && !selected && "border-2 border-[#1BAE70] text-[#1BAE70]"
                    )}
                    title={
                      hasBooked
                        ? `${date.getDate()} - Has booked appointments`
                        : `${date.toDateString()}`
                    }
                  >
                    <span>{date.getDate()}</span>
                    {hasBooked && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full absolute bottom-1",
                          selected ? "bg-white" : "bg-red-500"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend & Stats */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1BAE70]" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Booked
                </span>
              </div>
              {sortedSelectedDates.length > 0 && (
                <button
                  onClick={clearAllDates}
                  className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ================= RIGHT: TIME SLOT CONFIGURATOR ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Month Banner & Info */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#1BAE70] mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Slot Configuration
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Showing <strong>{visibleSelectedDates.length}</strong> active date(s) for this month. Toggle slots or add custom times.
                </p>
              </div>
            </div>

            {visibleSelectedDates.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplySlotsToAllMonthDates(visibleSelectedDates[0])}
                className="shrink-0 h-8 text-xs font-medium border-emerald-200 dark:border-emerald-800 text-[#1BAE70] hover:bg-[#1BAE70] hover:text-white transition-all shadow-xs"
                title="Apply the slots configured on the first date to all selected dates in this month"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Apply 1st Day to Month
              </Button>
            )}
          </div>

          {/* Date Cards List */}
          {visibleSelectedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl px-4 text-center bg-white/40 dark:bg-zinc-950/40">
              <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-3 animate-pulse" />
              <p className="text-base text-gray-600 dark:text-gray-300 font-semibold">No dates selected for this month</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Click on dates in the calendar to enable booking and configure time slots.
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {visibleSelectedDates.map((dateStr) => {
                const dateObj = parseDateString(dateStr);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const friendlyDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const selectedSlotsForDay = selectedDatesMap[dateStr] || [];
                const customSlotsForDay = customSlotsMap[dateStr] || [];

                // Combine default slots, loaded custom slots, and any active slots
                const allPossibleSlots = Array.from(
                  new Set([...DEFAULT_SLOTS, ...selectedSlotsForDay, ...customSlotsForDay])
                ).sort();

                const hasBooked = hasBookedAppointments(dateStr);

                return (
                  <Card
                    key={dateStr}
                    className="border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-md bg-white dark:bg-zinc-950 overflow-hidden transition-all hover:border-gray-200 dark:hover:border-zinc-700"
                  >
                    {/* Date Card Header */}
                    <CardHeader className="bg-gray-50/60 dark:bg-zinc-900/60 border-b border-gray-100 dark:border-zinc-800 py-3 px-4 md:px-5 flex flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CalendarIcon className="w-4 h-4 text-[#1BAE70] shrink-0" />
                        <CardTitle className="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {dayName}, <span className="text-gray-600 dark:text-gray-300 font-normal">{friendlyDate}</span>
                        </CardTitle>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-[#1BAE70] px-2 py-0.5 rounded-full font-medium shrink-0 ml-1">
                          {selectedSlotsForDay.length} slot(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => removeDate(dateStr)}
                          disabled={hasBooked}
                          className={cn(
                            "transition-colors p-1.5 shrink-0 rounded-lg text-xs flex items-center gap-1 font-medium",
                            hasBooked
                              ? "text-gray-300 dark:text-zinc-700 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          )}
                          title={hasBooked ? "Cannot remove date with active bookings" : "Remove this date"}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </CardHeader>

                    {/* Date Card Body */}
                    <CardContent className="pt-4 pb-5 px-4 md:px-5 space-y-3.5">

                      {/* Controls Bar for this Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectAllSlotsForDate(dateStr, allPossibleSlots)}
                            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 hover:text-[#1BAE70]"
                          >
                            <CheckCheck className="w-3.5 h-3.5 mr-1" />
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearAllSlotsForDate(dateStr)}
                            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 hover:text-amber-600"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Clear Slots
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resetSlotsToDefault(dateStr)}
                            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1" />
                            Reset Defaults
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAddSlotModal(dateStr)}
                          className="h-7 px-2.5 text-xs text-[#1BAE70] border-[#1BAE70]/30 hover:bg-[#1BAE70]/10 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add Custom Slot
                        </Button>
                      </div>

                      {/* Empty Warning */}
                      {selectedSlotsForDay.length === 0 && (
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-xs bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-md border border-amber-200 dark:border-amber-900/50">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>No slots are enabled for this day. Users will not be able to book.</span>
                        </div>
                      )}

                      {/* Slot Chips Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-2.5">
                        {allPossibleSlots.map((slot) => {
                          const isActive = selectedSlotsForDay.includes(slot);
                          const isBooked = getIsBooked(dateStr, slot);

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => !isBooked && toggleTimeSlot(dateStr, slot)}
                              disabled={isBooked}
                              className={cn(
                                "py-2.5 px-3 rounded-md text-xs md:text-sm font-semibold border-2 transition-all duration-150 flex items-center justify-center relative",
                                isBooked
                                  ? "border-red-200 bg-red-50/60 text-red-500 cursor-not-allowed dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 shadow-none"
                                  : isActive
                                    ? "border-[#1BAE70] bg-[#1BAE70]/10 text-[#1BAE70] dark:bg-[#1BAE70]/20 shadow-xs font-bold hover:bg-[#1BAE70]/15"
                                    : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-zinc-700 hover:text-gray-600 dark:hover:text-gray-300"
                              )}
                            >
                              {isBooked ? (
                                <div className="flex flex-col items-center leading-tight">
                                  <span>{formatTimeDisplay(slot)}</span>
                                  <span className="text-[9px] uppercase tracking-wider text-red-500 font-bold mt-0.5">Booked</span>
                                </div>
                              ) : (
                                formatTimeDisplay(slot)
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Publishing Action Bar */}
          {sortedSelectedDates.length > 0 && (
            <div className="sticky bottom-4 z-10 flex items-center justify-between p-3.5 md:p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-md shadow-xl">
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {sortedSelectedDates.length} Date(s) Scheduled
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Timezone: {timezone}
                </span>
              </div>

              <Button
                size="lg"
                onClick={handleSaveAvailability}
                className="w-full sm:w-auto bg-[#1BAE70] hover:bg-[#16965f] text-white px-8 h-11 rounded-md font-bold shadow-md transition-all active:scale-98"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Publish Availability</>
                )}
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Modal for adding custom slot */}
      <Dialog open={isAddSlotModalOpen} onOpenChange={setIsAddSlotModalOpen}>
        <DialogContent className="sm:max-w-md rounded-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1BAE70]" />
              Add Custom Time Slot
            </DialogTitle>
            <DialogDescription>
              Enter a custom start time for {targetDateForSlot} in 24-hour format (e.g., 08:00, 11:15, 17:30).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="slotTime" className="text-sm font-semibold">Time (HH:mm)</Label>
              <Input
                id="slotTime"
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="rounded-md h-11"
              />
              <p className="text-xs text-gray-500">
                Display Preview: <strong className="text-gray-800 dark:text-gray-200">{formatTimeDisplay(newSlotTime)}</strong>
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsAddSlotModalOpen(false)} className="rounded-md">
              Cancel
            </Button>
            <Button onClick={handleAddCustomSlot} className="bg-[#1BAE70] hover:bg-[#16965f] text-white rounded-md">
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}