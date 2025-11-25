import React, { useState, useMemo, useEffect } from "react";
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSearch,
  FaStore,
  FaArrowLeft,
  FaBox,
  FaUsers,
  FaTh,
  FaList,
} from "react-icons/fa";
import { GiScissors } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import useGetAllMarketRepVendor from "../../../hooks/marketRep/useGetAllReps";
import { useProductActions } from "../../../hooks/marketRep/useProductActions";

import { formatNumberWithCommas, formatDateStr } from "../../../lib/helper";
import ReusableTable from "./components/ReusableTable";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import useGetVendorProducts from "../../../hooks/marketRep/useGetVendorProducts";
import VendorCard from "./components/VendorCard";
import VendorSkeleton from "./components/VendorSkeleton";
import Breadcrumb from "./components/Breadcrumb";
import QuickActions from "./components/QuickActions";
import ProductSummaryCard from "./components/ProductSummaryCard";
import ProductViewModal from "./components/ProductViewModal";
import ProductEditModal from "./components/ProductEditModal";

const MyProducts = () => {
  const navigate = useNavigate();
  const { deleteProduct, updateProduct, isDeleting, isUpdating } =
    useProductActions();

  // State management
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorType, setVendorType] = useState("fabric-vendor");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    product: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    product: null,
  });

  // Track vendorType change to trigger refetch
  const [vendorTypeChanged, setVendorTypeChanged] = useState(false);
  // Fetch vendors based on selected type
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    isError: vendorsError,
    refetch: refetchVendors,
  } = useGetAllMarketRepVendor(
    {
      "pagination[page]": 1,
      "pagination[limit]": 50,
    },
    vendorType === "fabric-vendor" ? "fabric-vendor" : "fashion-designer",
  );

  // Refetch vendors when vendorType changes
  useEffect(() => {
    // When vendorType changes, refetch vendors and reset selection/search
    setVendorSearchTerm("");
    setSelectedVendor(null);
    setVendorTypeChanged(true);
    refetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorType]);

  // Reset the vendorTypeChanged flag after data loads
  useEffect(() => {
    if (!vendorsLoading && vendorTypeChanged) {
      setVendorTypeChanged(false);
    }
  }, [vendorsLoading, vendorTypeChanged]);

  // Fetch products for selected vendor
  const {
    products: vendorProducts,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useGetVendorProducts(selectedVendor?.id);
  console.log(
    "🚀 ~ file: useGetVendorProducts.jsx:93 ~ products:",
    vendorProducts,
  );
  // Process vendors data
  const allVendors = useMemo(() => {
    // Only update UI after vendorTypeChanged is false (i.e., after fetch)
    if (vendorTypeChanged) {
      return [];
    }

    if (!vendorsData?.data) {
      return [];
    }

    const processedVendors = vendorsData.data.map((vendor, index) => {
      const processed = {
        ...vendor,
        displayName: vendor?.name || vendor?.email || "Unknown Vendor",
        businessName: vendor?.business_info?.business_name || "N/A",
        joinDate: vendor?.created_at
          ? formatDateStr(vendor.created_at.split(".")[0])
          : "N/A",
      };
      return processed;
    });

    return processedVendors;
  }, [vendorsData, vendorTypeChanged]);

  // Filter and search vendors
  const vendors = useMemo(() => {
    let filtered = allVendors || [];

    // Search filter for vendors
    if (vendorSearchTerm) {
      filtered = filtered.filter((vendor) => {
        if (!vendor) {
          return false;
        }

        const matchesName = vendor.displayName
          ?.toLowerCase()
          .includes(vendorSearchTerm.toLowerCase());
        const matchesBusiness = vendor.businessName
          ?.toLowerCase()
          .includes(vendorSearchTerm.toLowerCase());
        const matchesEmail = vendor.email
          ?.toLowerCase()
          .includes(vendorSearchTerm.toLowerCase());

        const matches = matchesName || matchesBusiness || matchesEmail;
        return matches;
      });
    }
    return filtered;
  }, [allVendors, vendorSearchTerm]);

  // Process products data - just use the data directly
  const products = useMemo(() => {
    if (!vendorProducts || vendorProducts.length === 0) {
      return [];
    }
    return vendorProducts;
  }, [vendorProducts, selectedVendor]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((product) => {
        // Check if it's a fabric or style product
        const productType = product.fabric
          ? "fabric"
          : product.style
            ? "style"
            : product.product?.type?.toLowerCase();
        const matches = productType === filterType.toLowerCase();
        return matches;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const productName = product.name || product.product?.name || "";
        const productDescription =
          product.description || product.product?.description || "";
        const productSku = product.sku || "";

        const matchesName = productName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesDescription = productDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesSku = productSku
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matches = matchesName || matchesDescription || matchesSku;
        return matches;
      });
    }
    return filtered;
  }, [products, filterType, searchTerm]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredProducts.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
    return paginated;
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset pagination when vendor changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setFilterType("all");
  }, [selectedVendor]);

  const handleDelete = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = async () => {
    if (deleteModal.product) {
      try {
        await deleteProduct(deleteModal.product);
        refetchProducts();
        setDeleteModal({ isOpen: false, product: null });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleVendorSelect = (vendor) => {
    if (!vendor) {
      return;
    }
    setSelectedVendor(vendor);
  };

  const handleBackToVendors = () => {
    setSelectedVendor(null);
  };

  const handleViewProduct = (product) => {
    setViewModal({ isOpen: true, product });
  };

  const handleEditProduct = (product) => {
    console.log("Edit product:", product);
    // Navigate to edit route with product data
    if (product.fabric) {
      navigate(`/sales/edit-fabric/${product?.id}`, {
        state: { product, selectedVendor },
      });
    } else if (product.style) {
      navigate(`/sales/edit-style/${product?.id}`, {
        state: { product, selectedVendor },
      });
    } else {
      // Fallback to modal for unknown product types
      setEditModal({ isOpen: true, product });
    }
  };

  const handleUpdateProduct = async (updatedData) => {
    if (editModal.product) {
      try {
        await updateProduct(editModal.product, updatedData, selectedVendor);
        refetchProducts();
        setEditModal({ isOpen: false, product: null });
      } catch (error) {
        console.error("Update error:", error);
      }
    }
  };

  // Utility functions
  const getProductImage = (item) => {
    if (!item) return "https://via.placeholder.com/100x100?text=No+Image";

    // Check for photos array in different possible locations
    if (item.fabric?.photos?.length > 0) return item.fabric.photos[0];
    if (item.style?.photos?.length > 0) return item.style.photos[0];
    if (item.photos?.length > 0) return item.photos[0];

    // Check for direct image URLs from API response
    if (typeof item.photos === "string") return item.photos;
    if (item.image_url) return item.image_url;
    if (item.thumbnail) return item.thumbnail;

    return "https://via.placeholder.com/100x100?text=No+Image";
  };

  const getProductSpecificInfo = (item) => {
    if (!item)
      return <div className="text-xs text-gray-500">No details available</div>;

    if (item.fabric) {
      return (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Material: {item.fabric.material_type || "N/A"}</div>
          <div>Quantity: {item.quantity || "N/A"} yards</div>
          <div>Min Yards: {item.fabric.minimum_yards || "N/A"}</div>
          <div>Weight: {item.fabric.weight_per_unit || "N/A"}</div>
        </div>
      );
    }
    if (item.style) {
      return (
        <div className="text-xs text-gray-500 space-y-1">
          <div>SKU: {item.sku || "N/A"}</div>
          <div>Sewing Time: {item.style.estimated_sewing_time || "N/A"}h</div>
          <div>Min Fabric: {item.style.minimum_fabric_qty || "N/A"}</div>
        </div>
      );
    }

    // Default product info based on API structure
    return (
      <div className="text-xs text-gray-500 space-y-1">
        <div>SKU: {item.sku || "N/A"}</div>
        <div>Category: {item.category?.name || "N/A"}</div>
        <div>Market: {item.market_place?.name || "N/A"}</div>
        <div>
          Created:{" "}
          {item.created_at
            ? formatDateStr(item.created_at.split("T")[0])
            : "N/A"}
        </div>
      </div>
    );
  };

  // Product table columns
  const productColumns = [
    {
      label: "Product",
      key: "product",
      render: (value, item) => (
        <div className="flex items-center space-x-3">
          <img
            src={
              Array.isArray(item?.fabric?.photos) &&
              typeof item.fabric.photos[0] === "string"
                ? item.fabric.photos[0].split(" from ")[0]
                : Array.isArray(item?.style?.photos) &&
                    typeof item.style.photos[0] === "string"
                  ? item.style.photos[0].split(" from ")[0]
                  : ""
            }
            alt={item.name || "Product"}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">
              {item.name || "Unnamed Product"}
            </div>
            <div className="text-sm text-gray-500">
              {item.fabric ? "Fabric" : item.style ? "Style" : "Product"} •{" "}
              {item.gender || "Unisex"}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Details",
      key: "details",
      render: (value, item) => getProductSpecificInfo(item),
    },
    {
      label: "Price",
      key: "price",
      render: (value, item) => (
        <div>
          <div className="font-medium">
            ₦{formatNumberWithCommas(item.price || item.original_price || 0)}
          </div>
          {item.original_price && item.price !== item.original_price && (
            <div className="text-sm text-gray-500 line-through">
              ₦{formatNumberWithCommas(item.original_price)}
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (value, item) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            item.status === "PUBLISHED"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {item.status || "Draft"}
        </span>
      ),
    },
    {
      label: "Actions",
      key: "actions",
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewProduct(item)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
            title="View"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditProduct(item)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Loading state
  if ((vendorsLoading || vendorTypeChanged) && !selectedVendor) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="bg-white p-6 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-4 bg-gray-50 rounded-lg animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-300 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-12 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors skeleton */}
        <div className="bg-white p-6 rounded-xl">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <VendorSkeleton count={6} />
        </div>
      </div>
    );
  }

  // Error state
  if (vendorsError && !selectedVendor) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white p-4 rounded-xl">
          <Breadcrumb
            items={[
              {
                label: "View/Add Products",
              },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                View/Add Products
              </h1>
              <p className="text-gray-600 mt-1">
                Select a vendor to view and manage their products
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        <div className="bg-white p-6 rounded-xl">
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to Load Vendors
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                We encountered an issue while loading your vendors. Please check your connection and try again.
              </p>
              <button
                onClick={() => refetchVendors()}
                className="px-6 py-2 bg-gradient text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  if (!selectedVendor) {
    // Vendor selection view
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white p-4 rounded-xl">
          <Breadcrumb
            items={[
              {
                label: "View/Add Products",
              },
            ]}
          />
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                View/Add Products
              </h1>
              <p className="text-gray-600 mt-1">
                Select a vendor to view and manage their products
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {vendorType === "fabric-vendor" && (
                <Link
                  to="/sales/add-fabric"
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Fabric
                </Link>
              )}
              {vendorType === "fashion-designer" && (
                <Link
                  to="/sales/add-style"
                  className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add Style
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Type Toggle */}
        <div className="bg-white p-6 rounded-xl">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVendorType("fabric-vendor")}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  vendorType === "fabric-vendor"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaStore className="mr-2 w-4 h-4" />
                Fabric Vendors
              </button>
              <button
                onClick={() => setVendorType("fashion-designer")}
                className={`flex items-center px-4 py-2 rounded-md transition-all ${
                  vendorType === "fashion-designer"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <GiScissors className="mr-2 w-4 h-4" />
                Fashion Designers
              </button>
            </div>
          </div>
        </div>

        {/* Vendor Search and Filter */}
        <div className="bg-white p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${vendorType === "fabric-vendor" ? "fabric vendors" : "fashion designers"}...`}
                value={vendorSearchTerm}
                onChange={(e) => setVendorSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {vendors.length === allVendors.length
                ? `${vendors.length} ${vendorType === "fabric-vendor" ? "fabric vendors" : "fashion designers"}`
                : `${vendors.length} of ${allVendors.length} ${vendorType === "fabric-vendor" ? "fabric vendors" : "fashion designers"}`}
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="bg-white rounded-xl">
          {vendorsLoading || vendorTypeChanged ? (
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
              <VendorSkeleton count={6} />
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  {vendorSearchTerm ? (
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  ) : vendorType === "fabric-vendor" ? (
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {vendorSearchTerm ? (
                    "No vendors match your search"
                  ) : (
                    <>
                      No{" "}
                      {vendorType === "fabric-vendor"
                        ? "fabric vendors"
                        : "fashion designers"}{" "}
                      found
                    </>
                  )}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  {vendorSearchTerm ? (
                    "Try adjusting your search term or browse all vendors"
                  ) : (
                    <>
                      You haven't added any{" "}
                      {vendorType === "fabric-vendor"
                        ? "fabric vendors"
                        : "fashion designers"}{" "}
                      yet. Start by adding your first vendor to get started.
                    </>
                  )}
                </p>
                {!vendorSearchTerm && (
                  <Link
                    to={`/sales/add-${vendorType === "fabric-vendor" ? "fabric-vendors" : "fashion-designers"}`}
                    className="inline-flex items-center px-6 py-2 bg-gradient text-white rounded-md hover:opacity-90 transition-opacity"
                  >
                    <FaPlus className="mr-2" />
                    Add{" "}
                    {vendorType === "fabric-vendor"
                      ? "Fabric Vendor"
                      : "Fashion Designer"}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  {vendorType === "fabric-vendor"
                    ? "Fabric Vendors"
                    : "Fashion Designers"}{" "}
                  ({vendors.length})
                </h2>
                <Link
                  to={`/sales/add-${vendorType === "fabric-vendor" ? "fabric-vendors" : "fashion-designers"}`}
                  className="inline-flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  <FaPlus className="mr-1 w-3 h-3" />
                  Add New
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors
                  .filter((vendor) => vendor && vendor.id)
                  .map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      vendorType={vendorType}
                      onViewProducts={handleVendorSelect}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Product view for selected vendor
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="bg-white p-4 rounded-xl">
        <Breadcrumb
          items={[
            {
              label: "View/Add Products",
              path: "/sales/my-products",
            },
            {
              label: selectedVendor?.displayName || "Unknown Vendor",
            },
          ]}
        />
      </div>

      {/* Header with back button */}
      <div className="bg-white p-6 rounded-xl">
        <button
          onClick={handleBackToVendors}
          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          <FaArrowLeft className="mr-2 w-4 h-4" />
          Back
        </button>
      </div>

      {/* Quick Actions */}
      {selectedVendor && (
        <QuickActions
          selectedVendor={selectedVendor}
          totalProducts={products.length}
          onRefresh={refetchProducts}
          isLoading={productsLoading}
          vendorType={vendorType}
        />
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Left side - Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter by type */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Products</option>
                <option value="fabric">Fabrics</option>
                <option value="style">Styles</option>
              </select>
            </div>
          </div>

          {/* Right side - View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "table"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaList className="mr-1 w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center px-3 py-1.5 rounded-md transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaTh className="mr-1 w-4 h-4" />
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        {productsLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load products</p>
            <button
              onClick={() => refetchProducts()}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : `${selectedVendor?.displayName || "This vendor"} hasn't added any products yet`}
            </p>
            {!searchTerm && filterType === "all" && (
              <div className="flex justify-center space-x-4">
                {vendorType === "fabric-vendor" && (
                  <Link
                    to="/sales/add-fabric"
                    state={{ selectedVendor }}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Fabric
                  </Link>
                )}
                {vendorType === "fashion-designer" && (
                  <Link
                    to="/sales/add-style"
                    state={{ selectedVendor }}
                    className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Style
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : viewMode === "table" ? (
          <ReusableTable
            columns={productColumns}
            data={paginatedProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={filteredProducts.length}
          />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductSummaryCard
                  key={product.id}
                  product={product}
                  onView={handleViewProduct}
                  onEdit={handleEditProduct}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination for cards view */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length,
                  )}{" "}
                  of {filteredProducts.length} products
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1.5 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Product View Modal */}
      <ProductViewModal
        product={viewModal.product}
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, product: null })}
        onEdit={handleEditProduct}
        onDelete={handleDelete}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        product={editModal.product}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, product: null })}
        onSave={handleUpdateProduct}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default MyProducts;
