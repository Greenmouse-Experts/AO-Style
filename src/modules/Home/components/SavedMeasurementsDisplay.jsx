import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubmitModal from "../components/SubmitModal";
import { useCartStore } from "../../../store/carybinUserCartStore";
import SubmitStyleModal from "./SubmitStyle";
import { generateUniqueId } from "../../../lib/helper";

export default function SavedMeasurementsDisplay({
  onAddNewMeasurement,
  measurementArr,
  removeMeasurementById,
  item,
  styleInfo,
  setCurrMeasurement,
}) {
  const navigate = useNavigate();

  const handleAddNewMeasurement = () => {
    if (onAddNewMeasurement) {
      setCurrMeasurement(null);
      return onAddNewMeasurement();
    }
    navigate("/aostyle-details");
  };

  const [measurements, setMeasurements] = useState(measurementArr);

  console.log(measurements);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEditModal = (measurement) => {
    setCurrentEdit(measurement);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setCurrentEdit(null);
  };

  const addToCart = useCartStore((state) => state.addToCart);

  const id = useMemo(() => generateUniqueId(), []);

  return (
    <div className="">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-medium text-purple-500">
          Your Measurement
        </h2>
        <div className="mt-2 w-64 h-0.5 bg-purple-500 mx-auto"></div>
      </div>

      {/* Measurement Cards */}
      {measurementArr?.map((measurement, id) => (
        <div key={measurement.id} className="mb-8 bg-purple-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">
              {id + 1} - {measurement.customer_name}
            </h3>
            <div className="flex gap-2">
              <button
                className="p-2"
                onClick={() => {
                  setCurrMeasurement(measurement);
                  onAddNewMeasurement();
                }}
              >
                <Pencil className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="p-2 cursor-pointer"
                onClick={() => {
                  removeMeasurementById(measurement.id);
                }}
              >
                <Trash2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Measurement Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-4">Upper Body</h4>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Bust Circumference :</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.bust_circumference}{" "}
                    {measurement?.upper_body?.bust_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Shoulder Width :</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.shoulder_width}{" "}
                    {measurement?.upper_body?.shoulder_width_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Armhole Circumference :</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.armhole_circumference}{" "}
                    {measurement?.upper_body?.armhole_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Sleeve Length :</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.sleeve_length}{" "}
                    {measurement?.upper_body?.sleeve_length_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Bicep Circumference:</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.bicep_circumference}{" "}
                    {measurement?.upper_body?.bicep_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Wrist Circumference :</span>
                  <span className="font-medium">
                    {measurement?.upper_body?.waist_circumference}{" "}
                    {measurement?.upper_body?.waist_circumference_unit}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-4">Lower Body</h4>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Waist Circumference :</span>
                  <span className="font-medium">
                    {measurement?.lower_body?.waist_circumference}{" "}
                    {measurement?.lower_body?.waist_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Hip Circumference :</span>
                  <span className="font-medium">
                    {measurement?.lower_body?.hip_circumference}{" "}
                    {measurement?.lower_body?.hip_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Thigh Circumference :</span>
                  <span className="font-medium">
                    {measurement?.lower_body?.thigh_circumference}{" "}
                    {measurement?.lower_body?.thigh_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Knee Circumference :</span>
                  <span className="font-medium">
                    {measurement?.lower_body?.knee_circumference}{" "}
                    {measurement?.lower_body?.knee_circumference_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">
                    Trouser Length (Waist to Ankle) :
                  </span>
                  <span className="font-medium">
                    {measurement?.lower_body?.trouser_length}{" "}
                    {measurement?.lower_body?.trouser_length_unit}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-4">Full Body</h4>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Height :</span>
                  <span className="font-medium">
                    {measurement?.full_body?.height}{" "}
                    {measurement?.full_body?.height_unit}
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-800">Dress/Gown Length :</span>
                  <span className="font-medium">
                    {measurement?.full_body?.dress_length}{" "}
                    {measurement?.full_body?.dress_length_unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add New Measurement Button */}
      <div
        className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md py-3 px-5 cursor-pointer"
        onClick={handleAddNewMeasurement}
      >
        <div className="bg-purple-500 text-white w-6 h-6 flex items-center justify-center rounded-full">
          <Plus className="w-4 h-4" />
        </div>
        <span>Add New Measurement</span>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex justify-center">
        <SubmitStyleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <button
          className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white font-medium py-3 px-12 rounded-md"
          onClick={() => {
            if (item) {
              setIsModalOpen(true);
              addToCart(
                {
                  product: {
                    style: {
                      id: styleInfo?.id,
                      name: styleInfo?.name,
                      type: "STYLE",
                      price_at_time: styleInfo?.price,
                      image: styleInfo?.style?.photos[0],
                      measurement: measurementArr,
                    },
                  },
                },
                item
              );
              localStorage.removeItem("cart_id");
            } else {
              addToCart(
                {
                  product: {
                    style: {
                      id: styleInfo?.id,
                      name: styleInfo?.name,
                      type: "STYLE",
                      price_at_time: styleInfo?.price,
                      image: styleInfo?.style?.photos[0],
                      measurement: measurementArr,
                    },
                  },
                },
                id
              );

              navigate("/shop");
              localStorage.setItem("cart_id", id);
            }
          }} // Opens the modal
        >
          Submit Measurements
        </button>
      </div>

      {/* Edit Modal */}
      {editModalVisible && currentEdit && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full mt-10 max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={closeEditModal}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Edit Measurement: {currentEdit.name}
            </h2>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-700">Name</label>
              <input
                type="text"
                value={currentEdit.name}
                onChange={(e) =>
                  setCurrentEdit({ ...currentEdit, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg outline-none"
              />
            </div>

            {/* Measurement Inputs */}
            <div className="space-y-6">
              {currentEdit.measurements.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    {section.section}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <label className="block text-sm text-gray-600 mb-1">
                          {item.name}
                        </label>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const updatedMeasurements = [
                              ...currentEdit.measurements,
                            ];
                            updatedMeasurements[sectionIndex].items[
                              itemIndex
                            ].value = e.target.value;
                            setCurrentEdit({
                              ...currentEdit,
                              measurements: updatedMeasurements,
                            });
                          }}
                          className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="bg-gradient text-white px-4 py-2"
                onClick={() => {
                  setMeasurements((prev) =>
                    prev.map((m) => (m.id === currentEdit.id ? currentEdit : m))
                  );
                  closeEditModal();
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
