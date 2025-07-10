import { useQuery } from '@tanstack/react-query';
import { jobApplicationService } from '../../services/api/jobApplications';

export const useGetJobApplications = (jobId) => {
    return useQuery({
        queryKey: ['job-applications', jobId],
        queryFn: () => jobApplicationService.getJobApplications(jobId),
        enabled: !!jobId
    });
};
