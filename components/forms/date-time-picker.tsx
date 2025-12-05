"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

interface DateTimePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function DateTimePicker({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = "Select date & time",
}: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : null;
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isoString = date.toISOString().slice(0, 16);
      onChange(name, isoString);
    } else {
      onChange(name, "");
    }
  };

  // Set time range to full day (9 AM to 9 PM for business hours)
  const minTime = new Date();
  minTime.setHours(9, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(21, 0, 0, 0);

  return (
    <div className="relative">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={minDate}
        minTime={minTime}
        maxTime={maxTime}
        required={required}
        placeholderText={placeholder}
        calendarClassName="dark-theme-datepicker"
        wrapperClassName="w-full"
        popperClassName="datepicker-popper"
        customInput={
          <div className="relative group">
            <input
              type="text"
              readOnly
              value={
                selectedDate
                  ? selectedDate.toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : ""
              }
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-dark-card border border-neon-blue/30 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-200 hover:border-neon-blue/50 text-gray-900 dark:text-white placeholder-gray-500 pr-12 cursor-pointer group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="w-5 h-5 text-neon-blue dark:text-neon-blue text-neon-light-blue group-hover:text-neon-cyan dark:group-hover:text-neon-cyan group-hover:text-neon-light-blue transition-colors" />
            </div>
          </div>
        }
      />
    </div>
  );
}

