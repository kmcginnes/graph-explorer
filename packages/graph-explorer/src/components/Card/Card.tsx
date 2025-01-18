import { cn } from "@/utils";
import type { ForwardedRef, HTMLAttributes, PropsWithChildren } from "react";
import { forwardRef } from "react";

export interface CardProps
  extends Pick<HTMLAttributes<HTMLDivElement>, "style"> {
  id?: string;
  className?: string;
  transparent?: boolean;
}

export function Card(
  { id, className, children, ...restProps }: PropsWithChildren<CardProps>,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      id={id}
      ref={ref}
      className={cn(
        `text-text-primary bg-background-secondary relative flex grow flex-col rounded border p-2 shadow-md dark:shadow-none`,
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}

export default forwardRef<HTMLDivElement, PropsWithChildren<CardProps>>(Card);
