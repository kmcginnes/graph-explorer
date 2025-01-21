import { cn } from "@/utils";
import React from "react";

import { IconButton, IconButtonProps } from "@/components/IconButton";
import { XIcon } from "lucide-react";

type PanelVariant = "default" | "sidebar";

interface PanelProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: PanelVariant;
}

type PanelContextValue = {
  variant: PanelVariant;
};

const PanelContext = React.createContext<PanelContextValue | null>(null);

function PanelProvider({
  variant,
  children,
}: {
  variant: PanelVariant;
  children: React.ReactNode;
}) {
  return (
    <PanelContext.Provider value={{ variant }}>
      {children}
    </PanelContext.Provider>
  );
}

function usePanelVariant() {
  const context = React.useContext(PanelContext);
  if (!context) {
    throw new Error("usePanelVariant must be used within a PanelProvider");
  }
  return context.variant;
}

const Panel = React.forwardRef<React.ElementRef<"div">, PanelProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <PanelProvider variant={variant}>
      <div
        ref={ref}
        className={cn(
          "text-text-primary flex h-full flex-col overflow-hidden",
          variant === "default"
            ? "shadow-base bg-background-default"
            : "bg-background-secondary",
          className
        )}
        {...props}
      />
    </PanelProvider>
  )
);
Panel.displayName = "Panel";

const PanelContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const variant = usePanelVariant();
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full grow flex-col overflow-y-auto",
        variant === "default"
          ? "bg-background-default"
          : "bg-background-secondary",
        className
      )}
      {...props}
    />
  );
});
PanelContent.displayName = "PanelContent";

export type Action = {
  label: string;
  icon: React.ReactNode;
  color?: "success" | "error" | "warning" | "info" | "primary";
  keepOpenOnSelect?: boolean;
  alwaysVisible?: boolean;
  active?: boolean;
  onlyPinnedVisible?: boolean;
  isDisabled?: boolean;
  collapsedItems?: React.ReactElement;
  onActionClick: () => void;
};

const PanelHeader = React.forwardRef<
  React.ElementRef<"div">,
  React.PropsWithChildren<React.ComponentPropsWithoutRef<"div">>
>(({ className, children, ...props }, ref) => {
  const variant = usePanelVariant();
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-[48px] w-full shrink-0 items-center gap-4 border-b px-3 py-1",
        variant === "default" && "bg-background-default",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PanelHeader.displayName = "PanelHeader";

const PanelFooter = React.forwardRef<
  React.ElementRef<"div">,
  React.PropsWithChildren<React.ComponentPropsWithoutRef<"div">>
>(({ className, children, ...props }, ref) => {
  const variant = usePanelVariant();
  return (
    <div
      ref={ref}
      className={cn(
        "w-full border-t px-3 py-3",
        variant === "default"
          ? "bg-background-default"
          : "bg-background-secondary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PanelFooter.displayName = "PanelFooter";

const PanelTitle = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-text-primary inline-flex shrink-0 gap-2 whitespace-nowrap text-base font-bold leading-none",
      className
    )}
    {...props}
  />
));
PanelTitle.displayName = "PanelTitle";

const PanelHeaderDivider = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-divider h-5 w-[1px]", className)}
    {...props}
  />
));
PanelHeaderDivider.displayName = "PanelHeaderDivider";

export interface PanelHeaderCloseButtonProps
  extends React.PropsWithChildren<React.ComponentPropsWithoutRef<"div">> {
  onClose: () => void;
}

export function PanelHeaderCloseButton({
  onClose,
}: PanelHeaderCloseButtonProps) {
  return (
    <IconButton
      tooltipText="Close"
      icon={<XIcon />}
      onClick={onClose}
      variant="text"
      size="small"
    />
  );
}
PanelHeaderCloseButton.displayName = "PanelHeaderCloseButton";

export function PanelHeaderActionButton({
  isDisabled,
  label,
  active,
  color,
  icon,
  onActionClick,
  ...props
}: Action & IconButtonProps) {
  return (
    <IconButton
      disabled={isDisabled}
      tooltipText={label}
      variant={active ? "filled" : "text"}
      color={color}
      icon={icon}
      onClick={() => onActionClick()}
      {...props}
    />
  );
}

export type PanelHeaderActionsProps = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<"div">
>;

function PanelHeaderActions({
  children,
  className,
  ...props
}: PanelHeaderActionsProps) {
  return (
    <div
      className={cn(
        "flex grow flex-row items-center justify-end gap-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

PanelHeaderActions.displayName = "PanelHeaderActions";

export {
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
  PanelHeaderActions,
  PanelTitle,
  PanelHeaderDivider,
};
