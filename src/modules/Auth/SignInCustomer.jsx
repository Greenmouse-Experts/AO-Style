import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import HowDidYouHearAboutUs from "../Auth/components/HowDidYouHearAboutUs";
import { useFormik } from "formik";
import useRegister from "./hooks/useSignUpMutate";
import ReCAPTCHA from "react-google-recaptcha";
import useToast from "../../hooks/useToast";
import PhoneInput from "react-phone-input-2";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { countryCodes } from "../../constant";

import Select from "react-select";
import useGoogleSignin from "./hooks/useGoogleSignIn";
import { usePlacesWidget } from "react-google-autocomplete";
import { AttentionTooltip } from "../../components/ui/Tooltip";
import { useQueryClient } from "@tanstack/react-query";
import useSessionManager from "../../hooks/useSessionManager";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  alternative_phone: "",
  password: "",
  password_confirmation: "",
  referral_source: "",
  phoneCode: "+234",
};

export default function SignInAsCustomer() {
  const { toastError } = useToast();
  const redirectPath = new URLSearchParams(location.search).get("redirect");
  const pendingProduct = localStorage.getItem("pendingProduct");

  let parsedProduct = null;
  try {
    parsedProduct = pendingProduct ? JSON.parse(pendingProduct) : null;
  } catch (error) {
    console.log("⚠️ Invalid pending product data:", error);
    parsedProduct = null;
  }

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuthData } = useSessionManager();

  const [value, setValue] = useState("");

  const options = countryCodes.map((code) => ({
    label: code,
    value: code,
  }));

  const [handleRecaptch, setHandleRecaptch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    setFieldValue,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      // const phoneno = `${val.phone}`;
      // return console.log(phoneno);
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }

      const phoneno = `${val.phone}`;
      const altno = `${val.alternative_phone}`;

      if (values.password_confirmation !== values.password) {
        return toastError("Password must match");
      }
      registerMutate({
        ...val,
        role: "user",
        phone: phoneno,
        alternative_phone: val?.alternative_phone === "" ? undefined : altno,
        allowOtp: true,
        location: val.location,
        coordinates: {
          longitude: val.longitude,
          latitude: val.latitude,
        },
      });
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);

  const onChange = (val) => {
    // Handle reCAPTCHA verification here
    setHandleRecaptch(val);
  };

  const changeHandler = (value) => {
    setValue(value);
  };

  const { isPending: googleIsPending, googleSigninMutate } = useGoogleSignin();

  // Auto-trigger Google signup if redirected from login with stored token
  useEffect(() => {
    const storedGoogleToken = sessionStorage.getItem("googleToken");
    const storedProvider = sessionStorage.getItem("googleProvider");

    if (storedGoogleToken && storedProvider === "google") {
      console.log("🔄 Auto-triggering Google signup from stored token");
      googleSigninHandler({ credential: storedGoogleToken });
    }
  }, []);

  const googleSigninHandler = (cred) => {
    console.log("🔐 Google signup initiated");

    // Check if we have stored Google token from login attempt
    const storedGoogleToken = sessionStorage.getItem("googleToken");
    const storedProvider = sessionStorage.getItem("googleProvider");

    let tokenToUse = cred?.credential || storedGoogleToken;

    if (!tokenToUse) {
      console.log("❌ No Google token available for signup");
      toastError("Google authentication failed. Please try again.");
      return;
    }

    const payload = {
      token: tokenToUse,
      provider: "google",
      role: "user",
      action_type: "SIGNUP", // API requires both role and action_type
    };

    console.log("📤 Sending Google signup request");

    googleSigninMutate(payload, {
      onSuccess: (data) => {
        console.log("✅ Google signup successful");

        // Handle both nested (data.data) and flat response structures
        const responseData = data?.data || data;
        const statusCode = data?.statusCode || responseData?.statusCode;
        const message = data?.message || responseData?.message;
        const accessToken = data?.accessToken || responseData?.accessToken;
        const userData = responseData?.data || responseData;
        const userRole = userData?.role;

        // Clear stored Google token
        sessionStorage.removeItem("googleToken");
        sessionStorage.removeItem("googleProvider");

        // If we get an access token, user was created successfully
        if (accessToken && statusCode === 200) {
          console.log("🔑 Setting authentication tokens");

          // Set token cookie (like normal signin)
          Cookies.set("token", accessToken);

          // Set approvedByAdmin cookie (like normal signin)
          Cookies.set(
            "approvedByAdmin",
            userData?.profile?.approved_by_admin || "true",
          );

          // Store auth data in session manager (like normal signin)
          // For Google SSO, set a long expiry since no refresh token
          const googleSSOExpiry = new Date();
          googleSSOExpiry.setDate(googleSSOExpiry.getDate() + 7); // 7 days from now

          setAuthData({
            accessToken: accessToken,
            refreshToken: responseData?.refreshToken || null,
            refreshTokenExpiry:
              responseData?.refreshTokenExpiry || googleSSOExpiry.toISOString(),
            user: userData, // Include user data
            userType: userRole, // Include role
          });

          // Refresh user profile query to ensure fresh data
          queryClient.invalidateQueries(["get-user-profile"]);

          // Add small delay to ensure cookies are set before navigation
          setTimeout(() => {
            console.log("🔄 Redirecting to customer dashboard");

            // Check for pending cart data and redirect appropriately
            const pendingCartData = localStorage.getItem("pending_fabric_data");
            let targetPath;
            if (pendingCartData) {
              targetPath = "/view-cart";
              console.log("🛒 Found pending cart data, redirecting to cart");
            } else {
              targetPath = redirectPath ?? "/customer";
            }

            navigate(targetPath, {
              state: { info: parsedProduct },
              replace: true,
            });
            Cookies.set("currUserUrl", "customer");
            console.log("✅ Signup complete");
          }, 1000);
        }
      },
      onError: (error) => {
        console.log("❌ Google signup error:", error?.data?.message);

        // Clear stored token on error
        sessionStorage.removeItem("googleToken");
        sessionStorage.removeItem("googleProvider");
      },
    });
  };

  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      setFieldValue("location", place.formatted_address);
      setFieldValue("latitude", place.geometry?.location?.lat().toString());
      setFieldValue("longitude", place.geometry?.location?.lng().toString());
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Section - Banner */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741611518/AoStyle/image_1_m2fv4b.png"
          alt="Sign In"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-0 p-8 text-white w-full">
          <h2 className="text-xl font-medium">
            Connecting customers to Material Vendors
            <br /> and the best Tailors/Fashion Designers
          </h2>
          <p className="text-sm mt-2">
            Welcome to Carybin, a platform that simplifies tailoring processes;{" "}
            <br />
            from buying materials to finding a tailor for you.
          </p>
        </div>
      </div>

      {/* Right Section - Scrollable Form */}
      <div className="w-full lg:w-1/2 md:w-1/1 h-full overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="OA Styles"
              className="h-20 w-auto mx-auto"
            />
          </Link>
          <h2 className="text-2xl lg:text-left md:text-center font-semibold text-gray-800 mb-4">
            Sign Up As A <span className="text-[#2B21E5]">Customer</span>
          </h2>
          <p className="text-gray-500 lg:text-left md:text-center text-sm mt-1">
            Fill the form below to create an account instantly
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <label className="block text-black">Full Name</label>
            <input
              type="text"
              placeholder="Full Name"
              name={"name"}
              required
              value={values.name}
              onChange={handleChange}
              className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
            />
            <label className="block text-black">Email Address</label>
            <input
              type="email"
              name={"email"}
              required
              value={values.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
            />
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
              </div>
            </div>
            {/* <select
                options={options}
                value={value}
                onChange={changeHandler}
              /> */}

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
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                Pick Address from Google Suggestions
                <AttentionTooltip
                  content="Select from Google dropdown"
                  position="top"
                />
              </label>
              <input
                type="text"
                ref={ref}
                className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                placeholder="Start typing your address and select from Google suggestions..."
                title="Start typing your address and select from the Google dropdown suggestions for accurate location"
                required
                name="location"
                onChange={(e) => {
                  setFieldValue("location", e.currentTarget.value);
                  setFieldValue("latitude", "");
                  setFieldValue("longitude", "");
                }}
                value={values.location}
              />
            </div>

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
            {/* <HowDidYouHearAboutUs /> */}
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
              <option value="Radio/ TV Ads">Radio/ TV Ads</option>
              <option value="Blogs/Articles">Blogs/Articles</option>
              <option value="Personal Referral">Personal Referral</option>
              <option value="Just got here">Just got here</option>
              <option value="Other">Other</option>
            </select>
            {/* <ReCAPTCHA sitekey="Your client site key" onChange={onChange} /> */}
            {/* {handleRecaptch === "" && (
              <p className="text-red-500 text-sm">
                Please verify that you are not a robot.
              </p>
            )} */}

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

            <div className="flex flex-col text-sm md:mt-8"></div>
            <button
              disabled={isPending}
              className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal mt-4"
              type="submit"
            >
              {isPending ? "Please wait..." : "Sign Up As A Customer"}
            </button>
          </form>
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-600">
              Login
            </Link>
          </p>

          <div className="flex items-center mt-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">Or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div
            role="button"
            className="flex items-center mt-4 justify-center rounded-lg "
          >
            {googleIsPending ? (
              <div className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
                <span className="text-gray-600">Signing up with Google...</span>
              </div>
            ) : (
              <GoogleLogin
                size="large"
                text="signup_with"
                theme="outlined"
                onSuccess={(credentialResponse) => {
                  googleSigninHandler(credentialResponse);
                }}
                onError={(error) => {
                  console.error("❌ SignUp: Google OAuth error:", error);
                  toastError(
                    "Google sign-up was cancelled or failed. Please try again.",
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
