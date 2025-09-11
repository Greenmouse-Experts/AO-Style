import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../services/CarybinBaseUrl";

const useGetAdmins = () => {
  const { data, isPending, isError, error, isSuccess } = useQuery({
    queryKey: ["get-admins"],
    queryFn: async () => {
      const response = await CaryBinApi.get(
        "/auth/admins/owner-super-administrator",
      );
      // console.log(response.data);
      return response.data;
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a 401 error (unauthorized)
      if (error?.response?.status === 401) {
        // console.log("❌ Admin fetch: 401 error, not retrying");
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Log the complete query state and data
  // console.log("📊 GET ADMINS - QUERY STATE:", {
  //   isPending,
  //   isError,
  //   isSuccess,
  //   error,
  //   data,
  // });
  // console.log("📊 GET ADMINS - FULL DATA OBJECT:", data);
  // console.log(
  //   "📊 GET ADMINS - DATA STRINGIFIED:",
  //   JSON.stringify(data, null, 2),
  // );

  return {
    data: data?.data || [],
    isPending,
    isError,
    error,
    isSuccess,
    totalAdmins: data?.count || 0,
    rawResponse: data, // Include raw response for debugging
  };
};

export default useGetAdmins;
