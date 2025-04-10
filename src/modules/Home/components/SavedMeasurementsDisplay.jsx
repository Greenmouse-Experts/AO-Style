import { useState } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Link } from "react-router-dom";

export default function SavedMeasurementsDisplay({ onAddNewMeasurement }) {
  const [measurements, setMeasurements] = useState([
    {
      id: 1,
      name: "Chukka",
      measurements: [
        {
          section: "UPPER BODY", items: [
            { name: "Bust Circumference", value: "12 m" },
            { name: "Armhole Circumference", value: "12 m" },
            { name: "Bicep Circumference", value: "12 m" },
            { name: "Shoulder Width", value: "12 m" },
            { name: "Sleeve Length", value: "12 m" },
            { name: "Waist Circumference", value: "12 m" },
          ]
        },
        {
          section: "LOWER BODY", items: [
            { name: "Waist Circumference", value: "12 m" },
            { name: "Thigh Circumference", value: "12 m" },
            { name: "Trouser Length", value: "12 m" },
            { name: "Hip Circumference", value: "12 m" },
            { name: "Knee Circumference", value: "12 m" },
          ]
        },
        {
          section: "FULL BODY", items: [
            { name: "Full Height", value: "12 m" },
            { name: "Dress/Gown Length", value: "12 m" },
          ]
        }
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);

  const handleAddNewMeasurement = () => {
    if (onAddNewMeasurement) {
      onAddNewMeasurement(); // Navigate back to AStyleDetails
    }
  };

  const openEditModal = (measurement) => {
    setCurrentEdit(measurement);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setCurrentEdit(null);
  };

  return (
    <div className="">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-medium text-purple-500">Your Measurement</h2>
        <div className="mt-2 w-64 h-0.5 bg-purple-500 mx-auto"></div>
      </div>

      {/* Measurement Cards */}
      {measurements.map((measurement) => (
        <div key={measurement.id} className="mb-8 bg-purple-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">{measurement.id} - {measurement.name}</h3>
            <div className="flex gap-2">
              <button className="p-2" onClick={() => openEditModal(measurement)}>
                <Pencil className="w-5 h-5 text-gray-700" />
              </button>
              <button className="p-2">
                <Trash2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Measurement Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {measurement.measurements.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="font-medium text-gray-700 mb-4">{section.section}</h4>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between">
                      <span className="text-gray-800">{item.name} :</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add New Measurement Button */}
      <div
        className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md py-3 px-5 cursor-pointer"
        onClick={handleAddNewMeasurement}
      >
        <div className="bg-purple-500 text-white rounded-full p-1">
          <Plus className="w-4 h-4" />
        </div>
        <span>Add New Measurement</span>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex justify-center">
        <Link to="/aostyle-details">
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-12 rounded-md">
            Submit Measurements
          </button>
        </Link>
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

            <h2 className="text-xl font-semibold mb-4">Edit Measurement: {currentEdit.name}</h2>

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
                  <h4 className="text-md font-medium text-gray-800 mb-2">{section.section}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <label className="block text-sm text-gray-600 mb-1">{item.name}</label>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const updatedMeasurements = [...currentEdit.measurements];
                            updatedMeasurements[sectionIndex].items[itemIndex].value = e.target.value;
                            setCurrentEdit({ ...currentEdit, measurements: updatedMeasurements });
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
                  setMeasurements(prev =>
                    prev.map(m => m.id === currentEdit.id ? currentEdit : m)
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
