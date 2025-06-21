import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useGetKyc() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-kyc-info"],
      queryFn: () => SettingsService.getKycInfo(),
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

export default useGetKyc;
