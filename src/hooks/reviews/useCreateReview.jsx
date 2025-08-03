import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReviewService from "../../services/api/reviews";
import { toast } from "react-toastify";

function useCreateReview() {
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error, data, isSuccess } = useMutation({
    mutationFn: (payload) => {
      console.log(
        "📤 useCreateReview: About to call API with payload:",
        payload,
      );
      console.log(
        "📤 useCreateReview: Product ID in payload:",
        payload.product_id,
      );
      console.log(
        "🎯 useCreateReview: FINAL PRODUCT ID BEING SENT TO API:",
        payload.product_id,
      );
      console.log("📦 useCreateReview: Complete payload structure:", {
        product_id: payload.product_id,
        rating: payload.rating,
        title: payload.title || "Not provided",
        content: payload.content || "Not provided",
        hasAllRequiredFields: !!(payload.product_id && payload.rating),
      });
      return ReviewService.createReview(payload);
    },
    onSuccess: (data, variables) => {
      console.log("✅ useCreateReview: API Success response:", data);
      console.log("✅ useCreateReview: Variables used:", variables);
      toast.success("Review submitted successfully!");

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["product-reviews", variables.product_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-average-rating", variables.product_id],
      });
    },
    onError: (error) => {
      console.error("❌ useCreateReview: API Error:", error);
      console.error("❌ useCreateReview: Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });

      // Handle authentication errors
      if (error?.response?.status === 401) {
        toast.error("Please log in to submit a review");
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // Handle product not found errors
      if (error?.response?.status === 404) {
        const errorData = error?.response?.data;
        if (errorData?.message?.toLowerCase().includes("product")) {
          toast.error(
            "Product not found. Please check the product ID and try again.",
          );
        } else {
          toast.error("Resource not found. Please try again.");
        }
        return;
      }

      // Handle bad request errors (product ID format issues)
      if (error?.response?.status === 400) {
        const errorData = error?.response?.data;
        if (errorData?.message?.toLowerCase().includes("product")) {
          toast.error("Invalid product ID format. Please contact support.");
        } else {
          toast.error(
            "Invalid request. Please check your input and try again.",
          );
        }
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    },
  });

  return {
    createReview: mutate,
    isPending,
    isError,
    error,
    data,
    isSuccess,
  };
}

export default useCreateReview;
