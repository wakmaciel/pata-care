import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  iconClass,
  title,
  text,
  action,
}: {
  icon: IconName;
  iconClass?: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className={cn("paw-stack", iconClass)}>
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
