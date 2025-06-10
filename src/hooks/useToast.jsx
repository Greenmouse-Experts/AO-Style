import { toast } from "react-toastify";

const useToast = () => {
  const options = {
    position: "top-right",
    closeOnClick: true,
    pauseOnHover: true,
    hideProgressBar: false,
  };
  const toastSuccess = (message) => {
    toast.success(message, {
      ...options,
    });
  };
  const toastError = (message) => {
    toast.error(message, options);
  };
  const toastInfo = (message) => {
    toast.info(message, options);
  };
  const toastWarning = (message) => {
    toast.warning(message, options);
  };

  return { toastSuccess, toastError, toastInfo, toastWarning };
};

export default useToast;
