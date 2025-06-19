import { useQuery } from "@tanstack/react-query";
import SettingsService from "../../services/api/settings";

function useFetchBank() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["fetch-bank"],
      queryFn: () => SettingsService.getFetchBank(),
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useFetchBank;
