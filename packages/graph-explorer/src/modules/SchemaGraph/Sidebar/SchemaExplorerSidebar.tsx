import { Tabs as TabsPrimitive } from "radix-ui";
import { Resizable } from "re-resizable";
import { type PropsWithChildren, useState } from "react";

import { DetailsIcon, EdgeIcon, GraphIcon } from "@/components";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip";
import { useTranslations } from "@/hooks";
import { cn, LABELS } from "@/utils";

import type { SchemaGraphSelection } from "../SchemaGraph";

import { SchemaDetailsContent } from "./SchemaDetailsContent";
import { SchemaEdgesStyling } from "./SchemaEdgesStyling";
import {
  DEFAULT_SCHEMA_SIDEBAR_WIDTH,
  useSchemaExplorerSidebarSize,
} from "./schemaExplorerLayout";
import { SchemaNodesStyling } from "./SchemaNodesStyling";

export type SchemaExplorerSidebarProps = {
  selection: SchemaGraphSelection;
};

/** Resizable sidebar for schema graph with details, node styling, and edge styling tabs */
export function SchemaExplorerSidebar({
  selection,
}: SchemaExplorerSidebarProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("details");

  return (
    <ResizableSidebarContainer>
      <SidebarTabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="bg-background-default shadow-primary-dark/25 grid min-h-0 flex-none shrink-0 shadow"
      >
        <SidebarTabsList>
          <SidebarTabsTrigger
            value="details"
            title={LABELS.SIDEBAR.SELECTION_DETAILS}
          >
            <DetailsIcon />
          </SidebarTabsTrigger>
          <SidebarTabsTrigger
            value="nodes-styling"
            title={t("nodes-styling.title")}
          >
            <GraphIcon />
          </SidebarTabsTrigger>
          <SidebarTabsTrigger
            value="edges-styling"
            title={t("edges-styling.title")}
          >
            <EdgeIcon />
          </SidebarTabsTrigger>
        </SidebarTabsList>
        <SidebarTabsContent value="details">
          <SchemaDetailsContent selection={selection} />
        </SidebarTabsContent>
        <SidebarTabsContent value="nodes-styling">
          <SchemaNodesStyling />
        </SidebarTabsContent>
        <SidebarTabsContent value="edges-styling">
          <SchemaEdgesStyling />
        </SidebarTabsContent>
      </SidebarTabs>
    </ResizableSidebarContainer>
  );
}

function ResizableSidebarContainer({ children }: PropsWithChildren) {
  const [sidebarWidth, setSidebarWidth] = useSchemaExplorerSidebarSize();
  const [enableAnimation, setEnableAnimation] = useState(true);

  return (
    <Resizable
      size={{ width: sidebarWidth }}
      minWidth={DEFAULT_SCHEMA_SIDEBAR_WIDTH}
      defaultSize={{ width: DEFAULT_SCHEMA_SIDEBAR_WIDTH }}
      enable={{ left: true }}
      onResizeStart={() => setEnableAnimation(false)}
      onResizeStop={(_e, _direction, _ref, delta) => {
        setEnableAnimation(true);
        setSidebarWidth(delta.width);
      }}
      className={cn(
        enableAnimation &&
          "transition-width min-h-0 transform duration-200 ease-in-out",
      )}
    >
      {children}
    </Resizable>
  );
}

function SidebarTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="workspace-sidebar-tabs"
      className={cn(
        "ring-border grid size-full grid-cols-[auto_1fr] ring-1",
        className,
      )}
      {...props}
    />
  );
}

function SidebarTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="workspace-sidebar-tabs-list"
      className={cn(
        "bg-primary-subtle border-border/50 text-muted-foreground flex flex-col items-center gap-2 border-r p-2 dark:bg-gray-800",
        className,
      )}
      {...props}
    />
  );
}

function SidebarTabsTrigger({
  className,
  title,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  title: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <TabsPrimitive.Trigger
            data-slot="workspace-sidebar-tabs-trigger"
            value={value}
            className={cn(
              "inline-flex items-center justify-center gap-2 font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 disabled:saturate-0 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:saturate-0 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              "size-10 rounded-md px-4 text-base [&_svg]:size-5",
              "text-primary-foreground hover:bg-primary-subtle data-open:bg-primary-subtle dark:text-foreground dark:hover:bg-neutral-subtle-hover",
              "data-[state=active]:bg-brand data-[state=active]:hover:bg-brand-hover data-[state=active]:text-white",
              className,
            )}
            {...props}
          >
            {children}
            <span className="sr-only">{title}</span>
          </TabsPrimitive.Trigger>
        </span>
      </TooltipTrigger>
      <TooltipContent side="left">{title}</TooltipContent>
    </Tooltip>
  );
}

function SidebarTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="workspace-sidebar-tabs-content"
      className={cn("flex-1 overflow-y-auto outline-none", className)}
      {...props}
    />
  );
}
