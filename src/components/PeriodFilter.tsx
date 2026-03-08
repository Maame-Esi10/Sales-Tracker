import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type PeriodValue = "Today" | "Week" | "Month" | "All Time" | "Custom";

interface PeriodFilterProps {
  period: string;
  onPeriodChange: (period: PeriodValue) => void;
  customDate?: Date;
  onCustomDateChange?: (date: Date | undefined) => void;
}

const PeriodFilter = ({ period, onPeriodChange, customDate, onCustomDateChange }: PeriodFilterProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {(["Today", "Week", "Month", "All Time"] as const).map((p) => (
        <button
          key={p}
          onClick={() => onPeriodChange(p)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            period === p ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {p}
        </button>
      ))}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              period === "Custom" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <CalendarIcon size={12} />
            {period === "Custom" && customDate ? format(customDate, "dd MMM yyyy") : "Pick Date"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={customDate}
            onSelect={(date) => {
              onCustomDateChange?.(date);
              if (date) {
                onPeriodChange("Custom");
              }
              setCalendarOpen(false);
            }}
            disabled={(date) => date > new Date()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PeriodFilter;
