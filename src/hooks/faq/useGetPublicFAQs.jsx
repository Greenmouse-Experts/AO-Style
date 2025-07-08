import { useQuery } from "@tanstack/react-query";
import FAQService from "../../services/api/faq";

const useGetPublicFAQs = () => {
  return useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      console.log("🔍 Fetching public FAQs from API...");
      const { data } = await FAQService.getPublicFAQs();
      console.log("✅ Public FAQs fetched successfully:", data);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export default useGetPublicFAQs;
