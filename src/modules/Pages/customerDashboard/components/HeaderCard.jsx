import React from "react";
import { useCarybinUserStore } from "../../../../store/carybinUserStore";

export default function HeaderCard() {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const { carybinUser } = useCarybinUserStore();

  return (
    <div
      className="relative text-white p-4 lg:p-6 rounded-xl flex bg-gradient flex-col space-y-4 min-w-0 w-full"
      style={{
        height: "200px",
        minHeight: "200px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="bg-white/20 text-white px-4 lg:px-6 py-2 rounded-md flex items-center w-fit text-sm space-x-2">
        <img
          src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980774/AoStyle/uis_calender_vabz81.png"
          alt="Calendar"
          className="w-4 h-4 flex-shrink-0"
        />
        <span className="whitespace-nowrap">{today}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl lg:text-2xl font-medium leading-tight">
          Welcome back, {carybinUser?.name} 👋
        </h2>
        <p className="text-sm text-white/80 mt-2">Have a great day!</p>
      </div>
    </div>
  );
}
