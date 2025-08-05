import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import CaryBinApi from "../../../services/CarybinBaseUrl";

export default function ViewTailorStyle() {
  const { id } = useParams();
  const style_query = useQuery({
    queryKey: ["style"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/style/" + id);
      return resp.data;
    },
  });
  return <div>{id}</div>;
}
