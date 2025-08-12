import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../../../services/CarybinBaseUrl";

export default function AdminNotificationDetail() {
  let query = useQuery({
    queryKey: ["adminNotificationDetail"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/");
      return resp.data;
    },
  });
  return <>sis</>;
}
