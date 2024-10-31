import { useCallback, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { BadgeRenderer } from "@/components/Graph/hooks/useRenderBadges";
import { useConfiguration } from "@/core";
import { nodesAtom } from "@/core/StateProvider/nodes";
import useDisplayNames from "@/hooks/useDisplayNames";
import useTextTransform from "@/hooks/useTextTransform";
import { VertexId } from "@/@types/entities";
import { useUpdateAllNodeCounts } from "@/hooks/useUpdateNodeCounts";
import { getNeighborsByIdSelector } from "@/core/StateProvider/entitiesSelector";

const useNodeBadges = () => {
  const config = useConfiguration();
  const textTransform = useTextTransform();
  const getDisplayNames = useDisplayNames();
  const nodes = useRecoilValue(nodesAtom);

  const neighborCountQueries = useUpdateAllNodeCounts();
  const getExpandedNeighbors = useRecoilValue(getNeighborsByIdSelector);
  const map = new Map(neighborCountQueries.data.map(x => [x.nodeId, x]));

  const nodesCurrentNames = useMemo(() => {
    return new Map(
      nodes.entries().map(([id, node]) => {
        const vtConfig = config?.getVertexTypeConfig(node.type);
        const title = vtConfig?.displayLabel || textTransform(node.type);
        const { name } = getDisplayNames(node);
        return [id, { name, title }];
      })
    );
  }, [config, getDisplayNames, nodes, textTransform]);

  return useCallback(
    (outOfFocusIds: Set<VertexId>): BadgeRenderer =>
      (nodeData, boundingBox, { zoomLevel }) => {
        // Ensure we have the node name and title
        const name = nodesCurrentNames.get(nodeData.id)?.name ?? "";
        const title = nodesCurrentNames.get(nodeData.id)?.title ?? "";
        const counts = map.get(nodeData.id);
        const expandedNeighbors = getExpandedNeighbors(nodeData.id);
        const unfetched = counts
          ? counts.totalCount - expandedNeighbors.uniqueNeighbors.size
          : 0;

        return [
          {
            text: name,
            hidden: zoomLevel === "small" || outOfFocusIds.has(nodeData.id),
            title: zoomLevel === "large" ? title : undefined,
            maxWidth: zoomLevel === "large" ? 80 : 50,
            anchor: "center",
            fontSize: 7,
            borderRadius: 2,
            backgroundColor: "rgba(29,37,49,0.6)",
            paddingLeft: 2,
            paddingRight: 2,
            paddingBottom: 2,
            paddingTop: 2,
            boundingBox: {
              x: boundingBox.x + boundingBox.width / 2,
              y: boundingBox.y + boundingBox.height - 6,
              width: "auto",
              height: "auto",
            },
          },
          {
            hidden:
              zoomLevel === "small" ||
              outOfFocusIds.has(nodeData.id) ||
              !unfetched,
            text: String(unfetched),
            anchor: "center",
            fontSize: 5,
            borderRadius: 4,
            backgroundColor: "rgba(29,37,49,0.6)",
            paddingLeft: 3,
            paddingRight: 3,
            boundingBox: {
              x: boundingBox.x + boundingBox.width / 2,
              y: boundingBox.y - 6,
              width: "auto",
              height: "auto",
            },
          },
        ];
      },
    [getExpandedNeighbors, map, nodesCurrentNames]
  );
};

export default useNodeBadges;
