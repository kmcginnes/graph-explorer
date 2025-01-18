import { cn } from "@/utils";
import { ComponentPropsWithoutRef } from "react";

export function InfoBar({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-wrap gap-6 border-b px-6 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function InfoBarItem({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {children}
    </div>
  );
}
