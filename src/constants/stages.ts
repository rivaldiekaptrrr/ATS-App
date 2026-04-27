import { ApplicationStatus } from '@/types';

export interface PipelineStage {
    id: ApplicationStatus;
    label: string;
    color: string;
    bgColor: string;
    order: number;
}

export const PIPELINE_STAGES: PipelineStage[] = [
    { id: 'applied', label: 'Applied', color: 'text-slate-700', bgColor: 'bg-slate-100', order: 0 },
    { id: 'screening', label: 'Screening', color: 'text-blue-700', bgColor: 'bg-blue-100', order: 1 },
    { id: 'interview_1', label: 'Interview 1', color: 'text-purple-700', bgColor: 'bg-purple-100', order: 2 },
    { id: 'interview_2', label: 'Interview 2', color: 'text-purple-700', bgColor: 'bg-purple-200', order: 3 },
    { id: 'interview_3', label: 'Interview 3', color: 'text-purple-700', bgColor: 'bg-purple-300', order: 4 },
    { id: 'test', label: 'Test', color: 'text-orange-700', bgColor: 'bg-orange-100', order: 5 },
    { id: 'offering', label: 'Offering', color: 'text-green-700', bgColor: 'bg-green-100', order: 6 },
    { id: 'hired', label: 'Hired', color: 'text-emerald-700', bgColor: 'bg-emerald-100', order: 7 },
    { id: 'rejected', label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100', order: -1 },
];

export const getStageByStatus = (status: ApplicationStatus): PipelineStage => {
    return PIPELINE_STAGES.find(stage => stage.id === status) || PIPELINE_STAGES[0];
};

export const getNextStage = (currentStatus: ApplicationStatus): ApplicationStatus | null => {
    const currentStage = getStageByStatus(currentStatus);
    if (currentStage.order === -1) return null; // Rejected has no next stage

    const nextStage = PIPELINE_STAGES.find(stage => stage.order === currentStage.order + 1);
    return nextStage?.id || null;
};

export const getPreviousStage = (currentStatus: ApplicationStatus): ApplicationStatus | null => {
    const currentStage = getStageByStatus(currentStatus);
    if (currentStage.order <= 0) return null;

    const prevStage = PIPELINE_STAGES.find(stage => stage.order === currentStage.order - 1);
    return prevStage?.id || null;
};
