import { Link } from "react-router-dom";
import useVerifyEmail from "./hooks/useVerifyEmail";
import { useFormik } from "formik";
import { maskEmail } from "../../lib/helper";

export default function SignInCustomer() {
  const { isPending, verifyEmailMutate } = useVerifyEmail();

  const savedEmail = localStorage.getItem("verifyemail");

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    // setFieldError,
  } = useFormik({
    initialValues: {
      token: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      verifyEmailMutate({ ...val, email: savedEmail });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3E3FF]">
      <div className="max-w-lg w-full bg-white rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img
              src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png"
              alt="OAStyles Logo"
              className="h-20"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-medium text-black mb-4">
          Verify your Email
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter the code that was sent to <span>{maskEmail(savedEmail ?? "")}</span> to verify your
          email
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-gray-700">Verification Code</label>
          <input
            type="text"
            name={"token"}
            required
            value={values.token}
            onChange={handleChange}
            placeholder="Enter verification code"
            className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient cursor-pointer text-white py-3 rounded-lg font-semibold"
          >
            {isPending ? "Please wait..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
