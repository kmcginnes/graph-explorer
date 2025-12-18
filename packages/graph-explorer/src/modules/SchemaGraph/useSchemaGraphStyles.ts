import useGraphStyles from "@/modules/GraphViewer/useGraphStyles";
import type { GraphProps } from "@/components/Graph";

/** Returns styles for the schema graph with node and edge labels displayed. */
export function useSchemaGraphStyles(): GraphProps["styles"] {
  const baseStyles = useGraphStyles();

  return {
    ...baseStyles,
    node: {
      label: "data(displayLabel)",
    },
    edge: {
      label: "data(displayLabel)",
    },
  };
}
