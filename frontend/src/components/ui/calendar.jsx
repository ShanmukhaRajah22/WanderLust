import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import "./calendar.css";

export function Calendar({ className = "", ...props }) {
  return <DayPicker className={`ui-calendar ${className}`} {...props} />;
}
