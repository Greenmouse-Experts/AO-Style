import { useQuery } from "@tanstack/react-query";
import AdminRoleService from "../../services/api/adminRole";

function useGetAdminRoles(params) {
  const { isLoading, isFetching, data, isError, refetch, isPending } = useQuery(
    {
      queryKey: ["get-admin-role", params],
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

export default useGetAdminRoles;
