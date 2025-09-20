import { useMutation } from "@tanstack/react-query";
import MarketRepService from "../../services/api/marketrep";
import useToast from "../useToast";

// Hook for updating market rep fabric
export const useUpdateFabric = () => {
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, payload, vendorId }) =>
      MarketRepService.updateMarketRepFabric(id, payload, vendorId),
    onSuccess: () => {
      toastSuccess("Fabric updated successfully!");
    },
    onError: (error) => {
      console.error("Update fabric error:", error);
      toastError("Failed to update fabric");
    },
  });
};

// Hook for deleting market rep fabric
export const useDeleteFabric = () => {
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: (id) => MarketRepService.deleteMarketRepFabric(id),
    onSuccess: () => {
      toastSuccess("Fabric deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete fabric error:", error);
      toastError("Failed to delete fabric");
    },
  });
};

// Hook for updating market rep style
export const useUpdateStyle = () => {
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: ({ id, payload, vendorId }) =>
      MarketRepService.updateMarketRepStyle(id, payload, vendorId),
    onSuccess: () => {
      toastSuccess("Style updated successfully!");
    },
    onError: (error) => {
      console.error("Update style error:", error);
      toastError("Failed to update style");
    },
  });
};

// Hook for deleting market rep style
export const useDeleteStyle = () => {
  const { toastSuccess, toastError } = useToast();

  return useMutation({
    mutationFn: (id) => MarketRepService.deleteMarketRepStyle(id),
    onSuccess: () => {
      toastSuccess("Style deleted successfully!");
    },
    onError: (error) => {
      console.error("Delete style error:", error);
      toastError("Failed to delete style");
    },
  });
};

// Combined hook for product actions
export const useProductActions = () => {
  const updateFabricMutation = useUpdateFabric();
  const deleteFabricMutation = useDeleteFabric();
  const updateStyleMutation = useUpdateStyle();
  const deleteStyleMutation = useDeleteStyle();

  const updateProduct = async (product, payload, selectedVendor) => {
    console.log("🔧 UPDATE PRODUCT DEBUG:");
    console.log("  - product:", product);
    console.log("  - payload:", payload);
    console.log("  - selectedVendor:", selectedVendor);
    console.log("  - product.id:", product?.id);
    console.log("  - selectedVendor.id:", selectedVendor?.id);
    console.log("  - has fabric:", !!product?.fabric);
    console.log("  - has style:", !!product?.style);

    const vendorId = selectedVendor?.id;
    if (!vendorId) {
      console.error("🔧 ERROR: No vendor ID found");
      throw new Error("Vendor ID is required");
    }

    if (product.fabric) {
      console.log("🔧 Updating fabric product with params:", {
        id: product.id,
        payload,
        vendorId,
      });
      return updateFabricMutation.mutateAsync({
        id: product.id,
        payload,
        vendorId,
      });
    } else if (product.style) {
      console.log("🔧 Updating style product with params:", {
        id: product.id,
        payload,
        vendorId,
      });
      return updateStyleMutation.mutateAsync({
        id: product.id,
        payload,
        vendorId,
      });
    } else {
      console.error(
        "🔧 ERROR: Unknown product type - no fabric or style property",
      );
      throw new Error("Unknown product type");
    }
  };

  const deleteProduct = async (product) => {
    if (product.fabric) {
      return deleteFabricMutation.mutateAsync(product.id);
    } else if (product.style) {
      return deleteStyleMutation.mutateAsync(product.id);
    } else {
      throw new Error("Unknown product type");
    }
  };

  return {
    updateProduct,
    deleteProduct,
    isUpdating: updateFabricMutation.isPending || updateStyleMutation.isPending,
    isDeleting: deleteFabricMutation.isPending || deleteStyleMutation.isPending,
  };
};
