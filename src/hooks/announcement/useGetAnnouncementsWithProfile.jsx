import { useQuery } from "@tanstack/react-query";
import AnnouncementService from "../../services/api/announcement/index";
import AuthService from "../../services/api/auth";

const useGetAnnouncementsWithProfile = (role, status) => {
  // First, fetch the user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    isSuccess: profileSuccess,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      try {
        const response = await AuthService.GetUser();
        console.log("Profile API Response:", response);
        return response?.data?.data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Then, fetch announcements with created_at and status as query parameters
  const announcementsQuery = useQuery({
    queryKey: [
      "announcements-with-profile",
      role,
      status, // Include status in query key
      profileData?.created_at,
    ],
    queryFn: async () => {
      console.log("Fetching announcements for role:", role);
      console.log("Using created_at:", profileData?.created_at);
      console.log("Using status:", status);

      try {
        // Pass parameters in correct order: role, createdAt, status
        const response =
          await AnnouncementService.getAnnouncementsWithTimestamp(
            role,
            profileData?.created_at,
            status, // Pass status parameter
          );
        console.log("Announcements API Response:", response);
        return response;
      } catch (error) {
        console.error("Error in useGetAnnouncementsWithProfile:", error);
        console.error("Error response:", error?.response);
        console.error("Error data:", error?.response?.data);
        throw error;
      }
    },
    enabled: !!role && !!profileData?.created_at && profileSuccess,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    // Profile data
    profileData,
    profileLoading,
    profileError,
    profileSuccess,

    // Announcements data
    data: announcementsQuery.data,
    isLoading: profileLoading || announcementsQuery.isLoading,
    error: profileError || announcementsQuery.error,
    isSuccess: profileSuccess && announcementsQuery.isSuccess,
    isError: announcementsQuery.isError || !!profileError,

    // Individual loading states for granular control
    isProfileLoading: profileLoading,
    isAnnouncementsLoading: announcementsQuery.isLoading,

    // Refetch functions
    refetchProfile,
    refetchAnnouncements: announcementsQuery.refetch,
    refetchAll: () => {
      refetchProfile();
      announcementsQuery.refetch();
    },
  };
};

export default useGetAnnouncementsWithProfile;
