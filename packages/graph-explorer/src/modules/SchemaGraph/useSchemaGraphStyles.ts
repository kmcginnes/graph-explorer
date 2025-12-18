import useGraphStyles from "@/modules/GraphViewer/useGraphStyles";
import type { GraphProps } from "@/components/Graph";
import type { EdgeSingular, NodeSingular } from "cytoscape";

const BASE_FONT_SIZE = 12;
const BASE_TEXT_MARGIN = 4;
const BASE_MAX_WIDTH = 100;

/** Returns styles for the schema graph with node labels displayed. */
export function useSchemaGraphStyles(): GraphProps["styles"] {
  const baseStyles = useGraphStyles();

  return {
    ...baseStyles,
    // Add node label styling for all nodes with zoom-independent sizing
    node: {
      label: "data(displayLabel)",
      "text-valign": "bottom",
      "text-halign": "center",
      // Divide by zoom to keep rendered size constant
      "text-margin-y": (ele: NodeSingular) =>
        String(BASE_TEXT_MARGIN / ele.cy().zoom()),
      "font-size": (ele: NodeSingular) =>
        String(BASE_FONT_SIZE / ele.cy().zoom()),
      "text-wrap": "ellipsis",
      "text-max-width": (ele: NodeSingular) =>
        String(BASE_MAX_WIDTH / ele.cy().zoom()),
    },
    // Add edge label styling with zoom-independent sizing
    edge: {
      label: "data(displayLabel)",
      "text-rotation": "autorotate",
      // Divide by zoom to keep rendered size constant
      "font-size": (ele: EdgeSingular) =>
        String(BASE_FONT_SIZE / ele.cy().zoom()),
      "text-wrap": "ellipsis",
      "text-max-width": (ele: EdgeSingular) =>
        String(BASE_MAX_WIDTH / ele.cy().zoom()),
    },
  };
}
