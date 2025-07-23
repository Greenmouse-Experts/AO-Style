import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const api = axios.create({
  baseURL: "https://countriesnow.space/api/v0.1",
});

export const useCountries = () => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await api.get("/countries/positions");
      return res.data.data;
    },
  });
};

export const useStates = (country) => {
  return useQuery({
    queryKey: ["states", country],
    queryFn: async () => {
      const res = await api.post("/countries/states", { country });
      return res.data.data.states;
    },
    enabled: !!country,
  });
};
