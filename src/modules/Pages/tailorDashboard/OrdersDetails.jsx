// import {
//   Phone,
//   MessageSquare,
//   Mail,
//   X,
//   Scissors,
//   Package,
//   Clock,
//   CheckCircle,
//   Truck,
//   Ruler,
//   User,
//   Upload,
//   Image as ImageIcon,
//   Loader2,
// } from "lucide-react";
// import { useState } from "react";
// import { useParams } from "react-router-dom";
// import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
// import Loader from "../../../components/ui/Loader";
// import useUploadImage from "../../../hooks/multimedia/useUploadImage";
// // import CaryBinApi from "../../../services/CarybinBaseUrl";
// import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";

// const OrderDetails = () => {
//   const [showUploadPopup, setShowUploadPopup] = useState(false);
//   const [markReceivedChecked, setMarkReceivedChecked] = useState(false);
//   const [markSentChecked, setMarkSentChecked] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [currentActionType, setCurrentActionType] = useState(null); // 'received' or 'sent'
//   const { isPending: isImageUploading, uploadImageMutate } = useUploadImage();
//   const { isPending: isStatusUpdating, updateOrderStatusMutate } =
//     useUpdateOrderStatus();

//   // Get order ID from URL params
//   const { id } = useParams();

//   // Fetch order data from API
//   const {
//     data,
//     isPending: getOrderIsPending,
//     isError,
//     refetch,
//   } = useGetSingleOrder(id);

//   // Extract order information from API response
//   const orderInfo = data?.data || {};
//   const orderPurchase = data?.data?.order_items || [];
//   const orderMetadata = data?.data?.payment?.metadata || [];

//   // Determine if this is a fabric-only order or has tailoring/style components
//   const hasTailoringComponents = orderMetadata && orderMetadata.length > 0;
//   const isFabricOnlyOrder = !hasTailoringComponents;

//   console.log("📋 Tailor Order Details - API Data:", data);
//   console.log("📋 Order Info:", orderInfo);
//   console.log("📋 Order Purchase Items:", orderPurchase);
//   console.log("📋 Order Metadata:", orderMetadata);
//   console.log("📋 Is Fabric Only Order:", isFabricOnlyOrder);
//   console.log("📋 Has Tailoring Components:", hasTailoringComponents);
//   console.log("📋 Order ID from params:", id);
//   console.log("📋 Loading state:", getOrderIsPending);
//   console.log("📋 Error state:", isError);

//   // Loading state
//   if (getOrderIsPending) {
//     console.log("📋 Still loading order details...");
//     return (
//       <div className="m-auto flex h-[80vh] items-center justify-center">
//         <div className="text-center">
//           <Loader />
//           <p className="text-gray-500 mt-4">Loading order details...</p>
//           <p className="text-sm text-gray-400">Order ID: {id}</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (isError || (!getOrderIsPending && !orderInfo?.id)) {
//     console.log("📋 Error loading order details:", { isError, orderInfo, id });
//     return (
//       <div className="m-auto flex h-[80vh] items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">Failed to load order details</p>
//           <p className="text-sm text-gray-600 mb-4">
//             Order ID: {id || "No ID provided"}
//           </p>
//           <p className="text-sm text-gray-600 mb-4">
//             Error: {isError ? "API Error" : "No order data received"}
//           </p>
//           <button
//             onClick={() => {
//               console.log("📋 Retrying order fetch for ID:", id);
//               refetch();
//             }}
//             className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const formatNumberWithCommas = (num) => {
//     return parseInt(num || 0).toLocaleString();
//   };

//   const formatDateStr = (dateStr, format) => {
//     if (!dateStr) return "N/A";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-US", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const displayOrderId = (id) => {
//     return `#${id?.slice(-8)?.toUpperCase() || "N/A"}`;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       DELIVERED: "bg-green-100 text-green-600",
//       SHIPPED: "bg-blue-100 text-blue-600",
//       CANCELLED: "bg-red-100 text-red-600",
//       PENDING: "bg-yellow-100 text-yellow-600",
//       PROCESSING: "bg-purple-100 text-purple-600",
//     };
//     return colors[status] || "bg-gray-100 text-gray-600";
//   };

//   // Handle file selection
//   const handleFileSelect = (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // File size validation (5MB limit)
//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size exceeds 5MB limit. Please choose a smaller file.");
//       return;
//     }

//     // File type validation
//     if (!file.type.startsWith("image/")) {
//       alert("Please select a valid image file.");
//       return;
//     }

//     // Set the selected file
//     setSelectedFile(file);

//     // Create image preview
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setImagePreview(e.target.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Upload image to multimedia endpoint using your existing service
//   const uploadImageToMultimedia = async (file) => {
//     const formData = new FormData();
//     formData.append("image", file);

//     return new Promise((resolve, reject) => {
//       uploadImageMutate(formData, {
//         onSuccess: (result) => {
//           // Adjust based on your API response structure
//           console.log(result);
//           const imageUrl =
//             result?.data?.data?.url ||
//             result?.url ||
//             result?.data?.image_url ||
//             result?.imageUrl;
//           resolve(imageUrl);
//         },
//         onError: (error) => {
//           reject(
//             new Error(`Upload failed: ${error?.message || "Unknown error"}`),
//           );
//         },
//       });
//     });
//   };

//   // Update order status with image
//   const updateOrderStatus = async (imageUrl, actionType) => {
//     const statusData = {
//       status: actionType === "received" ? "PROCESSING" : "SHIPPED",
//       metadata: {
//         image: imageUrl,
//       },
//     };

//     return new Promise((resolve, reject) => {
//       updateOrderStatusMutate(
//         { id, statusData },
//         {
//           onSuccess: (result) => {
//             console.log("✅ Order status updated:", result);
//             resolve(result);
//           },
//           onError: (error) => {
//             reject(
//               new Error(error?.message || "Failed to update order status"),
//             );
//           },
//         },
//       );
//     });
//   };

//   // Handle complete upload flow
//   const handleCompleteUpload = async () => {
//     if (!selectedFile) {
//       alert("Please select an image first.");
//       return;
//     }

//     setIsUploading(true);
//     setUploadStatus("Uploading image...");

//     try {
//       // Step 1: Upload image to multimedia endpoint
//       console.log("📤 Step 1: Uploading to multimedia endpoint...");
//       const imageUrl = await uploadImageToMultimedia(selectedFile);

//       if (!imageUrl) {
//         throw new Error("No image URL received from multimedia upload");
//       }

//       console.log("✅ Image uploaded successfully, URL:", imageUrl);
//       setUploadStatus("Updating order status...");

//       // Step 2: Update order status with image URL
//       console.log("📊 Step 2: Updating order status...");
//       await updateOrderStatus(imageUrl, currentActionType);

//       console.log("✅ Order status updated successfully");
//       setUploadStatus("Complete!");

//       // Show success message
//       const actionText =
//         currentActionType === "received"
//           ? "marked as completed"
//           : "marked as shipped";
//       alert(`Success! Garment image uploaded and order ${actionText}.`);

//       // Update checkbox state
//       if (currentActionType === "received") {
//         setMarkReceivedChecked(true);
//       } else if (currentActionType === "sent") {
//         setMarkSentChecked(true);
//       }

//       // Close popup and reset state
//       handleClosePopup();

//       // Refetch order data to get updated status
//       refetch();
//     } catch (error) {
//       console.error("❌ Upload flow error:", error);
//       setUploadStatus("Upload failed");
//       alert(`Upload failed: ${error.message || "Unknown error occurred"}`);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleCheckboxChange = (type) => {
//     if (type === "received") {
//       if (!markReceivedChecked) {
//         setCurrentActionType("received");
//         setShowUploadPopup(true);
//       } else {
//         setMarkReceivedChecked(false);
//       }
//     } else if (type === "sent") {
//       if (!markSentChecked) {
//         setCurrentActionType("sent");
//         setShowUploadPopup(true);
//       } else {
//         setMarkSentChecked(false);
//       }
//     }
//   };

//   const handleClosePopup = () => {
//     setShowUploadPopup(false);
//     setSelectedFile(null);
//     setImagePreview(null);
//     setUploadStatus("");
//     setCurrentActionType(null);
//     // Reset file input
//     const fileInput = document.getElementById("garment-upload");
//     if (fileInput) fileInput.value = "";
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "DELIVERED":
//         return <CheckCircle className="w-5 h-5 text-green-600" />;
//       case "SHIPPED":
//         return <Truck className="w-5 h-5 text-blue-600" />;
//       case "PROCESSING":
//         return <Scissors className="w-5 h-5 text-orange-600" />;
//       default:
//         return <Clock className="w-5 h-5 text-yellow-600" />;
//     }
//   };

//   const getActionTitle = () => {
//     if (currentActionType === "received") {
//       return "Mark Tailoring Complete";
//     } else if (currentActionType === "sent") {
//       return "Mark as Shipped";
//     }
//     return "Upload Finished Garment";
//   };

//   const getActionDescription = () => {
//     if (currentActionType === "received") {
//       return "Upload a clear picture of the finished tailored garment to mark this order as completed.";
//     } else if (currentActionType === "sent") {
//       return "Upload a picture showing the garment is ready for shipping to the customer.";
//     }
//     return "Upload a clear picture of the finished tailored garment.";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* Header */}
//       <div className="bg-white rounded-xl shadow-sm px-6 py-5 mb-6">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
//               <Scissors className="w-6 h-6 text-purple-600" />
//               Tailoring Order #
//               {orderInfo?.id?.slice(-8)?.toUpperCase() || "N/A"}
//             </h1>
//             <p className="text-gray-500 text-sm">
//               <a
//                 href="/tailor"
//                 className="text-purple-600 hover:text-purple-800 transition-colors"
//               >
//                 Dashboard
//               </a>{" "}
//               → Orders → Order Details
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             {getStatusIcon(orderInfo?.status)}
//             <span
//               className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(orderInfo?.status)}`}
//             >
//               {orderInfo?.status || "PENDING"}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Order Summary */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
//               <Package className="w-5 h-5 text-purple-600" />
//               Tailoring Order Summary
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">Order ID:</span>
//                   <span className="font-semibold text-gray-900">
//                     #{orderInfo?.id?.slice(-8)?.toUpperCase()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">
//                     Transaction ID:
//                   </span>
//                   <span className="font-mono text-sm text-gray-900">
//                     {orderInfo?.payment?.transaction_id}
//                   </span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">Order Date:</span>
//                   <span className="text-gray-900">
//                     {formatDateStr(orderInfo?.created_at, "D MMM YYYY h:mm A")}
//                   </span>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">
//                     Payment Method:
//                   </span>
//                   <span className="text-gray-900">
//                     {orderInfo?.payment?.payment_method}
//                   </span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">
//                     Payment Status:
//                   </span>
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       orderInfo?.payment?.payment_status === "SUCCESS"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-yellow-100 text-yellow-700"
//                     }`}
//                   >
//                     {orderInfo?.payment?.payment_status}
//                   </span>
//                 </div>
//                 <div className="flex justify-between py-2 border-b border-gray-100">
//                   <span className="text-gray-600 font-medium">
//                     Total Amount:
//                   </span>
//                   <span className="text-2xl font-bold text-purple-600">
//                     ₦{formatNumberWithCommas(parseInt(orderInfo?.total_amount))}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Tailoring Orders */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
//               <Scissors className="w-5 h-5 text-purple-600" />
//               Tailoring Orders
//             </h2>
//             <div className="space-y-6">
//               {orderPurchase.map(
//                 (purchaseItem, index) =>
//                   purchaseItem?.product?.type && (
//                     <div
//                       key={purchaseItem?.id || index}
//                       className="border border-gray-200 rounded-xl overflow-hidden"
//                     >
//                       <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
//                         <div className="flex items-center justify-between">
//                           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                             {purchaseItem?.product?.type === "FABRIC" ? (
//                               <Package className="w-5 h-5 text-purple-600" />
//                             ) : (
//                               <Scissors className="w-5 h-5 text-purple-600" />
//                             )}
//                             {purchaseItem?.product?.name || "Fabric Product"}
//                           </h3>
//                           <div className="flex items-center gap-2">
//                             <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
//                               {purchaseItem?.product?.type || "FABRIC"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="p-6">
//                         <div className="flex flex-col lg:flex-row gap-6 items-center">
//                           <div className="lg:w-32 lg:h-32 w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
//                             {purchaseItem?.product?.fabric?.photos?.[0] ||
//                             purchaseItem?.product?.style?.photos?.[0] ? (
//                               <img
//                                 src={
//                                   purchaseItem?.product?.fabric?.photos?.[0] ||
//                                   purchaseItem?.product?.style?.photos?.[0]
//                                 }
//                                 alt={
//                                   purchaseItem?.product?.name || "Product Photo"
//                                 }
//                                 className="w-full h-full object-cover rounded-xl"
//                               />
//                             ) : (
//                               <div className="text-center">
//                                 <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                                 <p className="text-sm text-gray-500">
//                                   No image
//                                 </p>
//                               </div>
//                             )}
//                           </div>

//                           <div className="flex-1">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                               <div>
//                                 <span className="text-sm font-medium text-gray-600">
//                                   Quantity:
//                                 </span>
//                                 <p className="text-lg font-bold text-gray-900">
//                                   {purchaseItem?.quantity || 1}
//                                 </p>
//                               </div>
//                               <div>
//                                 <span className="text-sm font-medium text-gray-600">
//                                   Unit Price:
//                                 </span>
//                                 <p className="text-lg font-bold text-purple-600">
//                                   ₦
//                                   {formatNumberWithCommas(
//                                     parseInt(purchaseItem?.product?.price || 0),
//                                   )}
//                                 </p>
//                               </div>
//                               <div>
//                                 <span className="text-sm font-medium text-gray-600">
//                                   Total:
//                                 </span>
//                                 <p className="text-2xl font-bold text-purple-600">
//                                   ₦
//                                   {formatNumberWithCommas(
//                                     parseInt(
//                                       purchaseItem?.product?.price || 0,
//                                     ) * parseInt(purchaseItem?.quantity || 1),
//                                   )}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ),
//               )}
//             </div>
//             {/* Empty state */}
//             {orderPurchase.length === 0 && (
//               <div className="text-center py-12">
//                 <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500 text-lg font-medium mb-2">
//                   No products found
//                 </p>
//                 <p className="text-gray-400">
//                   This order doesn't contain any products.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Tailor Actions */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
//               <Scissors className="w-5 h-5 text-purple-600" />
//               Tailoring Actions
//             </h3>

//             <div className="space-y-4">
//               <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   {getStatusIcon(orderInfo?.status)}
//                   <span className="font-semibold text-gray-700">
//                     Current Status
//                   </span>
//                 </div>
//                 <p className="text-sm text-orange-800 font-medium mb-1">
//                   {orderInfo?.status || "PENDING"}
//                 </p>
//                 <p className="text-xs text-orange-600">
//                   Last Updated:{" "}
//                   {formatDateStr(orderInfo?.updated_at, "D MMM YYYY h:mm A")}
//                 </p>
//               </div>

//               <div className="border border-gray-200 rounded-lg p-4">
//                 <label className="flex items-center justify-between cursor-pointer">
//                   <div className="flex-1">
//                     <span className="font-medium text-gray-900">
//                       Mark Tailoring Complete
//                     </span>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Upload finished garment photo
//                     </p>
//                   </div>
//                   <input
//                     type="checkbox"
//                     className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
//                     checked={markReceivedChecked}
//                     onChange={() => handleCheckboxChange("received")}
//                     disabled={orderInfo?.status === "DELIVERED" || isUploading}
//                   />
//                 </label>
//               </div>

//               <div className="border border-gray-200 rounded-lg p-4">
//                 <label className="flex items-center justify-between cursor-pointer">
//                   <div className="flex-1">
//                     <span className="font-medium text-gray-900">
//                       Mark as Shipped
//                     </span>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Send to customer
//                     </p>
//                   </div>
//                   <input
//                     type="checkbox"
//                     className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
//                     checked={markSentChecked}
//                     onChange={() => handleCheckboxChange("sent")}
//                     disabled={orderInfo?.status === "DELIVERED" || isUploading}
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Order Timeline */}
//           <div className="bg-white rounded-xl shadow-sm p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-6">
//               Order Timeline
//             </h3>

//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-900">
//                     Order Placed
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     {formatDateStr(orderInfo?.created_at)}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-3 h-3 rounded-full ${orderInfo?.status === "PROCESSING" || orderInfo?.status === "SHIPPED" || orderInfo?.status === "DELIVERED" ? "bg-orange-500" : "bg-gray-300"}`}
//                 ></div>
//                 <div className="flex-1">
//                   <p
//                     className={`text-sm font-medium ${orderInfo?.status === "PROCESSING" || orderInfo?.status === "SHIPPED" || orderInfo?.status === "DELIVERED" ? "text-gray-900" : "text-gray-500"}`}
//                   >
//                     In Progress
//                   </p>
//                   <p className="text-xs text-gray-500">Currently tailoring</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-3 h-3 rounded-full ${orderInfo?.status === "SHIPPED" || orderInfo?.status === "DELIVERED" ? "bg-blue-500" : "bg-gray-300"}`}
//                 ></div>
//                 <div className="flex-1">
//                   <p
//                     className={`text-sm ${orderInfo?.status === "SHIPPED" || orderInfo?.status === "DELIVERED" ? "font-medium text-gray-900" : "text-gray-500"}`}
//                   >
//                     Ready for Delivery
//                   </p>
//                   <p className="text-xs text-gray-400">
//                     {orderInfo?.status === "SHIPPED" ||
//                     orderInfo?.status === "DELIVERED"
//                       ? "Shipped"
//                       : "Pending"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Upload Popup */}
//       {showUploadPopup && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-gray-900">
//                   {getActionTitle()}
//                 </h3>
//                 <button
//                   onClick={handleClosePopup}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                   disabled={isUploading}
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               <p className="text-gray-600 mb-6 leading-relaxed">
//                 {getActionDescription()}
//               </p>

//               {/* File Upload Area */}
//               <div className="mb-6">
//                 {!selectedFile ? (
//                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
//                     <div className="flex justify-center mb-4">
//                       <Upload className="w-12 h-12 text-gray-400" />
//                     </div>
//                     <p className="text-gray-600 font-medium mb-2">
//                       Click to upload photo
//                     </p>
//                     <p className="text-gray-400 text-sm mb-4">
//                       Max file size: 5MB • JPG, PNG, GIF
//                     </p>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       id="garment-upload"
//                       onChange={handleFileSelect}
//                       disabled={isUploading}
//                     />
//                     <label
//                       htmlFor="garment-upload"
//                       className={`inline-block px-6 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
//                         isUploading
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-purple-100 text-purple-700 hover:bg-purple-200"
//                       }`}
//                     >
//                       Browse Files
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {/* Image Preview */}
//                     <div className="border border-gray-200 rounded-xl overflow-hidden">
//                       <img
//                         src={imagePreview}
//                         alt="Preview"
//                         className="w-full h-48 object-cover"
//                       />
//                     </div>

//                     {/* File Details */}
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <ImageIcon className="w-5 h-5 text-purple-600" />
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">
//                               {selectedFile.name}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {formatFileSize(selectedFile.size)}
//                             </p>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() => {
//                             setSelectedFile(null);
//                             setImagePreview(null);
//                             const fileInput =
//                               document.getElementById("garment-upload");
//                             if (fileInput) fileInput.value = "";
//                           }}
//                           className="text-gray-400 hover:text-red-500 transition-colors"
//                           disabled={isUploading}
//                         >
//                           <X size={18} />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Change File Button */}
//                     <div className="text-center">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         className="hidden"
//                         id="garment-upload-change"
//                         onChange={handleFileSelect}
//                         disabled={isUploading}
//                       />
//                       <label
//                         htmlFor="garment-upload-change"
//                         className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
//                           isUploading
//                             ? "border-gray-300 text-gray-400 cursor-not-allowed"
//                             : "border-purple-300 text-purple-700 hover:bg-purple-50"
//                         }`}
//                       >
//                         <Upload size={16} />
//                         Change Image
//                       </label>
//                     </div>
//                   </div>
//                 )}

//                 {/* Upload Status */}
//                 {uploadStatus && (
//                   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       {isUploading && (
//                         <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
//                       )}
//                       <p className="text-sm font-medium text-blue-800">
//                         {uploadStatus}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleClosePopup}
//                   className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//                   disabled={isUploading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCompleteUpload}
//                   className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
//                     selectedFile && !isUploading
//                       ? "bg-purple-600 text-white hover:bg-purple-700"
//                       : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                   }`}
//                   disabled={!selectedFile || isUploading}
//                 >
//                   {isUploading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="w-4 h-4" />
//                       {currentActionType === "received"
//                         ? "Complete & Upload"
//                         : "Ship & Upload"}
//                     </>
//                   )}
//                 </button>
//               </div>

//               {/* Instructions */}
//               <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                 <h4 className="text-sm font-semibold text-amber-800 mb-2">
//                   Upload Instructions:
//                 </h4>
//                 <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
//                   <li>Take a clear, well-lit photo of the finished garment</li>
//                   <li>Ensure the entire garment is visible in the frame</li>
//                   <li>Avoid blurry or poorly lit images</li>
//                   <li>Maximum file size: 5MB</li>
//                   <li>Supported formats: JPG, PNG, GIF</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderDetails;

// Upload image to multimedia endpoint using your existing service
// {{REWRITTEN_CODE}}
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
    status: actionType === "received" ? "PROCESSING" : "SHIPPED",
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
          reject(new Error(error?.message || "Failed to update order status"));
        },
      },
    );
  });
};
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
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import useGetSingleOrder from "../../../hooks/order/useGetSingleOrder";
import Loader from "../../../components/ui/Loader";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useUpdateOrderStatus from "../../../hooks/order/useUpdateOrderStatus";

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
  const measurement = orderInfo?.payment?.metadata[0]?.measurement[0] || {};

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Details
          </h1>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* {{ REWRITTEN_CODE }}*/}
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
                {/* Order Details Grid */}
                <div className="grid grid-cols-3 gap-8 mb-6">
                  {/* STYLE */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">FABRIC</p>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {orderPurchase[0]?.product?.fabric?.photos?.[0] ? (
                          <img
                            src={orderPurchase[0]?.product?.fabric?.photos?.[0]}
                            alt="Style"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="w-12 h-12 text-gray-400 mx-auto" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-gray-900 truncate max-w-[140px]"
                          title={orderPurchase[0]?.product?.name}
                        >
                          {orderPurchase[0]?.product?.name
                            ? orderPurchase[0]?.product?.name.length > 28
                              ? orderPurchase[0]?.product?.name.slice(0, 28) +
                                "..."
                              : orderPurchase[0]?.product?.name
                            : "Product Name"}
                        </p>
                        <p className="text-sm text-gray-500">
                          X {orderPurchase[0]?.quantity || 1} Piece
                        </p>
                        {/* <p className="text-blue-600 font-medium">
                          ₦
                          {formatNumberWithCommas(
                            orderPurchase[0]?.product?.price,
                          )}
                        </p>*/}
                      </div>
                    </div>
                  </div>
                  {/* STYLE */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">STYLE</p>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {orderPurchase[1]?.product?.style?.photos?.[0] ? (
                          <img
                            src={orderPurchase[1]?.product?.style?.photos?.[0]}
                            alt="Fabric"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="w-12 h-12 text-gray-400 mx-auto" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-gray-900 truncate max-w-[140px]"
                          title={orderPurchase[1]?.product?.name}
                        >
                          {orderPurchase[1]?.product?.name
                            ? orderPurchase[1]?.product?.name.length > 28
                              ? orderPurchase[1]?.product?.name.slice(0, 28) +
                                "..."
                              : orderPurchase[1]?.product?.name
                            : "Fabric Name"}
                        </p>
                        <p className="text-sm text-gray-500">
                          X {orderPurchase[1]?.quantity || 2} Yards
                        </p>
                        <p className="text-blue-600 font-medium">
                          ₦
                          {formatNumberWithCommas(
                            orderPurchase[1]?.product?.price,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* MEASUREMENTS */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">MEASUREMENTS</p>
                    <button
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      onClick={handleOpenMeasurementModal}
                    >
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">See measurement</span>
                    </button>
                  </div>
                </div>
                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Order Total :</span>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ₦ {formatNumberWithCommas(orderInfo?.total_amount)}
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium">
                        {orderInfo?.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* {{ REWRITTEN_CODE }}*/}
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
                        checked={markReceivedChecked}
                        onChange={() => handleCheckboxChange("received")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  <div>
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
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      OUT FOR DELIVERY
                    </p>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-900">Mark as Sent</span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        checked={markSentChecked}
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

        {/* Measurement Modal */}
        {showMeasurementModal && (
          // {{REWRITTEN_CODE}}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative border border-purple-100">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                onClick={handleCloseMeasurementModal}
                aria-label="Close"
              >
                <X size={28} />
              </button>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="w-7 h-7 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Measurement Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Upper Body */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="font-bold text-purple-700 mb-4 text-base flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                      Upper Body
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Bust Circumference
                        </span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.bust_circumference ?? "--"}{" "}
                          {measurement?.upper_body?.bust_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Shoulder Width</span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.shoulder_width ?? "--"}{" "}
                          {measurement?.upper_body?.shoulder_width_unit ?? ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Armhole Circumference
                        </span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.armhole_circumference ??
                            "--"}{" "}
                          {measurement?.upper_body
                            ?.armhole_circumference_unit ?? ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Sleeve Length</span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.sleeve_length ?? "--"}{" "}
                          {measurement?.upper_body?.sleeve_length_unit ?? ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Bicep Circumference
                        </span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.bicep_circumference ?? "--"}{" "}
                          {measurement?.upper_body?.bicep_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Wrist Circumference
                        </span>
                        <span className="font-semibold text-purple-700">
                          {measurement?.upper_body?.waist_circumference ?? "--"}{" "}
                          {measurement?.upper_body?.waist_circumference_unit ??
                            ""}
                        </span>
                      </li>
                    </ul>
                  </div>
                  {/* Lower Body */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="font-bold text-blue-700 mb-4 text-base flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                      Lower Body
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Waist Circumference
                        </span>
                        <span className="font-semibold text-blue-700">
                          {measurement?.lower_body?.waist_circumference ?? "--"}{" "}
                          {measurement?.lower_body?.waist_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Hip Circumference</span>
                        <span className="font-semibold text-blue-700">
                          {measurement?.lower_body?.hip_circumference ?? "--"}{" "}
                          {measurement?.lower_body?.hip_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Thigh Circumference
                        </span>
                        <span className="font-semibold text-blue-700">
                          {measurement?.lower_body?.thigh_circumference ?? "--"}{" "}
                          {measurement?.lower_body?.thigh_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Knee Circumference
                        </span>
                        <span className="font-semibold text-blue-700">
                          {measurement?.lower_body?.knee_circumference ?? "--"}{" "}
                          {measurement?.lower_body?.knee_circumference_unit ??
                            ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Trouser Length</span>
                        <span className="font-semibold text-blue-700">
                          {measurement?.lower_body?.trouser_length ?? "--"}{" "}
                          {measurement?.lower_body?.trouser_length_unit ?? ""}
                        </span>
                      </li>
                    </ul>
                  </div>
                  {/* Full Body */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h4 className="font-bold text-amber-700 mb-4 text-base flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-amber-400 rounded-full"></span>
                      Full Body
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Height</span>
                        <span className="font-semibold text-amber-700">
                          {measurement?.full_body?.height ?? "--"}{" "}
                          {measurement?.full_body?.height_unit ?? ""}
                        </span>
                      </li>
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Dress/Gown Length</span>
                        <span className="font-semibold text-amber-700">
                          {measurement?.full_body?.dress_length ?? "--"}{" "}
                          {measurement?.full_body?.dress_length_unit ?? ""}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Divider */}
                <div className="mt-8 flex justify-end">
                  <button
                    className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors shadow"
                    onClick={handleCloseMeasurementModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          // {{REWRITTEN_CODE}}
        )}

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
            {/* <div>
              <p className="text-sm text-gray-500 mb-2">DELIVERY DATE</p>
              <p className="text-gray-900">
                {formatDateStr(orderInfo?.updated_at)} (10 days left)
              </p>
            </div>*/}
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
                {orderInfo?.payment?.metadata[0].customer_name || "N/A"}
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
// {{REWRITTEN_CODE}}
