import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const MetricsCard = ({ title, value, icon: Icon, trend, variant = "default" }: MetricsCardProps) => {
  const variantClasses = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <Card className="glass-card hover:shadow-premium transition-all duration-300 group hover:scale-105 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-${variant === 'default' ? 'primary' : variant}/10 group-hover:shadow-glow transition-all`}>
          <Icon className={`h-5 w-5 ${variantClasses[variant]}`} strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2 group-hover:text-muted-foreground/80 transition-colors">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
