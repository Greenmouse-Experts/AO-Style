import { useQuery } from "@tanstack/react-query";
import AdminRoleService from "../../services/api/adminRole";

function useFetchBusinessInfo(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-subadmin", params],
      queryFn: () => AdminRoleService.getAdminRoles(params),
    }
  );

  return {
    isLoading,
    isFetching,
    data: data?.data,
    isError,
    isPending,
    refetch,
  };
}

export default useGetAdmin;
