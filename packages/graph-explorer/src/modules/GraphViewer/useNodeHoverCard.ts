import { useState } from "react";
import { useLayer, useMousePositionAsTrigger } from "react-laag";

import type { ElementEventCallback } from "@/components/Graph/hooks/useAddClickEvents";

import {
  getVertexIdFromRenderedVertexId,
  type RenderedVertex,
  type VertexId,
} from "@/core";

export function useNodeHoverCard() {
  const [hoveredNodeId, setHoveredNodeId] = useState<VertexId | null>(null);

  const { hasMousePosition, handleMouseEvent, trigger } =
    useMousePositionAsTrigger({ enabled: true, preventDefault: false });

  const clearHoverCard = () => {
    setHoveredNodeId(null);
  };

  const { renderLayer: renderHoverCardLayer, layerProps: hoverCardLayerProps } =
    useLayer({
      isOpen: Boolean(hoveredNodeId),
      overflowContainer: true,
      auto: true,
      placement: "right-center",
      trigger,
      onParentClose: clearHoverCard,
      onDisappear: clearHoverCard,
    });

  const onNodeMouseOver: ElementEventCallback<RenderedVertex["data"]> = (
    event,
    node,
  ) => {
    // Anchor the card to the node's right-center edge.
    // oxlint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    handleMouseEvent(event.originalEvent);

    setHoveredNodeId(getVertexIdFromRenderedVertexId(node.id));
  };

  const onNodeMouseOut: ElementEventCallback<RenderedVertex["data"]> = () => {
    clearHoverCard();
  };

  const isHoverCardOpen = Boolean(hoveredNodeId) && hasMousePosition;

  return {
    hoveredNodeId,
    isHoverCardOpen,
    onNodeMouseOver,
    onNodeMouseOut,
    renderHoverCardLayer,
    hoverCardLayerProps,
  };
}
