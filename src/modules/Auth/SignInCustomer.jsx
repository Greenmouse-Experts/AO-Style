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
};

export default function SignInAsCustomer() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      registerMutate({
        ...val,
        role: "user",
        alternative_phone:
          val?.alternative_phone === "" ? undefined : val?.alternative_phone,
        allowOtp: true,
      });
    },
  });

  const { isPending, registerMutate } = useRegister(values.email);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Section - Banner */}
      <div className="hidden md:flex w-1/2 relative">
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
      <div className="w-full md:w-1/2 h-full overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="OA Styles"
              className="h-20 w-auto mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sign Up As A <span className="text-[#2B21E5]">Customer</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
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

            <label className="block text-black">Phone Number</label>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-4 border border-[#CCCCCC] outline-none  mb-3 rounded-lg"
              name={"phone"}
              required
              value={values.phone}
              onChange={handleChange}
            />

            <label className="block text-black">
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

          <button className="w-full mt-4 flex items-center justify-center border border-[#CCCCCC] hover:bg-gradient-to-r from-purple-500 to-pink-50 hover:text-white p-4 rounded-lg">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 mr-2"
            />
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
