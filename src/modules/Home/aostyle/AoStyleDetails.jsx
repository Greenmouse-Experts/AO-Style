import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SavedMeasurementsDisplay from "../components/SavedMeasurementsDisplay";
import Breadcrumb from "../components/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../store/carybinUserCartStore";
import { useFormik } from "formik";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import Cookies from "js-cookie";

export default function AnkaraGownPage() {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState("Upper Body");
  const [measurementUnit, setMeasurementUnit] = useState("cm");
  const [measurementsSubmitted, setMeasurementsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const styleInfo = location?.state?.info;

  console.log(styleInfo);

  const images = [
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094281/AoStyle/image_ijkebh.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094278/AoStyle/image-copy-2_crpdbi.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094277/AoStyle/image-copy-0_lonvru.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094277/AoStyle/image-copy-1_iok8hz.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1744094281/AoStyle/image_ijkebh.png",
  ];

  const tabs = ["Upper Body", "Lower Body", "Full Body"];

  const handleProceed = () => {
    const currentIndex = tabs.indexOf(selectedTab);
    if (currentIndex < tabs.length - 1) {
      setSelectedTab(tabs[currentIndex + 1]);
    }
  };

  const upperBodyMeasurements = [
    {
      name: "Bust Circumference",
      placeholder: "Enter the circumference of your bust",
    },
    { name: "Shoulder Width", placeholder: "Enter the width of your shoulder" },
    {
      name: "Armhole Circumference",
      placeholder: "Enter the circumference of your armhole",
    },
    { name: "Sleeve Length", placeholder: "Enter the length of your sleeve" },
    {
      name: "Bicep Circumference",
      placeholder: "Enter the circumference of your bicep",
    },
    {
      name: "Wrist Circumference",
      placeholder: "Enter the circumference of your wrist",
    },
  ];

  const lowerBodyMeasurements = [
    {
      name: "Waist Circumference",
      placeholder: "Enter your waist measurement",
    },
    { name: "Hip Circumference", placeholder: "Enter your hip measurement" },
    {
      name: "Thigh Circumference",
      placeholder: "Enter your thigh measurement",
    },
    { name: "Knee Circumference", placeholder: "Enter your knee measurement" },
    {
      name: "Trouser Length (Waist to Ankle)",
      placeholder: "Enter your trouser length",
    },
  ];

  const fullBodyMeasurements = [
    { name: "Height", placeholder: "Enter your height" },
    { name: "Dress/Gown Length", placeholder: "Enter your desired length" },
  ];

  const getMeasurements = () => {
    switch (selectedTab) {
      case "Lower Body":
        return lowerBodyMeasurements;
      case "Full Body":
        return fullBodyMeasurements;
      default:
        return upperBodyMeasurements;
    }
  };

  const unitOptions = ["cm", "in", "m"];

  // Check if the user came from /aostyle-details
  const cameFromAoStyleDetails =
    location.state?.from === "/aostyle-details" ||
    location.pathname === "/aostyle-details";

  // Automatically open the modal if the user came from /aostyle-details
  useEffect(() => {
    if (cameFromAoStyleDetails) {
      setIsModalOpen(true);
    }
  }, [cameFromAoStyleDetails]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { state } = useLocation();

  const Cartid = localStorage.getItem("cart_id");

  const item = useCartStore.getState().getItemByCartId(Cartid);
  const token = Cookies.get("token");

  const [measurementArr, setMeasurementArr] = useState([]);

  const [currMeasurement, setCurrMeasurement] = useState(null);

  const { carybinUser } = useCarybinUserStore();

  const userMeasurement = carybinUser?.profile?.measurement;

  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);

  const initialValues = {
    customer_name: markReceivedChecked
      ? carybinUser?.name
      : currMeasurement?.customer_name ?? "",
    bust_circumference: markReceivedChecked
      ? userMeasurement?.upper_body
      : currMeasurement?.upper_body?.bust_circumference ?? "",
    bust_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.bust_circumference_unit
      : currMeasurement?.upper_body?.bust_circumference_unit ?? "cm",
    shoulder_width: markReceivedChecked
      ? userMeasurement?.upper_body?.shoulder_width
      : currMeasurement?.upper_body?.shoulder_width ?? "",
    shoulder_width_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.shoulder_width_unit
      : currMeasurement?.upper_body?.shoulder_width_unit ?? "cm",
    armhole_circumference: markReceivedChecked
      ? userMeasurement?.upper_body?.armhole_circumference
      : currMeasurement?.upper_body?.armhole_circumference ?? "",
    armhole_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.armhole_circumference_unit
      : currMeasurement?.upper_body?.armhole_circumference_unit ?? "cm",
    sleeve_length: markReceivedChecked
      ? userMeasurement?.upper_body?.sleeve_length
      : currMeasurement?.upper_body?.sleeve_length ?? "",

    sleeve_length_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.sleeve_length_unit
      : currMeasurement?.upper_body?.sleeve_length_unit ?? "cm",
    bicep_circumference: markReceivedChecked
      ? userMeasurement?.upper_body?.bicep_circumference
      : currMeasurement?.upper_body?.bicep_circumference ?? "",

    bicep_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.bicep_circumference_unit
      : currMeasurement?.upper_body?.bicep_circumference_unit ?? "cm",
    waist_circumference_upper: markReceivedChecked
      ? userMeasurement?.upper_body?.waist_circumference
      : currMeasurement?.upper_body?.waist_circumference ?? "",

    waist_circumference_unit_upper: markReceivedChecked
      ? userMeasurement?.upper_body?.waist_circumference_unit
      : currMeasurement?.upper_body?.waist_circumference_unit ?? "cm",
    waist_circumference_lower: markReceivedChecked
      ? userMeasurement?.lower_body?.waist_circumference
      : currMeasurement?.lower_body?.waist_circumference ?? "",

    waist_circumference_lower_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.waist_circumference_unit
      : currMeasurement?.lower_body?.waist_circumference_unit ?? "cm",
    hip_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.hip_circumference
      : currMeasurement?.lower_body?.hip_circumference ?? "",

    hip_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.hip_circumference_unit
      : currMeasurement?.lower_body?.hip_circumference_unit ?? "cm",

    thigh_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.thigh_circumference
      : currMeasurement?.lower_body?.thigh_circumference ?? "",

    thigh_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.thigh_circumference_unit
      : currMeasurement?.lower_body?.thigh_circumference_unit ?? "cm",

    knee_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.knee_circumference
      : currMeasurement?.lower_body?.knee_circumference ?? "",

    knee_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.knee_circumference_unit
      : currMeasurement?.lower_body?.knee_circumference_unit ?? "cm",

    trouser_length: markReceivedChecked
      ? userMeasurement?.lower_body?.trouser_length
      : currMeasurement?.lower_body?.trouser_length ?? "",

    trouser_length_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.trouser_length_unit
      : currMeasurement?.lower_body?.trouser_length_unit ?? "cm",

    height: markReceivedChecked
      ? userMeasurement?.full_body?.height
      : currMeasurement?.full_body?.height ?? "",

    height_unit: markReceivedChecked
      ? userMeasurement?.full_body?.height_unit
      : currMeasurement?.full_body?.height_unit ?? "cm",

    dress_length: markReceivedChecked
      ? userMeasurement?.full_body?.dress_length
      : currMeasurement?.full_body?.dress_length ?? "",

    dress_length_unit: markReceivedChecked
      ? userMeasurement?.full_body?.dress_length_unit
      : currMeasurement?.full_body?.dress_length_unit ?? "cm",
  };

  const {
    handleSubmit,
    touched,
    errors,
    setFieldValue,
    values,
    handleChange,
    resetForm,
    // setFieldError,
  } = useFormik({
    initialValues: initialValues,
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true,
    onSubmit: (val) => {
      if (selectedTab === "Full Body") {
        console.log(val);

        const updateVal = {
          id: currMeasurement?.id
            ? currMeasurement?.id
            : measurementArr.length + 1,
          customer_name: val?.customer_name,
          upper_body: {
            bust_circumference: val?.bust_circumference,
            bust_circumference_unit: val?.bust_circumference_unit,
            shoulder_width: val?.shoulder_width,
            shoulder_width_unit: val?.shoulder_width_unit,
            armhole_circumference: val?.armhole_circumference,
            armhole_circumference_unit: val?.armhole_circumference_unit,
            sleeve_length: val?.sleeve_length,
            sleeve_length_unit: val?.sleeve_length_unit,
            bicep_circumference: val?.bicep_circumference,
            bicep_circumference_unit: val?.bicep_circumference_unit,
            waist_circumference: val?.waist_circumference_upper,
            waist_circumference_unit: val?.waist_circumference_unit_upper,
          },
          lower_body: {
            waist_circumference: val?.waist_circumference_lower,
            waist_circumference_unit: val?.waist_circumference_lower_unit,
            hip_circumference: val?.hip_circumference,
            hip_circumference_unit: val?.hip_circumference_unit,
            thigh_circumference: val?.thigh_circumference,
            thigh_circumference_unit: val?.thigh_circumference_unit,
            knee_circumference: val?.knee_circumference,
            knee_circumference_unit: val?.knee_circumference_unit,
            trouser_length: val?.trouser_length,
            trouser_length_unit: val?.trouser_length_unit,
          },
          full_body: {
            height: val?.height,
            height_unit: val?.height_unit,
            dress_length: val?.dress_length,
            dress_length_unit: val?.dress_length_unit,
          },
        };
        setMeasurementArr((prev) => {
          if (currMeasurement?.id) {
            return prev.map((item) =>
              item.id === currMeasurement?.id ? updateVal : item
            );
          } else {
            return [...prev, updateVal];
          }
        });

        setCurrMeasurement(null);
        setMeasurementsSubmitted(true);
        resetForm();
        setSelectedTab("Upper Body");
      } else {
        handleProceed();
      }
    },
  });

  const removeMeasurementById = (idToRemove) => {
    setMeasurementArr((prev) => prev.filter((m) => m.id !== idToRemove));
  };

  return (
    <>
      <Breadcrumb
        title="OAStyles"
        subtitle="Products"
        just="OAStyles Details"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />
      <section className="Resizer section px-4">
        <div>
          <div className="p-6">
            {/* Conditionally render the Fabric section */}
            {item ? (
              <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4">
                  FABRIC
                </h2>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img
                      src={item?.product?.image}
                      alt="product"
                      className="w-20 h-20 rounded object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item?.product?.name}</h3>
                    <p className="mt-1 text-sm">
                      X {item?.product?.quantity} Yards
                    </p>
                    <p className="mt-1 text-[#2B21E5] text-sm">
                      N {item?.product?.price_at_time?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto p-4">
              {/* Image Gallery */}
              <div className="md:w-1/2">
                <div className="mb-4">
                  <img
                    src={styleInfo?.style?.photos[selectedImage]}
                    alt={styleInfo?.name}
                    className="w-full h-80 md:h-96 object-cover rounded"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {styleInfo?.style?.photos?.map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded overflow-hidden flex-shrink-0 ${
                        selectedImage === index
                          ? "border-purple-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${styleInfo?.name} thumbnail ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="md:w-1/2 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {styleInfo?.name}
                  </h1>

                  {/* Product Details Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {styleInfo?.gender && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {styleInfo.gender}
                      </span>
                    )}
                    {styleInfo?.type && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {styleInfo.type}
                      </span>
                    )}
                    {styleInfo?.fabric && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                        {styleInfo.fabric}
                      </span>
                    )}
                  </div>

                  {styleInfo?.sku && (
                    <p className="text-sm text-gray-500 mb-1">
                      SKU: {styleInfo.sku}
                    </p>
                  )}
                </div>

                <div className="border-b pb-4">
                  <span className="text-2xl font-bold text-purple-600">
                    ₦{styleInfo?.price?.toLocaleString()}
                  </span>
                </div>

                {styleInfo?.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      {styleInfo.description.split(" ").slice(0, 50).join(" ")}
                      {styleInfo.description.split(" ").length > 50 && "..."}
                    </p>
                  </div>
                )}

                {/* Additional Product Info */}
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  {styleInfo?.style?.minimum_fabric_qty && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Min. Fabric Required:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {styleInfo.style.minimum_fabric_qty} yards
                      </span>
                    </div>
                  )}
                  {styleInfo?.style?.estimated_sewing_time && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Estimated Sewing Time:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {styleInfo.style.estimated_sewing_time} day
                        {styleInfo.style.estimated_sewing_time > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {styleInfo?.tags?.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {styleInfo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border"
                        >
                          {tag}
                        </span>
                      ))}
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Image Gallery */}
                        <div className="flex md:w-1/1">
                          <div className="flex flex-col gap-2 mr-4">
                            {styleInfo?.style?.photos?.map((image, index) => (
                              <div
                                key={index}
                                className={`cursor-pointer border-2 ${
                                  selectedImage === index
                                    ? "border-purple-500"
                                    : "border-gray-200"
                                }`}
                                onClick={() => setSelectedImage(index)}
                              >
                                <img
                                  src={image}
                                  alt={`Ankara Gown thumbnail ${index}`}
                                  className="w-32 h-28 object-cover rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex-1">
                            <img
                              src={styleInfo?.style?.photos[selectedImage]}
                              alt="Ankara Gown"
                              className="w-full h-auto object-cover rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="md:w-1/2">
                          <h1 className="text-3xl font-bold mb-4">
                            {styleInfo?.name}
                          </h1>

                          {/* <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 3 ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-600">(15 Reviews)</span>
                </div> */}

                          <p className="text-xl font-medium text-blue-600 mb-4">
                            ₦{styleInfo?.price}
                          </p>

                          {styleInfo?.tags?.length ? (
                            <div className="mb-6">
                              <p className="font-medium mb-4">Tags:</p>
                              <div className="flex gap-2">
                                {styleInfo?.tags?.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-8 py-2 rounded-full border border-gray-300 text-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded transition-colors">
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Measurement Section */}
            <div className="mt-20">
              {measurementsSubmitted && (
                <div className="w-full">
                  <SavedMeasurementsDisplay
                    setCurrMeasurement={setCurrMeasurement}
                    item={Cartid}
                    styleInfo={styleInfo}
                    measurementArr={measurementArr}
                    removeMeasurementById={removeMeasurementById}
                    onAddNewMeasurement={() => {
                      setMeasurementsSubmitted(false);
                      setSelectedTab("Upper Body");
                    }}
                  />
                </div>
              )}

              <div className="flex flex-col md:flex-col lg:flex-row gap-8">
                {/* Measurement Image */}
                <div className="md:w-full lg:w-2/5">
                  <img
                    src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744902411/WhatsApp_Image_2025-04-17_at_15.09.49_r3aaap.jpg"
                    alt="Body measurement diagram"
                    className="w-full rounded-md border border-gray-300"
                  />
                </div>

                {/* Measurement Form */}
                <div className="md:w-full lg:w-3/5">
                  <h2 className="text-xl font-medium max-w-xs text-purple-500 pb-2 border-b-1 border-purple-500 mb-8">
                    Your Measurement
                  </h2>
                  <h3 className="text-xl font-medium mb-4">
                    Fill in your measurements
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Fill the form below to give the tailor your accurate
                    measurement
                  </p>

                  {token ? (
                    <div>
                      <label className="flex flex-row gap-6 mb-4">
                        <span className="text-sm">Use saved measurement</span>
                        <input
                          type="checkbox"
                          className="accent-purple-500 w-5 h-5"
                          checked={markReceivedChecked}
                          onChange={() =>
                            setMarkReceivedChecked(!markReceivedChecked)
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <></>
                  )}

                  {/* Tabs */}
                  <div className="flex mb-6 border-b border-purple-500">
                    {tabs.map((tab, index) => (
                      <button
                        key={tab}
                        className={`px-8 py-3 font-medium relative ${
                          selectedTab === tab
                            ? "text-purple-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => {
                          const currentIndex = tabs.indexOf(selectedTab);
                          if (index <= currentIndex) {
                            setSelectedTab(tab);
                          }
                        }}
                      >
                        {tab}
                        {selectedTab === tab && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Customer Name field only for Upper Body */}
                  <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {selectedTab === "Upper Body" && (
                      <div className="mb-6">
                        <label className="block text-gray-700 mb-4">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          name={"customer_name"}
                          required
                          value={values.customer_name}
                          onChange={handleChange}
                          placeholder="Enter customer name"
                          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
                        />

                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Bust Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={
                                  "Enter the circumference of your bust"
                                }
                                name={"bust_circumference"}
                                required
                                value={values.bust_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full appearance-none p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"bust_circumference_unit"}
                                  value={values.bust_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Shoulder Width"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter the width of your shoulder"}
                                name={"shoulder_width"}
                                required
                                value={values.shoulder_width}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"shoulder_width_unit"}
                                  value={values.shoulder_width_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Armhole Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={
                                  "Enter the circumference of your armhole"
                                }
                                name={"armhole_circumference"}
                                required
                                value={values.armhole_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"armhole_circumference_unit"}
                                  value={values.armhole_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Sleeve Length"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter the length of your sleeve"}
                                name={"sleeve_length"}
                                required
                                value={values.sleeve_length}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"sleeve_length_unit"}
                                  value={values.sleeve_length_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Bicep Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={
                                  "Enter the circumference of your bicep"
                                }
                                name={"bicep_circumference"}
                                required
                                value={values.bicep_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"bicep_circumference_unit"}
                                  value={values.bicep_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Wrist Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={
                                  "Enter the circumference of your wrist"
                                }
                                name={"waist_circumference_upper"}
                                required
                                value={values.waist_circumference_upper}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"waist_circumference_unit_upper"}
                                  value={values.waist_circumference_unit_upper}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === "Lower Body" && (
                      <div className="mb-6">
                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Waist Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your waist measurement"}
                                name={"waist_circumference_lower"}
                                required
                                value={values.waist_circumference_lower}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"waist_circumference_lower_unit"}
                                  value={values.waist_circumference_lower_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Hip Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your hip measurement"}
                                name={"hip_circumference"}
                                required
                                value={values.hip_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"hip_circumference_unit"}
                                  value={values.hip_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Thigh Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your thigh measurement"}
                                name={"thigh_circumference"}
                                required
                                value={values.thigh_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"thigh_circumference_unit"}
                                  value={values.thigh_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Knee Circumference"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your knee measurement"}
                                name={"knee_circumference"}
                                required
                                value={values.knee_circumference}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"knee_circumference_unit"}
                                  value={values.knee_circumference_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Trouser Length (Waist to Ankle)"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your trouser length"}
                                name={"trouser_length"}
                                required
                                value={values.trouser_length}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"trouser_length_unit"}
                                  value={values.trouser_length_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === "Full Body" && (
                      <div className="mb-6">
                        <div className="grid mt-6 grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Height"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your height"}
                                name={"height"}
                                required
                                value={values.height}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"height_unit"}
                                  value={values.height_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700 mb-4">
                              {"Dress/Gown Length"}
                            </label>
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                placeholder={"Enter your desired length"}
                                name={"dress_length"}
                                required
                                value={values.dress_length}
                                onChange={handleChange}
                                className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
                              />
                              <div className="relative">
                                <select
                                  className="appearance-none w-full p-4 border text-gray-500 border-[#CCCCCC] outline-none border-l-0 rounded-r-md pr-8"
                                  name={"dress_length_unit"}
                                  value={values.dress_length_unit}
                                  onChange={handleChange}
                                >
                                  <option value="cm">cm</option>
                                  <option value="in">in</option>
                                  <option value="m">m</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-5 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Proceed Button */}
                    <button
                      type="submit"
                      className="bg-gradient text-white font-medium py-3 px-6 cursor-pointer"
                    >
                      {selectedTab === "Upper Body"
                        ? "Proceed to Lower Body"
                        : selectedTab === "Lower Body"
                        ? "Proceed to Full Body"
                        : "Submit Measurements"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-lg w-[100%] sm:w-[500px]">
          <div className="flex justify-between items-center border-b border-[#CCCCCC] outline-none pb-3  mb-4">
            <h2 className="text-lg font-meduim">.</h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-meduim mb-3">
                You have a successfully added a Style{" "}
              </h2>
              <p className="text-sm leading-loose text-gray-500">
                You have added a style and a material to your order, you can
                proceed to checkout or keep shopping
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Link to="/shop">
                <button
                  onClick={closeModal}
                  className="border px-6 py-3 border-[#CCCCCC] text-gray-400 cursor-pointer"
                >
                  Back to Shop
                </button>
              </Link>
              <Link to="/view-cart">
                <button className="bg-gradient text-white px-6 py-3 cursor-pointer">
                  Proceed to View Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
