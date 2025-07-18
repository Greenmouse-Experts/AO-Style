import { useQuery } from "@tanstack/react-query";
import FAQService from "../../services/api/faq";

const useGetPublicFAQs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["public-faqs", page, limit],
    queryFn: async () => {
      console.log(`🔍 Fetching public FAQs from API... Page: ${page}, Limit: ${limit}`);
      const response = await FAQService.getPublicFAQs(page, limit);
      console.log("✅ Public FAQs API response:", response);
      return response.data; // Return the data object which should contain { data: [...], count: number }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

export default useGetPublicFAQs;
