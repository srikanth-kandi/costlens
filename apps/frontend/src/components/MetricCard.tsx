import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
}

const variantConfig = {
  default: { bg: "bg-blue-50", iconColor: "text-blue-600", border: "" },
  success: { bg: "bg-green-50", iconColor: "text-green-600", border: "" },
  warning: {
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-200",
  },
  danger: {
    bg: "bg-red-50",
    iconColor: "text-red-600",
    border: "border-red-200",
  },
};

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  loading = false,
}: MetricCardProps) {
  const config = variantConfig[variant];
  const isPositiveTrend = trend !== undefined && trend > 0;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", config.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              config.bg,
            )}
          >
            <Icon className={cn("w-5 h-5", config.iconColor)} />
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {trend !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    isPositiveTrend ? "text-green-600" : "text-red-600",
                  )}
                >
                  {isPositiveTrend ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-slate-400">{subtitle}</span>
              )}
              {trendLabel && (
                <span className="text-xs text-slate-400">{trendLabel}</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
