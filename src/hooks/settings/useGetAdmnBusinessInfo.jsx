import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useGetAdminBusinessDetails() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-adminbusiness-details"],
      queryFn: () => SettingsService.getAdminBusinessInfo(),
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

export default useGetAdminBusinessDetails;
