import { useQuery } from "@tanstack/react-query";
import AnnouncementService from "../../services/api/announcement/index";

const useGetAnnouncements = (role) => {
    console.log("useGetAnnouncements called with role:", role);
    
    return useQuery({
        queryKey: ["announcements", role],
        queryFn: async () => {
            console.log("Fetching announcements for role:", role);
            try {
                const response = await AnnouncementService.getAnnouncements(role);
                console.log("Announcements API Response:", response);
                console.log("Response type:", typeof response);
                console.log("Response keys:", response ? Object.keys(response) : 'No response');
                return response;
            } catch (error) {
                console.error("Error in useGetAnnouncements:", error);
                console.error("Error response:", error?.response);
                console.error("Error data:", error?.response?.data);
                throw error;
            }
        },
        enabled: !!role,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        onError: (error) => {
            console.error("React Query Error:", error);
        },
        onSuccess: (data) => {
            console.log("React Query Success:", data);
        }
    });
};

export default useGetAnnouncements;
