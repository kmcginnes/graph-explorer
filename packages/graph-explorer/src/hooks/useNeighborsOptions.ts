import { useMemo } from "react";
import { Vertex } from "@/types/entities";
import {
  useConfiguration,
  VertexTypeConfig,
} from "@/core/ConfigurationProvider";
import useTextTransform from "./useTextTransform";
import { SelectOption } from "@/components";
import { useUpdateNodeCountsQuery } from "./useUpdateNodeCounts";

export type NeighborOption = SelectOption & {
  config?: VertexTypeConfig;
};

export default function useNeighborsOptions(vertex: Vertex): NeighborOption[] {
  const config = useConfiguration();
  const textTransform = useTextTransform();

  const query = useUpdateNodeCountsQuery(vertex.id, vertex.idType);

  return useMemo(() => {
    const countOfNeighborsByType = query.data?.counts ?? {};

    return Object.keys(countOfNeighborsByType)
      .map(vt => {
        const vConfig = config?.getVertexTypeConfig(vt);

        return {
          label: vConfig?.displayLabel || textTransform(vt),
          value: vt,
          isDisabled: countOfNeighborsByType[vt] === 0,
          config: vConfig,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [config, textTransform, query.data]);
}
