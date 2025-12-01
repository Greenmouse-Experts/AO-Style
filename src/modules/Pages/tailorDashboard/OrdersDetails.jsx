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
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";
import MeasurementsModal from "./components/MeasurementsModal";
import CustomBackbtn from "../../../components/CustomBackBtn";
import useToast from "../../../hooks/useToast";
import axios from "axios";
import CaryBinApi from "../../../services/CarybinBaseUrl";

const OrderDetails = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [currentActionType, setCurrentActionType] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [expandedVideo, setExpandedVideo] = useState(null);

  // New state for viewing attached order image
  const [showOrderImageModal, setShowOrderImageModal] = useState(false);

  // State for GIG logistics modals
  const [showShipmentDetailsModal, setShowShipmentDetailsModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [isLoadingShipment, setIsLoadingShipment] = useState(false);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  const { uploadImageMutate } = useUploadImage();
  const { isPending: isStatusUpdating, updateOrderStatusMutate } =
    useUpdateOrderStatus();
  const { toastSuccess, toastError } = useToast();

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
  
  // Extract customer email from order info
  const customerEmail = orderInfo?.user?.email || "N/A";

  // Get attached image from metadata (first found)
  const attachedOrderImage =
    orderInfo?.metadata?.image ||
    orderInfo?.payment?.metadata?.find((meta) => meta?.image)?.image ||
    null;

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

  // Check if order uses GIG logistics
  const isGigLogistics = () => {
    const firstLegType = orderInfo?.first_leg_logistics_type;
    const secondLegType = orderInfo?.second_leg_logistics_type;
    return firstLegType === "GIG" || secondLegType === "GIG";
  };

  // Get the external logistics tracking ID for GIG
  const getGigTrackingId = () => {
    const firstLegType = orderInfo?.first_leg_logistics_type;
    const secondLegType = orderInfo?.second_leg_logistics_type;
    const firstLegTrackingId = orderInfo?.first_leg_external_logistics_tracking_id;
    const secondLegTrackingId = orderInfo?.second_leg_external_logistics_tracking_id;
    
    // Check first leg
    if (firstLegType === "GIG" && firstLegTrackingId) {
      return firstLegTrackingId;
    }
    
    // Check second leg
    if (secondLegType === "GIG" && secondLegTrackingId) {
      return secondLegTrackingId;
    }
    
    return null;
  };

  // Fetch shipment details
  const fetchShipmentDetails = async () => {
    const trackingId = getGigTrackingId();
    if (!trackingId) {
      toastError("No tracking ID available");
      return;
    }

    setIsLoadingShipment(true);
    try {
      const response = await CaryBinApi.get(`/orders/external-logistics/shipment-details/${trackingId}`
      );
      setShipmentDetails(response.data);
      setShowShipmentDetailsModal(true);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      toastError("Failed to load shipment details");
    } finally {
      setIsLoadingShipment(false);
    }
  };

  // Track order
  const fetchTrackingDetails = async () => {
    const trackingId = getGigTrackingId();
    if (!trackingId) {
      toastError("No tracking ID available");
      return;
    }

    setIsLoadingTracking(true);
    try {
      const response = await CaryBinApi.get(`/orders/external-logistics/track/${trackingId}`
      );
      setTrackingDetails(response.data);
      setShowTrackOrderModal(true);
    } catch (error) {
      console.error("Error fetching tracking details:", error);
      toastError("Failed to load tracking details");
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const formatNumberWithCommas = (num) => {
    return parseInt(num || 0).toLocaleString();
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
  const updateOrderStatus = async (imageUrl, newStatus) => {
    const statusData = {
      status: newStatus,
      metadata: {
        ...(orderInfo?.metadata || []),
        ...(newStatus === "PROCESSING"
          ? { tailorReferenceImage1: imageUrl }
          : { tailorReferenceImage: imageUrl }),
      },
    };
    console.log("This is the status Data", statusData);

    return new Promise((resolve, reject) => {
      updateOrderStatusMutate(
        { id, statusData },
        {
          onSuccess: (result) => {
            console.log("✅ Order status updated:", result);
            const message =
              result?.data?.message || "Order status updated successfully";
            toastSuccess(message);
            refetch();
            resolve(result);
          },
          onError: (error) => {
            console.error("❌ Order status update failed:", error);
            reject(
              new Error(error?.message || "Failed to update order status"),
            );
          },
        },
      );
    });
  };

  // Update order status without image
  const updateStatusOnly = async (newStatus) => {
    const statusData = {
      status: newStatus,
    };

    return new Promise((resolve, reject) => {
      updateOrderStatusMutate(
        { id, statusData },
        {
          onSuccess: (result) => {
            console.log("✅ Order status updated:", result);
            const message =
              result?.data?.message || "Order status updated successfully";
            toastSuccess(message);
            refetch();
            resolve(result);
          },
          onError: (error) => {
            console.error("❌ Order status update failed:", error);
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to update order status";
            toastError(errorMessage);
            reject(new Error(errorMessage));
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
      toastError("Please select an image first.");
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
      await updateOrderStatus(imageUrl, pendingStatus);

      console.log("✅ Order status updated successfully");
      setUploadStatus("Complete!");

      // Show success message
      const actionText =
        currentActionType === "received"
          ? "marked as received"
          : currentActionType === "completed"
            ? "marked as completed"
            : "marked as sent";
      toastSuccess(
        `Success! Image uploaded and order status updated to ${pendingStatus}.`,
      );

      // Close modal and reset state
      handleCloseUploadModal();

      // Refetch order data to get updated status
      refetch();
    } catch (error) {
      console.error("❌ Upload flow error:", error);
      setUploadStatus("Upload failed");
      toastError(`Upload failed: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setImagePreview(null);
    setCurrentActionType(null);
    setPendingStatus(null);
  };

  // Handle status update - open modal for image upload
  const handleStatusUpdate = (newStatus) => {
    console.log("🔄 Opening upload modal for status:", newStatus);
    setPendingStatus(newStatus);
    setCurrentActionType(
      newStatus === "PROCESSING" ? "processing" : "out_for_delivery",
    );
    setShowUploadModal(true);
  };

  // Check if status can be updated
  const canUpdateToProcessing = () => {
    const currentStatus = orderInfo?.status;
    return currentStatus === "DELIVERED_TO_TAILOR";
  };

  const canUpdateToOutForDelivery = () => {
    const currentStatus = orderInfo?.status;
    return currentStatus === "PROCESSING";
  };

  const isStatusReached = (targetStatus) => {
    const currentStatus = orderInfo?.status;
    if (targetStatus === "PROCESSING") {
      return (
        currentStatus === "PROCESSING" ||
        currentStatus === "OUT_FOR_DELIVERY" ||
        currentStatus === "IN_TRANSIT" ||
        currentStatus === "DELIVERED"
      );
    }
    if (targetStatus === "OUT_FOR_DELIVERY") {
      return (
        currentStatus === "OUT_FOR_DELIVERY" ||
        currentStatus === "IN_TRANSIT" ||
        currentStatus === "DELIVERED"
      );
    }
    return false;
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
    if (currentActionType === "processing") return "Mark as Processing";
    if (currentActionType === "out_for_delivery")
      return "Mark as Out for Delivery";
    if (pendingStatus === "PROCESSING") return "Mark as Processing";
    if (pendingStatus === "OUT_FOR_DELIVERY") return "Mark as Out for Delivery";
    return "Upload Image & Update Status";
  };

  // Measurement Modal
  const handleOpenMeasurementModal = () => setShowMeasurementModal(true);
  const handleCloseMeasurementModal = () => setShowMeasurementModal(false);

  // Video Modal functions
  const handleCloseVideoModal = () => {
    setExpandedVideo(null);
  };

  // Order Image Modal functions
  const handleOpenOrderImageModal = () => setShowOrderImageModal(true);
  const handleCloseOrderImageModal = () => setShowOrderImageModal(false);

  // GIG Logistics Modal functions
  const handleCloseShipmentDetailsModal = () => {
    setShowShipmentDetailsModal(false);
    setShipmentDetails(null);
  };

  const handleCloseTrackOrderModal = () => {
    setShowTrackOrderModal(false);
    setTrackingDetails(null);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CustomBackbtn />
            <h1 className="text-2xl font-bold text-gray-900 ">Order ID: </h1>
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-base font-mono font-semibold tracking-wide">
              {orderInfo?.payment?.id
                ? orderInfo.payment.id
                    .replace(/-/g, "")
                    .substring(0, 12)
                    .toUpperCase()
                : id
                  ? id.replace(/-/g, "").substring(0, 12).toUpperCase()
                  : "N/A"}
            </span>
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
                                Color:
                              </span>
                              {orderInfo?.payment?.metadata?.[0]?.color && (
                                <span
                                  className="inline-block w-5 h-5 rounded-full border border-gray-200 mr-1 align-middle"
                                  style={{
                                    backgroundColor:
                                      orderInfo?.payment?.metadata?.[0]?.color.trim(),
                                  }}
                                  title={orderInfo?.payment?.metadata?.[0]?.color.trim()}
                                ></span>
                              )}
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
                          ) : orderPurchase[2]?.product?.style?.photos?.[0] ? (
                            <img
                              src={
                                orderPurchase[2]?.product?.style?.photos?.[0]
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

                  {/* GIG Logistics Buttons */}
                  {isGigLogistics() && (
                    <div className="flex gap-4 justify-end">
                      <button
                        onClick={fetchShipmentDetails}
                        disabled={isLoadingShipment}
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoadingShipment ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Package className="w-5 h-5" />
                            View Shipment Details
                          </>
                        )}
                      </button>
                      <button
                        onClick={fetchTrackingDetails}
                        disabled={isLoadingTracking}
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoadingTracking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Truck className="w-5 h-5" />
                            Track Order
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* View Attached Order Image Button */}
                  {attachedOrderImage && (
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                        onClick={handleOpenOrderImageModal}
                      >
                        <Image className="w-5 h-5" />
                        View Attached Order Image
                      </button>
                    </div>
                  )}
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
                <h3 className="text-lg font-semibold mb-4">
                  Order Status Management
                </h3>

                <div className="space-y-6">
                  {/* Current Status Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Current Status</p>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                      {orderInfo?.status || "Pending"}
                    </span>
                  </div>

                  {/* Status Update Actions */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-900 font-medium">
                          PROCESSING
                        </span>
                        {isStatusReached("PROCESSING") && (
                          <span className="text-green-600 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      {canUpdateToProcessing() ? (
                        <button
                          onClick={() => handleStatusUpdate("PROCESSING")}
                          disabled={isStatusUpdating || isUploading}
                          className="cursor-pointer w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {isStatusUpdating || isUploading
                            ? "Updating..."
                            : "Mark as Processing"}
                        </button>
                      ) : isStatusReached("PROCESSING") ? (
                        <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg text-center">
                          Status Reached
                        </div>
                      ) : (
                        <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center">
                          Previous steps required
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-900 font-medium">
                          OUT FOR DELIVERY
                        </span>
                        {isStatusReached("OUT_FOR_DELIVERY") && (
                          <span className="text-green-600 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                      {canUpdateToOutForDelivery() ? (
                        <button
                          onClick={() => handleStatusUpdate("OUT_FOR_DELIVERY")}
                          disabled={isStatusUpdating || isUploading}
                          className="cursor-pointer w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {isStatusUpdating || isUploading
                            ? "Updating..."
                            : "Mark as Out for Delivery"}
                        </button>
                      ) : isStatusReached("OUT_FOR_DELIVERY") ? (
                        <div className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg text-center">
                          Status Reached
                        </div>
                      ) : (
                        <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center">
                          Complete Processing first
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Flow Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Status Flow
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        <span>
                          1. Mark as Processing when you start working on the
                          order (image required)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        <span>
                          2. Mark as Out for Delivery when ready to ship (image
                          required)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipment Details Modal */}
        {showShipmentDetailsModal && shipmentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b bg-purple-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-7 h-7 text-purple-600" />
                  Shipment Details
                </h3>
                <button
                  onClick={handleCloseShipmentDetailsModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {shipmentDetails.data && shipmentDetails.data.length > 0 ? (
                  (() => {
                    const shipment = shipmentDetails.data[0];
                    return (
                      <div className="space-y-6">
                        {/* Main Shipment Info */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Waybill Number</p>
                              <p className="text-lg font-mono font-semibold text-gray-900">
                                {shipment.Waybill}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                                shipment.IsDelivered
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {shipment.shipmentstatus}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Vehicle Type</p>
                              <p className="text-base font-semibold text-purple-700">
                                {shipment.VehicleType}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Delivery Type</p>
                              <p className="text-base font-medium text-gray-900">
                                {shipment.IsHomeDelivery ? "Home Delivery" : "Pickup"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sender & Receiver Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <User className="w-5 h-5 text-blue-600" />
                              Sender Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs">Name</p>
                                <p className="font-medium text-gray-900">{shipment.SenderName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Phone</p>
                                <p className="font-medium text-gray-900">{shipment.SenderPhoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Address</p>
                                <p className="text-gray-700 text-xs leading-relaxed">{shipment.SenderAddress}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-green-600" />
                              Receiver Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs">Name</p>
                                <p className="font-medium text-gray-900">{shipment.ReceiverName}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Phone</p>
                                <p className="font-medium text-gray-900">{shipment.ReceiverPhoneNumber}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Address</p>
                                <p className="text-gray-700 text-xs leading-relaxed">{shipment.ReceiverAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Information */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                          <h4 className="font-semibold text-gray-700 mb-4">Pricing Details</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Delivery Price</p>
                              <p className="text-lg font-bold text-gray-900">₦{shipment.DeliveryPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Insurance</p>
                              <p className="text-lg font-bold text-gray-900">₦{shipment.InsuranceValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Grand Total</p>
                              <p className="text-lg font-bold text-purple-600">₦{shipment.GrandTotal.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900">Created</h4>
                            </div>
                            <p className="text-sm text-blue-800">
                              {new Date(shipment.DateCreated).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-900">Last Modified</h4>
                            </div>
                            <p className="text-sm text-green-800">
                              {new Date(shipment.DateModified).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Waybill Image */}
                        {shipment.WaybillImageUrl && (
                          <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h4 className="font-semibold text-gray-700 mb-3">Waybill Image</h4>
                            <img 
                              src={shipment.WaybillImageUrl} 
                              alt="Waybill" 
                              className="w-full rounded-lg border border-gray-300"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No shipment details available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Track Order Modal */}
        {showTrackOrderModal && trackingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b bg-blue-50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Truck className="w-7 h-7 text-blue-600" />
                  Track Order
                </h3>
                <button
                  onClick={handleCloseTrackOrderModal}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {trackingDetails.data && trackingDetails.data.length > 0 ? (
                  (() => {
                    const shipment = trackingDetails.data[0];
                    const trackings = shipment.MobileShipmentTrackings || [];
                    
                    return (
                      <div className="space-y-6">
                        {/* Shipment Summary */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Waybill</p>
                              <p className="text-lg font-mono font-semibold text-gray-900">
                                {shipment.Waybill}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                              <p className="text-lg font-bold text-blue-600">
                                ₦{shipment.Amount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500 mb-1">Pickup Option</p>
                              <p className="text-base font-medium text-gray-900">
                                {shipment.MobileShipmentTrackings[0]?.PickupOptions || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Events */}
                        {trackings.length > 0 ? (
                          <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            
                            <div className="space-y-6">
                              {trackings.map((tracking, index) => {
                                const isLatest = index === 0;
                                return (
                                  <div key={index} className="relative flex gap-4 items-start">
                                    <div className="relative z-10 flex-shrink-0">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        isLatest
                                          ? "bg-green-100 border-4 border-green-500" 
                                          : "bg-gray-100 border-4 border-gray-300"
                                      }`}>
                                        {isLatest ? (
                                          <CheckCircle className="w-6 h-6 text-green-600" />
                                        ) : (
                                          <Clock className="w-6 h-6 text-gray-500" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                            {tracking.Status}
                                          </h4>
                                          {tracking.ScanStatusIncident && (
                                            <p className="text-sm text-blue-600 font-medium">
                                              {tracking.ScanStatusIncident}
                                            </p>
                                          )}
                                        </div>
                                        {tracking.DateTime && (
                                          <span className="text-sm text-gray-500 flex items-center gap-1 ml-3">
                                            <Calendar className="w-4 h-4" />
                                            {(() => {
                                              let dateStr = tracking.DateTime?.replace(" WAT", "");
                                              let dateObj = dateStr ? new Date(dateStr.replace(/-/g, '/')) : null;
                                              return dateObj && !isNaN(dateObj)
                                                ? dateObj.toLocaleString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                  })
                                                : tracking.DateTime || "N/A";
                                            })()}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {tracking.ScanStatusReason && (
                                          <p className="text-sm text-gray-600">
                                            <span className="font-medium">Reason:</span> {tracking.ScanStatusReason}
                                          </p>
                                        )}
                                        
                                        {tracking.ScanStatusComment && (
                                          <p className="text-sm text-gray-600">
                                            <span className="font-medium">Comment:</span> {tracking.ScanStatusComment}
                                          </p>
                                        )}
                                        
                                        {tracking.DepartureServiceCentre?.Name && (
                                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                            <MapPin className="w-4 h-4" />
                                            {tracking.DepartureServiceCentre.Name}
                                          </p>
                                        )}
                                      </div>

                                      {/* Additional Info */}
                                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                                        {tracking.ServiceCentreId && (
                                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            Service Centre: {tracking.ServiceCentreId}
                                          </span>
                                        )}
                                        {tracking.TrackingType !== undefined && (
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Tracking Type: {tracking.TrackingType}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No tracking events available yet</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tracking details available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

        {/* Order Image Modal */}
        {showOrderImageModal && attachedOrderImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden relative">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Attached Order Image
                </h3>
                <button
                  onClick={handleCloseOrderImageModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center">
                <img
                  src={attachedOrderImage}
                  alt="Order Attached"
                  className="rounded-xl max-h-[60vh] object-contain border border-gray-200"
                  style={{ background: "#f3f4f6" }}
                />
                <a
                  href={attachedOrderImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-600 underline text-sm"
                >
                  Open in new tab
                </a>
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
              <p className="text-sm text-gray-500 mb-2">CUSTOMER EMAIL</p>
              <p className="text-gray-900">
                {customerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">
                FABRIC VENDOR BUSINESS ID
              </p>
              <p className="text-gray-900">
                {orderInfo?.order_items?.[0]?.product?.business_id
                  ? orderInfo.order_items[0].product.business_id
                      .substring(0, 8)
                      .toUpperCase()
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">DELIVERY METHOD</p>
              <p className="text-gray-900">Logistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {getActionTitle()}
                </h3>
                <button
                  onClick={handleCloseUploadModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isUploading}
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload a clear picture of the garment to update the order status
                to{" "}
                <span className="font-semibold text-purple-600">
                  {pendingStatus?.replace("_", " ")}
                </span>
                . Image upload is required to proceed.
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
                  onClick={handleCloseUploadModal}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteUpload}
                  className={`cursor-pointer flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
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
                      Update Status
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