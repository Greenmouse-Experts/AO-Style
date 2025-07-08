import { useQuery } from "@tanstack/react-query";
import JobService from "../../services/api/jobs";

const useGetJobs = () => {
  return useQuery({
    queryKey: ["get-jobs"],
    queryFn: async () => {
      console.log("📋 Fetching jobs...");
      const { data } = await JobService.getJobs();
      console.log("✅ Jobs fetched successfully:", data);
      return data;
    },
    onError: (error) => {
      console.error("❌ Failed to fetch jobs:", error);
    },
  });
};
export default useGetJobs;