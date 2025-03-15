import * as React from "react";

export function Avatar({ src, alt, fallback }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
      {src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : <span>{fallback}</span>}
    </div>
  );
}
