import { useState } from "react";
import { format, startOfToday } from "date-fns";
import { Calendar } from "./calendar";
import "./date-range-picker.css";

const toInputDate = (value) => (value ? format(value, "yyyy-MM-dd") : "");

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const checkIn = value.checkIn ? new Date(`${value.checkIn}T00:00:00`) : undefined;
  const checkOut = value.checkOut
    ? new Date(`${value.checkOut}T00:00:00`)
    : undefined;
  const selected = checkIn
    ? { from: checkIn, to: checkOut }
    : undefined;

  const chooseDate = (range) => {
    onChange({
      checkIn: toInputDate(range?.from),
      checkOut: toInputDate(range?.to),
    });
  };

  return (
    <div className="date-range-picker">
      <button
        type="button"
        className="date-range-picker__trigger"
        onClick={() => setOpen((current) => !current)}
      >
        {checkIn ? format(checkIn, "MMM d, yyyy") : "Check-in"}{" "}
        <span>→</span>{" "}
        {checkOut ? format(checkOut, "MMM d, yyyy") : "Check-out"}
      </button>
      {open && (
        <div className="date-range-picker__panel">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={chooseDate}
            disabled={{ before: startOfToday() }}
            numberOfMonths={1}
          />
          <button
            type="button"
            className="date-range-picker__done"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
