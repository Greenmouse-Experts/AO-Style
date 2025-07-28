import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
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

  const parsedProduct = JSON.parse(pendingProduct);

  const navigate = useNavigate();

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

  const googleSigninHandler = (cred) => {
    const payload = {
      token: cred?.credential,
      provider: "google",
      role: "user",
    };

    googleSigninMutate(payload, {
      onSuccess: (data) => {
        Cookies.set("token", data?.data?.accessToken);

        if (data?.data?.data?.role === "user") {
          navigate(redirectPath ?? "/customer", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "customer");
        }
        if (data?.data?.data?.role === "fabric-vendor") {
          navigate(redirectPath ?? "/fabric", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "fabric");
        }
        if (data?.data?.data?.role === "fashion-designer") {
          navigate(redirectPath ?? "/tailor", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "tailor");
        }
        if (data?.data?.data?.role === "logistics-agent") {
          navigate(redirectPath ?? "/logistics", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "logistics");
        }
        if (data?.data?.data?.role === "market-representative") {
          navigate(redirectPath ?? "/sales", {
            state: { info: parsedProduct },
            replace: true,
          });
          Cookies.set("currUserUrl", "sales");
        }
        // if()
      },
    });
  };

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
            Welcome to OAStyles, a platform that simplifies tailoring processes;{" "}
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
            <GoogleLogin
              size="large"
              text="signup_with"
              theme="outlined"
              onSuccess={(credentialResponse) => {
                googleSigninHandler(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
