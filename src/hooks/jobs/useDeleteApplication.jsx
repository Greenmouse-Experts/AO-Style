import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplicationService } from '../../services/api/jobApplications';
import useToast from '../useToast';

export const useDeleteApplication = () => {
    const { toastSuccess, toastError } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: jobApplicationService.deleteApplication,
        onSuccess: (data) => {
            toastSuccess(data.message || 'Application deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['job-applications'] });
        },
        onError: (error) => {
            toastError(error.message || 'Failed to delete application');
        }
    });
};
