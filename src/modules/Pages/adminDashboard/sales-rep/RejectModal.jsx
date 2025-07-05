import { useFormik } from "formik";
import useApproveMarketRep from "../../../../hooks/marketRep/useApproveMarketRep";

const initialValues = {
  reason: "",
};

const RejectModal = ({ isOpen, onClose, id }) => {
  const { isPending, approveMarketRepMutate } = useApproveMarketRep();

  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    values,
    resetForm,
    handleChange,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      approveMarketRepMutate(
        {
          user_id: id,
          approved: false,
          reason: val.reason,
        },
        {
          onSuccess: () => {
            resetForm();
            onClose();
          },
        }
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-3xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#CCCCCC] pb-3 mb-4">
          <h2 className="text-lg font-semibold">Reject Market Rep</h2>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-black mb-2">Reject Reasons</label>
            <textarea
              placeholder="Reasons"
              className="w-full p-4 border border-[#CCCCCC] outline-none mb-3 rounded-lg resize-none"
              name="reason"
              required
              value={values.reason}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button
            disabled={isPending}
            className="w-full bg-gradient cursor-pointer text-white py-4 rounded-lg font-normal"
            type="submit"
          >
            {isPending ? "Please wait..." : "Reject"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;
