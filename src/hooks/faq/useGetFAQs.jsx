import { useQuery } from "@tanstack/react-query";
import FAQService from "../../services/api/faq";

function useGetFAQs() {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-faqs"],
      queryFn: () => FAQService.getFAQs(),
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data?.data, // Fix: The FAQs are at data.data.data
    isError,
    isPending,
    refetch,
  };
}

export default useGetFAQs;
