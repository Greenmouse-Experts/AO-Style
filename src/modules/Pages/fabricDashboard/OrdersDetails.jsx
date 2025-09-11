import {
  Phone,
  MessageSquare,
  Mail,
  X,
  Star,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Play,
  Maximize2,
  AlertCircle,
  ArrowRight,
  Upload,
  Image,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import Loader from "../../../components/ui/Loader";
import { formatOrderId } from "../../../lib/orderUtils";
import FabricUploadDebug from "../../../components/debug/FabricUploadDebug";

import useToast from "../../../hooks/useToast";

const OrderDetails = () => {
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [currentActionType, setCurrentActionType] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Get order ID from URL params
  const { id } = useParams();

  // Fetch order data from API
  const {
    data,
    isPending: getOrderIsPending,
    isError,
    refetch,
  } = useGetSingleOrder(id);

  // Status update hook
  const { isPending: isStatusUpdating, updateOrderStatusMutate } =
    useUpdateOrderStatus();
  const { uploadImageMutate } = useUploadImage();
  const { toastSuccess, toastError } = useToast();

  // Extract order information from API response
  const orderInfo = data?.data || {};
  const orderPurchase = data?.data?.order_items || [];
  const orderMetadata = data?.data?.payment?.metadata || [];

  // Debug logging when page loads (after variable declarations)
  console.log("=== FABRIC VENDOR ORDER DETAILS PAGE LOADED ===");
  console.log("Order ID:", id);
  console.log("Raw data:", data);
  console.log("Is Loading:", getOrderIsPending);
  console.log("Is Error:", isError);
  console.log("Order Info:", orderInfo);
  console.log("Order Purchase Items:", orderPurchase);
  console.log("Order Metadata:", orderMetadata);
  console.log("================================================");

  const handleExpandVideo = (videoType) => {
    setExpandedVideo(videoType);
  };

  const handleCloseVideoModal = () => {
    setExpandedVideo(null);
  };

  // Filter to show only fabric items for fabric vendors
  const fabricOnlyPurchase = Array.isArray(orderInfo?.order_items)
    ? orderInfo.order_items.filter(
        (item) =>
          item?.product?.type?.toUpperCase() === "FABRIC" ||
          item?.type?.toUpperCase() === "FABRIC",
      )
    : [];

  console.log("=== FABRIC VENDOR ORDER ANALYSIS ===");
  console.log("Fabric only purchase items:", fabricOnlyPurchase);
  console.log("Current order status:", orderInfo?.status);
  console.log("===================================");

  // Calculate fabric-only total amount
  const fabricOnlyTotal = Array.isArray(fabricOnlyPurchase)
    ? fabricOnlyPurchase.reduce((total, item) => {
        return total + (item?.product?.price * item?.quantity || 0);
      }, 0)
    : 0;

  // Detect if order has style items (simplified to avoid hooks issues)
  const hasStyleItems = orderInfo?.order_items
    ? orderInfo.order_items.some((item) => {
        const isStyle =
          item?.product?.type?.toLowerCase().includes("style") ||
          item?.type?.toLowerCase().includes("style") ||
          item?.product?.name?.toLowerCase().includes("style") ||
          item?.name?.toLowerCase().includes("style");
        return isStyle;
      })
    : false;

  // Check if order has metadata indicating style components (simplified)
  const hasStyleMetadata = orderMetadata
    ? orderMetadata.some(
        (meta) =>
          meta?.style_product_id ||
          meta?.measurement ||
          meta?.style_product_name,
      )
    : false;

  // Final determination of order type
  const isFabricOnlyOrder = !hasStyleItems && !hasStyleMetadata;

  // Loading and error states handled in render
  const showLoading = getOrderIsPending;
  const showError = isError || (!getOrderIsPending && !orderInfo?.id);

  const formatDateStr = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color classes
  const getStatusColor = (status) => {
    const colors = {
      PAID: "bg-blue-100 text-blue-600",
      DISPATCHED_TO_AGENT: "bg-purple-100 text-purple-600",
      OUT_FOR_DELIVERY: "bg-orange-100 text-orange-600",
      IN_TRANSIT: "bg-indigo-100 text-indigo-600",
      DELIVERED: "bg-green-100 text-green-600",
      CANCELLED: "bg-red-100 text-red-600",
      PENDING: "bg-yellow-100 text-yellow-600",
      PROCESSING: "bg-blue-100 text-blue-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  // File handling functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastError("Please select a valid image file");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getActionTitle = () => {
    if (pendingStatus) {
      return `Update Status to ${pendingStatus.replace(/_/g, " ")}`;
    }
    const nextStatus = getNextStatus();
    return `Update Status to ${nextStatus.replace(/_/g, " ")}`;
  };

  // Update order status with image (following tailor dashboard pattern)
  const updateOrderStatus = async (imageUrl) => {
    const nextStatus = getNextStatus();
    const statusData = {
      status: nextStatus,
      metadata: {
        image: imageUrl,
      },
    };

    console.log("=== FABRIC VENDOR STATUS UPDATE DETAILS ===");
    console.log("Order ID:", id);
    console.log("Current Status:", orderInfo?.status);
    console.log("Next Status:", nextStatus);
    console.log("Status Data:", statusData);
    console.log("Image URL:", imageUrl);
    console.log("==========================================");

    return new Promise((resolve, reject) => {
      updateOrderStatusMutate(
        { id, statusData },
        {
          onSuccess: (result) => {
            console.log(
              "✅ FABRIC VENDOR Order status updated successfully:",
              result,
            );
            console.log("Response data:", result?.data);
            const message =
              result?.data?.message || "Order status updated successfully";
            toastSuccess(message);
            refetch();
            resolve(result);
          },
          onError: (error) => {
            console.error(
              "❌ FABRIC VENDOR Order status update failed:",
              error,
            );
            console.error("Error response:", error?.response);
            console.error("Error data:", error?.response?.data);
            reject(
              new Error(
                error?.response?.data?.message ||
                  error?.message ||
                  "Failed to update order status",
              ),
            );
          },
        },
      );
    });
  };

  const uploadImageToMultimedia = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("image", file);

      console.log("🔄 Attempting multimedia upload...");
      console.log("FormData contents:", {
        hasImage: formData.has("image"),
        fileName: file.name,
        fileSize: file.size,
      });

      uploadImageMutate(formData, {
        onSuccess: (result) => {
          console.log("✅ Multimedia upload response received:");
          console.log("Full response:", result);
          console.log("Response structure check:", {
            hasData: !!result?.data,
            hasDataData: !!result?.data?.data,
            hasDataUrl: !!result?.data?.url,
            hasUrl: !!result?.url,
            hasImageUrl: !!result?.imageUrl,
            hasDataImageUrl: !!result?.data?.image_url,
          });

          const imageUrl =
            result?.data?.data?.url ||
            result?.url ||
            result?.data?.image_url ||
            result?.imageUrl ||
            result?.data?.url;

          console.log("Extracted image URL:", imageUrl);

          if (imageUrl) {
            resolve(imageUrl);
          } else {
            console.error("❌ No image URL found in response structure:");
            console.error(
              "Available keys in result:",
              Object.keys(result || {}),
            );
            console.error(
              "Available keys in result.data:",
              Object.keys(result?.data || {}),
            );
            reject(new Error("No image URL in response"));
          }
        },
        onError: (error) => {
          console.error("❌ Multimedia upload failed:");
          console.error("Error object:", error);
          console.error("Error response:", error?.response);
          console.error("Error data:", error?.response?.data);
          console.error("Error status:", error?.response?.status);

          const errorMessage =
            error?.response?.data?.message ||
            error?.data?.message ||
            error?.message ||
            "Unknown upload error";

          reject(new Error(`Upload failed: ${errorMessage}`));
        },
      });
    });
  };

  const handleCompleteUpload = async () => {
    if (!selectedFile) {
      toastError("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading image...");

    try {
      // Debug: Check authentication and file details
      console.log("=== FABRIC VENDOR UPLOAD DEBUG START ===");
      console.log("📋 Upload Details:");
      console.log("- File name:", selectedFile.name);
      console.log("- File size:", selectedFile.size);
      console.log("- File type:", selectedFile.type);
      console.log("- Order ID:", id);
      console.log("- Current status:", orderInfo?.status);
      console.log("- Next status:", getNextStatus());

      // Check authentication
      const authData =
        document.cookie.includes("token") ||
        document.cookie.includes("adminToken");
      console.log("- Has auth token:", authData);
      console.log("- Navigator online:", navigator.onLine);
      console.log("=====================================");

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
      console.log("About to call updateOrderStatus with imageUrl:", imageUrl);
      console.log("Order ID being updated:", id);
      console.log("Current order info:", orderInfo);
      await updateOrderStatus(imageUrl);

      console.log("✅ FABRIC VENDOR Order status updated successfully");
      setUploadStatus("Complete!");

      // Show success message
      const nextStatus = getNextStatus();
      const actionText =
        nextStatus === "OUT_FOR_DELIVERY"
          ? "marked as out for delivery"
          : nextStatus === "DISPATCHED_TO_AGENT"
            ? "dispatched to agent"
            : "status updated";
      toastSuccess(`Success! Fabric image uploaded and order ${actionText}.`);

      // Close modal and reset state
      handleCloseUploadModal();

      // Refetch order data to get updated status
      refetch();
    } catch (error) {
      console.error("=== FABRIC VENDOR UPLOAD ERROR ===");
      console.error("❌ Upload flow error:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack,
      });
      console.error("================================");

      setUploadStatus("Upload failed");

      // Better error message based on error type
      let errorMessage = "Unknown error occurred";
      if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error?.response?.status === 413) {
        errorMessage = "File too large. Please select a smaller image.";
      } else if (error?.response?.status === 422) {
        errorMessage = "Invalid file format. Please select a valid image.";
      } else if (error?.message?.includes("No image URL")) {
        errorMessage =
          "Upload completed but no image URL returned. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toastError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setImagePreview(null);
    setUploadStatus("");
    setCurrentActionType(null);
    setPendingStatus(null);
    const fileInput = document.getElementById("fabric-upload");
    if (fileInput) fileInput.value = "";
  };

  // Check if fabric vendor can update status
  const canUpdateStatus = () => {
    if (!orderInfo?.status) {
      console.log("Cannot update: No order status found");
      return false;
    }

    const currentStatus = orderInfo?.status;
    const allowedStatuses = ["PAID", "PENDING", "PROCESSING"];
    const canUpdate = allowedStatuses.includes(currentStatus);

    console.log("Can update status check:", {
      currentStatus,
      allowedStatuses,
      canUpdate,
      isFabricOnlyOrder,
      hasOrderData: !!orderInfo,
    });

    return canUpdate;
  };

  // Get the appropriate next status based on order type
  const getNextStatus = () => {
    const currentStatus = orderInfo?.status;

    console.log("Getting next status for:", {
      currentStatus,
      isFabricOnlyOrder,
      hasStyleItems,
    });

    if (!currentStatus) {
      console.warn(
        "No current status found, defaulting to DISPATCHED_TO_AGENT",
      );
      return "DISPATCHED_TO_AGENT";
    }

    // For fabric-only orders: go directly to delivery
    if (isFabricOnlyOrder) {
      switch (currentStatus) {
        case "PAID":
        case "PENDING":
        case "PROCESSING":
          return "OUT_FOR_DELIVERY";
        default:
          console.warn(
            `Unexpected status for fabric-only order: ${currentStatus}`,
          );
          return "OUT_FOR_DELIVERY";
      }
    } else {
      // For orders with style items: go to logistics agent first
      switch (currentStatus) {
        case "PAID":
        case "PENDING":
        case "PROCESSING":
          return "DISPATCHED_TO_AGENT";
        default:
          console.warn(`Unexpected status for style order: ${currentStatus}`);
          return "DISPATCHED_TO_AGENT";
      }
    }
  };

  // Debug logging (simplified to avoid function calls in render)
  if (orderInfo && orderInfo.id) {
    console.log("=== FABRIC VENDOR ORDER ANALYSIS ===");
    console.log("Order ID:", id);
    console.log("Current Status:", orderInfo?.status);
    console.log("Is Fabric Only:", isFabricOnlyOrder);
    console.log("Has Style Items:", hasStyleItems);
    console.log("===================================");
  }

  // Run test when orderInfo is available (no useEffect to avoid hooks issues)
  if (orderInfo && orderInfo.id) {
    // testStatusUpdateFlow(); // Disabled to prevent hooks issues
  }

  // Get status description based on order type
  const getStatusDescription = () => {
    if (isFabricOnlyOrder) {
      return "Mark order ready for direct delivery to customer";
    } else {
      return "Dispatch fabric to logistics agent for delivery to tailor";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "DISPATCHED_TO_AGENT":
        return <Package className="w-5 h-5 text-purple-600" />;
      case "OUT_FOR_DELIVERY":
        return <Truck className="w-5 h-5 text-orange-600" />;
      case "IN_TRANSIT":
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case "PROCESSING":
        return <Package className="w-5 h-5 text-blue-600" />;
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle loading state
  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Handle error state
  if (showError) {
    console.log("📋 Error loading order details:", { isError, orderInfo, id });
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
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm px-6 py-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order ID: {formatOrderId(orderInfo?.payment_id || "")}
            </h1>
            <p className="text-gray-500 text-sm">
              <a
                href="/fabric"
                className="text-purple-600 hover:text-purple-800 transition-colors"
              >
                Dashboard
              </a>{" "}
              → Orders → Order Details
            </p>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderInfo?.status)}`}
            >
              {getStatusIcon(orderInfo?.status)}
              <span className="ml-2">
                {orderInfo?.status?.replace(/_/g, " ") || "Unknown"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated:{" "}
              {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order ID:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatOrderId(orderInfo?.payment_id || "")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Transaction ID:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.transaction_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Order Date:</span>
                  <span className="text-gray-900">
                    {formatDateStr(orderInfo?.created_at, "D MMM YYYY")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Payment Method:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.payment_method || "PAYSTACK"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Total Amount:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    ₦
                    {(
                      fabricOnlyTotal || parseInt(orderInfo?.total_amount || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Items:</span>
                  <span className="text-gray-900">
                    {fabricOnlyPurchase.length} fabric item(s)
                  </span>
                </div>
                {/* <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Delivery City:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.payment?.metadata?.delivery_city ||
                      orderInfo?.payment?.order_summary?.delivery_city ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">
                    Customer Name:
                  </span>
                  <span className="text-gray-900">
                    {orderInfo?.user?.first_name && orderInfo?.user?.last_name
                      ? `${orderInfo.user.first_name} ${orderInfo.user.last_name}`
                      : orderInfo?.user?.full_name || "N/A"}
                  </span>
                </div>*/}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Fabric Items ({fabricOnlyPurchase.length})
            </h3>
            <div className="space-y-4">
              {fabricOnlyPurchase.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item?.product?.fabric?.photos &&
                      item?.product?.fabric?.photos[0] ? (
                        <img
                          src={item.product.fabric.photos[0]}
                          alt={item.product?.name || "Fabric"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {item?.product?.name || "Fabric Item"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Qty: {item?.quantity || 1}</span>
                            <span>
                              ₦{(item?.product?.price || 0).toLocaleString()}/
                              unit
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₦
                            {(
                              (item?.product?.price || 0) *
                              (item?.quantity || 1)
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>

                      {/* Fabric Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 font-medium">
                            Color:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric_colors ||
                              item?.color ||
                              "Default"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">
                            Material:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric?.material_type || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">
                            Weight:
                          </span>
                          <p className="text-gray-900">
                            {item?.product?.fabric?.weight_per_unit || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item?.product?.video_url && (
                            <button
                              onClick={() => handleExpandVideo("fabric")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                            >
                              <Play className="w-3 h-3" />
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Actions
            </h3>

            <div className="space-y-4">
              {/* Current Status Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(orderInfo?.status)}
                  <span className="font-semibold text-gray-700">
                    Current Status
                  </span>
                </div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {orderInfo?.status || "PENDING"}
                </p>
                <p className="text-xs text-blue-600">
                  Last Updated:{" "}
                  {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
                </p>
              </div>

              {/* Order Type Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Order Type</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  {isFabricOnlyOrder ? "Fabric Only" : "Fabric + Style"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {isFabricOnlyOrder
                    ? "Direct delivery to customer"
                    : "Delivery to tailor first, then to customer"}
                </p>
              </div>

              {/* Status Update Action */}
              {canUpdateStatus() ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 block mb-1">
                        Ready to Dispatch?
                      </span>
                      <p className="text-sm text-gray-600 mb-3">
                        {getStatusDescription()}
                      </p>
                      <button
                        onClick={() => {
                          console.log(
                            "🔴 FABRIC VENDOR STATUS UPDATE BUTTON CLICKED",
                          );
                          console.log(
                            "Current order status:",
                            orderInfo?.status,
                          );
                          const nextStatus = getNextStatus();
                          console.log("Next status:", nextStatus);
                          console.log("Can update status:", canUpdateStatus());
                          console.log("Opening upload modal...");
                          setPendingStatus(nextStatus);
                          setCurrentActionType("fabric_dispatch");
                          setShowUploadModal(true);
                        }}
                        disabled={
                          isStatusUpdating || isUploading || !canUpdateStatus()
                        }
                        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        title={
                          !canUpdateStatus()
                            ? "Status cannot be updated at this time"
                            : ""
                        }
                        onMouseEnter={() => {
                          console.log("=== STATUS UPDATE BUTTON HOVER ===");
                          console.log("Can update:", canUpdateStatus());
                          console.log("Is updating:", isStatusUpdating);
                          console.log("Next status:", getNextStatus());
                          console.log("Current status:", orderInfo?.status);
                          console.log("==================================");
                        }}
                      >
                        {isStatusUpdating || isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            Update to {getNextStatus().replace(/_/g, " ")}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {orderInfo?.status === "DISPATCHED_TO_AGENT"
                          ? "Order dispatched to logistics agent"
                          : orderInfo?.status === "OUT_FOR_DELIVERY"
                            ? "Order ready for delivery"
                            : "Order has been processed"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expected Flow Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-yellow-800 block mb-1">
                      Expected Flow
                    </span>
                    {isFabricOnlyOrder ? (
                      <>
                        <div>1. Update to "OUT FOR DELIVERY" when ready</div>
                        <div>
                          2. Logistics will deliver directly to customer
                        </div>
                      </>
                    ) : (
                      <>
                        <div>1. Update to "DISPATCHED TO AGENT" when ready</div>
                        <div>2. Logistics will deliver fabric to tailor</div>
                        <div>
                          3. Tailor will process and prepare for final delivery
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {expandedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={handleCloseVideoModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              controls
              autoPlay
              className="w-full h-auto"
              src={orderInfo?.order_items?.[0]?.product?.video_url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {console.log("🟢 FABRIC VENDOR UPLOAD MODAL IS RENDERING")}
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
                Upload a clear picture of the fabric to update the order status
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
                      id="fabric-upload"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="fabric-upload"
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
                              document.getElementById("fabric-upload");
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
                      Update Status (with image)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Component */}
      <FabricUploadDebug />
    </div>
  );
};

export default OrderDetails;
