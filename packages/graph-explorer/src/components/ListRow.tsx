import { cn } from "@/utils";
import { ComponentPropsWithoutRef } from "react";

export function ListRow({
  className,
  isDisabled,
  ...props
}: {
  isDisabled?: boolean;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "bg-background-secondary hover:ring-primary-main has-[:checked]:ring-primary-main flex items-center gap-4 overflow-hidden rounded-lg border px-3 py-1.5 shadow-sm ring-2 ring-transparent transition-shadow duration-200 hover:ring-1",
        isDisabled && "pointer-events-none",
        className
      )}
      aria-disabled={isDisabled}
      {...props}
    />
  );
}

export function ListRowTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("text-primary-dark line-clamp-1 font-bold", className)}
      {...props}
    />
  );
}

export function ListRowSubtitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("text-text-secondary line-clamp-2 text-sm", className)}
      {...props}
    />
  );
}

export function ListRowContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex grow flex-col", className)} {...props} />;
}
