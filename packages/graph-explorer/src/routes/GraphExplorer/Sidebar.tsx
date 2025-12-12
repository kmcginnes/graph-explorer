import { useAtomValue } from "jotai";
import { Tabs as TabsPrimitive } from "radix-ui";
import { Resizable } from "re-resizable";
import {
  type ComponentPropsWithRef,
  type PropsWithChildren,
  useState,
} from "react";

import {
  DetailsIcon,
  EdgeIcon,
  ExpandGraphIcon,
  FilterIcon,
  GraphIcon,
  NamespaceIcon,
  SearchIcon,
} from "@/components";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/Tooltip";
import {
  CLOSED_SIDEBAR_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  type SidebarItems,
  useSidebar,
  useSidebarSize,
} from "@/core";
import { totalFilteredCount } from "@/core/StateProvider/filterCount";
import { useTranslations } from "@/hooks";
import { EdgesStyling } from "@/modules/EdgesStyling";
import EntitiesFilter from "@/modules/EntitiesFilter";
import EntityDetails from "@/modules/EntityDetails";
import Namespaces from "@/modules/Namespaces/Namespaces";
import NodeExpand from "@/modules/NodeExpand";
import { NodesStyling } from "@/modules/NodesStyling";
import { SearchSidebarPanel } from "@/modules/SearchSidebar";
import { cn } from "@/utils";

export function Sidebar({
  className,
  ...props
}: ComponentPropsWithRef<typeof SidebarTabs>) {
  const t = useTranslations();
  const filteredEntitiesCount = useAtomValue(totalFilteredCount);
  const { shouldShowNamespaces, activeSidebarItem } = useSidebar();

  return (
    <ResizableSidebar>
      <SidebarTabs
        value={activeSidebarItem ?? ""}
        orientation="vertical"
        className={cn(
          className,
          "bg-background-default shadow-primary-dark/25 grid min-h-0 flex-none shrink-0 shadow",
        )}
        {...props}
      >
        <SidebarTabsList>
          <SidebarTabsTrigger value="search" title="Search">
            <SearchIcon />
          </SidebarTabsTrigger>
          <SidebarTabsTrigger value="details" title="Details">
            <DetailsIcon />
          </SidebarTabsTrigger>

          <SidebarTabsTrigger value="expand" title="Expand">
            <ExpandGraphIcon />
          </SidebarTabsTrigger>
          <SidebarTabsTrigger
            value="filters"
            title="Filters"
            badge={filteredEntitiesCount > 0}
          >
            <FilterIcon />
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
          {shouldShowNamespaces && (
            <SidebarTabsTrigger value="namespaces" title="Namespaces">
              <NamespaceIcon />
            </SidebarTabsTrigger>
          )}
        </SidebarTabsList>
        <SidebarTabsContent value="search">
          <SearchSidebarPanel />
        </SidebarTabsContent>
        <SidebarTabsContent value="details">
          <EntityDetails />
        </SidebarTabsContent>
        <SidebarTabsContent value="expand">
          <NodeExpand />
        </SidebarTabsContent>
        <SidebarTabsContent value="filters">
          <EntitiesFilter />
        </SidebarTabsContent>
        <SidebarTabsContent value="nodes-styling">
          <NodesStyling />
        </SidebarTabsContent>
        <SidebarTabsContent value="edges-styling">
          <EdgesStyling />
        </SidebarTabsContent>
        <SidebarTabsContent value="namespaces">
          <Namespaces />
        </SidebarTabsContent>
      </SidebarTabs>
    </ResizableSidebar>
  );
}

function ResizableSidebar({ children }: PropsWithChildren) {
  const { isSidebarOpen } = useSidebar();
  const [sidebarWidth, setSidebarWidth] = useSidebarSize();

  // The transition animation used for opening and closing sidebar animation
  // does not play well with the resizing behavior of the Resizable component.
  // If the animation is not disabled, the resize will feel jerky.
  const [enableAnimation, setEnableAnimation] = useState(true);

  return (
    <Resizable
      size={{
        width: isSidebarOpen ? sidebarWidth : CLOSED_SIDEBAR_WIDTH,
      }}
      minWidth={isSidebarOpen ? DEFAULT_SIDEBAR_WIDTH : CLOSED_SIDEBAR_WIDTH}
      defaultSize={{
        width: isSidebarOpen ? DEFAULT_SIDEBAR_WIDTH : CLOSED_SIDEBAR_WIDTH,
      }}
      enable={{ left: isSidebarOpen }}
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
  badge,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  title: string;
  badge?: boolean;
}) {
  const { toggleSidebar } = useSidebar();

  const handleClick = () => {
    toggleSidebar(value as SidebarItems);
  };

  return (
    <BadgeIndicator value={badge}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <TabsPrimitive.Trigger
              data-slot="workspace-sidebar-tabs-trigger"
              value={value}
              onClick={handleClick}
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
    </BadgeIndicator>
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

function BadgeIndicator({
  children,
  value,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { value?: boolean }) {
  return (
    <div className="stack" {...props}>
      {children}
      {value ? (
        <span
          aria-description="badge"
          className="bg-error-main pointer-events-none -mt-0.5 -mr-0.5 size-2.5 place-self-start justify-self-end rounded-full"
        />
      ) : null}
    </div>
  );
}
