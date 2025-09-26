import { useState, useEffect, useRef } from "react";
import { ChevronDown, MessageSquare, X } from "lucide-react";
import SavedMeasurementsDisplay from "../components/SavedMeasurementsDisplay";
import Breadcrumb from "../components/Breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCartStore } from "../../../store/carybinUserCartStore";
import { useFormik } from "formik";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import Cookies from "js-cookie";
import AuthenticatedProductReviews from "../../../components/reviews/AuthenticatedProductReviews";
import useAddCart from "../../../hooks/cart/useAddCart";
import useToast from "../../../hooks/useToast";
import CustomBackbtn from "../../../components/CustomBackBtn";

export default function AnkaraGownPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState("Upper Body");
  const [measurementUnit, setMeasurementUnit] = useState("cm");
  const [measurementsSubmitted, setMeasurementsSubmitted] = useState(false);
  const [showMeasurementForm, setShowMeasurementForm] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingFabric, setPendingFabric] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const reviewsRef = useRef(null);

  const { addCartMutate, isPending: addCartPending } = useAddCart();
  const { toastSuccess, toastError } = useToast();
  console.log(pendingFabric, "this is the peding fabric");
  const styleInfo = location?.state?.info;

  console.log("🔍 AoStyleDetails: styleInfo:", styleInfo);
  console.log("🔍 AoStyleDetails: Product ID from styleInfo:", styleInfo?.id);
  console.log("📦 AoStyleDetails: Full styleInfo structure:", {
    hasData: !!styleInfo,
    styleInfoKeys: styleInfo ? Object.keys(styleInfo) : null,
    id: styleInfo?.id,
    product_id: styleInfo?.product_id,
    styleData: styleInfo?.style,
    productData: styleInfo?.product,
  });

  // Determine correct product ID for reviews - prefer product_id for API consistency
  const correctProductId = styleInfo?.product_id || styleInfo?.id;
  console.log(
    "🎯 AoStyleDetails: USING CORRECT PRODUCT ID FOR REVIEWS:",
    correctProductId,
  );

  // Check for pending fabric data on component mount
  useEffect(() => {
    const pendingFabricData = localStorage.getItem("pending_fabric");
    if (pendingFabricData) {
      try {
        const fabricData = JSON.parse(pendingFabricData);
        console.log("🧵 Found pending fabric raw data:", fabricData);

        // Ensure fabric data has the right structure
        const processedFabricData = {
          product_id: fabricData.product_id,
          name: fabricData.name || "Selected Fabric",
          price: fabricData.price || 0,
          quantity: fabricData.quantity || 1,
          image: fabricData.image || fabricData.photos?.[0],
          photos:
            fabricData.photos || (fabricData.image ? [fabricData.image] : []),
          color: fabricData.color,
          customer_name: fabricData.customer_name,
        };

        setPendingFabric(processedFabricData);
        console.log("🧵 Processed pending fabric:", processedFabricData);
        console.log("🧵 Fabric display data:", {
          name: processedFabricData.name,
          price: processedFabricData.price,
          quantity: processedFabricData.quantity,
          hasImage: !!processedFabricData.image,
          hasPhotos: !!processedFabricData.photos?.length,
        });
      } catch (error) {
        console.error("Error parsing pending fabric:", error);
        localStorage.removeItem("pending_fabric");
      }
    } else {
      console.log("🧵 No pending fabric found in localStorage");
    }
  }, []);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
      : (currMeasurement?.customer_name ?? ""),
    bust_circumference: markReceivedChecked
      ? userMeasurement?.upper_body?.bust_circumference
      : (currMeasurement?.upper_body?.bust_circumference ?? ""),
    bust_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.bust_circumference_unit
      : (currMeasurement?.upper_body?.bust_circumference_unit ?? "cm"),
    shoulder_width: markReceivedChecked
      ? userMeasurement?.upper_body?.shoulder_width
      : (currMeasurement?.upper_body?.shoulder_width ?? ""),
    shoulder_width_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.shoulder_width_unit
      : (currMeasurement?.upper_body?.shoulder_width_unit ?? "cm"),
    armhole_circumference: markReceivedChecked
      ? userMeasurement?.upper_body?.armhole_circumference
      : (currMeasurement?.upper_body?.armhole_circumference ?? ""),
    armhole_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.armhole_circumference_unit
      : (currMeasurement?.upper_body?.armhole_circumference_unit ?? "cm"),
    sleeve_length: markReceivedChecked
      ? userMeasurement?.upper_body?.sleeve_length
      : (currMeasurement?.upper_body?.sleeve_length ?? ""),

    sleeve_length_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.sleeve_length_unit
      : (currMeasurement?.upper_body?.sleeve_length_unit ?? "cm"),
    bicep_circumference: markReceivedChecked
      ? userMeasurement?.upper_body?.bicep_circumference
      : (currMeasurement?.upper_body?.bicep_circumference ?? ""),

    bicep_circumference_unit: markReceivedChecked
      ? userMeasurement?.upper_body?.bicep_circumference_unit
      : (currMeasurement?.upper_body?.bicep_circumference_unit ?? "cm"),
    waist_circumference_upper: markReceivedChecked
      ? userMeasurement?.upper_body?.waist_circumference
      : (currMeasurement?.upper_body?.waist_circumference ?? ""),

    waist_circumference_unit_upper: markReceivedChecked
      ? userMeasurement?.upper_body?.waist_circumference_unit
      : (currMeasurement?.upper_body?.waist_circumference_unit ?? "cm"),
    waist_circumference_lower: markReceivedChecked
      ? userMeasurement?.lower_body?.waist_circumference
      : (currMeasurement?.lower_body?.waist_circumference ?? ""),

    waist_circumference_lower_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.waist_circumference_unit
      : (currMeasurement?.lower_body?.waist_circumference_unit ?? "cm"),
    hip_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.hip_circumference
      : (currMeasurement?.lower_body?.hip_circumference ?? ""),

    hip_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.hip_circumference_unit
      : (currMeasurement?.lower_body?.hip_circumference_unit ?? "cm"),

    thigh_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.thigh_circumference
      : (currMeasurement?.lower_body?.thigh_circumference ?? ""),

    thigh_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.thigh_circumference_unit
      : (currMeasurement?.lower_body?.thigh_circumference_unit ?? "cm"),

    knee_circumference: markReceivedChecked
      ? userMeasurement?.lower_body?.knee_circumference
      : (currMeasurement?.lower_body?.knee_circumference ?? ""),

    knee_circumference_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.knee_circumference_unit
      : (currMeasurement?.lower_body?.knee_circumference_unit ?? "cm"),

    trouser_length: markReceivedChecked
      ? userMeasurement?.lower_body?.trouser_length
      : (currMeasurement?.lower_body?.trouser_length ?? ""),

    trouser_length_unit: markReceivedChecked
      ? userMeasurement?.lower_body?.trouser_length_unit
      : (currMeasurement?.lower_body?.trouser_length_unit ?? "cm"),

    height: markReceivedChecked
      ? userMeasurement?.full_body?.height
      : (currMeasurement?.full_body?.height ?? ""),

    height_unit: markReceivedChecked
      ? userMeasurement?.full_body?.height_unit
      : (currMeasurement?.full_body?.height_unit ?? "cm"),

    dress_length: markReceivedChecked
      ? userMeasurement?.full_body?.dress_length
      : (currMeasurement?.full_body?.dress_length ?? ""),

    dress_length_unit: markReceivedChecked
      ? userMeasurement?.full_body?.dress_length_unit
      : (currMeasurement?.full_body?.dress_length_unit ?? "cm"),
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
            shoulder_width_unit: val?.bust_circumference_unit,
            armhole_circumference: val?.armhole_circumference,
            armhole_circumference_unit: val?.bust_circumference_unit,
            sleeve_length: val?.sleeve_length,
            sleeve_length_unit: val?.bust_circumference_unit,
            bicep_circumference: val?.bicep_circumference,
            bicep_circumference_unit: val?.bust_circumference_unit,
            waist_circumference: val?.waist_circumference_upper,
            waist_circumference_unit: val?.bust_circumference_unit,
          },
          lower_body: {
            waist_circumference: val?.waist_circumference_lower,
            waist_circumference_unit: val?.bust_circumference_unit,
            hip_circumference: val?.hip_circumference,
            hip_circumference_unit: val?.bust_circumference_unit,
            thigh_circumference: val?.thigh_circumference,
            thigh_circumference_unit: val?.bust_circumference_unit,
            knee_circumference: val?.knee_circumference,
            knee_circumference_unit: val?.bust_circumference_unit,
            trouser_length: val?.trouser_length,
            trouser_length_unit: val?.bust_circumference_unit,
          },
          full_body: {
            height: val?.height,
            height_unit: val?.bust_circumference_unit,
            dress_length: val?.dress_length,
            dress_length_unit: val?.bust_circumference_unit,
          },
        };

        setMeasurementArr((prev) => {
          if (currMeasurement?.id) {
            return prev.map((item) =>
              item.id === currMeasurement?.id ? updateVal : item,
            );
          } else {
            return [...prev, updateVal];
          }
        });

        setCurrMeasurement(null);
        setMeasurementsSubmitted(true);
        setShowMeasurementForm(false);
        resetForm();
        setSelectedTab("Upper Body");

        // ALWAYS show modal when measurements are complete AND fabric exists
        if (pendingFabric) {
          // Use setTimeout to ensure state updates are processed first
          setTimeout(() => {
            setShowCartModal(true);
          }, 100);
        }
      } else {
        handleProceed();
      }
    },
  });

  // Handle adding to cart with pending fabric and style/measurements
  const handleAddToCartWithFabric = () => {
    if (!pendingFabric || measurementArr.length === 0) {
      toastError("Missing fabric or measurement data");
      return;
    }

    const latestMeasurement = measurementArr[measurementArr.length - 1];

    const cartPayload = {
      product_id: pendingFabric.product_id,
      product_type: "FABRIC",
      quantity: pendingFabric.quantity || 1,
      customer_name: latestMeasurement.customer_name,
      color: pendingFabric.color || "",
      style_product_id: styleInfo?.id || styleInfo?.product_id,
      style_price: styleInfo?.price || 0,
      measurement: measurementArr,
    };

    if (!token) {
      // Save both pendingFabric and measurementArr to localStorage
      localStorage.setItem(
        "pending_fabric",
        JSON.stringify({
          ...pendingFabric,
          measurement: measurementArr,
        }),
      );
      toastSuccess(
        "Fabric and measurement saved! Please log in or sign up to continue.",
      );
      navigate("/login");
      return;
    }

    addCartMutate(cartPayload, {
      onSuccess: () => {
        // Clear pending fabric data
        localStorage.removeItem("pending_fabric");
        setPendingFabric(null);
        toastSuccess("Style and fabric added to cart successfully!");
        navigate("/view-cart");
      },
      onError: (error) => {
        console.error("Error adding to cart:", error);
        toastError("Failed to add to cart. Please try again.");
      },
    });
  };

  // Handle modal confirmation for adding to cart
  const handleConfirmAddToCart = () => {
    setShowCartModal(false);
    handleAddToCartWithFabric();
  };

  const removeMeasurementById = (idToRemove) => {
    setMeasurementArr((prev) => prev.filter((m) => m.id !== idToRemove));
  };

  return (
    <>
      <Breadcrumb
        title="Carybin"
        subtitle="Products"
        just="Carybin Details"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1743712882/AoStyle/image_lslmok.png"
      />
      <section className="Resizer section px-2 sm:px-4">
        <div className="mb-4">
          <CustomBackbtn />
        </div>
        <div>
          <div className="p-2 sm:p-6">
            {/* Conditionally render the Fabric section */}
            {pendingFabric && (
              <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6 relative">
                {/* Cancel/Remove Fabric Button */}
                <button
                  onClick={() => {
                    setPendingFabric(null);
                    localStorage.removeItem("pending_fabric");
                    toastSuccess("Fabric selection removed");
                  }}
                  className="absolute top-3 right-3 p-1.5 hover:bg-white/50 rounded-full transition-colors"
                  aria-label="Remove selected fabric"
                  title="Remove selected fabric"
                >
                  <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                </button>
                <h2 className="text-sm font-medium text-gray-500 mb-4">
                  Selected Fabric
                </h2>
                <div className="flex items-center space-x-4">
                  {(pendingFabric.photos && pendingFabric.photos[0]) ||
                  pendingFabric.image ? (
                    <img
                      src={pendingFabric.photos?.[0] || pendingFabric.image}
                      alt={pendingFabric.name || "Selected Fabric"}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {pendingFabric.name || "Selected Fabric"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {pendingFabric.quantity || 1} yards
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* {item ? ( */}
            {/* <div className="bg-[#FFF2FF] p-4 rounded-lg mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4"></h2>
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
              </div> */}
            {/* ) : (
              <></>
            )} */}

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-6xl mx-auto p-2 sm:p-4">
              {/* Image Gallery */}
              <div className="w-full md:w-1/2">
                <div className="mb-4">
                  {/* Show selected image or video in the big box */}
                  {styleInfo?.style?.video_url && selectedImage === "video" ? (
                    <video
                      src={styleInfo.style.video_url}
                      controls
                      className="w-full h-64 sm:h-80 md:h-96 object-cover rounded"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={styleInfo?.style?.photos[selectedImage]}
                      alt={styleInfo?.name}
                      className="w-full h-64 sm:h-80 md:h-96 object-cover rounded"
                    />
                  )}
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
                  {styleInfo?.style?.video_url && (
                    <div
                      className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ml-2 flex items-center justify-center bg-black relative cursor-pointer ${
                        selectedImage === "video"
                          ? "border-purple-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      // onClick={() => setSelectedImage("video")}
                    >
                      <video
                        src={styleInfo.style.video_url}
                        // controls
                        className="w-full h-full object-cover rounded-lg"
                        onClick={() => setSelectedImage("video")}
                        // poster={mainImage}
                      >
                        Your browser does not support the video tag.
                      </video>
                      {/* Video tag/icon overlay */}
                      <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" opacity="0.5" />
                          <polygon points="10,8 16,12 10,16" fill="white" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
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

                  {/* Rate & Review Button */}
                  <button
                    onClick={scrollToReviews}
                    className="mt-3 py-2 px-4 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 hover:border-purple-700 hover:text-purple-700 transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <MessageSquare size={18} />
                    <span>Ratings & Reviews</span>
                  </button>
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
                {pendingFabric && styleInfo?.style?.minimum_fabric_qty && (
                  <div className="mb-4">
                    {pendingFabric.quantity >=
                    styleInfo.style.minimum_fabric_qty ? (
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                        <svg
                          className="w-6 h-6 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="green"
                            opacity="0.15"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                          />
                        </svg>
                        <div>
                          <p className="text-green-800 font-semibold">
                            You have enough fabric for this style!
                          </p>
                          <p className="text-green-700 text-sm">
                            Selected:{" "}
                            <span className="font-bold">
                              {pendingFabric.quantity}
                            </span>{" "}
                            yards &nbsp;|&nbsp; Required:{" "}
                            <span className="font-bold">
                              {styleInfo.style.minimum_fabric_qty}
                            </span>{" "}
                            yards
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-6 h-6 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="yellow"
                              opacity="0.15"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01"
                              stroke="currentColor"
                            />
                          </svg>
                          <span className="text-yellow-700 font-semibold">
                            Not enough fabric selected!
                          </span>
                        </div>
                        <p className="text-yellow-700 text-sm">
                          Selected:{" "}
                          <span className="font-bold">
                            {pendingFabric.quantity}
                          </span>{" "}
                          yards &nbsp;|&nbsp; Required:{" "}
                          <span className="font-bold">
                            {styleInfo.style.minimum_fabric_qty}
                          </span>{" "}
                          yards
                        </p>
                        <button
                          className="cursor-pointer mt-2 w-fit border border-yellow-400 text-gray-900 font-semibold px-5 py-2 rounded-lg shadow transition-opacity"
                          onClick={() => {
                            if (pendingFabric) {
                              localStorage.removeItem("pending_fabric");
                              setPendingFabric(null);
                            }
                            // navigate(
                            //   `/shop-details/${pendingFabric?.product_id}`,
                            // );
                            navigate("/marketplace");
                          }}
                        >
                          Increase Fabric Yards
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* Location and Gender Display */}
                <div className="flex flex-wrap gap-4 items-center mb-2">
                  {/* Gender */}
                  {styleInfo?.gender && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14v7m0 0h-3m3 0h3M12 7a5 5 0 100 10 5 5 0 000-10z"
                        />
                      </svg>
                      <span className="text-blue-700 font-medium text-sm">
                        {styleInfo.gender.charAt(0).toUpperCase() +
                          styleInfo.gender.slice(1)}
                      </span>
                    </div>
                  )}
                  {/* Location */}
                  {styleInfo?.creator?.profile?.address && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 0v8m0 0c-4.418 0-8-3.582-8-8a8 8 0 1116 0c0 4.418-3.582 8-8 8z"
                        />
                      </svg>
                      <span className="text-green-700 font-medium text-sm">
                        {styleInfo.creator.profile.state},{" "}
                        {styleInfo.creator.profile.country}
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

                {/* <div className="pt-4">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded transition-colors">
                    Add To Cart
                  </button>
                </div> */}
              </div>
            </div>

            {/* Measurement Section */}
            <div className="mt-10 sm:mt-20">
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
                      setShowMeasurementForm(true);
                      setSelectedTab("Upper Body");
                    }}
                  />
                </div>
              )}

              {/* Add Measurement Button - Show when measurements are submitted but form is hidden */}
              {measurementsSubmitted && !showMeasurementForm && (
                <div className="flex justify-center my-8 px-4">
                  <button
                    onClick={() => {
                      setShowMeasurementForm(true);
                      setCurrMeasurement(null);
                      setSelectedTab("Upper Body");
                    }}
                    className="cursor-pointer w-full max-w-sm bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                  >
                    Add New Measurement
                  </button>
                </div>
              )}

              {/* Measurement Form Container - Only show when form should be visible */}
              {(!measurementsSubmitted || showMeasurementForm) && (
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 px-4">
                  {/* Measurement Image */}
                  <div className="w-full lg:w-2/5">
                    <img
                      src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744902411/WhatsApp_Image_2025-04-17_at_15.09.49_r3aaap.jpg"
                      alt="Body measurement diagram"
                      className="w-full max-w-md mx-auto lg:max-w-none rounded-md border border-gray-300"
                    />
                  </div>

                  {/* Measurement Form */}
                  <div className="w-full lg:w-3/5">
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
                    <div className="flex mb-6 border-b border-purple-500 overflow-x-auto">
                      {tabs.map((tab, index) => (
                        <button
                          key={tab}
                          className={`px-4 sm:px-8 py-3 font-medium relative whitespace-nowrap flex-shrink-0 ${
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

                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Bust Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                  step="any"
                                  placeholder={
                                    "Enter the width of your shoulder"
                                  }
                                  name={"shoulder_width"}
                                  required
                                  value={values.shoulder_width}
                                  onChange={handleChange}
                                  className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
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
                          </div>

                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Armhole Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                {"Sleeve Length"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder={
                                    "Enter the length of your sleeve"
                                  }
                                  name={"sleeve_length"}
                                  required
                                  value={values.sleeve_length}
                                  onChange={handleChange}
                                  className="flex-1 w-full p-4 border border-[#CCCCCC] outline-none rounded-l-md"
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
                          </div>

                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Bicep Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                {"Wrist Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                          </div>
                        </div>
                      )}

                      {selectedTab === "Lower Body" && (
                        <div className="mb-6">
                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Waist Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                {"Hip Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                          </div>

                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Thigh Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                {"Knee Circumference"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                          </div>

                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Trouser Length (Waist to Ankle)"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                          </div>
                        </div>
                      )}

                      {selectedTab === "Full Body" && (
                        <div className="mb-6">
                          <div className="grid mt-6 grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="mb-4">
                              <label className="block text-gray-700 mb-4">
                                {"Height"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                                {"Dress/Gown Length"}
                              </label>
                              <div className="flex">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
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
                          </div>
                        </div>
                      )}

                      {/* Proceed Button */}
                      <div className="flex flex-col gap-3 mt-8 mb-6">
                        <button
                          type="submit"
                          className="w-full bg-gradient text-white font-medium py-4 px-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-center"
                        >
                          {selectedTab === "Upper Body"
                            ? "Proceed to Lower Body"
                            : selectedTab === "Lower Body"
                              ? "Proceed to Full Body"
                              : pendingFabric
                                ? "Complete & Review Order" // Changed text to be clearer
                                : "Submit Measurements"}
                        </button>
                        {measurementsSubmitted && (
                          <button
                            type="button"
                            onClick={() => setShowMeasurementForm(false)}
                            className="w-full bg-gray-100 text-gray-700 font-medium py-4 px-6 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Show next steps after measurements are submitted */}
              {/* {measurementsSubmitted && !showMeasurementForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Measurements Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {pendingFabric
                        ? "Your style and fabric will be added to cart"
                        : "Choose what you'd like to do next"}
                    </p>

                    {pendingFabric ? (
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-700">
                            ✨ Ready to add your custom style with selected
                            fabric to cart
                          </p>
                        </div>
                        <button
                          onClick={() => setShowCartModal(true)}
                          disabled={addCartPending}
                          className="w-full bg-gradient text-white font-medium py-4 px-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          Add Style + Fabric to Cart
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                          to="/shop"
                          className="flex-1 bg-gradient text-white font-medium py-4 px-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-center"
                        >
                          Select Fabric
                        </Link>
                        <button
                          onClick={() => setShowMeasurementForm(true)}
                          className="flex-1 bg-gray-100 text-gray-700 font-medium py-4 px-6 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Edit Measurements
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}*/}
            </div>
          </div>
        </div>
      </section>

      {/* Product Reviews Section */}
      {correctProductId && (
        <section
          ref={reviewsRef}
          className="Resizer section px-4 py-8 bg-gray-50"
        >
          <div className="max-w-6xl mx-auto">
            <AuthenticatedProductReviews
              productId={correctProductId}
              initiallyExpanded={true}
              className="bg-white rounded-lg p-6 shadow-sm"
            />
            {/* Debug info */}
            {/* <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <p>
                <strong>Debug:</strong> Product ID being passed to reviews:{" "}
                <code>{correctProductId}</code>
              </p>
              <p className="mt-1">
                <strong>Available IDs:</strong> Main ID:{" "}
                <code>{styleInfo?.id}</code>, Product ID:{" "}
                <code>{styleInfo?.product_id}</code>
              </p>
            </div>*/}
          </div>
        </section>
      )}

      {/* Cart Confirmation Modal */}
      {console.log("🐛 Modal debug:", {
        showCartModal,
        hasPendingFabric: !!pendingFabric,
        pendingFabricData: pendingFabric,
        measurementCount: measurementArr.length,
        shouldShowModal:
          showCartModal && pendingFabric && measurementArr.length > 0,
      })}
      {showCartModal && pendingFabric && (
        <div className="fixed inset-0 flex justify-center items-start z-[9999] bg-black/50 backdrop-blur-sm p-4 pt-20 overflow-y-auto">
          <style>
            {`
              @keyframes fadeInUp {
                0% {
                  opacity: 0;
                  transform: translateY(40px) scale(0.98);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              .animate-fade-in-up {
                animation: fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
              }
            `}
          </style>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-fade-in-up my-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowCartModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>

            {/* Header */}
            <div className="text-center pt-8 pb-6 px-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Add to Cart!
              </h2>
              <p className="text-gray-600">
                Your custom style with fabric and measurements
              </p>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Fabric Info */}
              <div className="bg-purple-50 rounded-xl p-4 mb-4 relative">
                {/* Remove Fabric Button */}
                <button
                  onClick={() => {
                    setPendingFabric(null);
                    localStorage.removeItem("pending_fabric");
                    setShowCartModal(false);
                    toastSuccess("Fabric selection removed");
                  }}
                  className="absolute top-3 right-3 p-1.5 hover:bg-white/50 rounded-full transition-colors"
                  aria-label="Remove selected fabric"
                  title="Remove selected fabric"
                >
                  <X className="w-4 h-4 text-purple-600 hover:text-purple-800" />
                </button>
                <h3 className="font-semibold text-purple-900 mb-2">
                  Selected Fabric
                </h3>
                <div className="flex items-center space-x-3">
                  {(pendingFabric.photos && pendingFabric.photos[0]) ||
                  pendingFabric.image ? (
                    <img
                      src={pendingFabric.photos?.[0] || pendingFabric.image}
                      alt={pendingFabric.name || "Selected Fabric"}
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {pendingFabric.name || "Selected Fabric"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pendingFabric.quantity || 1} yards
                    </p>
                  </div>
                </div>
              </div>

              {/* Style Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Selected Style
                </h3>
                <div className="flex items-center space-x-3">
                  {styleInfo?.style?.photos?.[0] && (
                    <img
                      src={styleInfo.style.photos[0]}
                      alt={styleInfo?.name}
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {styleInfo?.name}
                    </p>
                    <p className="text-sm text-gray-600">Custom tailoring</p>
                  </div>
                </div>
              </div>

              {/* Measurements Info */}
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  Measurements
                </h3>
                <p className="text-sm text-green-700">
                  ✓ {measurementArr.length} measurement
                  {measurementArr.length !== 1 ? "s" : ""} submitted
                </p>
                {measurementArr.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Customer:{" "}
                    {measurementArr[measurementArr.length - 1]?.customer_name}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* If pendingFabric and minimum_fabric_qty is set and yards is too low, show warning and action buttons */}
                {pendingFabric &&
                styleInfo?.style?.minimum_fabric_qty &&
                Number(pendingFabric.quantity) <
                  Number(styleInfo.style.minimum_fabric_qty) ? (
                  <>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2 text-center">
                      <p className="text-red-700 font-semibold mb-1">
                        Not enough fabric selected!
                      </p>
                      <p className="text-red-600 text-sm">
                        This style requires at least{" "}
                        {styleInfo.style.minimum_fabric_qty} yards of fabric.
                        <br />
                        You have selected {pendingFabric.quantity} yard
                        {pendingFabric.quantity !== 1 ? "s" : ""}.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCartModal(false);
                        localStorage.removeItem("pending_fabric");
                        setPendingFabric(null);
                        navigate("/marketplace");
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 text-black rounded-xl transition-all duration-200 cursor-pointer shadow-lg border border-gray-300 bg-purple-100 hover:bg-purple-200"
                    >
                      <span>Select more yards</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleConfirmAddToCart}
                      disabled={addCartPending}
                      className="w-full cursor-pointer flex items-center justify-center space-x-2 px-6 py-4 bg-gradient text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19"
                        ></path>
                      </svg>
                      <span>
                        {addCartPending ? "Adding to Cart..." : "Add to Cart"}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowCartModal(false)}
                      disabled={addCartPending}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 text-black rounded-xl transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50 border border-gray-300"
                    >
                      <span>Select more measurements</span>
                    </button>
                  </>
                )}
                {/*
                <button
                  onClick={() => setShowCartModal(false)}
                  disabled={addCartPending}
                  className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Details
                </button>*/}
              </div>

              {/* Info Text */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  You can edit measurements or fabric selection before adding to
                  cart
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
