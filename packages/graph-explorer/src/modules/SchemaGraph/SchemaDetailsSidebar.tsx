import { Activity } from "react";
import { isVisible } from "@/utils";
import { NodeLabelDetails } from "./NodeLabelDetails";
import { EdgeConnectionDetails } from "./EdgeConnectionDetails";
import type { SchemaGraphSelection } from "./SchemaGraph";
import { useActiveSchema } from "@/core";

export type SchemaDetailsSidebarProps = {
  selection: SchemaGraphSelection;
  onClose: () => void;
};

/** Parses an edge connection ID to extract source, type, and target. */
function parseEdgeConnectionId(edgeId: string) {
  // Format: "sourceLabel-[edgeType]->targetLabel"
  const match = edgeId.match(/^(.+)-\[(.+)\]->(.+)$/);
  if (!match) return null;
  return {
    sourceLabel: match[1],
    edgeType: match[2],
    targetLabel: match[3],
  };
}

export function SchemaDetailsSidebar({
  selection,
  onClose,
}: SchemaDetailsSidebarProps) {
  const schema = useActiveSchema();
  const hasSelection = Boolean(selection.nodeId || selection.edgeId);

  // Find the edge connection details if an edge is selected
  const edgeDetails = selection.edgeId
    ? parseEdgeConnectionId(selection.edgeId)
    : null;

  // Verify the edge connection exists in the schema
  const edgeConnection = edgeDetails
    ? schema.edgeConnections?.find(
        ec =>
          ec.sourceLabel === edgeDetails.sourceLabel &&
          ec.edgeType === edgeDetails.edgeType &&
          ec.targetLabel === edgeDetails.targetLabel,
      )
    : null;

  return (
    <Activity mode={isVisible(hasSelection)}>
      <div className="absolute top-3 right-3 z-20 max-h-[calc(100%-1.5rem)] overflow-auto">
        {selection.nodeId && (
          <NodeLabelDetails nodeLabel={selection.nodeId} onClose={onClose} />
        )}
        {edgeConnection && edgeDetails && (
          <EdgeConnectionDetails
            edgeType={edgeDetails.edgeType}
            sourceLabel={edgeDetails.sourceLabel}
            targetLabel={edgeDetails.targetLabel}
            onClose={onClose}
          />
        )}
      </div>
    </Activity>
  );
}
