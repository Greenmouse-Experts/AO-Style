import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  alternative_phone: "",
  password: "",
  password_confirmation: "",
  referral_source: "",
  business_name: "",
  business_type: "",
  location: "",
  business_registration_number: "",
};

export default function SignUpAsLogisticsAgent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agentType, setAgentType] = useState("individual");

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      registerMutate(
        agentType === "individual"
          ? {
              ...val,
              role: "logistics-agent",
              allowOtp: true,
              location: val.location,
              location: val.location,
            }
          : {
              ...val,
              role: "logistics-agent",
              allowOtp: true,
              location: val.location,
              business: {
                business_name: val.business_name,
                business_type: val.business_type,
                business_registration_number: val.business_registration_number,
                location: val.location,
              },
            }
      );
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 h-screen relative">
        <img
          src="https://res.cloudinary.com/diqa0sakr/image/upload/v1743763031/image_ov4nhd.jpg"
          alt="Sign In"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-black/70 to-transparent w-full">
          <h2 className="text-xl font-medium">
            Earn More with Every Delivery – Join Our <br /> Logistics Network
            Today!
          </h2>
          <p className="text-sm mt-2">
            Welcome to OAStyles, a platform that simplifies tailoring <br />{" "}
            processes; from buying materials to finding a tailor for you
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 h-screen overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                alt="OA Styles"
                className="h-20 w-auto mx-auto"
              />
            </Link>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Sign Up As A{" "}
              <span className="text-[#2B21E5]">Logistics Agent</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Fill the form become a delivery agent for customers
            </p>
          </div>

          {/* Agent Type Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                agentType === "individual"
                  ? "bg-gradient text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setAgentType("individual")}
            >
              As Individual Agent
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                agentType === "organization"
                  ? "bg-gradient text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setAgentType("organization")}
            >
              As Organisation
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                name={"name"}
                required
                value={values.name}
                onChange={handleChange}
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
                name={"phone"}
                required
                value={values.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Alternative Phone Number{" "}
                <small className="text-[#CCCCCC]">(Optional)</small>
              </label>
              <input
                type="tel"
                name={"alternative_phone"}
                value={values.alternative_phone}
                onChange={handleChange}
                placeholder="Alternative Phone Number"
                className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="Enter your home address"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                required
                name={"location"}
                value={values.location}
                onChange={handleChange}
              />
            </div>

            {agentType === "organization" && (
              <div>
                <label className="block text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  name={"business_name"}
                  value={values.business_name}
                  onChange={handleChange}
                  placeholder="Enter your organization name"
                  className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name={"email"}
                required
                value={values.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name={"password"}
                  required
                  value={values.password}
                  onChange={handleChange}
                  className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  name={"password_confirmation"}
                  required
                  value={values.password_confirmation}
                  onChange={handleChange}
                  className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-5 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <label className="block text-gray-700 mb-3">
              {" "}
              How did you hear about us?
            </label>
            <select
              name={"referral_source"}
              value={values.referral_source}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
            >
              <option value="" disabled selected>
                Select option
              </option>
              <option value="Social Media">Social Media</option>
              <option value="Radio/TV Ads">Radio / TV Ads</option>
              <option value="Blogs/Articles">Blogs/Articles</option>
              <option value="Personal Referral">Personal Referral</option>
              <option value="Just got here">Just got here</option>
              <option value="Other">Other</option>
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient cursoor-pointer text-white py-3 rounded-lg font-medium mt-4 transition-colors"
            >
              {isPending ? "Please wait..." : "Sign Up As A Logistics Agent"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
