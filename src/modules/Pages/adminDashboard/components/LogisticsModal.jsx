import { useState } from "react";

const AddLogisticsAgentModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
            <h2 className="text-lg font-semibold">Add a New Logistics Agent</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          {/* <div className="flex space-x-2 mb-4">
            <button
              className={`flex-1 py-2 rounded-md ${
                activeTab === "individual"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveTab("individual")}
            >
              As Individual Agent
            </button>
            <button
              className={`flex-1 py-2 rounded-md ${
                activeTab === "organisation"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveTab("organisation")}
            >
              As Organisation
            </button>
          </div> */}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                name={"name"}
                required
                // value={values.name}
                // onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                placeholder="Email Address"
              />
            </div>

            {/* <div>
              <label className="text-sm">Phone Number</label>
              <div className="flex gap-3 mt-4">
                <div className="flex items-center p-2 border border-gray-300 rounded-md">
                  🇳🇬 +234
                </div>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="flex-1 p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Address</label>
              <input
                type="text"
                placeholder="Enter your home address"
                className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm">Service Areas</label>
              <select className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg">
                <option>Choose your service area</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                />
                <button
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-6 text-gray-500"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="w-full p-3 mt-3 border border-[#CCCCCC] outline-none rounded-lg"
                />
                <button
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-2 top-6 text-gray-500"
                >
                  {showConfirmPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div> */}

            {/* Submit Button */}
            <button className="w-full py-3 mt-4 bg-gradient text-white rounded-md">
              Sign Up As A Logistics Agent
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default AddLogisticsAgentModal;
