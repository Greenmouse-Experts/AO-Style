import { useFormik } from "formik";
import useFetchBank from "../../../../hooks/settings/useFetchBank";
import Select from "react-select";
import useResolveAccount from "../../../../hooks/settings/useResolveAccount";
import { useEffect } from "react";
import useSaveWithdrawal from "../../../../hooks/settings/useSaveWithdrawal";
import useGetBusinessDetails from "../../../../hooks/settings/useGetBusinessDetails";
import useToast from "../../../../hooks/useToast";
import { useCarybinUserStore } from "../../../../store/carybinUserStore";

const BankDetailsUpdate = () => {
  const { data: businessDetails } = useGetBusinessDetails();
  const { carybinUser } = useCarybinUserStore();
  const businessInfo = businessDetails?.data;

  console.log(businessInfo);

  const { data } = useFetchBank();

  const options = data?.data.map((code) => ({
    label: code?.name,
    value: code?.code,
  }));

  const selectedBank = options?.find(
    (bank) => bank.label === businessInfo?.withdrawal_account?.bank_name
  );

  const initialValues = {
    account_number: carybinUser?.withdrawal_account?.account_number ?? "",
    account_type: carybinUser?.withdrawal_account?.account_type ?? "",
    bank_name: carybinUser?.withdrawal_account?.bank_name ?? "",
    bank_code: carybinUser?.withdrawal_account?.bank_code ?? "",
    account_name: "",
  };

  const { resolveAccountMutate } = useResolveAccount();

  const { isPending, saveWithdrawalMutate } = useSaveWithdrawal();

  const { toastError } = useToast();

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
      if (!navigator.onLine) {
        toastError("No internet connection. Please check your network.");
        return;
      }
      saveWithdrawalMutate({ ...val, business_id: businessDetails?.data?.id });
    },
  });

  useEffect(() => {
    if (values.account_number?.length == 10 && values.bank_code) {
      resolveAccountMutate(
        {
          account_number: values.account_number,
          bank_code: values.bank_code,
        },
        {
          onSuccess: (data) => {
            const details = data?.data?.data?.data?.details;
            setFieldValue("account_name", details?.account_name);
          },
        }
      );
    }
  }, [values.account_number, values.bank_code]);

  return (
    <div className="">
      <h2 className="text-xl font-medium mb-4">Bank Details</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Account Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Account Number */}
          <div>
            <label className="block text-gray-700 mb-4">Account Number</label>
            <input
              type="text"
              name="account_number"
              placeholder="Enter your account number"
              required
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
              value={values.account_number}
              onChange={(e) => {
                const onlyDigits = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                setFieldValue("account_number", onlyDigits);
              }}
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-gray-700 mb-4">Bank Name</label>
            <Select
              options={options}
              name="bank_name"
              value={options?.find((opt) => opt.value === values.bank_code)}
              onChange={(selectedOption) => {
                setFieldValue("bank_code", selectedOption.value);
                setFieldValue("bank_name", selectedOption.label);
              }}
              placeholder="Select"
              className="w-full p-[8px] text-gray-500 border border-[#CCCCCC] outline-none rounded-lg"
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
            />{" "}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 mb-4">Account Name</label>
            <input
              disabled
              type="text"
              placeholder=""
              name="account_name"
              value={values.account_name}
              onChange={handleChange}
              required
              className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-4">Acount Type</label>
            <Select
              options={[
                { label: "Savings", value: "Savings Bank" },
                { label: "Current", value: "Current Bank" },
              ]}
              name="account_type"
              value={[
                { label: "Savings", value: "Savings Bank" },
                { label: "Current", value: "Current Bank" },
              ]?.find((opt) => opt.value === values.account_type)}
              onChange={(selectedOption) => {
                setFieldValue("account_type", selectedOption.value);
              }}
              isSearchable={false}
              required
              placeholder="Select"
              className="w-full p-[8px] text-gray-500 border border-[#CCCCCC] outline-none rounded-lg"
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
            />{" "}
          </div>
        </div>

        {/* Submit Button */}
        <button
          disabled={isPending}
          type="submit"
          className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient cursor-pointer text-white"
        >
          {isPending
            ? "Please wait..."
            : businessInfo?.withdrawal_account?.account_number
            ? "Update Bank Details"
            : "Add Bank Details"}{" "}
        </button>
      </form>
    </div>
  );
};

export default BankDetailsUpdate;
