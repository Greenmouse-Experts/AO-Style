import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetAdminFabricProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-adminfabric-product", params],
      queryFn: () => FabricService.getAdminFabricProduct(params),
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetAdminFabricProduct;
