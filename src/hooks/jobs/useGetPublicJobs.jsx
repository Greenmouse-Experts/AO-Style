import { useQuery } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";

const useGetPublicJobs = () => {
  return useQuery({
    queryKey: ["get-public-jobs"],
    queryFn: async () => {
      console.log("📋 Fetching public jobs...");
      try {
        const { data } = await JobService.getPublicJobs();
        console.log("✅ Public jobs fetched successfully:", data);
        return data;
      } catch (error) {
        console.log("⚠️ Public jobs endpoint failed, trying regular jobs endpoint...");
        // Fallback to regular jobs endpoint if public endpoint doesn't exist
        const { data } = await JobService.getJobs();
        console.log("✅ Jobs fetched successfully from fallback:", data);
        return data;
      }
    },
    onError: (error) => {
      console.error("❌ Failed to fetch public jobs:", error);
    },
  });
};

export default useGetPublicJobs;
