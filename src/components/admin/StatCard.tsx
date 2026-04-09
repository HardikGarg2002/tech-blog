import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  accent?: string; // tailwind color class like "text-blue-400"
};

export function StatCard({ title, value, icon: Icon, description, accent = "text-primary" }: Props) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg bg-muted ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}
