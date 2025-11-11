import React from "react";
import { FaTimes } from "react-icons/fa";

const ColorSelector = ({
  numberOfColors,
  setNumberOfColors,
  selectedColors,
  setSelectedColors,
  onColorsChange,
  maxColors = 10,
  label = "Available Colors",
  required = false,
  error = null,
}) => {
  const handleColorCountChange = (count) => {
    const newCount = Math.max(1, Math.min(maxColors, count));
    setNumberOfColors(newCount);

    // Update selectedColors array
    const newColors = Array(newCount)
      .fill(null)
      .map((_, index) => selectedColors[index] || "#000000");
    setSelectedColors(newColors);

    // Notify parent component
    if (onColorsChange) {
      onColorsChange(newColors);
    }
  };

  const handleColorChange = (index, color) => {
    const newColors = [...selectedColors];
    newColors[index] = color;
    setSelectedColors(newColors);

    // Notify parent component
    if (onColorsChange) {
      onColorsChange(newColors);
    }
  };

  const handleRemoveColor = (indexToRemove) => {
    if (numberOfColors > 1) {
      const newCount = numberOfColors - 1;
      setNumberOfColors(newCount);

      const newColors = selectedColors.filter((_, i) => i !== indexToRemove);
      setSelectedColors(newColors);

      // Notify parent component
      if (onColorsChange) {
        onColorsChange(newColors);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Color Count Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          How many colors do you want to add?
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="1"
            max={maxColors}
            value={numberOfColors}
            onChange={(e) =>
              handleColorCountChange(parseInt(e.target.value) || 1)
            }
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-500">
            (Maximum {maxColors} colors)
          </span>
        </div>
      </div>

      {/* Color Selection Grid */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-3">
          Click on each box to select colors:
        </label>

        {/* Responsive Grid Container */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-w-fit mx-auto">
            {Array(numberOfColors)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative group">
                    <input
                      type="color"
                      value={selectedColors[index] || "#000000"}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      title={`Select color ${index + 1}`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg border border-gray-200">
                      <span className="text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 text-center font-medium">
                    Color {index + 1}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Selected Colors Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-3">
          Selected Colors Preview:
        </label>
        <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[60px] flex items-center">
          {selectedColors.length > 0 ? (
            <div className="flex flex-wrap gap-2 w-full">
              {selectedColors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                >
                  <div
                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 select-all">
                    {color.toUpperCase()}
                  </span>
                  {numberOfColors > 1 && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveColor(index)}
                      title="Remove this color"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">No colors selected</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}

      {/* Usage Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <p className="text-blue-800 text-xs flex items-start">
          <span className="mr-2 mt-0.5">💡</span>
          <span>
            <strong>Tip:</strong> Click on any color box to open the color picker.
            You can also type hex values directly or use the eyedropper tool in most browsers.
          </span>
        </p>
      </div>
    </div>
  );
};

export default ColorSelector;
