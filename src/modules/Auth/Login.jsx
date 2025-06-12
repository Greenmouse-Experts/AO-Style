import { Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import useSignIn from "./hooks/useSigninMutate";
import { useFormik } from "formik";

const initialValues = {
  email: "",
  password: "",
};

export default function SignInCustomer() {
  const [showPassword, setShowPassword] = useState(false);

  const { isPending, signinMutate } = useSignIn();

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
      signinMutate(val);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient">
      <div className="max-w-lg w-full bg-white rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1749385530/Payvidence-Images/logo_rkfmu6.png"
              alt="OAStyles Logo"
              className="h-20"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-medium text-black mb-4">Login</h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-700">Email Address</label>
          <input
            type="email"
            name={"email"}
            required
            value={values.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
          />

          <label className="block text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={values.password}
              required
              onChange={handleChange}
              name={"password"}
              placeholder="Enter your password"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg pr-10"
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

          <div className="flex justify-between text-sm text-purple-600">
            <Link to="/forgot-password" className="hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold"
          >
            {isPending ? "Please wait..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/sign-up" className="text-[#DB6DC0] hover:underline">
              Register Now
            </Link>
          </div>

          <div className="flex items-center justify-between my-4">
            <div className="border-b border-[#CCCCCC] w-full"></div>
            <span className="px-3 text-gray-500">Or</span>
            <div className="border-b border-[#CCCCCC] w-full"></div>
          </div>

          <button className="w-full flex items-center justify-center border border-[#CCCCCC] py-3 rounded-lg font-normal">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 mr-2"
            />
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
}
