import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function CalendarWidget() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  return (
    <div className="bg-white lg:flex md:hidden p-4 rounded-md">
      <DayPicker mode="single" selected={selectedDate} onSelect={setSelectedDate} />
    </div>
  );
}