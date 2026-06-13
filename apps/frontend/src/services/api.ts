import axios from "axios";
import type {
  DashboardData,
  Meeting,
  Project,
  ProjectUpsertInput,
  Employee,
  EmployeeUpsertInput,
  Anomaly,
  AttributionRequest,
  AttributionPrefillResult,
  AttributionResult,
  MeetingUpsertInput,
  CostCalculationRequest,
  CostCalculationResult,
  MeetingFilters,
  ApiResponse,
  PaginatedResponse,
} from "@costlens/shared";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard");
  return data.data;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiResponse<Project[]>>("/projects");
  return data.data;
}

// ─── Employees (HR Admin) ────────────────────────────────────────────────────
export async function fetchEmployees(filters?: {
  search?: string;
  department?: string;
}): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.department) params.set("department", filters.department);

  const query = params.toString();
  const { data } = await api.get<ApiResponse<Employee[]>>(
    `/employees${query ? `?${query}` : ""}`,
  );
  return data.data;
}

export async function createEmployee(
  payload: EmployeeUpsertInput,
): Promise<Employee> {
  const { data } = await api.post<ApiResponse<Employee>>("/employees", payload);
  return data.data;
}

export async function updateEmployee(
  id: number,
  payload: EmployeeUpsertInput,
): Promise<Employee> {
  const { data } = await api.put<ApiResponse<Employee>>(
    `/employees/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteEmployee(id: number): Promise<{ id: number }> {
  const { data } = await api.delete<ApiResponse<{ id: number }>>(
    `/employees/${id}`,
  );
  return data.data;
}

export async function fetchProjectById(id: number): Promise<Project> {
  const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return data.data;
}

export async function createProject(payload: ProjectUpsertInput): Promise<Project> {
  const { data } = await api.post<ApiResponse<Project>>("/projects", payload);
  return data.data;
}

export async function updateProject(
  id: number,
  payload: ProjectUpsertInput,
): Promise<Project> {
  const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, payload);
  return data.data;
}

export async function deleteProject(id: number): Promise<{ id: number }> {
  const { data } = await api.delete<ApiResponse<{ id: number }>>(
    `/projects/${id}`,
  );
  return data.data;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export async function fetchMeetings(
  filters: MeetingFilters = {},
): Promise<PaginatedResponse<Meeting>> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.projectId) params.set("projectId", String(filters.projectId));
  if (filters.department) params.set("department", filters.department);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const { data } = await api.get(`/meetings?${params.toString()}`);
  return {
    data: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  };
}

export async function createMeeting(payload: MeetingUpsertInput): Promise<Meeting> {
  const { data } = await api.post<ApiResponse<Meeting>>("/meetings", payload);
  return data.data;
}

export async function updateMeeting(
  id: number,
  payload: MeetingUpsertInput,
): Promise<Meeting> {
  const { data } = await api.put<ApiResponse<Meeting>>(`/meetings/${id}`, payload);
  return data.data;
}

export async function deleteMeeting(id: number): Promise<{ id: number }> {
  const { data } = await api.delete<ApiResponse<{ id: number }>>(
    `/meetings/${id}`,
  );
  return data.data;
}

// ─── Anomalies ────────────────────────────────────────────────────────────────
export async function fetchAnomalies(filters?: {
  type?: string;
  severity?: string;
  projectId?: number;
}): Promise<Anomaly[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.severity) params.set("severity", filters.severity);
  if (filters?.projectId) params.set("projectId", String(filters.projectId));
  const { data } = await api.get<ApiResponse<Anomaly[]>>(
    `/anomalies?${params.toString()}`,
  );
  return data.data;
}

// ─── AI Attribution ───────────────────────────────────────────────────────────
export async function attributeMeeting(
  request: AttributionRequest,
): Promise<AttributionResult> {
  const { data } = await api.post<ApiResponse<AttributionResult>>(
    "/attribution",
    request,
  );
  return data.data;
}

export async function fetchAttributionPrefill(): Promise<AttributionPrefillResult> {
  const { data } = await api.get<ApiResponse<AttributionPrefillResult>>(
    "/attribution/prefill",
  );
  return data.data;
}

// ─── Cost Calculation ─────────────────────────────────────────────────────────
export async function calculateCost(
  request: CostCalculationRequest,
): Promise<CostCalculationResult> {
  const { data } = await api.post<ApiResponse<CostCalculationResult>>(
    "/calculate-cost",
    request,
  );
  return data.data;
}
