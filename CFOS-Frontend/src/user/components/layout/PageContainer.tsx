import type { ReactNode } from "react";
import { cn } from "@user/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}

export function PageContainer({
  children,
  className,
  innerClassName,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-[calc(100vh-80px)] px-4 py-8 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className={cn("mx-auto max-w-7xl", innerClassName)}>{children}</div>
    </div>
  );
}
