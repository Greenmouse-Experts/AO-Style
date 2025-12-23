import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";
import { countryCodes } from "../../constant";

import Select from "react-select";
import useToast from "../../hooks/useToast";
import PhoneInput from "react-phone-input-2";
import { usePlacesWidget } from "react-google-autocomplete";
import { AttentionTooltip } from "../../components/ui/Tooltip";
import { removeStateSuffix } from "../../lib/helper";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  alternative_phone: "",
  password: "",
  password_confirmation: "",
  referral_source: "",
  location: "",
  years_of_experience: "",
  phoneCode: "+234",
  state: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
};

export default function SignInAsCustomer() {
  const { toastError } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  // Helper function to extract address components from Google Places
  const getAddressComponent = (components, type) => {
    if (!Array.isArray(components)) return "";
    const component = components.find((c) => c.types.includes(type));
    return component?.long_name || "";
  };

  const {
    handleSubmit,
    values,
    handleChange,
    resetForm,
    setFieldValue,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      const phoneno = `${val.phone}`;
      const altno = `${val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }

      // Remove "State" suffix if present before sending to backend
      const cleanedState = removeStateSuffix(val.state);

      console.log("📤 Submitting registration data:", {
        ...val,
        state: cleanedState || val.state || "",
        role: "market-representative",
        phone: phoneno,
        alternative_phone: val?.alternative_phone === "" ? undefined : altno,
        allowOtp: true,
      });

      registerMutate(
        {
          ...val,
          state: cleanedState || val.state || "",
          role: "market-representative",
          phone: phoneno,
          alternative_phone: val?.alternative_phone === "" ? undefined : altno,
          allowOtp: true,
        },
        {
          onSuccess: () => {
            resetForm();
          },
        },
      );
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);

  // Google Places Autocomplete setup - moved after useFormik to access setFieldValue
  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      console.log("🗺️ Market Rep - Google Place selected:", place);
      
      // Set formatted address
      setFieldValue("location", place.formatted_address);
      
      // Set coordinates
      setFieldValue("latitude", place.geometry?.location?.lat().toString());
      setFieldValue("longitude", place.geometry?.location?.lng().toString());

      // Extract and set address components
      const components = place.address_components || [];
      
      const state = getAddressComponent(
        components,
        "administrative_area_level_1"
      );
      const city =
        getAddressComponent(components, "locality") ||
        getAddressComponent(components, "administrative_area_level_2");
      const country = getAddressComponent(components, "country");

      console.log("🏘️ Market Rep - Address components extracted:", {
        state,
        city,
        country,
      });

      // Update form values with extracted data
      if (state) {
        setFieldValue("state", state);
        console.log("✅ State set to:", state);
      }
      if (city) {
        setFieldValue("city", city);
        console.log("✅ City set to:", city);
      }
      if (country) {
        setFieldValue("country", country);
        console.log("✅ Country set to:", country);
      }
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Section */}
      <div className="hidden lg:flex w-1/2 relative h-full">
        <img
          src="https://res.cloudinary.com/diqa0sakr/image/upload/v1745811955/image_1_wfjpsw.jpg"
          alt="Sign In"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-0 p-8 text-white w-full">
          <h2 className="text-xl font-medium">
            Earn Money by onboarding Fabric Vendors and Fashion Designers!
          </h2>
          <p className="text-sm mt-2">
            Welcome to Carybin, a platform that simplifies tailoring processes;{" "}
            <br />
            from buying materials to finding a tailor for you.
          </p>
        </div>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full lg:w-1/2 md:w-1/1 h-full overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
                alt="OA Styles"
                className="h-20 w-auto mx-auto"
              />
            </Link>
          </div>
          <h2 className="text-2xl font-semibold lg:text-left md:text-center text-gray-800 mb-4">
            Become a Market Rep
          </h2>
          <p className="text-gray-500 lg:text-left md:text-center text-sm mt-1">
            Fill the form become a Market rep on 
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-black">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              name={"name"}
              required
              value={values.name}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
            />

            <label className="block text-black">Email Address</label>
            <input
              type="email"
              name={"email"}
              required
              value={values.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
            />

            <div className="mb-3">
              <label className="block text-black mb-2">Phone Number</label>

              <div className="flex flex-col md:flex-row md:items-center gap-2 ">
                {/* Country Code Dropdown */}
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
                />{" "}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-black mb-2">
                Alternative Phone Number{" "}
                <small className="text-[#CCCCCC]">(Optional)</small>
              </label>

              <div className="flex flex-col md:flex-row md:items-center gap-2 ">
                {/* Country Code Dropdown */}
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

            <label className="block text-black">
              Years of Experience in Sales
            </label>
            <input
              type="numeric"
              name={"years_of_experience"}
              required
              value={values.years_of_experience}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, "");
                setFieldValue("years_of_experience", onlyNums);
              }}
              placeholder="Years of experience"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
            />

            <label className="flex items-center gap-2 text-black">
              Pick Address from Google Suggestions
              <AttentionTooltip
                content="Select from Google dropdown"
                position="top"
              />
            </label>
            <input
              type="text"
              name={"location"}
              ref={ref}
              value={values.location}
              onChange={(e) => {
                handleChange(e);
                setFieldValue("location", e.currentTarget.value);
                // Clear location data when manually typing (not selecting from Google)
                setFieldValue("latitude", "");
                setFieldValue("longitude", "");
                setFieldValue("state", "");
                setFieldValue("city", "");
                setFieldValue("country", "");
              }}
              placeholder="Start typing your address and select from Google suggestions..."
              title="Start typing your address and select from the Google dropdown suggestions for accurate location"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg"
              required
            />

            {/* Debug display for captured location data */}
            {(values.latitude || values.longitude || values.state || values.country) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  🗺️ Captured Location Data:
                </p>
                {values.country && (
                  <p className="text-xs text-blue-700">
                    Country: {values.country}
                  </p>
                )}
                {values.state && (
                  <p className="text-xs text-blue-700">
                    State: {values.state}
                  </p>
                )}
                {values.city && (
                  <p className="text-xs text-blue-700">
                    City: {values.city}
                  </p>
                )}
                {values.latitude && values.longitude && (
                  <p className="text-xs text-blue-700">
                    Coordinates: {values.latitude}, {values.longitude}
                  </p>
                )}
              </div>
            )}

            {/* <div>
              <HowDidYouHearAboutUs />
            </div> */}

            <label className="block text-gray-700 mb-3">
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

            <label className="block text-black">Password</label>
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

            <label className="block text-black">Confirm Password</label>
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
              disabled={isPending}
              className="w-full bg-gradient cursor-pointer text-white py-4 mt-8 rounded-lg font-normal"
              type="submit"
            >
              {isPending ? "Please wait..." : "Sign Up As A Market Rep"}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600">
              Login
            </Link>
          </p>

          {/* <div className="flex items-center mt-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">Or</span>
            <hr className="flex-grow border-gray-300" />
          </div> */}

          {/* <button className="w-full mt-4 flex items-center justify-center border border-[#CCCCCC] hover:bg-gradient-to-r from-purple-500 to-pink-50 hover:text-white p-4 rounded-lg">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 mr-2"
            />
            Sign Up with Google
          </button> */}
        </div>
      </div>
    </div>
  );
}