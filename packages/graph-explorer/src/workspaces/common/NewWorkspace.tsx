import { cx } from "@emotion/css";
import { PropsWithChildren } from "react";
import { IconButton, IconButtonProps } from "../../components";
import GraphExplorerIcon from "../../components/icons/GraphExplorerIcon";

export function NewContainer({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "bg-white dark:bg-slate-900 rounded-2xl shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function NewTopBar({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <NewContainer className={cx("flex flex-row", className)}>
      <div className="flex items-center justify-center aspect-square rounded-s-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-2 text-white">
        <GraphExplorerIcon width={"2em"} height={"2em"} />
      </div>
      <div className="grow flex flex-row justify-between items-center gap-3 p-3">
        {children}
      </div>
    </NewContainer>
  );
}

export function NewContentArea({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main className={cx("h-full w-full grow overflow-auto", className)}>
      {children}
    </main>
  );
}

export function NewSidebar({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <aside className={cx("h-full overflow-auto", className)}>{children}</aside>
  );
}

export type NewSidebarButtonProps = {
  active?: boolean;
} & Omit<IconButtonProps, "variant" | "rounded">;

export function NewSidebarButton({
  classNamePrefix = "ft",
  className,
  active,
  ...props
}: NewSidebarButtonProps) {
  return (
    <IconButton
      tooltipPlacement={"left-center"}
      variant="text"
      classNamePrefix={classNamePrefix}
      className={cx(
        active
          ? "bg-sky-500 text-white hover:bg-sky-400 hover:text-white"
          : "bg-gray-100",
        "p-2 rounded-xl hover:bg-sky-100",
        className
      )}
      {...props}
    />
  );
}

export function NewWorkspaceContainer({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={cx(
        "flex flex-col w-full h-full max-h-screen max-w-full p-3 gap-3",
        "bg-gray-100 dark:bg-slate-900 text-black dark:text-slate-50 shadow-sm",
        className
      )}
    >
      {children}
    </main>
  );
}
