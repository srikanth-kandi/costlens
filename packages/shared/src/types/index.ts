// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  name: string;
  email: string;
  designation: string;
  department: string;
  hourlyRate: number;
  avatarUrl?: string;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  teamSize?: number;
  startDate?: string;
  endDate?: string;
}

export type ProjectStatus = "active" | "on-hold" | "completed" | "at-risk";

export interface Meeting {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  meetingDate: string;
  projectId: number | null;
  projectName?: string;
  confidenceScore: number;
  participants?: MeetingParticipant[];
  cost?: number;
}

export interface MeetingParticipant {
  meetingId: number;
  employeeId: number;
  employee?: Employee;
}

export interface CostSummary {
  projectId: number;
  projectName: string;
  projectCode: string;
  totalCost: number;
  meetingCount: number;
  hoursSpent: number;
  budget: number;
  budgetUtilization: number;
  status: ProjectStatus;
}

export interface Anomaly {
  id: number;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  projectId: number | null;
  projectName?: string;
  meetingId?: number;
  meetingTitle?: string;
  amount?: number;
  detectedAt: string;
}

export type AnomalyType =
  | "budget_exceeded"
  | "low_confidence"
  | "expensive_meeting"
  | "resource_imbalance"
  | "budget_risk";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";

// ─── Dashboard Types ───────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalHRCost: number;
  totalMeetings: number;
  activeProjects: number;
  costOverruns: number;
  costGrowth: number;
  meetingGrowth: number;
}

export interface WeeklyCostTrend {
  week: string;
  cost: number;
  meetings: number;
}

export interface DepartmentCost {
  department: string;
  cost: number;
  employees: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  costByProject: CostSummary[];
  costByDepartment: DepartmentCost[];
  weeklyTrend: WeeklyCostTrend[];
  recentMeetings: Meeting[];
  recentAnomalies: Anomaly[];
}

// ─── API Types ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MeetingFilters {
  search?: string;
  projectId?: number;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// ─── AI Attribution Types ──────────────────────────────────────────────────────

export interface AttributionRequest {
  title: string;
  description: string;
  attendees: string[];
}

export interface AttributionResult {
  project: string;
  projectId: number | null;
  confidence: number;
  reason: string;
}

// ─── Cost Calculation Types ────────────────────────────────────────────────────

export interface CostCalculationRequest {
  employeeIds: number[];
  durationMinutes: number;
}

export interface CostCalculationResult {
  totalCost: number;
  breakdown: {
    employeeId: number;
    employeeName: string;
    hourlyRate: number;
    cost: number;
  }[];
  durationHours: number;
}
