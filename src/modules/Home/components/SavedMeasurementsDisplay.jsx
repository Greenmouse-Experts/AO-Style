import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function SavedMeasurementsDisplay() {
  const [measurements, setMeasurements] = useState([
    {
      id: 1,
      name: "Chukka",
      measurements: [
        { section: "UPPER BODY", items: [
          { name: "Bust Circumference", value: "12 m" },
          { name: "Armhole Circumference", value: "12 m" },
          { name: "Bicep Circumference", value: "12 m" },
          { name: "Shoulder Width", value: "12 m" },
          { name: "Sleeve Length", value: "12 m" },
          { name: "Waist Circumference", value: "12 m" },
        ]},
        { section: "UPPER BODY", items: [
          { name: "Waist Circumference", value: "12 m" },
          { name: "Thigh Circumference", value: "12 m" },
          { name: "Trouser Length", value: "12 m" },
          { name: "Hip Circumference", value: "12 m" },
          { name: "Knee Circumference", value: "12 m" },
        ]},
        { section: "UPPER BODY", items: [
          { name: "Full Height", value: "12 m" },
          { name: "Dress/Gown Length", value: "12 m" },
        ]}
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeasurementName, setNewMeasurementName] = useState("");

  const handleAddNewMeasurement = () => {
    if (newMeasurementName.trim()) {
      const newId = measurements.length > 0 ? Math.max(...measurements.map(m => m.id)) + 1 : 1;
      
      setMeasurements([...measurements, {
        id: newId,
        name: newMeasurementName,
        measurements: [
          { section: "UPPER BODY", items: [] }
        ]
      }]);
      
      setNewMeasurementName("");
      setShowAddForm(false);
    }
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
              <button className="p-2">
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
      {!showAddForm ? (
        <div 
          className="inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md py-3 px-5 cursor-pointer"
          onClick={() => setShowAddForm(true)}
        >
          <div className="bg-purple-500 text-white rounded-full p-1">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add New Measurement</span>
        </div>
      ) : (
        <div className="bg-purple-100 p-4 rounded-md">
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Enter measurement name" 
              className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              value={newMeasurementName}
              onChange={(e) => setNewMeasurementName(e.target.value)}
            />
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
              onClick={handleAddNewMeasurement}
            >
              Add
            </button>
            <button 
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-10 flex justify-center">
        <button className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-12 rounded-md">
          Submit Measurements
        </button>
      </div>
    </div>
  );
}