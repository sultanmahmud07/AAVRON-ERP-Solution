export const formatDate = (date?: string | Date): string => {
      if (!date) return "N/A";
      
      // If it's a string, convert it to a Date object first, otherwise use it directly
      const dateObj = typeof date === "string" ? new Date(date) : date;
      
      return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
      });
};