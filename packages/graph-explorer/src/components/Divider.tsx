import { cn } from "@/utils";
import { ComponentProps } from "react";

export default function Divider({
  orientation = "horizontal",
  className,
  ...props
}: ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal"
          ? "my-1 h-[1px] w-full"
          : "mx-1 h-full w-[1px]",
        className
      )}
      {...props}
    />
  );
}
