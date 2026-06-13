import { useState } from "react";
import {
  AlertTriangle,
  Filter,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import { useAnomalies } from "@/hooks/useApi";
import { mockAnomalies, mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge, AnomalyTypeBadge } from "@/components/AnomalyBadge";
import { formatCurrency, formatRelativeDate } from "@/utils/formatters";
import type { Anomaly } from "@costlens/shared";

const ANOMALY_TYPE_ICONS: Record<
  Anomaly["type"],
  React.FC<{ className?: string }>
> = {
  budget_exceeded: XCircle,
  budget_risk: TrendingUp,
  expensive_meeting: DollarSign,
  low_confidence: AlertCircle,
  resource_imbalance: Activity,
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "budget_exceeded", label: "Budget Exceeded" },
  { value: "budget_risk", label: "Budget Risk" },
  { value: "expensive_meeting", label: "Expensive Meeting" },
  { value: "low_confidence", label: "Low Confidence" },
  { value: "resource_imbalance", label: "Resource Imbalance" },
];

const SEVERITY_OPTIONS = [
  { value: "", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function Anomalies() {
  const [typeFilter, setTypeFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const { data: apiAnomalies, isLoading } = useAnomalies({
    type: typeFilter || undefined,
    severity: severityFilter || undefined,
    projectId: projectFilter ? parseInt(projectFilter) : undefined,
  });

  let anomalies = apiAnomalies ?? mockAnomalies;

  // Apply client-side filter if using mock data
  if (!apiAnomalies) {
    if (typeFilter) anomalies = anomalies.filter((a) => a.type === typeFilter);
    if (severityFilter)
      anomalies = anomalies.filter((a) => a.severity === severityFilter);
    if (projectFilter)
      anomalies = anomalies.filter(
        (a) => a.projectId === parseInt(projectFilter),
      );
  }

  const criticalCount = anomalies.filter(
    (a) => a.severity === "critical",
  ).length;
  const highCount = anomalies.filter((a) => a.severity === "high").length;
  const mediumCount = anomalies.filter((a) => a.severity === "medium").length;
  const totalAmount = anomalies.reduce((sum, a) => sum + (a.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <p className="text-xs text-slate-500 font-medium">Critical</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <p className="text-xs text-slate-500 font-medium">High</p>
            </div>
            <p className="text-2xl font-bold text-red-500">{highCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <p className="text-xs text-slate-500 font-medium">Medium</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{mediumCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium mb-1">
              Total at Risk
            </p>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-52"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full sm:w-44"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full sm:w-52"
            >
              <option value="">All Projects</option>
              {mockProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Anomalies
            <span className="ml-1 text-sm font-normal text-slate-400">
              ({anomalies.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading anomalies...</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-green-400" />
              </div>
              <p className="font-medium text-slate-600">No anomalies found</p>
              <p className="text-sm text-slate-400">
                All systems are within normal thresholds
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {anomalies.map((anomaly) => {
                const Icon = ANOMALY_TYPE_ICONS[anomaly.type] ?? AlertTriangle;
                return (
                  <div
                    key={anomaly.id}
                    className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
                          anomaly.severity === "critical" ||
                          anomaly.severity === "high"
                            ? "bg-red-50"
                            : anomaly.severity === "medium"
                              ? "bg-amber-50"
                              : "bg-slate-100"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            anomaly.severity === "critical" ||
                            anomaly.severity === "high"
                              ? "text-red-600"
                              : anomaly.severity === "medium"
                                ? "text-amber-600"
                                : "text-slate-500"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <SeverityBadge severity={anomaly.severity} />
                          <AnomalyTypeBadge type={anomaly.type} />
                          {anomaly.projectName && (
                            <Badge variant="secondary" className="text-xs">
                              {anomaly.projectName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {anomaly.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {anomaly.amount !== undefined &&
                            anomaly.amount > 0 && (
                              <span className="text-xs font-semibold text-slate-600">
                                {formatCurrency(anomaly.amount)}
                              </span>
                            )}
                          {anomaly.meetingTitle && (
                            <span className="text-xs text-slate-400">
                              Meeting: {anomaly.meetingTitle}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatRelativeDate(anomaly.detectedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
