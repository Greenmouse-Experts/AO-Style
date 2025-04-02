import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SecuritySettings = () => {
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="">
      <h2 className="text-xl font-medium mb-4">Security Settings</h2>

      {/* Old Password */}
      <div className="mb-4 relative">
        <label className="block text-gray-700 mb-4">Old Password</label>
        <input
          type={showPassword.old ? "text" : "password"}
          placeholder="Enter your old password"
          required
          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
        />
        <span
          className="absolute right-4 top-14 cursor-pointer text-gray-500"
          onClick={() => togglePassword("old")}
        >
          {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* New Password */}
      <div className="mb-4 relative">
        <label className="block text-gray-700 mb-4">New Password</label>
        <input
          type={showPassword.new ? "text" : "password"}
          placeholder="Enter your new password"
          required
          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
        />
        <span
          className="absolute right-4 top-14 cursor-pointer text-gray-500"
          onClick={() => togglePassword("new")}
        >
          {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* Confirm New Password */}
      <div className="mb-6 relative">
        <label className="block text-gray-700 mb-4">Confirm New Password</label>
        <input
          type={showPassword.confirm ? "text" : "password"}
          placeholder="Re-enter your new password"
          required
          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
        />
        <span
          className="absolute right-4 top-14 cursor-pointer text-gray-500"
          onClick={() => togglePassword("confirm")}
        >
          {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
      </div>

      {/* Update Password Button */}
      <button className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient text-white">
        Update Password
      </button>
    </div>
  );
};

export default SecuritySettings;
