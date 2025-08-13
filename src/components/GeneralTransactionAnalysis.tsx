import { useQuery } from "@tanstack/react-query";
import CaryBinApi from "../services/CarybinBaseUrl";

export default function GeneralTransactionAnalysis() {
  const query = useQuery({
    queryKey: ["analyis"],
    queryFn: async () => {
      let resp = await CaryBinApi.get("/owner-analytics/fetch-revenue", {
        params: {
          year: 2025,
        },
      });
      return resp.data;
    },
  });
  return <div>analyis {JSON.stringify(query.data)}</div>;
}
