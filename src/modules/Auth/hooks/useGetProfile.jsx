import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import AuthService from "../../../services/api/auth";

const useGetUserProfile = () => {
  // Check if we're on an admin route to determine which token to use
  const isAdminRoute = window.location.pathname.includes("/admin");
  const tokenKey = isAdminRoute ? "adminToken" : "token";
  const token = Cookies.get(tokenKey);

  const { isPending, data, isSuccess, isError, error } = useQuery({
    queryKey: ["get-user-profile"],
    queryFn: () => {
      console.log(
        "🔍 Profile fetch: Token available:",
        !!token,
        "Route type:",
        isAdminRoute ? "admin" : "user",
      );
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
