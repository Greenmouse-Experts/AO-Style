import { useQuery } from "@tanstack/react-query";
import AnnouncementService from "../../services/api/announcement/index";

const useGetAnnouncementById = (id) => {
  return useQuery({
    queryKey: ["announcement", id],
    queryFn: () => AnnouncementService.getAnnouncementById(id),
    enabled: !!id, // Only run query if id is provided
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useGetAnnouncementById;
