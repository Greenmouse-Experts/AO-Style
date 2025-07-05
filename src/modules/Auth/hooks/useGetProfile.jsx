import { useQuery } from "@tanstack/react-query";
import AuthService from "../../../services/api/auth";

const useGetUserProfile = () => {
  const { isPending, data, isSuccess, isError, error } = useQuery({
    queryKey: ["get-user-profile"],
    queryFn: () => AuthService.GetUser(),
  });

  return { data: data?.data?.data, isPending, isSuccess, isError, error };
};

export default useGetUserProfile;
