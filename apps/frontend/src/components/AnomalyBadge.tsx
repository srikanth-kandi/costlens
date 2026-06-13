import { Anomaly } from "@costlens/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnomalyBadgeProps {
  type: Anomaly["type"];
  severity: Anomaly["severity"];
  showLabel?: boolean;
}

const typeLabels: Record<Anomaly["type"], string> = {
  budget_exceeded: "Budget Exceeded",
  low_confidence: "Low Confidence",
  expensive_meeting: "Expensive Meeting",
  resource_imbalance: "Resource Imbalance",
  budget_risk: "Budget Risk",
};

const severityVariant: Record<
  Anomaly["severity"],
  "destructive" | "warning" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

const severityDot: Record<Anomaly["severity"], string> = {
  critical: "bg-red-500",
  high: "bg-red-400",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export function SeverityBadge({ severity }: { severity: Anomaly["severity"] }) {
  return (
    <Badge variant={severityVariant[severity]} className="capitalize gap-1.5">
      <span className={cn("w-1.5 h-1.5 rounded-full", severityDot[severity])} />
      {severity}
    </Badge>
  );
}

export function AnomalyTypeBadge({ type }: { type: Anomaly["type"] }) {
  const typeColors: Record<Anomaly["type"], string> = {
    budget_exceeded: "bg-red-100 text-red-700",
    budget_risk: "bg-orange-100 text-orange-700",
    expensive_meeting: "bg-purple-100 text-purple-700",
    low_confidence: "bg-yellow-100 text-yellow-700",
    resource_imbalance: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        typeColors[type],
      )}
    >
      {typeLabels[type]}
    </span>
  );
}

export default function AnomalyBadge({
  type,
  severity,
  showLabel = true,
}: AnomalyBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <SeverityBadge severity={severity} />
      {showLabel && <AnomalyTypeBadge type={type} />}
    </div>
  );
}
