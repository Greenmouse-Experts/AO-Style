import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import FAQService from "../../services/api/faq";

function useGetFAQs(page = 1, limit = 10) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-faqs", page, limit],
      queryFn: () => FAQService.getFAQs(page, limit),
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    console.log("FAQs data:", data);
  }, [data]);

  return {
    isLoading,
    isFetching,
    data: data?.data?.data,
    totalCount: data?.data?.count,
    isError,
    isPending,
    refetch,
  };
}

export default useGetFAQs;
