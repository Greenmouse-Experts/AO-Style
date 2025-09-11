import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";
import useGetAdminBusinessDetails from "../../../hooks/settings/useGetAdmnBusinessInfo";
interface API_RESPONSE {
  data: any[];
  code: string;
}
export default function InvitesPage() {
  const { data } = useGetAdminBusinessDetails();
  // return <>{JSON.stringify(data)}</>;
  const query = useQuery<API_RESPONSE>({
    queryKey: ["invites"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/contact/invites/" + data.data.id);
      return resp.data;
    },
  });
  return <div>{JSON.stringify(query.data)}</div>;
}
