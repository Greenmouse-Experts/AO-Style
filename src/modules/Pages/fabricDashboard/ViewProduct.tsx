import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";

export default function ViewFabricProduct() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["fabric_procduct", id],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/manage-fabric/:id");
      return resp.data;
    },
  });
  return (
    <div>
      {id} {JSON.stringify(query.data)}
    </div>
  );
}
