import React from "react";

const PaginationButton = ({ 
  onClick, 
  disabled, 
  children, 
  variant = "default" 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    default: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500",
    outline: disabled
      ? "border border-gray-300 text-gray-400 cursor-not-allowed"
      : "border border-purple-500 text-purple-500 hover:bg-purple-50 focus:ring-purple-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};

export default PaginationButton;
