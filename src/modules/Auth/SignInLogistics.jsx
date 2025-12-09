import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";
import useAcceptInvite from "./hooks/useAcceptInvite";
import useGetInviteInfo from "../../hooks/invitation/useGetInviteInfo";
import useToast from "../../hooks/useToast";
import { countryCodes } from "../../constant";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import { usePlacesWidget } from "react-google-autocomplete";
import NotFoundPage from "../../components/ui/NotFoundPage";

export default function SignUpAsLogisticsAgent() {
  const { toastError } = useToast();
  
  // Check for invitation token
  const token = new URLSearchParams(window.location.search).get("token");
  
  const {
    data: inviteData,
    isPending: inviteInfoIsPending,
    error: inviteError,
    isError: inviteIsError,
  } = useGetInviteInfo(token);

  const initialValues = {
    name: inviteData?.name ?? "",
    email: inviteData?.email ?? "",
    phone: "",
    alternative_phone: "",
    password: "",
    password_confirmation: "",
    referral_source: "",
    business_name: "",
    business_type: "",
    location: "",
    latitude: "",
    longitude: "",
    state: "",
    phoneCode: "+234",
  };

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agentType, setAgentType] = useState("individual");

  const {
    handleSubmit,
    touched,
    errors,
    values,
    setFieldValue,
    handleChange,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      const phoneno = `${val.phone}`;
      const altno = `${val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }
      console.log("📤 Logistics Agent - Submitting with state:", val.state);
      
      const payload = agentType === "individual"
        ? {
            ...val,
            role: "logistics-agent",
            phone: phoneno,
            alternative_phone:
              val?.alternative_phone === "" ? undefined : altno,
            location: val.location,
            state: val.state || "",
            coordinates: {
              longitude: val.longitude,
              latitude: val.latitude,
            },
          }
        : {
            ...val,
            role: "logistics-agent",
            phone: phoneno,
            alternative_phone:
              val?.alternative_phone === "" ? undefined : altno,
            location: val.location,
            state: val.state || "",
            coordinates: {
              longitude: val.longitude,
              latitude: val.latitude,
            },
            business: {
              business_name: val.business_name,
              business_type: val.business_type,
              business_registration_number: val.business_registration_number,
              location: val.location,
              state: val.state || "",
            },
          };

      // If there's a token, use acceptInvite, otherwise use register
      if (token) {
        acceptInviteMutate({
          ...payload,
          token,
        });
      } else {
        registerMutate({
          ...payload,
          allowOtp: true,
        });
      }
    },
  });

  // Get user's current location automatically when signing up via invite
  useEffect(() => {
    if (token && navigator.geolocation) {
      // Only get location if coordinates are not already set
      if (!values.latitude || !values.longitude) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 Auto-detected coordinates for invite signup:", { latitude, longitude });
            setFieldValue("latitude", latitude.toString());
            setFieldValue("longitude", longitude.toString());
          },
          (error) => {
            console.warn("⚠️ Could not get user location:", error.message);
            // Don't show error to user, they can still fill location manually
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    }
  }, [token, setFieldValue, values.latitude, values.longitude]);

  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      console.log("🗺️ Logistics Agent - Google Place Selected:", place);
      
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      
      // Extract state from address_components
      let state = "";
      if (place.address_components) {
        const stateComponent = place.address_components.find(
          (component) =>
            component.types.includes("administrative_area_level_1")
        );
        state = stateComponent ? stateComponent.long_name : "";
      }
      
      console.log("📍 Logistics Agent - Extracted data:", {
        lat,
        lng,
        state,
        formatted_address: place.formatted_address,
      });

      setFieldValue("location", place.formatted_address);
      setFieldValue("latitude", lat ? lat.toString() : "");
      setFieldValue("longitude", lng ? lng.toString() : "");
      setFieldValue("state", state);
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);
  const { isPending: acceptInviteIsPending, acceptInviteMutate } = useAcceptInvite();
  
  // Show error if invite token is invalid
  if (token && inviteIsError) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 h-screen relative">
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
            Welcome to Carybin, a platform that simplifies tailoring <br />{" "}
            processes; from buying materials to finding a tailor for you
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 md:w-1/1 h-screen overflow-y-auto p-4 sm:p-8">
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
            <h2 className="text-2xl lg:text-left md:text-center font-semibold text-gray-800 mb-2">
              Sign Up As A{" "}
              <span className="text-[#2B21E5]">Logistics Agent</span>
            </h2>
            <p className="text-gray-500 lg:text-left md:text-center text-sm mt-1">
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

            <div className="mb-3">
              <label className="block text-black mb-2">Phone Number</label>

              <div className="flex flex-col md:flex-row md:items-center gap-2 ">
                {/* Country Code Dropdown */}
                {/* <Select
                  options={options}
                  name="phoneCode"
                  value={options.find((opt) => opt.value === values.phoneCode)}
                  onChange={(selectedOption) =>
                    setFieldValue("phoneCode", selectedOption.value)
                  }
                  placeholder="Select"
                  className="p-2 md:w-28 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                      backgroundColor: "#fff",
                      "&:hover": {
                        border: "none",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                /> */}
                {/* Phone Input */}
                {/* <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="flex-1 p-4 border border-[#CCCCCC] outline-none rounded-lg"
                  value={values.phone}
                  onChange={handleChange}
                  required
                /> */}
                <PhoneInput
                  country={"ng"}
                  value={values.phone}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                  onChange={(value) => {
                    // Ensure `+` is included and validate
                    if (!value.startsWith("+")) {
                      value = "+" + value;
                    }
                    setFieldValue("phone", value);
                  }}
                  containerClass="w-full disabled:bg-gray-100"
                  dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                  buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                  inputClass="!w-full px-4 font-sans disabled:bg-gray-100  !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-black mb-2">
                Alternative Phone Number{" "}
                <small className="text-[#CCCCCC]">(Optional)</small>
              </label>

              <div className="flex flex-col md:flex-row md:items-center gap-2 ">
                {/* Country Code Dropdown */}
                {/* <Select
                  options={options}
                  name="altCode"
                  value={options.find((opt) => opt.value === values.altCode)}
                  onChange={(selectedOption) =>
                    setFieldValue("altCode", selectedOption.value)
                  }
                  placeholder="Select"
                  className="p-2 md:w-34 border border-[#CCCCCC] outline-none rounded-lg text-gray-500"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: "none",
                      boxShadow: "none",
                      outline: "none",
                      backgroundColor: "#fff",
                      "&:hover": {
                        border: "none",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                /> */}
                {/* <input
                  type="tel"
                  name={"alternative_phone"}
                  value={values.alternative_phone}
                  onChange={handleChange}
                  placeholder="Alternative Phone Number"
                  className="w-full p-4 border border-[#CCCCCC] outline-none  rounded-lg"
                /> */}

                <PhoneInput
                  country={"ng"}
                  value={values.alternative_phone}
                  inputProps={{
                    name: "alternative_phone",
                    required: true,
                  }}
                  onChange={(value) => {
                    // Ensure `+` is included and validate
                    if (!value.startsWith("+")) {
                      value = "+" + value;
                    }
                    setFieldValue("alternative_phone", value);
                  }}
                  containerClass="w-full disabled:bg-gray-100"
                  dropdownClass="flex flex-col gap-2 text-black disabled:bg-gray-100"
                  buttonClass="bg-gray-100 !border !border-gray-100 hover:!bg-gray-100 disabled:bg-gray-100"
                  inputClass="!w-full px-4 font-sans disabled:bg-gray-100  !h-[54px] !py-4 border border-gray-300 !rounded-md focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Address</label>
              <input
                type="text"
                ref={ref}
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                placeholder="Enter full detailed address"
                required
                name="location"
                onChange={(e) => {
                  setFieldValue("location", e.currentTarget.value);
                  setFieldValue("latitude", "");
                  setFieldValue("longitude", "");
                  setFieldValue("state", "");
                }}
                value={values.location}
              />
              {values.state && (
                <div className="text-xs text-green-600 mt-1">
                  ✅ State detected: {values.state}
                </div>
              )}
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

            {agentType === "organization" && (
              <div>
                <label className="block text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  name={"business_type"}
                  value={values.business_type}
                  onChange={handleChange}
                  className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg text-gray-500"
                  required
                >
                  <option value="" disabled selected>
                    Select your business type
                  </option>
                  <option value="sole-proprietorship">
                    Sole Proprietorship
                  </option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">Limited Liability Company (LLC)</option>
                  <option value="corporation">
                    Corporation (C Corp & S Corp)
                  </option>
                  <option value="nonprofit">Nonprofit Organization</option>
                  <option value="franchise">Franchise</option>
                </select>
              </div>
            )}

            {agentType === "organization" && (
              <div className="w-full">
                <label className="block text-gray-600 font-medium mb-4">
                  Business Registration Number (Optional)
                </label>
                <input
                  type="text"
                  name="business_registration_number"
                  value={values.business_registration_number}
                  onChange={handleChange}
                  placeholder="Enter your business registration number"
                  className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
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
            {/* Terms and Policies Agreement */}
            <div className="flex items-center mt-2 mb-2">
              <input
                value={values.checked}
                onChange={handleChange}
                type="checkbox"
                id="agree"
                required
                className="mr-2"
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                I agree to the{" "}
                <a
                  href="https://carybin.netlify.app/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gradient underline"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="https://carybin.netlify.app/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gradient underline"
                >
                  Policies
                </a>{" "}
                from Carybin
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending || acceptInviteIsPending}
              className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-medium mt-8 transition-colors"
            >
              {(isPending || acceptInviteIsPending) ? "Please wait..." : "Sign Up As A Logistics Agent"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}