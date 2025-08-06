import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";

const useGetUserProfile = () => {
  // Only fetch profile if token is available
  const token = Cookies.get("token");

  const { isPending, data, isSuccess, isError, error } = useQuery({
    queryKey: ["get-user-profile"],
    queryFn: () => {
      console.log("🔍 Profile fetch: Token available:", !!token);
      return AuthService.GetUser();
    },
    enabled: !!token, // Only run query if token exists
    retry: (failureCount, error) => {
      // Don't retry if it's a 401 error (unauthorized)
      if (error?.response?.status === 401) {
        console.log("❌ Profile fetch: 401 error, not retrying");
        return false;
      }
      return failureCount < 3;
    },
  });

  return { data: data?.data?.data, isPending, isSuccess, isError, error };
};

export default useGetUserProfile;
