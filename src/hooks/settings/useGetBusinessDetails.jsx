import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useGetBusinessDetails() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-business-details"],
      queryFn: () => SettingsService.getBusinessDetails(),
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

export default useGetBusinessDetails;
