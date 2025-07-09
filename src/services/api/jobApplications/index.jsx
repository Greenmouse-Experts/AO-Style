import CaryBinApi from "../../CarybinBaseUrl";

export const jobApplicationService = {
    // Apply for a job
    applyForJob: async (applicationData) => {
        const response = await CaryBinApi.post('/jobs/apply', applicationData);
        return response.data;
    },

    // Get applications for a job (admin only)
    getJobApplications: async (jobId) => {
        const response = await CaryBinApi.get(`/jobs/${jobId}/applications`);
        return response.data;
    },

    // Delete an application (admin only)
    deleteApplication: async (applicationId) => {
        const response = await CaryBinApi.delete(`/applications/id`, {
            data: { id: applicationId }
        });
        return response.data;
    }
};
