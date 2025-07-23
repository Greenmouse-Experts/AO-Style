import { useQuery } from "@tanstack/react-query";
import UserService from "../../services/api/users";
import ProductService from "../../services/api/products";
import MarketService from "../../services/api/market";
import FabricService from "../../services/api/fabric";

function useGetAdminManageFabricProduct(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-manage-fabric-product", params],
      queryFn: () => FabricService.getManageFabricProduct(params),
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

export default useGetAdminManageFabricProduct;
