import React, { useState } from "react";
import { X, Ruler, ChevronLeft, ChevronRight, User, Users } from "lucide-react";

const MeasurementsModal = ({
  showMeasurementModal,
  handleCloseMeasurementModal,
  measurements = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!showMeasurementModal || !measurements || measurements.length === 0) {
    return null;
  }

  const currentMeasurement = measurements[currentIndex];
  const hasMultipleMeasurements = measurements.length > 1;

  const navigateToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % measurements.length);
  };

  const navigateToPrevious = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + measurements.length) % measurements.length,
    );
  };

  const navigateToIndex = (index) => {
    setCurrentIndex(index);
  };

  const formatCustomerName = (customerName) => {
    if (!customerName) return `Customer ${currentIndex + 1}`;
    return customerName;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden relative border border-purple-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler className="w-7 h-7 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Measurement Details
                </h2>
                {hasMultipleMeasurements && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCustomerName(currentMeasurement?.customer_name)}
                    <span className="text-purple-600 ml-2">
                      ({currentIndex + 1} of {measurements.length})
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Navigation Controls */}
              {hasMultipleMeasurements && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={navigateToPrevious}
                    className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    disabled={measurements.length <= 1}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={navigateToNext}
                    className="p-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors disabled:opacity-50"
                    disabled={measurements.length <= 1}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

              <button
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                onClick={handleCloseMeasurementModal}
                aria-label="Close"
              >
                <X size={28} />
              </button>
            </div>
          </div>

          {/* Customer Navigation Pills */}
          {hasMultipleMeasurements && (
            <div className="mt-4 flex flex-wrap gap-2">
              {measurements.map((measurement, index) => (
                <button
                  key={index}
                  onClick={() => navigateToIndex(index)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    index === currentIndex
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  <User size={12} />
                  {formatCustomerName(measurement?.customer_name)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upper Body */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-purple-700 mb-4 text-base flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                Upper Body
              </h4>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Bust Circumference
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.bust_circumference ?? "--"}{" "}
                    {currentMeasurement?.upper_body?.bust_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Shoulder Width
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.shoulder_width ?? "--"}{" "}
                    {currentMeasurement?.upper_body?.shoulder_width_unit ?? ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Armhole Circumference
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.armhole_circumference ??
                      "--"}{" "}
                    {currentMeasurement?.upper_body
                      ?.armhole_circumference_unit ?? ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Sleeve Length
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.sleeve_length ?? "--"}{" "}
                    {currentMeasurement?.upper_body?.sleeve_length_unit ?? ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Bicep Circumference
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.bicep_circumference ??
                      "--"}{" "}
                    {currentMeasurement?.upper_body?.bicep_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Wrist Circumference
                  </span>
                  <span className="font-semibold text-purple-700 text-right">
                    {currentMeasurement?.upper_body?.wrist_circumference ??
                      "--"}{" "}
                    {currentMeasurement?.upper_body?.wrist_circumference_unit ??
                      ""}
                  </span>
                </li>
              </ul>
            </div>

            {/* Lower Body */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-blue-700 mb-4 text-base flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                Lower Body
              </h4>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Waist Circumference
                  </span>
                  <span className="font-semibold text-blue-700 text-right">
                    {currentMeasurement?.lower_body?.waist_circumference ??
                      "--"}{" "}
                    {currentMeasurement?.lower_body?.waist_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Hip Circumference
                  </span>
                  <span className="font-semibold text-blue-700 text-right">
                    {currentMeasurement?.lower_body?.hip_circumference ?? "--"}{" "}
                    {currentMeasurement?.lower_body?.hip_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Thigh Circumference
                  </span>
                  <span className="font-semibold text-blue-700 text-right">
                    {currentMeasurement?.lower_body?.thigh_circumference ??
                      "--"}{" "}
                    {currentMeasurement?.lower_body?.thigh_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Knee Circumference
                  </span>
                  <span className="font-semibold text-blue-700 text-right">
                    {currentMeasurement?.lower_body?.knee_circumference ?? "--"}{" "}
                    {currentMeasurement?.lower_body?.knee_circumference_unit ??
                      ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Trouser Length
                  </span>
                  <span className="font-semibold text-blue-700 text-right">
                    {currentMeasurement?.lower_body?.trouser_length ?? "--"}{" "}
                    {currentMeasurement?.lower_body?.trouser_length_unit ?? ""}
                  </span>
                </li>
              </ul>
            </div>

            {/* Full Body */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-amber-700 mb-4 text-base flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-amber-400 rounded-full"></span>
                Full Body
              </h4>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Height
                  </span>
                  <span className="font-semibold text-amber-700 text-right">
                    {currentMeasurement?.full_body?.height ?? "--"}{" "}
                    {currentMeasurement?.full_body?.height_unit ?? ""}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm min-h-[1.25rem]">
                  <span className="text-gray-700 pr-2 flex-shrink-0">
                    Dress/Gown Length
                  </span>
                  <span className="font-semibold text-amber-700 text-right">
                    {currentMeasurement?.full_body?.dress_length ?? "--"}{" "}
                    {currentMeasurement?.full_body?.dress_length_unit ?? ""}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Summary Info */}
          {currentMeasurement && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-700">
                  Customer Information
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatCustomerName(currentMeasurement.customer_name)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Measurements:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {measurements.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-purple-100 p-6">
          <div className="flex justify-between items-center">
            {hasMultipleMeasurements && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Use arrows or click customer names to navigate
                </span>
              </div>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                onClick={handleCloseMeasurementModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementsModal;
