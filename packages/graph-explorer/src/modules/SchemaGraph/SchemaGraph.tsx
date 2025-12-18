import { useState, type ComponentPropsWithRef, type MouseEvent } from "react";
import {
  IconButton,
  Panel,
  PanelContent,
  PanelEmptyState,
  PanelHeader,
  PanelHeaderActions,
  PanelTitle,
} from "@/components";
import { Graph } from "@/components/Graph";
import { GraphProvider, useGraphRef } from "@/components/Graph/GraphContext";
import type { SelectedElements } from "@/components/Graph/Graph.model";
import { useSchemaGraphData } from "./useSchemaGraphData";
import { useSchemaGraphStyles } from "./useSchemaGraphStyles";
import { SchemaDetailsSidebar } from "./SchemaDetailsSidebar";
import {
  FullscreenIcon,
  GitCompareArrowsIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { cn } from "@/utils";
import { SelectLayout } from "@/modules/GraphViewer/SelectLayout";
import { useAtomValue } from "jotai";
import { graphLayoutSelectionAtom } from "@/modules/GraphViewer/SelectLayout";

export type SchemaGraphSelection = {
  nodeId: string | null;
  edgeId: string | null;
};

export type SchemaGraphProps = {
  onSelectionChange?: (selection: SchemaGraphSelection) => void;
} & Omit<ComponentPropsWithRef<"div">, "children" | "onContextMenu">;

// Prevent open context menu
function onContextMenu(e: MouseEvent<HTMLDivElement>) {
  e.preventDefault();
  e.stopPropagation();
}

export default function SchemaGraph(props: SchemaGraphProps) {
  return (
    <GraphProvider>
      <SchemaGraphContent {...props} />
    </GraphProvider>
  );
}

function SchemaGraphContent({
  className,
  onSelectionChange,
  ...props
}: SchemaGraphProps) {
  const { nodes, edges } = useSchemaGraphData();
  const styles = useSchemaGraphStyles();
  const layout = useAtomValue(graphLayoutSelectionAtom);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const handleSelectionChange = ({ nodeIds, edgeIds }: SelectedElements) => {
    const nodeId = nodeIds.values().next().value ?? null;
    const edgeId = edgeIds.values().next().value ?? null;

    setSelectedNodeId(nodeId);
    setSelectedEdgeId(edgeId);

    onSelectionChange?.({ nodeId, edgeId });
  };

  const isEmpty = nodes.length === 0;

  return (
    <div className={cn("size-full min-h-0 grow", className)} {...props}>
      <Panel>
        <PanelHeader>
          <PanelTitle>Schema Graph</PanelTitle>
          <PanelHeaderActions>
            <SelectLayout className="max-w-64 min-w-auto" />
            <SchemaGraphControls />
          </PanelHeaderActions>
        </PanelHeader>
        <PanelContent className="bg-background-secondary relative">
          {isEmpty ? (
            <PanelEmptyState
              title="No Schema Data"
              subtitle="Synchronize your connection to discover the schema."
              className="p-6"
            />
          ) : (
            <>
              <Graph
                nodes={nodes}
                edges={edges}
                selectedNodesIds={selectedNodeId ? [selectedNodeId] : []}
                selectedEdgesIds={selectedEdgeId ? [selectedEdgeId] : []}
                onSelectedElementIdsChange={handleSelectionChange}
                styles={styles}
                layout={layout}
                className="size-full"
                onContextMenu={onContextMenu}
              />
              <SchemaDetailsSidebar
                selection={{ nodeId: selectedNodeId, edgeId: selectedEdgeId }}
                onClose={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
              />
            </>
          )}
        </PanelContent>
      </Panel>
    </div>
  );
}

function SchemaGraphControls() {
  const graphRef = useGraphRef();

  const onZoomIn = () => {
    const cy = graphRef.current?.cytoscape;
    if (!cy) return;
    cy.zoom(cy.zoom() * 1.25);
  };

  const onZoomOut = () => {
    const cy = graphRef.current?.cytoscape;
    if (!cy) return;
    cy.zoom(cy.zoom() / 1.25);
  };

  const onFitToCanvas = () => {
    const cy = graphRef.current?.cytoscape;
    if (!cy) return;
    cy.fit();
  };

  const onRunLayout = () => {
    graphRef.current?.runLayout();
  };

  return (
    <>
      <IconButton
        tooltipText="Re-run Layout"
        icon={<GitCompareArrowsIcon />}
        variant="text"
        onClick={onRunLayout}
      />
      <IconButton
        tooltipText="Zoom to Fit"
        icon={<FullscreenIcon />}
        variant="text"
        onClick={onFitToCanvas}
      />
      <IconButton
        tooltipText="Zoom in"
        icon={<ZoomInIcon />}
        variant="text"
        onClick={onZoomIn}
      />
      <IconButton
        tooltipText="Zoom out"
        icon={<ZoomOutIcon />}
        variant="text"
        onClick={onZoomOut}
      />
    </>
  );
}
