import { useMutation } from '@tanstack/react-query';
import { jobApplicationService } from '../../services/api/jobApplications';
import useToast from '../useToast';

export const useApplyForJob = () => {
    const { toastSuccess, toastError } = useToast();

    return useMutation({
        mutationFn: jobApplicationService.applyForJob,
        onSuccess: (data) => {
            toastSuccess(data.message || 'Application submitted successfully!');
        },
        onError: (error) => {
            toastError(error.message || 'Failed to submit application');
        }
    });
};
