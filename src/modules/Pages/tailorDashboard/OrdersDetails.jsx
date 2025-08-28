import {
  Phone,
  MessageSquare,
  Mail,
  X,
  Scissors,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Ruler,
  User,
  Upload,
  Image,
  Loader2,
  Play,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";
import MeasurementsModal from "./components/MeasurementsModal";
import CustomBackbtn from "../../../components/CustomBackBtn";

const OrderDetails = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
  const [markCompletedChecked, setMarkCompletedChecked] = useState(false);
  const [markSentChecked, setMarkSentChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [currentActionType, setCurrentActionType] = useState(null);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const { isPending: isImageUploading, uploadImageMutate } = useUploadImage();
  const { isPending: isStatusUpdating, updateOrderStatusMutate } =
    useUpdateOrderStatus();

  // Get order ID from URL params
  const { id } = useParams();

  // Fetch order data from API
  const {
    data,
    isPending: getOrderIsPending,
    isError,
    refetch,
  } = useGetSingleOrder(id);

  // Extract order information from API response
  const orderInfo = data?.data || {};
  const orderPurchase = data?.data?.order_items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];
  const measurements = (() => {
    console.log("Raw orderMetadata:", orderInfo?.payment?.metadata);

    const result =
      orderInfo?.payment?.metadata?.reduce((acc, metadataItem, metaIndex) => {
        console.log(`Processing metadata item ${metaIndex}:`, metadataItem);

        if (
          metadataItem?.measurement &&
          Array.isArray(metadataItem.measurement)
        ) {
          console.log(
            `Found ${metadataItem.measurement.length} measurements in metadata item ${metaIndex}`,
          );

          const mappedMeasurements = metadataItem.measurement.map(
            (m, measureIndex) => {
              console.log(`Processing measurement ${measureIndex}:`, m);
              return {
                ...m,
                customer_name:
                  m.customer_name ||
                  metadataItem.customer_name ||
                  `Customer ${acc.length + measureIndex + 1}`,
              };
            },
          );

          return [...acc, ...mappedMeasurements];
        }
        return acc;
      }, []) || [];

    console.log("Final extracted measurements:", result);
    return result;
  })();
  console.log("order info", orderInfo);
  // Determine if this is a fabric-only order or has tailoring/style components
  const hasTailoringComponents = orderMetadata && orderMetadata.length > 0;
  const isFabricOnlyOrder = !hasTailoringComponents;

  const formatNumberWithCommas = (num) => {
    return parseInt(num || 0).toLocaleString();
  };

  const formatDateStr = (dateStr, format) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayOrderId = (id) => {
    return `${id?.slice(-8)?.toUpperCase() || "N/A"}`;
  };

  // Upload image to multimedia endpoint
  const uploadImageToMultimedia = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    return new Promise((resolve, reject) => {
      uploadImageMutate(formData, {
        onSuccess: (result) => {
          console.log(result);
          const imageUrl =
            result?.data?.data?.url ||
            result?.url ||
            result?.data?.image_url ||
            result?.imageUrl;
          resolve(imageUrl);
        },
        onError: (error) => {
          reject(
            new Error(`Upload failed: ${error?.message || "Unknown error"}`),
          );
        },
      });
    });
  };

  // Update order status with image
  const updateOrderStatus = async (imageUrl, actionType) => {
    const statusData = {
      status: actionType === "received" ? "PROCESSING" : "OUT_FOR_DELIVERY",
      metadata: {
        image: imageUrl,
      },
    };

    return new Promise((resolve, reject) => {
      updateOrderStatusMutate(
        { id, statusData },
        {
          onSuccess: (result) => {
            console.log("✅ Order status updated:", result);
            resolve(result);
          },
          onError: (error) => {
            reject(
              new Error(error?.message || "Failed to update order status"),
            );
          },
        },
      );
    });
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    // File type validation
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setSelectedFile(file);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading image...");

    try {
      // Step 1: Upload image to multimedia endpoint
      console.log("📤 Step 1: Uploading to multimedia endpoint...");
      const imageUrl = await uploadImageToMultimedia(selectedFile);

      if (!imageUrl) {
        throw new Error("No image URL received from multimedia upload");
      }

      console.log("✅ Image uploaded successfully, URL:", imageUrl);
      setUploadStatus("Updating order status...");

      // Step 2: Update order status with image URL
      console.log("📊 Step 2: Updating order status...");
      await updateOrderStatus(imageUrl, currentActionType);

      console.log("✅ Order status updated successfully");
      setUploadStatus("Complete!");

      // Show success message
      const actionText =
        currentActionType === "received"
          ? "marked as received"
          : currentActionType === "completed"
            ? "marked as completed"
            : "marked as sent";
      alert(`Success! Garment image uploaded and order ${actionText}.`);

      // Update checkbox state
      if (currentActionType === "received") {
        setMarkReceivedChecked(true);
      } else if (currentActionType === "completed") {
        setMarkCompletedChecked(true);
      } else if (currentActionType === "sent") {
        setMarkSentChecked(true);
      }

      // Close popup and reset state
      handleClosePopup();

      // Refetch order data to get updated status
      refetch();
    } catch (error) {
      console.error("❌ Upload flow error:", error);
      setUploadStatus("Upload failed");
      alert(`Upload failed: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCheckboxChange = (type) => {
    if (type === "received" && !markReceivedChecked) {
      setCurrentActionType("received");
      setShowUploadPopup(true);
    } else if (type === "completed" && !markCompletedChecked) {
      setCurrentActionType("completed");
      setShowUploadPopup(true);
    } else if (type === "sent" && !markSentChecked) {
      setCurrentActionType("sent");
      setShowUploadPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowUploadPopup(false);
    setSelectedFile(null);
    setImagePreview(null);
    setUploadStatus("");
    setCurrentActionType(null);
    const fileInput = document.getElementById("garment-upload");
    if (fileInput) fileInput.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getActionTitle = () => {
    if (currentActionType === "received") return "Mark as Received";
    if (currentActionType === "completed") return "Mark as Completed";
    if (currentActionType === "sent") return "Mark as Sent";
    return "Upload Image";
  };

  // Measurement Modal
  const handleOpenMeasurementModal = () => setShowMeasurementModal(true);
  const handleCloseMeasurementModal = () => setShowMeasurementModal(false);

  // Video Modal functions
  const handleExpandVideo = (videoType) => {
    setExpandedVideo(videoType);
  };

  const handleCloseVideoModal = () => {
    setExpandedVideo(null);
  };

  if (getOrderIsPending) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader />
          <p className="text-gray-500 mt-4">Loading order details...</p>
          <p className="text-sm text-gray-400">Order ID: {id}</p>
        </div>
      </div>
    );
  }

  if (isError || (!getOrderIsPending && !orderInfo?.id)) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load order details</p>
          <p className="text-sm text-gray-600 mb-4">
            Order ID: {id || "No ID provided"}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Error: {isError ? "API Error" : "No order data received"}
          </p>
          <button
            onClick={() => {
              console.log("📋 Retrying order fetch for ID:", id);
              refetch();
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const status_options = ["PROCESSING", "OUT_FOR_DELIVERY"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CustomBackbtn />
            <h1 className="text-2xl font-bold text-gray-900 ">Order Details</h1>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="bg-white rounded-lg p-6">
                {/* Order Details Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-base font-semibold text-gray-900 mb-1">
                      Order Details
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                      {orderInfo?.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Order Details - Clean Layout */}
                <div className="space-y-8 mb-6">
                  {/* Product Information Row - Product Card Style */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* FABRIC */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        FABRIC
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                        {/* Image */}
                        <div className="h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                          {orderPurchase[0]?.product?.fabric?.photos?.[0] ? (
                            <img
                              src={
                                orderPurchase[0]?.product?.fabric?.photos?.[0]
                              }
                              alt="Fabric"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <h4
                            className="font-semibold text-gray-900 text-base leading-tight mb-2 min-h-[2.5rem]"
                            title={
                              orderPurchase[0]?.product?.name || "Product Name"
                            }
                          >
                            {(orderPurchase[0]?.product?.name || "Product Name")
                              .length > 35
                              ? `${(orderPurchase[0]?.product?.name || "Product Name").substring(0, 35)}...`
                              : orderPurchase[0]?.product?.name ||
                                "Product Name"}
                          </h4>
                          {/* Show available colors for the fabric */}
                          {orderPurchase[0]?.product?.fabric
                            ?.available_colors && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500 mr-2">
                                Colors:
                              </span>
                              {orderPurchase[0]?.product?.fabric?.fabric_colors
                                ?.split(",") // Split the comma-separated string into an array
                                ?.map((color, idx) => (
                                  <span
                                    key={color + idx}
                                    className="inline-block w-5 h-5 rounded-full border border-gray-200 mr-1 align-middle"
                                    style={{ backgroundColor: color.trim() }} // Use trim() to remove any whitespace
                                    title={color.trim()}
                                  ></span>
                                ))}
                              <span className="text-xs text-gray-400 ml-2">
                                (
                                {
                                  orderPurchase[0]?.product?.fabric
                                    ?.available_colors
                                }
                                )
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-auto">
                            <p className="text-sm text-gray-600">
                              Qty:{" "}
                              <span className="font-medium text-gray-900">
                                {orderPurchase[0]?.quantity || 1}
                              </span>
                            </p>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Piece
                              {(orderPurchase[0]?.quantity || 1) > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STYLE */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        STYLE
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                        {/* Image */}
                        <div className="h-48 bg-gray-100 overflow-hidden flex-shrink-0 relative">
                          {orderPurchase[1]?.product?.style?.photos?.[0] ? (
                            <img
                              src={
                                orderPurchase[1]?.product?.style?.photos?.[0]
                              }
                              alt="Style"
                              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              style={{ minWidth: "100%", minHeight: "100%" }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <h4
                            className="font-semibold text-gray-900 text-base leading-tight mb-2 min-h-[2.5rem]"
                            title={
                              orderPurchase[1]?.product?.name || "Style Name"
                            }
                          >
                            {(orderPurchase[1]?.product?.name || "Style Name")
                              .length > 35
                              ? `${(orderPurchase[1]?.product?.name || "Style Name").substring(0, 35)}...`
                              : orderPurchase[1]?.product?.name || "Style Name"}
                          </h4>
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600">
                                Qty:{" "}
                                <span className="font-medium text-gray-900">
                                  {measurements?.length || 1}
                                </span>
                              </p>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                Piece
                                {(orderPurchase[1]?.quantity || 1) > 1
                                  ? "s"
                                  : ""}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-lg font-bold text-blue-600">
                                ₦
                                {formatNumberWithCommas(
                                  orderPurchase[1]?.product?.price,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MEASUREMENTS */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        MEASUREMENTS
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
                        <button
                          className="flex cursor-pointer flex-col flex-1 p-6 text-center hover:bg-gray-50 transition-colors group justify-center"
                          onClick={handleOpenMeasurementModal}
                        >
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                            <Ruler className="w-8 h-8 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900 text-base mb-1">
                            View Details
                          </h4>
                          <p className="text-sm text-gray-500">
                            {measurements.length > 0
                              ? `${measurements.length} measurement${measurements.length > 1 ? "s" : ""}`
                              : "No measurements available"}
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Video Preview Section */}
                </div>

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Order Total :</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ₦
                        {formatNumberWithCommas(
                          orderPurchase[1]?.product?.price *
                            measurements?.length,
                        )}
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                        {orderInfo?.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 ml-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">FABRIC</p>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900">Mark as Received</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        checked={
                          orderInfo.status === "PROCESSING" ||
                          orderInfo.status === "OUT_FOR_DELIVERY"
                        }
                        onChange={() => handleCheckboxChange("received")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {/* <div>
                    <p className="text-sm text-gray-500 mb-2">TAILORING</p>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900">Mark as Completed</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        checked={markCompletedChecked}
                        onChange={() => handleCheckboxChange("completed")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>*/}

                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      OUT FOR DELIVERY
                    </p>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900">Mark as Sent</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        checked={orderInfo?.status === "OUT_FOR_DELIVERY"}
                        onChange={() => handleCheckboxChange("sent")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Expansion Modal */}
        {expandedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  {expandedVideo === "fabric"
                    ? "Fabric Preview"
                    : "Style Preview"}
                </h3>
                <button
                  onClick={handleCloseVideoModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-black rounded-xl overflow-hidden">
                  <video
                    src={
                      expandedVideo === "fabric"
                        ? orderPurchase[0]?.product?.fabric?.video_url
                        : orderPurchase[1]?.product?.style?.video_url
                    }
                    controls
                    className="w-full max-h-[70vh] object-contain"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {expandedVideo === "fabric" ? "Fabric" : "Style"}:{" "}
                    <span className="font-medium">
                      {expandedVideo === "fabric"
                        ? orderPurchase[0]?.product?.name
                        : orderPurchase[1]?.product?.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Measurement Modal */}
        <MeasurementsModal
          showMeasurementModal={showMeasurementModal}
          handleCloseMeasurementModal={handleCloseMeasurementModal}
          measurements={measurements}
        />

        {/* Delivery Details */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-6">Delivery Details</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">SHIPPING ADDRESS</p>
              <p className="text-gray-900">
                {orderInfo?.user?.profile?.address}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">DELIVERY METHOD</p>
              <p className="text-gray-900">
                {orderInfo?.payment?.payment_method || "Logistics"}
              </p>
            </div>
          </div>
        </div>

        {/* Customer & Vendor */}
        <div className="bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-6">Customer & Vendor</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">CUSTOMER NAME</p>
              <p className="text-gray-900">
                {orderInfo?.payment?.metadata[0]?.customer_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">FABRIC VENDOR NAME</p>
              <p className="text-gray-900">Vendor Name</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">DELIVERY METHOD</p>
              <p className="text-gray-900">Logistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {getActionTitle()}
                </h3>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUploading}
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a clear picture of the garment to update the order
                status.
              </p>

              {/* File Upload Area */}
              <div className="mb-6">
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <div className="flex justify-center mb-4">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-2">
                      Click to upload photo
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Max file size: 5MB • JPG, PNG, GIF
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="garment-upload"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="garment-upload"
                      className={`inline-block px-6 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
                        isUploading
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      Browse Files
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    {/* File Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreview(null);
                            const fileInput =
                              document.getElementById("garment-upload");
                            if (fileInput) fileInput.value = "";
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          disabled={isUploading}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Status */}
                {uploadStatus && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isUploading && (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      <p className="text-sm font-medium text-blue-800">
                        {uploadStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClosePopup}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteUpload}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedFile && !isUploading
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
