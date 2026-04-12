import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  slug: string;
  color?: string | null;
  className?: string;
}

export function CategoryBadge({
  name,
  slug,
  color,
  className,
}: CategoryBadgeProps) {
  return (
    <Link href={`/categories/${slug}`}>
      <Badge
        style={{
          borderLeft: color ? `4px solid ${color}` : undefined,
        }}
        className={cn(
          "px-3 py-1 text-xs font-semibold bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer",
          className,
        )}
      >
        {name}
      </Badge>
    </Link>
  );
}
