import { PlannerOutput, InsightOutput, Report } from './report';

export interface BaseResponse {
  error?: boolean;
  message?: string;
  agent?: string;
  code?: number;
}

export interface PlanRequest {
  problemStatement: string;
}

export interface PlanResponse extends BaseResponse {
  data?: PlannerOutput;
}

export interface InsightRequest {
  problemStatement: string;
  plannerOutput: PlannerOutput;
}

export interface InsightResponse extends BaseResponse {
  data?: InsightOutput;
}

export interface ExecuteRequest {
  problemStatement: string;
  plannerOutput: PlannerOutput;
  insightOutput: InsightOutput;
}

export interface ExecuteResponse extends BaseResponse {
  data?: Report;
}

export interface EditSectionRequest {
  sectionId: string;
  currentContent: string;
  editInstruction: string;
  reportContext: string;
}

export interface EditSectionResponse extends BaseResponse {
  data?: {
    updatedContent: string;
    changesSummary: string;
  };
}

export interface OrchestrateResponse extends BaseResponse {
  data?: Report;
}
