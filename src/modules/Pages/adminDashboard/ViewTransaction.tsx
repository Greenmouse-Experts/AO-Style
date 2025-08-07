import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";

export default function ViewTransaction() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["transactions_details", id],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/withdraw/details/:id");
      return resp.data;
    },
  });
  return <div>{JSON.stringify(query.data?.data)}</div>;
}
