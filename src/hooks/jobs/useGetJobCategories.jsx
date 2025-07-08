import { useQuery } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";

const useGetJobCategories = () => {
  return useQuery({
    queryKey: ["get-job-categories"],
    queryFn: async () => {
      console.log("🏷️ Fetching job categories...");
      const { data } = await JobService.getJobCategories();
      console.log("✅ Job categories fetched successfully:", data);
      return data;
    },
    onError: (error) => {
      console.error("❌ Failed to fetch job categories:", error);
    },
  });
};

export default useGetJobCategories;
