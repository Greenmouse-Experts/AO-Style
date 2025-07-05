import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useGetBusinessInfo() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-business-info"],
      queryFn: () => SettingsService.getBusinessInfo(),
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

export default useGetBusinessInfo;
