import { Link, Navigate } from "react-router-dom";
import useVerifyEmail from "./hooks/useVerifyEmail";
import { useFormik } from "formik";
import { maskEmail } from "../../lib/helper";
import useResendCode from "./hooks/useResendOtp";
import { useTriggerResend } from "../../hooks/useTriggerResend";
import useToast from "../../hooks/useToast";

export default function SignInCustomer() {
  const { isPending, verifyEmailMutate } = useVerifyEmail();

  const { toastError } = useToast();

  const { isPending: resendCodeIsPending, resendCodeMutate } = useResendCode();

  const savedEmail = localStorage.getItem("verifyemail");

  const { canResend, countdown, triggerResend } = useTriggerResend(60);

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleChange,
    setFieldValue,
    // setFieldError,
  } = useFormik({
    initialValues: {
      token: "",
    },
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      verifyEmailMutate({ ...val, email: savedEmail });
    },
  });

  if (!savedEmail) {
    return <Navigate to="/login" replace />;
  }

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
          Enter the code that was sent to{" "}
          <span>{maskEmail(savedEmail ?? "")}</span> to verify your email
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-gray-700">Verification Code</label>
          <input
            type="numeric"
            name={"token"}
            required
            value={values.token}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "");
              setFieldValue("token", onlyNums);
            }}
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
        <p className="text-center text-sm mt-4">
          {canResend ? (
            <button
              disabled={resendCodeIsPending}
              className="text-purple-600 cursor-pointer"
              onClick={() => {
                resendCodeMutate(
                  {
                    email: savedEmail,
                    allowOtp: true,
                  },
                  {
                    onSuccess: () => {
                      triggerResend();
                    },
                  }
                );
              }}
            >
              {resendCodeIsPending ? "Please wait..." : "Resend Code"}
            </button>
          ) : (
            <p className="text-purple-600">
              You can resend code in {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}
            </p>
          )}
        </p>
      </div>
    </div>
  );
}
