import React, { useEffect, useState, useRef } from "react";
import Breadcrumb from "./components/Breadcrumb";
import useGetCart from "../../hooks/cart/useGetCart";
import LoaderComponent from "../../components/BeatLoader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDeleteCart from "../../hooks/cart/useDeleteCart";
import useCreatePayment from "../../hooks/cart/useCreatePayment";
import { useCarybinUserStore } from "../../store/carybinUserStore";
import useVerifyPayment from "../../hooks/cart/useVerifyPayment";
import Cookies from "js-cookie";
import useToast from "../../hooks/useToast";
import useGetUserProfile from "../Auth/hooks/useGetProfile";
import { useFormik } from "formik";
import Select from "react-select";
import { nigeriaStates } from "../../constant";
import PhoneInput from "react-phone-input-2";
import useCreateBilling from "../../hooks/billing/useCreateBilling";
import useApplyCoupon from "../../hooks/cart/useApplyCoupon";
import useGetDeliveryFee from "../../hooks/delivery/useGetDeleiveryFee";

import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Trash2,
  User,
  Calendar,
  Package,
  Tag,
} from "lucide-react";
import { formatNumberWithCommas } from "../../lib/helper";
import CartItemStyle from "./components/CartItemStyle";
import CartItemStyleDesktop from "./components/CartItemStyleDesktop";
import CartItemWithBreakdown from "./components/CartItemWithBreakdown";
import CustomBackbtn from "../../components/CustomBackBtn";

const initialValues = {
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "NG",
};

const CartPage = () => {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Add duplicate detection state
  const [duplicateError, setDuplicateError] = useState(null);
  const token = Cookies.get("token");
  // API hooks
  const {
    data: cartResponse,
    isPending: cartLoading,
    refetch: refetchCart,
  } = useGetCart();

  console.log("cartResponse", cartResponse);
  const { deleteCartMutate, isPending: deleteIsPending } = useDeleteCart();
  const { applyCouponMutate, isPending: applyCouponPending } = useApplyCoupon();

  const { createPaymentMutate, isPending: createPaymentPending } =
    useCreatePayment();
  const { createBillingMutate, isPending: billingPending } = useCreateBilling();
  const { verifyPaymentMutate, isPending: verifyPending } = useVerifyPayment();

  // Get cart data from API response
  let cartData;

  if (token) {
    cartData = cartResponse?.data;
  } else {
    // Try to get pending_fabric_data from localStorage
    const pendingFabricData = localStorage.getItem("pending_fabric_data");
    if (pendingFabricData) {
      try {
        cartData = JSON.parse(pendingFabricData);
        console.log("This is the cart Data", cartData);
      } catch (e) {
        cartData = null;
        console.error(
          "Failed to parse pending_fabric_data from localStorage:",
          e,
        );
      }
    } else {
      cartData = null;
    }
  }
  const items = cartData?.items || [];
  console.log("🛒 Cart Data fetched:", items);
  console.log("🛒 Cart Items:", items);
  console.log("🛒 Cart Data:", cartData);
  const cartUser = cartData?.user;
  const cartMeta = {
    id: cartData?.id,
    created_at: cartData?.created_at,
    updated_at: cartData?.updated_at,
    count: cartData?.count,
  };

  const {
    data: deliveryData,
    isLoading: deliveryLoading,
    isError: deliveryError,
  } = useGetDeliveryFee();

  const { carybinUser, setCaryBinUser } = useCarybinUserStore();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  console.log(carybinUser);
  // Duplicate Detection Function
  const checkForDuplicateItems = (items) => {
    console.log("🔍 Checking for duplicate items...", items);

    // Create a map to track fabric+style combinations
    const itemCombinations = new Map();
    const duplicates = [];

    items.forEach((item, index) => {
      const fabricId = item.product_id || item.product?.id;
      const styleId = item.style_product?.id || null;

      // Create a unique key for fabric+style combination
      // If item has style, key includes both fabric and style
      // If item has no style, key is just fabric
      const combinationKey = styleId
        ? `fabric_${fabricId}_style_${styleId}`
        : `fabric_${fabricId}_no_style`;

      // Check if this combination already exists
      if (itemCombinations.has(combinationKey)) {
        const existingItem = itemCombinations.get(combinationKey);
        duplicates.push({
          current: {
            index,
            id: item.id,
            fabricId,
            styleId,
            fabricName: item.product?.name,
            styleName: item.style_product?.name,
            combinationKey,
          },
          existing: existingItem,
        });

        console.log("❌ Duplicate found!", {
          currentItem: item.product?.name,
          currentStyle: item.style_product?.name,
          existingItem: existingItem.fabricName,
          existingStyle: existingItem.styleName,
          combinationKey,
        });
      } else {
        // Store this combination
        itemCombinations.set(combinationKey, {
          index,
          id: item.id,
          fabricId,
          styleId,
          fabricName: item.product?.name,
          styleName: item.style_product?.name,
          combinationKey,
        });
      }
    });

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates,
      uniqueCombinations: Array.from(itemCombinations.values()),
    };
  };

  // Check for duplicates when items change
  useEffect(() => {
    if (items && items.length > 0) {
      const duplicateCheck = checkForDuplicateItems(items);

      if (duplicateCheck.hasDuplicates) {
        const duplicateMessages = duplicateCheck.duplicates.map((dup) => {
          const fabricName = dup.current.fabricName || "Unknown Fabric";
          const styleName = dup.current.styleName;

          if (styleName) {
            return `"${fabricName}" with style "${styleName}"`;
          } else {
            return `"${fabricName}" (no style)`;
          }
        });

        const errorMessage = `Duplicate items found in cart: ${duplicateMessages.join(", ")}. Please remove duplicates before proceeding.`;
        setDuplicateError(errorMessage);

        console.log("❌ Duplicate error set:", errorMessage);
      } else {
        setDuplicateError(null);
        console.log("✅ No duplicates found, clearing error");
      }
    } else {
      setDuplicateError(null);
    }
  }, [items]);

  // Fetch user profile if not already in store (important for Google login)
  const {
    data: userProfile,
    isPending: userProfileLoading,
    isSuccess: userProfileSuccess,
  } = useGetUserProfile();

  // Populate user store when profile data is fetched
  useEffect(() => {
    if (userProfile && userProfileSuccess && !carybinUser) {
      // console.log(
      //   "🔄 CartPage: Populating user store with profile data",
      //   userProfile,
      // );
      setCaryBinUser(userProfile);
    }
  }, [userProfile, userProfileSuccess, carybinUser, setCaryBinUser]);

  // Debug logging for authentication status
  useEffect(() => {
    const token = Cookies.get("token");
    const adminToken = Cookies.get("adminToken");
    const currUserUrl = Cookies.get("currUserUrl");
  }, [carybinUser, userProfileLoading, userProfile]);

  // Authentication check and redirect
  useEffect(() => {
    const token = Cookies.get("token");

    // If no token and not loading, redirect to login with cart redirect
    if (!token && !userProfileLoading) {
      console.log(
        "❌ CartPage: No authentication token found, redirecting to login",
      );
      navigate(
        `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`,
      );
      return;
    }

    // If token exists but no user data after loading is complete, there might be an issue
    if (token && !userProfileLoading && !carybinUser && !userProfile) {
      console.log(
        "⚠️ CartPage: Token exists but no user data - possible authentication issue",
      );
      toastError("Authentication issue detected. Please login again.");
      navigate(
        `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`,
      );
      return;
    }
  }, [
    carybinUser,
    userProfile,
    userProfileLoading,
    navigate,
    location,
    toastError,
  ]);

  const currentUrl = Cookies.get("currUserUrl");
  // console.log("user", userProfile);
  // Calculate totals from API cart items
  const calculateTotals = () => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        totalQuantity: 0,
        itemCount: 0,
      };
    }
    //GOOD
    const subtotal = items.reduce((total, item) => {
      const fabricPrice = parseFloat(
        item.price_at_time || item.product?.price || item?.price || 0,
      );
      const stylePrice = parseFloat(
        item.style_product?.price || item?.style_price || 0,
      );
      const measurementCount = item?.measurement?.length || 0;
      const quantity = parseInt(item.quantity || 1);
      const itemTotal = fabricPrice * quantity + stylePrice * measurementCount;

      console.log("💰 Cart Item Pricing:", {
        itemId: item.id,
        fabricPrice,
        stylePrice,
        quantity,
        itemTotal,
        hasStyle: !!item.style_product,
        stylePriceFromAPI: item.style_product?.price,
      });

      return total + itemTotal;
    }, 0);

    const totalQuantity = items.reduce((total, item) => {
      return total + parseInt(item.quantity || 1);
    }, 0);

    return {
      subtotal,
      totalQuantity,
      itemCount: items.length,
    };
  };

  const totals = calculateTotals();

  // Calculate fabric and style totals separately
  const fabricTotals = items.reduce(
    (acc, item) => {
      const fabricPrice = parseFloat(
        item.price_at_time || item.product?.price || 0,
      );
      const quantity = parseInt(item.quantity || 1);
      const fabricTotal = fabricPrice * quantity;

      return {
        totalAmount: acc.totalAmount + fabricTotal,
        totalYards: acc.totalYards + quantity,
        itemCount: acc.itemCount + 1,
      };
    },
    { totalAmount: 0, totalYards: 0, itemCount: 0 },
  );

  const styleTotals = items.reduce(
    (acc, item) => {
      const stylePrice = parseFloat(item.style_product?.price || 0);

      if (item.style_product && stylePrice > 0) {
        return {
          totalAmount: acc.totalAmount + stylePrice,
          itemCount: acc.itemCount + 1,
        };
      }
      return acc;
    },
    { totalAmount: 0, itemCount: 0 },
  );

  const delivery_fee = deliveryData?.data?.data?.delivery_fee ?? 0;
  const estimatedVat = totals.subtotal * 0.075;
  const charges = totals.subtotal * 0.015;
  const discountAmount = appliedCoupon?.discount || 0;

  const finalTotal =
    totals.subtotal + delivery_fee + estimatedVat - discountAmount;

  // Handle agreement click
  const handleAgreementClick = (e) => {
    e.preventDefault();
    const isMobile = window.innerWidth < 768;
    setShowPolicyModal(true);
  };

  // Get measurement count for styled items
  const getMeasurementCount = (measurement) => {
    if (Array.isArray(measurement)) {
      return measurement.length;
    }
    return measurement ? 1 : 0;
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    console.log("🛒 Removing item:", itemId);
    // If token exists, use API to delete
    if (token) {
      deleteCartMutate(
        {
          id: itemId,
        },
        {
          onSuccess: () => {
            console.log("🗑️ Item deleted successfully, refetching cart...");
            refetchCart();
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            // Clear any stale states
            setAppliedCoupon(null);
            setCoupon("");
            console.log(
              "🧹 Cleared coupon and stale states after item deletion",
            );
          },
          onError: (error) => {
            toastError("Failed to remove item");
            console.error("Delete error:", error);
          },
        },
      );
    } else {
      // No token: Remove from localStorage "pending_fabric_data"
      const pendingFabricData = localStorage.getItem("pending_fabric_data");
      if (pendingFabricData) {
        try {
          const cartObj = JSON.parse(pendingFabricData);
          if (Array.isArray(cartObj.items)) {
            // Find index of item with matching id
            const index = cartObj.items.findIndex((item) => item.id === itemId);
            if (index !== -1) {
              cartObj.items.splice(index, 1);
              // Save updated cart back to localStorage
              localStorage.setItem(
                "pending_fabric_data",
                JSON.stringify(cartObj),
              );
              setIsDeleteModalOpen(false);
              setItemToDelete(null);
              setAppliedCoupon(null);
              setCoupon("");
              // Optionally, force a re-render by triggering a state update
              // refetchCart && refetchCart();
              // toastSuccess && toastSuccess("Item removed from cart.");
              console.log("🗑️ Item removed from localStorage cart:", itemId);
            } else {
              toastError("Item not found in cart.");
              console.error("Item not found in localStorage cart:", itemId);
            }
          } else {
            toastError("Cart data is invalid.");
            console.error("Cart items is not an array in localStorage.");
          }
        } catch (e) {
          toastError("Failed to update cart in localStorage.");
          console.error("Failed to parse or update pending_fabric_data:", e);
        }
      } else {
        toastError("No cart data found.");
        console.error("No pending_fabric_data found in localStorage.");
      }
    }
  };

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;

    // Validate user email
    if (!carybinUser?.email) {
      toastError("User data not loaded. Please wait or refresh the page.");
      return;
    }

    const couponPayload = {
      email: carybinUser.email,
      code: coupon.trim(),
      amount: totals.subtotal.toString(),
    };

    console.log("🛒 Applying coupon:", couponPayload);
    applyCouponMutate(couponPayload, {
      onSuccess: (data) => {
        console.log("✅ Coupon applied successfully:", data?.data?.data);

        // Store the applied coupon details
        const couponData = data?.data?.data;
        if (couponData) {
          setAppliedCoupon({
            id: couponData.id || coupon.trim(), // Use API ID or fallback to code
            code: coupon.trim(),
            discount: parseFloat(couponData.discount || 0),
            discountedAmount: parseFloat(couponData.discountedAmount || 0),
            message: data?.data?.message || "Coupon applied successfully",
          });
        }

        refetchCart();
      },
      onError: (error) => {
        toastError("Failed to apply coupon");
        console.error("Coupon error:", error);
      },
    });
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    console.log("🛒 Removing coupon - clearing state and restoring total");
    setAppliedCoupon(null);
    setCoupon("");
    toastSuccess("Coupon removed successfully");
  };

  // Payment with Paystack
  const payWithPaystack = ({ amount, payment_id }) => {
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_API_KEY,
      email: carybinUser?.email,
      id: payment_id,
      amount: amount * 100,
      currency: "NGN",
      reference: payment_id,
      ref: payment_id,
      metadata: {
        custom_fields: [
          {
            display_name: carybinUser?.email,
            variable_name: carybinUser?.email,
            value: payment_id,
          },
        ],
      },
      callback: function (response) {
        console.log("💳 Payment callback:", response);
        verifyPaymentMutate(
          {
            id: response?.reference,
          },
          {
            onSuccess: () => {
              refetchCart();
              navigate(`/${currentUrl}/orders`);
              toastSuccess("Payment successful!");
            },
            onError: (error) => {
              toastError("Payment verification failed");
              console.error("Payment verification error:", error);
            },
          },
        );
      },
      onClose: function () {
        alert("Payment window closed.");
      },
    });

    handler.openIframe();
  };

  // Get profile address or use defaults
  const getProfileAddress = () => {
    const baseAddress = {
      address: carybinUser?.address || "2 Metalbox Rd, Ogba, Lagos 101233",
      city: carybinUser?.city || "Lagos",
      state: carybinUser?.state || "Lagos",
      postal_code: carybinUser?.postal_code || "101233",
      country: carybinUser?.country || "NG",
    };

    console.log("🏠 Profile address extraction:", {
      raw_user_data: carybinUser,
      extracted_address: baseAddress,
      address_source: carybinUser?.address ? "profile" : "default",
    });

    return baseAddress;
  };

  // Handle proceeding to payment - Updated with duplicate detection
  const handleProceedToPayment = async () => {
    // Add duplicate check at the beginning
    if (duplicateError) {
      toastError(duplicateError);
      console.log("❌ Blocking payment due to duplicates:", duplicateError);
      return;
    }

    // Double-check for duplicates before payment
    const duplicateCheck = checkForDuplicateItems(items);
    if (duplicateCheck.hasDuplicates) {
      const errorMsg =
        "Duplicate items detected in cart. Please remove duplicates before proceeding.";
      toastError(errorMsg);
      setDuplicateError(errorMsg);
      return;
    }

    if (!navigator.onLine) {
      toastError("No internet connection. Please check your network.");
      return;
    }

    try {
      // Refetch cart to ensure we have latest data
      console.log("🔄 Refetching cart before payment...");
      const freshCartData = await refetchCart();

      // Wait a moment for state to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("🔄 Fresh cart data:", freshCartData?.data);

      const addressInfo = getProfileAddress();
      // Prepare billing data with totals
      const billingData = {
        ...addressInfo,
        subtotal: totals.subtotal,
        discount_amount: discountAmount,
        delivery_fee: delivery_fee,
        vat_amount: estimatedVat,
        total_amount: finalTotal,
        coupon_code: appliedCoupon?.code || undefined,
      };

      console.log("🧾 Creating billing with enhanced data:", billingData);

      createBillingMutate(billingData, {
        onSuccess: (billingResponse) => {
          console.log("✅ Billing created successfully:", billingResponse);

          // Ensure we have fresh cart data
          console.log("🔄 Current cart items before payment:", items);
          console.log("🔄 Items length:", items.length);
          console.log(
            "🔍 Items with styles:",
            items.filter((item) => item.style_product?.id),
          );
          console.log(
            "🔍 Style items count:",
            items.filter((item) => item.style_product?.id).length,
          );

          // Debug: Check for potential duplicate styles
          const styleIds = items
            .filter((item) => item.style_product?.id)
            .map((item) => item.style_product.id);
          const uniqueStyleIds = new Set(styleIds);
          console.log("🎨 Style ID analysis:", {
            allStyleIds: styleIds,
            uniqueStyleIds: Array.from(uniqueStyleIds),
            potentialDuplicates: styleIds.length !== uniqueStyleIds.size,
            duplicateStyleIds: styleIds.filter(
              (id, index) => styleIds.indexOf(id) !== index,
            ),
          });

          // Prepare purchases from cart items - include both fabric and style purchases
          const purchases = [];
          const metadata = [];
          const addedStyles = new Set(); // Track added styles to prevent duplicates

          items.forEach((item) => {
            // Add fabric purchase
            purchases.push({
              purchase_id: item.product_id,
              quantity: item.quantity,
              purchase_type:
                item.product_type || item.product?.type || "FABRIC",
            });

            // Add style purchase if item has a style (avoid duplicates)
            if (
              item.style_product?.id &&
              !addedStyles.has(item.style_product.id)
            ) {
              purchases.push({
                purchase_id: item.style_product.id,
                quantity: item?.measurement?.length, // Style is always quantity 1 (flat fee)
                purchase_type: "STYLE",
              });

              // Mark this style as added to prevent duplicates
              addedStyles.add(item.style_product.id);
            }

            // Add metadata for ALL style items (even if style purchase already added)
            if (item.style_product?.id) {
              metadata.push({
                style_product_id: item.style_product.id,
                style_product_name: item.style_product.name,
                measurement: item.measurement || [],
                customer_name: carybinUser?.name || "",
                customer_email: carybinUser?.email || "",
                cart_item_id: item.id,
                fabric_product_id: item.product_id,
                fabric_product_name: item.product?.name || "",
                color: item.color || "",
                quantity: item.quantity,
                // Add delivery fee to each metadata item
                delivery_fee: delivery_fee,
              });
            }
          });

          // Add general order metadata with delivery fee (if no style items exist)
          if (metadata.length === 0) {
            // If there are no style items, add general order metadata
            metadata.push({
              order_type: "fabric_only",
              customer_name: carybinUser?.name || "",
              customer_email: carybinUser?.email || "",
              total_items: items.length,
              subtotal: totals.subtotal,
              delivery_fee: delivery_fee,
              vat_amount: estimatedVat,
              final_total: finalTotal,
              coupon_code: appliedCoupon?.code || null,
              delivery_address: addressInfo.address,
              delivery_city: addressInfo.city,
              delivery_state: addressInfo.state,
              delivery_country: addressInfo.country,
              postal_code: addressInfo.postal_code,
            });
          } else {
            // If there are style items, add delivery fee to general order info
            metadata.push({
              order_summary: {
                delivery_fee: delivery_fee,
                subtotal: totals.subtotal,
                vat_amount: estimatedVat,
                final_total: finalTotal,
                coupon_code: appliedCoupon?.code || null,
                total_style_items: items.filter(
                  (item) => item.style_product?.id,
                ).length,
                total_fabric_items: items.length,
                delivery_address: addressInfo.address,
                delivery_city: addressInfo.city,
                delivery_state: addressInfo.state,
                delivery_country: addressInfo.country,
                postal_code: addressInfo.postal_code,
              },
            });
          }

          console.log("🔍 Style deduplication results:", {
            totalItems: items.length,
            itemsWithStyles: items.filter((item) => item.style_product?.id)
              .length,
            uniqueStylesAdded: addedStyles.size,
            duplicatesAvoided:
              items.filter((item) => item.style_product?.id).length -
              addedStyles.size,
          });

          // Validation: Ensure we don't send empty metadata
          const hasStyleItems = items.some((item) => item.style_product?.id);
          console.log("🎨 Style validation:", {
            hasStyleItems,
            metadataLength: metadata.length,
            itemsCount: items.length,
            styleItemsCount: items.filter((item) => item.style_product?.id)
              .length,
            shouldIncludeMetadata: metadata.length > 0,
          });

          // Always include metadata now (either style items or general order info)
          const shouldIncludeMetadata = metadata.length > 0;

          // Final validation: Check for duplicate purchase IDs
          const purchaseIds = purchases.map((p) => p.purchase_id);
          const uniquePurchaseIds = new Set(purchaseIds);

          if (purchaseIds.length !== uniquePurchaseIds.size) {
            console.error("❌ Duplicate purchase IDs detected:", {
              allIds: purchaseIds,
              duplicates: purchaseIds.filter(
                (id, index) => purchaseIds.indexOf(id) !== index,
              ),
            });
            toastError(
              "Error: Duplicate items detected in cart. Please refresh and try again.",
            );
            return;
          }

          const paymentData = {
            purchases,
            amount: Math.round(finalTotal),
            currency: "NGN",
            coupon_code: appliedCoupon?.code || undefined,
            email: carybinUser?.email,
            subtotal: totals.subtotal,
            delivery_fee: delivery_fee, // Keep in main payment data
            vat_amount: estimatedVat,
            country: addressInfo.country,
            postal_code: addressInfo.postal_code,
            ...(shouldIncludeMetadata && { metadata }), // Now includes delivery fee in metadata
          };

          console.log("💳 Creating payment with enhanced data:", paymentData);
          console.log("🛍️ Payment purchases breakdown:", {
            totalPurchases: purchases.length,
            fabricPurchases: purchases.filter(
              (p) => p.purchase_type === "FABRIC",
            ).length,
            stylePurchases: purchases.filter((p) => p.purchase_type === "STYLE")
              .length,
            purchases: purchases,
            duplicateCheck: {
              allPurchaseIds: purchases.map((p) => p.purchase_id),
              duplicatePurchaseIds: purchases
                .map((p) => p.purchase_id)
                .filter((id, index, arr) => arr.indexOf(id) !== index),
              hasDuplicates:
                new Set(purchases.map((p) => p.purchase_id)).size !==
                purchases.length,
            },
          });
          console.log("📏 Payment metadata breakdown:", {
            metadataCount: metadata.length,
            deliveryFeeIncluded: metadata.some(
              (item) =>
                item.delivery_fee !== undefined ||
                (item.order_summary &&
                  item.order_summary.delivery_fee !== undefined),
            ),
            styleItemsWithMeasurements: metadata
              .filter((m) => m.style_product_id) // Only style items
              .map((m) => ({
                style_product_id: m.style_product_id,
                style_product_name: m.style_product_name,
                measurementCount: Array.isArray(m.measurement)
                  ? m.measurement.length
                  : m.measurement
                    ? 1
                    : 0,
                delivery_fee: m.delivery_fee, // Show delivery fee is included
              })),
            orderSummaryMetadata: metadata.find((m) => m.order_summary),
          });

          createPaymentMutate(paymentData, {
            onSuccess: (paymentResponse) => {
              console.log("✅ Payment created successfully:", paymentResponse);
              setShowConfirmationModal(false);
              setCoupon("");

              console.log("🚀 Launching Paystack with:", {
                amount: finalTotal,
                payment_id: paymentResponse?.data?.data?.payment_id,
              });

              payWithPaystack({
                amount: finalTotal,
                payment_id: paymentResponse?.data?.data?.payment_id,
              });
            },
            onError: (error) => {
              console.error("❌ Payment creation failed:", error);
              toastError(
                "Failed to create payment - " +
                  (error?.data?.message || "Unknown error"),
              );
            },
          });
        },
        onError: (error) => {
          console.error("❌ Billing creation failed:", error);
          toastError(
            "Failed to create billing - " +
              (error?.data?.message || "Unknown error"),
          );
        },
      });
    } catch (error) {
      console.error("❌ Error refetching cart before payment:", error);
      toastError("Failed to refresh cart data. Please try again.");
    }
  };

  // Format currency
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    return `₦${numPrice.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if ((cartLoading || userProfileLoading) && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        title="Shopping Cart"
        subtitle="Cart"
        backgroundImage="https://res.cloudinary.com/greenmouse-tech/image/upload/v1744104104/AoStyle/image_1_xxie9w.jpg"
      />

      {!items || items.length === 0 ? (
        <div className="px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gray-50 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Looks like you haven't added any items to your cart yet. Discover
              our amazing collection of fabrics and styles!
            </p>
            <div className="space-y-4">
              <Link
                to="/marketplace"
                className="block bg-gradient text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Explore Products
              </Link>
              <Link
                to="/pickastyle"
                className="block border-2 border-purple-300 text-purple-700 px-8 py-4 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 font-medium"
              >
                Browse Styles
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="Resizer section px-2 sm:px-4 py-4 sm:py-8">
          {" "}
          <div className="mb-4">
            <CustomBackbtn />
          </div>
          <div className="max-w-7xl mx-auto">
            {/* Cart Header with User Info */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Shopping Cart
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} •{" "}
                {totals.totalQuantity} total pieces
              </p>
            </div>
            <div className="mb-4 sm:mb-6">
              {/* User Information Header */}
              {cartUser && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-900">
                      Cart Owner
                    </h3>
                    {cartUser.status && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-xs uppercase tracking-wide">
                        Name
                      </span>
                      <span className="font-semibold text-gray-900">
                        {cartUser.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-xs uppercase tracking-wide">
                        Email
                      </span>
                      <span className="font-semibold text-gray-900">
                        {cartUser.email}
                      </span>
                    </div>
                    {cartUser.phone && (
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-xs uppercase tracking-wide">
                          Phone
                        </span>
                        <span className="font-semibold text-gray-900">
                          {cartUser.phone}
                        </span>
                      </div>
                    )}
                    {cartUser.is_email_verified && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Status:</span>
                        <span className="text-purple-600">✓ Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items - Left Side */}
              <div className="lg:col-span-2 space-y-4">
                {/* Table Headers - Desktop Only */}
                <div className="hidden md:block bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-6 pl-2">PRODUCTS</div>
                    <div className="col-span-2 text-center">QUANTITY</div>
                    <div className="col-span-2 text-center">PRICE</div>
                    <div className="col-span-2 text-center">TOTAL AMOUNT</div>
                  </div>
                </div>

                {/* Cart Items */}
                {items.map((item) => (
                  <CartItemWithBreakdown
                    key={item.id}
                    item={item}
                    onDelete={(itemId) => {
                      setItemToDelete(itemId);
                      setIsDeleteModalOpen(true);
                    }}
                    deleteIsPending={deleteIsPending}
                    getMeasurementCount={getMeasurementCount}
                  />
                ))}
              </div>

              {/* Order Summary - Right Side */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg sticky top-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-6 h-6 text-purple-600" />
                      Order Summary
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Review your order details
                    </p>
                  </div>
                  <div className="p-6">
                    {/* Coupon Section */}
                    {token ? (
                      <div className="mb-6">
                        {!appliedCoupon ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Have a coupon code?
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon code"
                                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <button
                                onClick={handleApplyCoupon}
                                disabled={!coupon.trim() || applyCouponPending}
                                className="absolute right-1 top-1 bottom-1 px-3 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {applyCouponPending ? "..." : "Apply"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 8 8"
                                    >
                                      <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-green-800">
                                      Coupon "{appliedCoupon.code}" applied
                                    </div>
                                    <div className="text-sm text-green-600">
                                      You saved ₦
                                      {formatNumberWithCommas(
                                        appliedCoupon.discount,
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={handleRemoveCoupon}
                                  className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                          <svg
                            className="w-6 h-6 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                            />
                          </svg>
                          <div>
                            <div className="font-semibold text-yellow-800 text-base">
                              Login Required to Use Coupons
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-center">
                          <Link
                            to={`/login`}
                            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                          >
                            Login to Use Coupon
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Summary Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal ({totals.itemCount} items)</span>
                        <span className="text-green-600 font-semibold">
                          {formatPrice(totals.subtotal)}
                        </span>
                      </div>
                      {token && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery Fee</span>
                          <span className="text-green-600 font-semibold">
                            {deliveryLoading ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : deliveryError ? (
                              <span className="text-red-500">
                                UPDATE ADDRESS
                              </span>
                            ) : (
                              formatPrice(delivery_fee)
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT (7.5%)</span>
                        <span className="text-green-600 font-semibold">
                          {formatPrice(estimatedVat)}
                        </span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-green-600 font-semibold">
                            -{formatPrice(discountAmount)}
                          </span>
                        </div>
                      )}
                      <hr className="border-gray-200 my-4" />
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-green-600">
                          {formatPrice(finalTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Policy Checkbox */}
                    <div className="flex items-start gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="main-agree-policy"
                        checked={agreedToPolicy}
                        onChange={(e) => setAgreedToPolicy(e.target.checked)}
                        className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="main-agree-policy"
                        className="text-sm text-gray-700 leading-relaxed"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={handleAgreementClick}
                          className="text-purple-600 hover:text-purple-800 underline font-medium"
                        >
                          Carybin Checkout Policy
                        </button>
                      </label>
                    </div>

                    {/* Checkout Button */}
                    {token ? (
                      deliveryError ? (
                        <button
                          onClick={() => {
                            // Redirect to address update page
                            window.open(`/${currentUrl}/settings`, "_blank");
                          }}
                          className="w-full cursor-pointer py-4 px-2 bg-purple-500 text-white hover:bg-purple-600 transition rounded-xl font-bold text-md shadow-lg flex items-center justify-center gap-2"
                        >
                          {/* Info/Warning/Alert Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-yellow-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                            />
                          </svg>
                          Update Address to Proceed
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowConfirmationModal(true);
                          }}
                          disabled={
                            !agreedToPolicy ||
                            createPaymentPending ||
                            billingPending
                          }
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                        >
                          {createPaymentPending || billingPending
                            ? "Processing..."
                            : "Proceed to Checkout"}
                        </button>
                      )
                    ) : (
                      <Link
                        to="/login"
                        className="w-full block bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                      >
                        Login to Checkout
                      </Link>
                    )}

                    {/* Continue Shopping */}
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center w-full mt-4 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveItem(itemToDelete)}
                disabled={deleteIsPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteIsPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 pt-20">
          <div className="bg-white rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto max-w-4xl relative">
            <button
              onClick={() => {
                setShowConfirmationModal(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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

            <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
              Review Your Order
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Order Details */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {carybinUser?.name || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {carybinUser?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {carybinUser?.phone ||
                        carybinUser?.alternative_phone ||
                        "Not provided"}
                    </p>
                    {/* <p>
                      <span className="font-medium">Email Verified:</span>{" "}
                      <span
                        className={
                          carybinUser?.is_email_verified
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {carybinUser?.is_email_verified ? "✅ Yes" : "❌ No"}
                      </span>
                    </p>*/}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    Delivery Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    {carybinUser?.profile?.address ? (
                      <p>
                        <span className="font-medium">Full Address:</span>{" "}
                        {carybinUser.profile.address}
                      </p>
                    ) : (
                      <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 flex flex-col gap-2">
                        <span className="font-medium">Full Address:</span>{" "}
                        <span>
                          <strong>
                            Address required to complete checkout.
                          </strong>
                        </span>
                        <a
                          href={`/${currentUrl}/settings`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline font-medium hover:text-blue-900"
                        >
                          Update your address
                        </a>
                      </div>
                    )}
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {carybinUser?.country || "NG"}
                    </p>
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p>
                        <strong>Profile ID:</strong> {carybinUser?.id}
                      </p>
                      <p>
                        <strong>Member Since:</strong>{" "}
                        {new Date(carybinUser?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {carybinUser?.profile?.address && (
                    <div className="mt-3 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                      <p>
                        💡 Address from your profile -{" "}
                        <button
                          onClick={() => {
                            console.log(
                              "📝 User wants to update profile address",
                            );
                            window.open(`${currentUrl}/settings`);
                          }}
                          className="underline hover:text-blue-800"
                        >
                          Update if needed
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-purple-600" />
                    Order Items ({items.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start border-b border-gray-200 pb-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {/* Show fabric name */}
                            {item.product?.name || item.name}
                            {/* Show style name if it exists */}
                            {item.style_product?.name && (
                              <>
                                {" "}
                                <span className="text-purple-700 font-semibold">
                                  + Style: {item.style_product.name}
                                </span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            {/* Show fabric price and quantity */}
                            Fabric: {item.quantity} × ₦
                            {formatNumberWithCommas(
                              item.price_at_time ||
                                item.product?.price ||
                                item.price ||
                                0,
                            )}
                            {/* Show style price if style exists */}
                            {item.style_product?.price && (
                              <span>
                                {" "}
                                + Style: ₦
                                {formatNumberWithCommas(
                                  item.style_product.price *
                                    item.measurement.length,
                                )}
                              </span>
                            )}
                          </p>
                          {/* Show product type if exists */}
                          {(item.product_type || item.product?.type) && (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1">
                              {item.product_type || item.product?.type}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₦
                            {formatNumberWithCommas(
                              parseFloat(
                                item.price_at_time ||
                                  item.product?.price ||
                                  item.price ||
                                  0,
                              ) *
                                parseInt(item.quantity || 1) +
                                parseFloat(item.style_product?.price || 0),
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(totals.subtotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span>-{formatPrice(appliedCoupon.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryLoading ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : deliveryError ? (
                          <span className="text-red-500">Error</span>
                        ) : (
                          formatPrice(delivery_fee)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>VAT (7.5%)</span>
                      <span>{formatPrice(estimatedVat)}</span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      <p>* Total includes: Subtotal + VAT + Delivery Fee</p>
                      <p>* Service charges excluded from final amount</p>
                    </div>

                    <div className="border-t border-purple-200 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-purple-600">
                          {formatPrice(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                {!carybinUser?.profile?.address ? (
                  <button
                    onClick={() => {
                      // Redirect to address update page
                      window.open(`/${currentUrl}/settings`, "_blank");
                    }}
                    className="w-full cursor-pointer py-4 bg-yellow-500 text-white hover:bg-yellow-600 transition rounded-lg font-bold text-lg shadow-lg"
                  >
                    Update Address to Complete Checkout
                  </button>
                ) : (
                  <button
                    disabled={billingPending || createPaymentPending}
                    onClick={handleProceedToPayment}
                    className="w-full cursor-pointer py-4 bg-gradient text-white hover:from-purple-600 hover:to-pink-600 transition rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {billingPending || createPaymentPending
                      ? "Processing..."
                      : `Proceed to Payment - ${formatPrice(finalTotal)}`}
                  </button>
                )}

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>By proceeding, you agree to our terms and conditions</p>
                  <p>Your payment is secured by Paystack</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <CheckoutPolicyModal
          isOpen={showPolicyModal}
          onClose={() => setShowPolicyModal(false)}
        />
      )}
    </>
  );
};

// Policy Modal Component
function CheckoutPolicyModal({ isOpen, onClose, agreementType = "checkout" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isFabricVendor = agreementType === "fabric";
  const isTailor = agreementType === "tailor";
  const isCheckout = agreementType === "checkout";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up">
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

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-purple-500">
            {isCheckout
              ? "Checkout Agreement"
              : isTailor
                ? "Service Level Agreement (SLA) - Tailors"
                : "Service Level Agreement (SLA) - Fabric Vendors"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            {isCheckout ? (
              // Checkout Agreement Content
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Checkout Agreement
                  </h1>
                  <p className="text-lg text-gray-600">
                    For E-Commerce Platform
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Effective Date:</strong> [From sign up or date of
                    checkout]
                  </p>
                </div>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Parties:
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>
                      <strong>E-Commerce Platform Host:</strong> [Carybin
                      Limited]
                    </li>
                    <li>
                      <strong>Customers:</strong> End-users of the platform
                    </li>
                    <li>
                      <strong>Vendors:</strong> Tailors, Fabric Vendors,
                      Logistics Vendors
                    </li>
                  </ol>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    1. Purpose
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    This agreement defines the terms and conditions governing
                    the checkout process on the e-commerce platform, including
                    payment, order confirmation, refunds, and dispute
                    resolution.
                  </p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    2. Order Process
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Orders are confirmed upon successful payment processing
                    </li>
                    <li>
                      You will receive an order confirmation email within 24
                      hours
                    </li>
                    <li>
                      Order details cannot be modified after payment
                      confirmation
                    </li>
                    <li>
                      We reserve the right to cancel orders for any reason
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    3. Payment Terms
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      All payments are processed securely through Paystack
                    </li>
                    <li>
                      We accept major credit/debit cards and bank transfers
                    </li>
                    <li>
                      Payment must be completed before order processing begins
                    </li>
                    <li>VAT and delivery fees are calculated at checkout</li>
                    <li>All prices are in Nigerian Naira (NGN)</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    4. Delivery & Shipping
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Delivery timeframes vary by product type and location
                    </li>
                    <li>Custom tailoring orders may take 7-14 business days</li>
                    <li>
                      Fabric orders typically ship within 2-5 business days
                    </li>
                    <li>
                      Delivery fees are calculated based on location and weight
                    </li>
                    <li>
                      Customers are responsible for providing accurate delivery
                      addresses
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    5. Returns & Refunds
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Custom-made items are generally non-refundable</li>
                    <li>
                      Fabric products may be returned within 7 days if unused
                    </li>
                    <li>Refunds are processed within 7-14 business days</li>
                    <li>
                      Return shipping costs are borne by the customer unless
                      item is defective
                    </li>
                    <li>
                      Damaged or incorrect items will be replaced or refunded at
                      no cost
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    6. Quality Assurance
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>All vendors are vetted for quality and reliability</li>
                    <li>
                      We maintain quality standards for all products and
                      services
                    </li>
                    <li>
                      Customer feedback is regularly monitored and addressed
                    </li>
                    <li>
                      Dispute resolution process is available for quality issues
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    7. Customer Responsibilities
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>Provide accurate measurements for custom tailoring</li>
                    <li>Respond promptly to vendor communications</li>
                    <li>
                      Inspect deliveries upon receipt and report issues
                      immediately
                    </li>
                    <li>
                      Maintain account security and update contact information
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    8. Dispute Resolution
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>First contact vendor directly for issue resolution</li>
                    <li>
                      Escalate to Carybin support if vendor resolution fails
                    </li>
                    <li>
                      We provide mediation services for vendor-customer disputes
                    </li>
                    <li>
                      Final decisions on disputes are at Carybin's discretion
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    9. Privacy & Data Protection
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Personal information is protected per our Privacy Policy
                    </li>
                    <li>
                      Payment data is securely processed and not stored on our
                      servers
                    </li>
                    <li>
                      Order information may be shared with vendors for
                      fulfillment
                    </li>
                    <li>
                      Marketing communications can be opted out at any time
                    </li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    10. Platform Liability
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>
                      Carybin acts as an intermediary between customers and
                      vendors
                    </li>
                    <li>
                      We are not liable for vendor performance or product
                      defects
                    </li>
                    <li>Our liability is limited to the transaction value</li>
                    <li>Force majeure events are excluded from liability</li>
                  </ul>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    11. Modifications
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Carybin reserves the right to modify these terms at any
                    time. Customers will be notified of significant changes via
                    email or platform notifications. Continued use of the
                    platform constitutes acceptance of modified terms.
                  </p>
                </section>

                <section className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    12. Contact Information
                  </h3>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="mb-2">
                      <strong>Carybin Limited</strong>
                    </p>
                    <p className="mb-2">Email: support@carybin.com</p>
                    <p className="mb-2">Phone: +234 (0) 123 456 7890</p>
                    <p className="mb-2">Website: www.carybin.com</p>
                  </div>
                </section>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">
                    By proceeding with checkout, you acknowledge that you have
                    read, understood, and agree to be bound by these terms and
                    conditions.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">Press ESC to close</div>
          <button
            onClick={onClose}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
