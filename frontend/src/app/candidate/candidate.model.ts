export enum Seniority {
  JUNIOR = 'junior',
  SENIOR = 'senior',
}

export interface Candidate {
  id: number;
  name: string;
  surname: string;
  seniority: Seniority;
  yearsOfExperience: number;
  availability: boolean;
  createdAt: Date;
}

export interface PaginatedCandidateResponse {
  data: Candidate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CandidateFilters {
  name?: string;
  seniority?: string;
  minYears?: number;
  availability?: boolean;
}
