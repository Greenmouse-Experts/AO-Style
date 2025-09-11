import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../services/CarybinBaseUrl";

export default function NotificationsSinglePage() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["notificaions"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/fetch-notifications/" + id);
      return resp.data;
    },
  });
  return (
    <div>
      {id} {JSON.stringify(query.data)}
    </div>
  );
}
