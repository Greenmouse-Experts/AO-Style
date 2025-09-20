import { useEffect, useMemo, useState, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";
import {
  Facebook,
  Twitter,
  Instagram,
  Star,
  Music2,
  MessageSquare,
} from "lucide-react";
import CartSelectionModal from "../components/CartSelectionModal";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import Cookies from "js-cookie";
import useSingleProductGeneral from "../../../hooks/dashboard/useeGetSingleProduct";
import useToast from "../../../hooks/useToast";
import useAddCart from "../../../hooks/cart/useAddCart";
import LoaderComponent from "../../../components/BeatLoader";
import useProductGeneral from "../../../hooks/dashboard/useGetProductGeneral";
import SubmitProductModal from "../components/SubmitProduct";
import { generateUniqueId } from "../../../lib/helper";
import { Tooltip } from "antd";
import AuthenticatedProductReviews from "../../../components/reviews/AuthenticatedProductReviews";
import CustomBackbtn from "../../../components/CustomBackBtn";

const product = {
  name: "Luxury Embellished Lace Fabrics",
  price: "₦12,000",
  image:
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  images: [
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
    "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214604/AoStyle/image3_ebun7q.png",
  ],
  tags: ["Red", "Silk", "New"],
  colors: ["#c11c28", "#3b82f6", "#22c55e", "#facc15", "#a855f7"],
  reviews: 5,
};

const relatedProducts = [
  {
    id: 1,
    name: "Plaid Colourful Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214605/AoStyle/image4_p4lpek.png",
  },
  {
    id: 2,
    name: "Yellow Cashmere",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
  },
  {
    id: 3,
    name: "100% Cotton Material",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214577/AoStyle/image2_dqzhpz.png",
  },
  {
    id: 4,
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
  {
    id: 5,
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
  {
    id: 6,
    name: "Red Ankara Fabric",
    price: "₦12,000",
    image:
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741214549/AoStyle/image_exywgk.png",
  },
];

export default function ShopDetails() {
  const [mainImage, setMainImage] = useState("");
  const [tab, setTab] = useState("details");
  const [quantity, setQuantity] = useState(1);

  const [selectedColor, setSelectedColor] = useState(null);

  const ratingStats = [2, 3, 0, 0, 0];
  const reviewsRef = useRef(null);

  const location = useLocation();
  const params = useParams();

  // Check if coming from style-first workflow
  const styleData =
    location?.state?.styleData ||
    JSON.parse(localStorage.getItem("selected_style") || "null");
  const measurementData =
    location?.state?.measurementData ||
    JSON.parse(localStorage.getItem("measurement_data") || "[]");
  const fromStyleFirst = location?.state?.fromStyleFirst || !!styleData;
  const handleRemoveStyle = () => {
    // Clear localStorage
    localStorage.removeItem("selected_style");
    localStorage.removeItem("measurement_data");

    // Option 1: Navigate back to the same route to trigger a refresh
    navigate(location.pathname, { replace: true });

    // Option 2: Alternative - reload the page (less elegant but works)
    // window.location.reload();

    // Option 3: If you want to use state management instead of navigation
    // You would need to add state variables at the component level:
    // const [localStyleData, setLocalStyleData] = useState(styleData);
    // const [localFromStyleFirst, setLocalFromStyleFirst] = useState(fromStyleFirst);
    // Then update them here:
    // setLocalStyleData(null);
    // setLocalFromStyleFirst(false);
  };
  // Debug logging for received data
  console.log("🎨 ShopDetails Data Debug:", {
    fromStyleFirst: fromStyleFirst,
    hasStyleData: !!styleData,
    hasMeasurementData: !!measurementData,
    locationState: location?.state,
    styleData: styleData,
    styleDataId: styleData?.id,
    styleDataStructure: styleData ? Object.keys(styleData) : null,
    measurementData: measurementData,
    measurementCount: Array.isArray(measurementData)
      ? measurementData.length
      : 0,
    localStorage: {
      selectedStyle: localStorage.getItem("selected_style"),
      measurementData: localStorage.getItem("measurement_data"),
    },
  });

  const productInfo = params.id;

  console.log("🔍 ShopDetails: URL params:", params);
  console.log("🔍 ShopDetails: Product ID from URL:", productInfo);

  const { isPending: addCartPending, addCartMutate } = useAddCart();

  const { data: getSingleProductData, isPending: productIsPending } =
    useSingleProductGeneral("FABRIC", productInfo);

  const productVal = getSingleProductData?.data;

  // Console log the fetched product details
  console.log(
    "📦 ShopDetails: Raw product data from API:",
    getSingleProductData,
  );
  console.log("📦 ShopDetails: Processed productVal:", productVal);
  console.log("📦 ShopDetails: Product structure:", {
    hasData: !!productVal,
    productKeys: productVal ? Object.keys(productVal) : null,
    fabricId: productVal?.fabric?.id,
    productId: productVal?.product_id,
    productData: productVal?.product,
    fabricData: productVal?.fabric,
  });

  // Log product data changes
  useEffect(() => {
    if (getSingleProductData) {
      console.log("🔄 ShopDetails: Product data updated:", {
        loading: productIsPending,
        hasData: !!getSingleProductData,
        dataStructure: getSingleProductData
          ? Object.keys(getSingleProductData)
          : null,
        productVal: productVal,
        productValKeys: productVal ? Object.keys(productVal) : null,
      });

      // Specific logging for review product ID
      const correctProductId = productVal?.product_id;
      console.log("⭐ ShopDetails: Review product ID analysis:", {
        urlProductId: productInfo,
        fabricId: productVal?.fabric?.id,
        productId: productVal?.product_id,
        productMainId: productVal?.id,
        productProductId: productVal?.product?.id,
        correctIdToUse: correctProductId,
        reviewProductIdBeingPassed: correctProductId,
        usingProductIdField: "productVal.product_id",
      });
      console.log(
        "🎯 ShopDetails: USING CORRECT PRODUCT ID FOR REVIEWS:",
        correctProductId,
      );
    }
  }, [getSingleProductData, productVal, productIsPending]);

  // useEffect(() => {
  //   setQuantity(productVal?.minimum_yards);
  // }, [productVal?.minimum_yards]);

  const incrementQty = () => {
    setQuantity((prev) => +prev + +productVal?.minimum_yards);
  };

  const decrementQty = () => {
    setQuantity((prev) =>
      +prev > +productVal?.minimum_yards
        ? +prev - productVal?.minimum_yards
        : +productVal?.minimum_yards,
    );
  };

  useEffect(() => {
    if (productVal?.minimum_yards) {
      setQuantity(+productVal.minimum_yards);
    }
  }, [productVal?.minimum_yards]);

  const [isCartSelectionModalOpen, setIsCartSelectionModalOpen] =
    useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fabricData, setFabricData] = useState(null);

  const handleShowCartSelection = () => {
    // Store fabric data for later use
    const fabricInfo = {
      product_id: productVal?.product_id,
      product_type: "FABRIC",
      quantity: +quantity,
      color: selectedColor,
      // Add customer_name from measurements if available
      customer_name: measurementData?.[0]?.customer_name || "Customer",
      // Add display info for style selection page
      name: productVal?.name || "Selected Fabric",
      price: productVal?.price || 0,
      image: productVal?.photos?.[0] || productVal?.image,
    };
    setFabricData(fabricInfo);

    // If coming from style-first workflow, add directly to cart
    if (fromStyleFirst) {
      handleDirectAddToCartWithStyle(fabricInfo);
    } else {
      setIsCartSelectionModalOpen(true);
    }
  };

  const handleDirectAddToCart = () => {
    console.log("🛒 Adding fabric directly to cart:", fabricData);
    // Check if user is logged in (token exists)
    if (!token) {
      // Redirect to login page
      navigate("/login");
      return;
    }
    addCartMutate(fabricData, {
      onSuccess: (data) => {
        setIsCartSelectionModalOpen(false);
        setIsSuccessModalOpen(true);

        // Auto-hide success modal after 3 seconds
        setTimeout(() => {
          setIsSuccessModalOpen(false);
        }, 3000);
      },
    });
  };

  const handleDirectAddToCartWithStyle = (fabricInfo) => {
    console.log("🛒 Starting cart addition process:", {
      fabricInfo: fabricInfo,
      styleData: styleData,
      measurementData: measurementData,
      fromStyleFirst: fromStyleFirst,
      hasStyle: !!styleData,
      hasMeasurement: !!measurementData,
      styleId: styleData?.id,
      styleName: styleData?.name,
      measurementCount: measurementData?.length,
    });

    // Check if user is logged in (token exists)
    if (!token) {
      // Redirect to login page
      navigate("/login");
      return;
    }

    // Create combined payload with fabric, style, and measurements
    const combinedPayload = {
      ...fabricInfo,
      style_product_id: styleData?.id || styleData?.product_id,
      style_price: styleData?.price || 0,
      measurement: measurementData,
    };

    console.log("🔄 Adding fabric + style + measurements in single request:", {
      combinedPayload: combinedPayload,
      hasStyleProductId: !!combinedPayload.style_product_id,
      hasMeasurement: !!combinedPayload.measurement,
    });

    console.log("💰 Style pricing details in ShopDetails:", {
      stylePrice: styleData?.price,
      stylePriceInPayload: combinedPayload.style_price,
      styleId: combinedPayload.style_product_id,
      fabricPrice: fabricInfo.price,
      totalExpectedPrice: (fabricInfo.price || 0) + (styleData?.price || 0),
    });

    // Validate required fields
    if (!combinedPayload.style_product_id) {
      console.error("❌ Missing style_product_id:", {
        styleData: styleData,
        styleDataId: styleData?.id,
        styleDataProductId: styleData?.product_id,
      });
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 3000);
      return;
    }

    // Add everything to cart in a single request
    addCartMutate(combinedPayload, {
      onSuccess: (data) => {
        console.log("✅ SUCCESS: Fabric + Style + Measurements added to cart");
        console.log("📦 Full cart response:", data);
        console.log("📦 Response data structure:", data?.data);

        setIsSuccessModalOpen(true);

        // Clear localStorage after successful cart addition
        localStorage.removeItem("selected_style");
        localStorage.removeItem("measurement_data");

        // Auto-hide success modal after 3 seconds
        setTimeout(() => {
          setIsSuccessModalOpen(false);
        }, 3000);
      },
      onError: (error) => {
        console.error("❌ FAILED: Error adding to cart:", error);
        console.error("❌ Error details:", error?.response?.data);
        console.error("❌ Full error object:", error);
      },
    });
  };

  const handleSelectStylesFirst = () => {
    // Store fabric data in localStorage for style selection
    localStorage.setItem("pending_fabric", JSON.stringify(fabricData));
    setIsCartSelectionModalOpen(false);
    navigate("/pickastyle");
  };

  useEffect(() => {
    if (productVal) {
      setMainImage(productVal?.photos[0]);
    }
  }, [productVal]);

  const token = Cookies.get("token");

  const { toastError, toastSuccess } = useToast();
  const currentPath = location.pathname + location.search;
  const navigate = useNavigate();

  console.log(productVal?.minimum_yards);

  const { data: getProductPreferenceData, isPending: productGeneralIsPending } =
    useProductGeneral(
      {
        "pagination[limit]": 10,
        "pagination[page]": 1,
        category_id: productVal?.product?.category_id,
        status: "PUBLISHED",
      },
      "FABRIC",
    );

  // console.log(getProductPreferenceData?.data, productInfo);

  const filteredData = getProductPreferenceData?.data?.filter(
    (item) => item.fabric?.id !== productInfo,
  );

  // API-based cart system already declared above

  const id = useMemo(() => generateUniqueId(), []);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <Breadcrumb
        title="Shop"
        subtitle="Shop"
        just="Enjoy a wide selection of Materials & Designs"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1741604351/AoStyle/image_ugfmjr.jpg"
      />
      {productIsPending ? (
        <div className="h-screen flex items-center">
          {" "}
          <LoaderComponent />
        </div>
      ) : (
        <section className="Resizer section px-4">
          <div className="mb-4">
            <CustomBackbtn />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section - Enhanced layout with sticky positioning */}
            <div className="lg:sticky lg:top-4 lg:self-start space-y-4 lg:max-h-screen lg:overflow-y-auto">
              {/* Main Image or Video */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                {mainImage === productVal?.video_url ? (
                  <video
                    src={productVal.video_url}
                    controls
                    className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
                    poster={productVal?.photos?.[0]}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={mainImage}
                    alt={productVal?.product?.name}
                    className="w-full h-96 lg:h-[500px] object-cover"
                  />
                )}
                {/* Heart icon removed as requested */}
              </div>

              {/* Thumbnail Images & Video */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productVal?.photos?.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {productVal?.video_url && (
                  <button
                    type="button"
                    onClick={() => setMainImage(productVal.video_url)}
                    className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all ml-2 flex items-center justify-center bg-black relative ${
                      mainImage === productVal.video_url
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <video
                      src={productVal.video_url}
                      className="w-full h-full object-cover rounded-lg pointer-events-none"
                      poster={productVal?.photos?.[0]}
                    />
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
                  </button>
                )}
              </div>
            </div>

            {/* Details Section - Enhanced layout */}
            <div className="space-y-6">
              {/* Style Information - Show when coming from style-first workflow */}
              {fromStyleFirst && styleData && (
                <div className="bg-[#FFF2FF] p-4 rounded-lg border border-purple-200 relative">
                  {/* X button at top right */}
                  <button
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-purple-100 transition-colors"
                    aria-label="Remove selected style"
                    onClick={handleRemoveStyle}
                  >
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                    Selected Style
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={styleData?.style?.photos?.[0] || styleData?.image}
                        alt="selected style"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {styleData?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        X 1 Piece • {measurementData?.length || 0} Measurement
                        {measurementData?.length !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-medium text-purple-600 mt-1">
                        ₦{styleData?.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Title and Price */}
              <div className="space-y-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {productVal?.product?.name}
                </h1>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-purple-600">
                    ₦{productVal?.product?.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    per yard
                  </span>
                </div>
                {/* SKU Section */}
                {productVal?.product?.sku && (
                  <div className="space-y-1 bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      SKU
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.product.sku}
                    </p>
                  </div>
                )}
                {/* Product Status Badge */}
                {productVal?.approval_status && (
                  <div className="inline-flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        productVal.approval_status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {productVal.approval_status}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Material Type */}
                {productVal?.material_type && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Material
                    </span>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {productVal.material_type}
                    </p>
                  </div>
                )}

                {/* Business Type */}
                {productVal?.business_id && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Business ID
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.business_id}
                    </p>
                  </div>
                )}

                {/* Minimum Yards */}
                {productVal?.minimum_yards && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Minimum Order
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.minimum_yards} yards
                    </p>
                  </div>
                )}

                {/* Currency */}
                {productVal?.currency && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Currency
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.currency}
                    </p>
                  </div>
                )}

                {/* Category */}
                {productVal?.category?.name && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Category
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.category.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Product Description */}
              {productVal?.description && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Description
                  </h3>
                  <div className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                    {productVal.description
                      .split("\n")
                      .map((paragraph, index) => (
                        <p key={index} className={index > 0 ? "mt-3" : ""}>
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Creator Information */}
              {productVal?.creator && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Created By
                  </h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {productVal.creator.name ||
                          `Creator ${productVal.creator.id?.slice(-8)}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {productVal.creator.role || "Creator"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Section */}
              {productVal?.product?.tags?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productVal?.product?.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Colours */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Available Colours
                  {selectedColor && (
                    <span className="ml-2 text-xs text-purple-600 font-normal normal-case">
                      (Selected: {selectedColor})
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {productVal?.fabric_colors?.split(",").map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 hover:scale-105 ${
                        selectedColor === color
                          ? "border-purple-500 ring-4 ring-purple-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    >
                      {selectedColor === color && (
                        <svg
                          className="w-6 h-6 text-white mx-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedColor && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="font-medium">Please select a color</span>{" "}
                    to add this item to your cart.
                  </p>
                )}

                {fromStyleFirst && styleData && (
                  <div className="space-y-2">
                    {Array.isArray(measurementData) &&
                    measurementData.length === 1 ? (
                      <p className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <span className="font-medium">
                          Minimum yards required for style -
                        </span>{" "}
                        {styleData?.style?.minimum_fabric_qty || 0}
                      </p>
                    ) : Array.isArray(measurementData) &&
                      measurementData.length > 1 ? (
                      <div className="text-sm bg-purple-50 p-3 rounded-lg border border-purple-200 flex flex-col gap-1">
                        <span className="font-medium text-purple-700">
                          Multiple measurements detected:
                        </span>
                        <span>
                          <span className="font-medium text-purple-700">
                            Minimum yards required ={" "}
                          </span>
                          {styleData?.style?.minimum_fabric_qty || 0} yards
                          {" × "}
                          {measurementData.length} measurements
                          {" = "}
                          <span className="font-bold text-purple-900">
                            {(styleData?.style?.minimum_fabric_qty || 0) *
                              measurementData.length}{" "}
                            yards
                          </span>
                        </span>
                        <span className="text-xs text-purple-500">
                          Please ensure your quantity is at least this amount to
                          proceed.
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Quantity (Yards)
                  {
                    <span className="ml-2 text-xs text-gray-500 font-normal normal-case">
                      (Min: {productVal?.minimum_yards})
                    </span>
                  }
                </h3>
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <Tooltip
                      title={
                        quantity <= productVal?.minimum_yards
                          ? `Minimum quantity is ${productVal?.minimum_yards} yards`
                          : "Decrease quantity"
                      }
                      placement="top"
                    >
                      <span>
                        <button
                          onClick={decrementQty}
                          disabled={quantity <= productVal?.minimum_yards}
                          className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                      </span>
                    </Tooltip>
                    <span className="px-6 py-3 text-lg font-semibold text-gray-900 bg-white border-x border-gray-200 min-w-[80px] text-center">
                      {quantity}
                    </span>
                    <Tooltip title={"Increase quantity"} placement="top">
                      <button
                        onClick={incrementQty}
                        className="p-3 hover:bg-gray-100 transition-colors"
                        title="Increase quantity"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">
                    <span className="font-medium">
                      Total: ₦
                      {(
                        productVal?.product?.price * quantity
                      )?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(productVal?.created_at || productVal?.updated_at) && (
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
                  {productVal?.created_at && (
                    <div>
                      <span className="font-semibold">Created:</span>
                      <br />
                      {new Date(productVal.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  )}
                  {productVal?.updated_at && (
                    <div>
                      <span className="font-semibold">Updated:</span>
                      <br />
                      {new Date(productVal.updated_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Additional Product Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200 mt-4">
                {/* Gender Suitability */}
                {productVal?.gender_suitability && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Gender Suitability
                    </span>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {productVal.gender_suitability}
                    </p>
                  </div>
                )}

                {/* Weight per yard */}
                {productVal?.weight_per_unit && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Weight per Yard
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.weight_per_unit} g
                    </p>
                  </div>
                )}

                {/* Local Name */}
                {productVal?.local_name && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Local Name
                    </span>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {productVal.local_name}
                    </p>
                  </div>
                )}
                {productVal?.product?.gender && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Gender Suitability
                    </span>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {productVal?.product?.gender}
                    </p>
                  </div>
                )}
                {/* Manufacturer's Name */}
                {productVal?.manufacturer_name && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Manufacturer
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.manufacturer_name}
                    </p>
                  </div>
                )}

                {/* Fabric Texture */}
                {productVal?.fabric_texture && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Fabric Texture
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.fabric_texture}
                    </p>
                  </div>
                )}

                {/* Quantity */}
                {typeof productVal?.quantity !== "undefined" && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quantity Available
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {productVal.quantity}
                    </p>
                  </div>
                )}
              </div>
              <div>
                {productVal?.product?.creator?.profile?.state &&
                  productVal?.product?.creator?.profile?.country && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 mb-2">
                      {/* Location Icon */}
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"
                        />
                      </svg>
                      <span className="text-sm text-green-800 font-medium">
                        {productVal.product.creator.profile.state},{" "}
                        {productVal.product.creator.profile.country}
                      </span>
                    </div>
                  )}
              </div>
              {/* Add to Cart Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  disabled={
                    !selectedColor ||
                    addCartPending ||
                    quantity <
                      styleData?.style?.minimum_fabric_qty *
                        measurementData.length
                  }
                  onClick={handleShowCartSelection}
                  className={
                    !selectedColor ||
                    addCartPending ||
                    quantity <
                      styleData?.style?.minimum_fabric_qty *
                        measurementData.length
                      ? "w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-gradient text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }
                >
                  <span>
                    {addCartPending
                      ? "Adding to Cart..."
                      : fromStyleFirst
                        ? "Add Fabric & Style to Cart"
                        : "Add To Cart"}
                  </span>
                </button>

                {/* Additional CTA buttons */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={scrollToReviews}
                    className="py-3 px-4 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 hover:border-purple-700 hover:text-purple-700 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <MessageSquare size={18} />
                    <span>Ratings & Reviews</span>
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    disabled={!productVal}
                    className="py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Share Product
                  </button>
                </div>
              </div>

              {/* Modals */}
              {/* Cart Selection Modal - Only show for fabric-first workflow */}
              {!fromStyleFirst && (
                <CartSelectionModal
                  isOpen={isCartSelectionModalOpen}
                  onClose={() => setIsCartSelectionModalOpen(false)}
                  onAddToCart={handleDirectAddToCart}
                  onSelectStyles={handleSelectStylesFirst}
                  isPending={addCartPending}
                />
              )}

              {/* Success Modal */}
              {isSuccessModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md animate-fade-in-up relative">
                    {/* Close Button */}
                    <button
                      onClick={() => setIsSuccessModalOpen(false)}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
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
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Added to Cart!
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Fabric has been successfully added to your cart.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsSuccessModalOpen(false)}
                          className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                        >
                          Continue Shopping
                        </button>
                        <Link to="/view-cart" className="flex-1">
                          <button className="w-full py-3 px-6 bg-gradient text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200">
                            View Cart
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Share Modal */}
              {isShareModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 pb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Share Product
                      </h3>
                      <button
                        onClick={() => setIsShareModalOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Product Preview */}
                    {productVal && (
                      <div className="px-6 pb-4">
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <img
                            src={
                              productVal?.photos?.[0] ||
                              "/placeholder-image.jpg"
                            }
                            alt={productVal?.name || "Product"}
                            className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTE2IDEySDhIMTZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=";
                            }}
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {productVal?.name || "Product"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {productVal?.price_per_yard
                                ? `₦${productVal.price_per_yard}/yard`
                                : "Price on request"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Social Media Share Options - Smaller */}
                    <div className="px-6 pb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Share on social media
                      </p>
                      <div className="flex space-x-4 justify-center">
                        <button
                          onClick={() => {
                            const url = encodeURIComponent(
                              window.location.href,
                            );
                            const text = encodeURIComponent(
                              `Check out this amazing fabric: ${productVal?.name || "Product"} - Available at AO Style`,
                            );
                            window.open(
                              `https://wa.me/?text=${text}%20${url}`,
                              "_blank",
                            );
                          }}
                          className="flex flex-col items-center p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            const url = encodeURIComponent(
                              window.location.href,
                            );
                            const text = encodeURIComponent(
                              `Check out this amazing fabric: ${productVal?.name || "Product"} - Available at AO Style`,
                            );
                            window.open(
                              `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                              "_blank",
                            );
                          }}
                          className="flex flex-col items-center p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">Twitter</span>
                        </button>

                        <button
                          onClick={() => {
                            const url = encodeURIComponent(
                              window.location.href,
                            );
                            window.open(
                              `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                              "_blank",
                            );
                          }}
                          className="flex flex-col items-center p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">Facebook</span>
                        </button>
                      </div>
                    </div>

                    {/* Copy Link Section - Compact with icon */}
                    <div className="px-6 pb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Or copy link
                      </p>
                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={window.location.href}
                          readOnly
                          className="flex-1 bg-transparent text-sm text-gray-700 outline-none px-3 py-2.5 select-all"
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                window.location.href,
                              );
                              toastSuccess("Link copied to clipboard!");
                              setIsShareModalOpen(false);
                            } catch (err) {
                              // Fallback for older browsers
                              const textArea =
                                document.createElement("textarea");
                              textArea.value = window.location.href;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand("copy");
                              document.body.removeChild(textArea);
                              toastSuccess("Link copied to clipboard!");
                              setIsShareModalOpen(false);
                            }
                          }}
                          className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-r-lg transition-colors"
                          title="Copy link"
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
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Close button */}
                    <div className="flex justify-end px-6 pb-6">
                      <button
                        onClick={() => setIsShareModalOpen(false)}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Enhanced Tabs Section */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    tab === "details"
                      ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("details")}
                >
                  Product Details
                </button>
                {/* Uncomment if reviews are needed */}
                {/* <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    tab === "reviews"
                      ? "border-b-2 border-purple-600 text-purple-600 bg-purple-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setTab("reviews")}
                >
                  Reviews
                </button> */}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {tab === "details" ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {productVal?.product?.description ||
                      "No description available for this product."}
                  </p>
                </div>
              ) : (
                /* Reviews content - keeping original structure */
                <div className="flex flex-col md:flex-row md:gap-10 mt-4 md:mt-10">
                  {/* Left Summary */}
                  <div className="w-full md:w-64 p-4 border border-[#CCCCCC] outline-none rounded-md bg-gray-50 mb-6 md:mb-0">
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-semibold">4.5/5</p>
                      <div className="flex justify-center text-yellow-500 mt-1">
                        {Array(4)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="md:w-4 md:h-4"
                              fill="currentColor"
                              stroke="none"
                            />
                          ))}
                        <Star size={14} className="md:w-4 md:h-4" />
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        5 Ratings
                      </p>
                    </div>

                    {/* Ratings Breakdown */}
                    <div className="mt-4 md:mt-6 space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-700">
                      {ratingStats.map((count, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="w-4">{5 - i}★</span>
                          <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded">
                            <div
                              className="h-1.5 md:h-2 bg-yellow-400 rounded"
                              style={{ width: `${(count / 5) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-gray-500">
                            ({count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="flex-1 space-y-4 md:space-y-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 md:gap-4">
                        <img
                          src={`https://randomuser.me/api/portraits/men/${
                            i + 1
                          }.jpg`}
                          alt="User"
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs md:text-sm text-gray-700">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit, sed do eiusmod tempor incididunt ut labore et
                            dolore magna aliqua.
                          </p>
                          <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2 text-xs md:text-sm font-medium text-gray-800">
                            <span>
                              {
                                [
                                  "Chukka Uzo",
                                  "French Tolu",
                                  "Princess Olukoya",
                                  "Sandra Bullock",
                                  "John Wick",
                                ][i]
                              }
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-yellow-500 flex items-center gap-1">
                              4.5/5{" "}
                              <Star
                                size={12}
                                className="md:w-3.5 md:h-3.5"
                                fill="currentColor"
                                stroke="none"
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Enhanced Related Products */}
          {filteredData?.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                You might also like
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData?.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop-details/${product?.fabric?.id}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product?.fabric?.photos[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-purple-600">
                          {product.price}
                        </span>
                        <span className="text-sm text-gray-500">per yard</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Product Reviews Section - Always show when productInfo exists */}
      {productInfo && productVal?.product_id && (
        <section
          ref={reviewsRef}
          className="Resizer section px-4 py-8 bg-gray-50"
        >
          <div className="max-w-6xl mx-auto">
            <AuthenticatedProductReviews
              productId={productVal.product_id}
              initiallyExpanded={true}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            />
          </div>
        </section>
      )}
    </>
  );
}
