import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUpload, FaTrash, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import useGetProductCategories from "../../../hooks/useGetProductCategories";
import useGetMarkets from "../../../hooks/useGetMarkets";
import useUploadVideo from "../../../hooks/multimedia/useUploadVideo";
import useUploadImage from "../../../hooks/multimedia/useUploadImage";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import Autocomplete from "react-google-autocomplete";
import { Edit } from "lucide-react";

import useEditMarketRepFabric from "../../../hooks/marketRep/useEditMarketRepFabric";
import ColorSelector from "../../../components/shared/ColorSelector";

const EditFabric = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Expecting fabricId, product and selectedVendor from location.state
  const { id: itemId } = useParams();
  const { selectedVendor: _selectedVendor, product } = location.state || {};
  const { toastSuccess, toastError } = useToast();

  console.log("===This is the selected vendor===");
  console.log(_selectedVendor);
  console.log("===This is the product for edit===");
  console.log(product);

  // State for images and video
  const [photoUrls, setPhotoUrls] = useState(["", "", "", ""]);
  const [isUploadingImages, setIsUploadingImages] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [_videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Color selection state
  const [numberOfColors, setNumberOfColors] = useState(1);
  const [selectedColors, setSelectedColors] = useState(["#000000"]);

  // Fetch product categories
  const { categories, isLoading: categoriesLoading } =
    useGetProductCategories();

  console.log("These are the categories", categories);

  // Fetch markets
  const { markets, isLoading: marketsLoading } = useGetMarkets();

  // Fetch fabric vendors
  const { data: getAllFabVendorData, isLoading: vendorsLoading } =
    useGetAllMarketRepVendor({}, "fabric-vendor");

  // Get business ID from selected vendor
  const businessId = _selectedVendor?.business_info?.id;

  // Fetch fabric details by ID - Commented out since we have product data from state
  // const {
  //   data: getFabricDataById,
  //   isLoading: isFabricLoading,
  //   error: errorGotten,
  // } = useGetMarketRepFabricById(itemId, businessId);

  // Image upload hook
  const { uploadImageMutate } = useUploadImage();

  // Video upload hook
  const { uploadVideoMutate } = useUploadVideo();

  // Edit fabric mutation
  const { createMarketRepFabricMutate, isPending: isEditing } =
    useEditMarketRepFabric();

  // Populate form with product data from location.state
  useEffect(() => {
    if (product?.fabric) {
      const fabric = product.fabric;
      console.log("=== PREFILL DEBUG ===");
      console.log("🔧 FABRIC DEBUG - Product data:", product);
      console.log("🔧 FABRIC DEBUG - Fabric data:", fabric);

      // Find vendor ID by business name
      console.log("--- VENDOR PREFILLING ---");
      console.log("Business info:", product.business_info);
      console.log(
        "Available vendors:",
        getAllFabVendorData?.data?.map((v) => ({
          id: v.id,
          name: v.name,
          business_name: v.business_name,
        })),
      );

      const vendorId =
        getAllFabVendorData?.data?.find(
          (vendor) =>
            vendor.business_name === product.business_info?.business_name ||
            vendor.name === product.business_info?.business_name,
        )?.id || "";

      console.log("Found vendor ID:", vendorId);

      // Find category ID
      console.log("--- CATEGORY PREFILLING ---");
      console.log("Product category:", product.category);
      console.log(
        "Available categories:",
        categories
          ?.filter((c) => c.type === "fabric")
          ?.map((c) => ({ id: c.id, name: c.name })),
      );

      const categoryId = product.category?.id || product.category_id || "";

      console.log("Found category ID:", categoryId);

      // Set form fields
      formik.setValues({
        vendor_id: vendorId,
        name: product.name || "",
        category_id: categoryId,
        description: product.description || "",
        gender: product.gender || "",
        price: product.price || "",
        quantity: fabric.quantity || 1,
        market_id: fabric.market_id || "",
        weight_per_unit: fabric.weight_per_unit || "",
        local_name: fabric.local_name || "",
        manufacturer_name: fabric.manufacturer_name || "",
        material_type: fabric.material_type || "",
        alternative_names: fabric.alternative_names || "",
        fabric_texture: fabric.fabric_texture || "",
        feel_a_like: fabric.feel_a_like || "",
        minimum_yards: fabric.minimum_yards || "1",
        available_colors: Array.isArray(fabric.available_colors)
          ? fabric.available_colors.join(", ")
          : fabric.available_colors || "",

        tags: Array.isArray(product.tags)
          ? product.tags.join(", ")
          : product.tags || "",
        video_url: fabric.video_url || "",
      });

      console.log("=== PREFILL COMPLETE ===");

      // Set color selection state
      if (fabric.available_colors) {
        const colors = Array.isArray(fabric.available_colors)
          ? fabric.available_colors
          : fabric.available_colors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);
        setNumberOfColors(colors.length || 1);
        setSelectedColors(colors.length > 0 ? colors : ["#000000"]);
      }

      // Set images and video
      if (Array.isArray(fabric.photos)) {
        const newPhotoUrls = ["", "", "", ""];
        fabric.photos.forEach((photo, index) => {
          if (index < 4 && photo) {
            newPhotoUrls[index] = photo;
          }
        });
        setPhotoUrls(newPhotoUrls);
      }
      if (fabric.video_url) {
        setVideoUrl(fabric.video_url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, categories]);

  const validationSchema = Yup.object({
    vendor_id: Yup.string().required("Please select a fabric vendor"),
    name: Yup.string().required("Fabric name is required"),
    category_id: Yup.string().required("Category is required"),
    description: Yup.string().required("Description is required"),
    gender: Yup.string().required("Gender is required"),
    price: Yup.number()
      .required("Price is required")
      .min(1, "Price must be greater than 0"),
    market_id: Yup.string().required("Market ID is required"),
    weight_per_unit: Yup.string().required("Weight per unit is required"),
    local_name: Yup.string().required("Local name is required"),
    manufacturer_name: Yup.string().required("Manufacturer name is required"),
    material_type: Yup.string().required("Material type is required"),
    quantity: Yup.number()
      .required("Quantity is required")
      .min(1, "Quantity must be greater than 0"),
    minimum_yards: Yup.string().required("Minimum yards is required"),
    available_colors: Yup.string().required("Available colors is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      vendor_id: "",
      name: "",
      category_id: "",
      description: "",
      gender: "",
      price: "",
      quantity: 1,
      market_id: "",
      weight_per_unit: "",
      local_name: "",
      manufacturer_name: "",
      material_type: "",
      alternative_names: "",
      fabric_texture: "",
      feel_a_like: "",
      minimum_yards: "1",
      available_colors: "#000000",
      tags: "",
      video_url: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const uploadedPhotos = photoUrls.filter(
        (url) => url && url.trim() !== "",
      );
      if (uploadedPhotos.length === 0) {
        toastError("Please upload at least one photo");
        return;
      }
      // Prepare payload for update
      const payload = {
        id: itemId,
        vendor_id: values.vendor_id,
        product: {
          type: "FABRIC",
          status: "PUBLISHED",
          name: values.name,
          category_id: values.category_id,
          description: values.description,
          gender: values.gender,
          tags: values.tags
            ? values.tags.split(",").map((tag) => tag.trim())
            : [],
          price: values.price.toString(),
        },
        fabric: {
          market_id: values.market_id,
          weight_per_unit: values.weight_per_unit.toString(),
          local_name: values.local_name,
          manufacturer_name: values.manufacturer_name,
          material_type: values.material_type,
          alternative_names: values.alternative_names,
          fabric_texture: values.fabric_texture,
          feel_a_like: values.feel_a_like,
          quantity: parseInt(values.quantity),
          minimum_yards: values.minimum_yards.toString(),
          available_colors: values.available_colors,

          photos: photoUrls.filter((url) => url && url.trim() !== ""),
          video_url: values.video_url,
        },
      };

      // Use the same business ID from selectedVendor for consistency
      const updateBusinessId =
        businessId ||
        _selectedVendor?.business_info?.id ||
        product?.vendor?.business_id ||
        product?.business_id;

      console.log("🔧 USING BUSINESS ID FOR UPDATE:", updateBusinessId);

      createMarketRepFabricMutate(
        {
          id: itemId,
          payload,
          vendorId: values.vendor_id,
          businessId: updateBusinessId,
        },
        {
          onSuccess: () => {
            toastSuccess("Fabric updated successfully!");
            navigate("/sales/my-products");
          },
          onError: () => {
            // Error handled in hook
          },
        },
      );
    },
  });

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];
    if (!validTypes.includes(file.type)) {
      toastError("Please upload a valid video file (MP4, AVI, MOV, WMV)");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("Video file must be less than 50MB");
      return;
    }

    setVideoFile(file);
    setIsUploadingVideo(true);

    const formData = new FormData();
    formData.append("video", file);

    uploadVideoMutate(formData, {
      onSuccess: (response) => {
        const videoUrl =
          response?.data?.data?.url ||
          response?.data?.url ||
          response?.data?.video_url;
        if (videoUrl) {
          setVideoUrl(videoUrl);
          formik.setFieldValue("video_url", videoUrl);
          toastSuccess("Video uploaded successfully!");
        } else {
          toastError("Video uploaded but URL not received");
        }
        setIsUploadingVideo(false);
      },
      onError: () => {
        toastError("Failed to upload video. Please try again.");
        setIsUploadingVideo(false);
      },
    });
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoUrl("");
    formik.setFieldValue("video_url", "");
  };

  const handleImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validImageTypes.includes(file.type)) {
      toastError("Please upload a valid image file (PNG, JPG, or JPEG)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toastError("Image file must be less than 5MB");
      return;
    }

    // Set loading state for this specific box
    setIsUploadingImages((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    // Create preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = previewUrl;
      return newUrls;
    });

    // Prepare FormData for upload
    const formData = new FormData();
    formData.append("image", file);

    uploadImageMutate(formData, {
      onSuccess: (response) => {
        console.log("📸 Image upload response:", response);
        const imageUrl =
          response?.data?.data?.url ||
          response?.data?.url ||
          response?.data?.image_url;

        if (imageUrl) {
          // Revoke the preview URL and set the actual URL
          URL.revokeObjectURL(previewUrl);
          setPhotoUrls((prev) => {
            const newUrls = [...prev];
            newUrls[index] = imageUrl;
            return newUrls;
          });
          toastSuccess(`Image ${index + 1} uploaded successfully!`);
        } else {
          toastError("Image uploaded but URL not received");
          // Keep the preview if URL not received
        }

        setIsUploadingImages((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      },
      onError: (error) => {
        console.error("📸 Image upload error:", error);
        // Revert to empty on error
        URL.revokeObjectURL(previewUrl);
        setPhotoUrls((prev) => {
          const newUrls = [...prev];
          newUrls[index] = "";
          return newUrls;
        });
        toastError(`Failed to upload image ${index + 1}. Please try again.`);
        setIsUploadingImages((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
      },
    });
  };

  const removeImage = (index) => {
    setPhotoUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = "";
      return newUrls;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Fabric</h1>
      </div>
      {/* Removed loading state since we use product data from location.state */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Fabric Vendor *
          </label>
          {vendorsLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
              <FaSpinner className="animate-spin mr-2" />
              Loading fabric vendors...
            </div>
          ) : (
            <select
              {...formik.getFieldProps("vendor_id")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a fabric vendor</option>
              {getAllFabVendorData?.data?.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.business_name || vendor.email})
                </option>
              ))}
            </select>
          )}
          {formik.touched.vendor_id && formik.errors.vendor_id && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.vendor_id}
            </p>
          )}
        </div>

        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Name *
            </label>
            <input
              type="text"
              {...formik.getFieldProps("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter fabric name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Category *
            </label>
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                Loading categories...
              </div>
            ) : (
              <select
                {...formik.getFieldProps("category_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((category) => category.type === "fabric")
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            )}
            {formik.touched.category_id && formik.errors.category_id && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.category_id}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...formik.getFieldProps("description")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter fabric description"
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              {...formik.getFieldProps("gender")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              {...formik.getFieldProps("price")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter price"
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            {...formik.getFieldProps("tags")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="vintage, modern, classic"
          />
        </div>

        {/* Fabric Specific Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Fabric Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Place *
              </label>
              {marketsLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Loading markets...
                </div>
              ) : (
                <select
                  {...formik.getFieldProps("market_id")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a market</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
                </select>
              )}
              {formik.touched.market_id && formik.errors.market_id && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.market_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight per yard(g) *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("weight_per_unit")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 10g"
              />
              {formik.touched.weight_per_unit &&
                formik.errors.weight_per_unit && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.weight_per_unit}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("local_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter local name"
              />
              {formik.touched.local_name && formik.errors.local_name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.local_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("manufacturer_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter manufacturer name"
              />
              {formik.touched.manufacturer_name &&
                formik.errors.manufacturer_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.manufacturer_name}
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Type *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("material_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Cotton, Silk"
              />
              {formik.touched.material_type && formik.errors.material_type && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.material_type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Texture
              </label>
              <input
                type="text"
                {...formik.getFieldProps("fabric_texture")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter fabric texture"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Names
              </label>
              <input
                type="text"
                {...formik.getFieldProps("alternative_names")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter alternative names"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feel A Like
              </label>
              <input
                type="text"
                {...formik.getFieldProps("feel_a_like")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What does it feel like?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                {...formik.getFieldProps("quantity")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter quantity"
              />
              {formik.touched.quantity && formik.errors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Yards *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("minimum_yards")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 50"
              />
              {formik.touched.minimum_yards && formik.errors.minimum_yards && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.minimum_yards}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Upload
              </label>

              {!videoUrl ? (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploadingVideo ? (
                        <>
                          <FaSpinner className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                          <p className="text-sm text-gray-500">
                            Uploading video...
                          </p>
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            fabric video
                          </p>
                          <p className="text-xs text-gray-500">
                            MP4, AVI, MOV, WMV (MAX. 50MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo}
                    />
                  </label>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Video uploaded successfully
                      </p>
                      <p className="text-xs text-gray-500 break-all">
                        {videoUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <ColorSelector
              numberOfColors={numberOfColors}
              setNumberOfColors={setNumberOfColors}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              onColorsChange={(colors) => {
                formik.setFieldValue("available_colors", colors.join(", "));
              }}
              maxColors={10}
              label="Available Colors"
              required={true}
              error={
                formik.touched.available_colors &&
                formik.errors.available_colors
                  ? formik.errors.available_colors
                  : null
              }
            />

            {/* Hidden input for form validation */}
            <input
              type="hidden"
              {...formik.getFieldProps("available_colors")}
              value={selectedColors.join(", ")}
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Images *
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload at least one image. The images should show different angles
            of the fabric.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative">
                {!photoUrls[index] ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center py-4">
                      {isUploadingImages[index] ? (
                        <>
                          <FaSpinner className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                          <p className="text-xs text-gray-500">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-sm font-semibold text-gray-500 text-center px-2">
                            <span className="font-normal">Click to upload</span>
                            <br />
                            {index === 0 && "Close-up view"}
                            {index === 1 && "Spread-out view"}
                            {index === 2 && "Manufacturer's label"}
                            {index === 3 && "Fabric's name"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG (MAX. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      disabled={isUploadingImages[index]}
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-40">
                    <img
                      src={photoUrls[index]}
                      alt={`Fabric ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {isUploadingImages[index] && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <FaSpinner className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={isUploadingImages[index]}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                    <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors shadow-lg cursor-pointer">
                      <FaUpload className="w-3 h-3" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        disabled={isUploadingImages[index]}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isEditing ||
              isUploadingImages.some((uploading) => uploading) ||
              isUploadingVideo
            }
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isEditing ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Fabric"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditFabric;
