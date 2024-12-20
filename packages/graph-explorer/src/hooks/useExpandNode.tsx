import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useNotification } from "@/components/NotificationProvider";
import type {
  NeighborsRequest,
  NeighborsResponse,
} from "@/connector/useGEFetchTypes";
import {
  activeConnectionSelector,
  explorerSelector,
  loggerSelector,
} from "@/core/connector";
import useEntities from "./useEntities";
import { useRecoilValue } from "recoil";
import { useMutation } from "@tanstack/react-query";
import { Vertex } from "@/types/entities";
import { useUpdateAllNodeCounts } from "./useUpdateNodeCounts";
import { createDisplayError } from "@/utils/createDisplayError";
import { toNodeMap } from "@/core/StateProvider/nodes";
import { toEdgeMap } from "@/core/StateProvider/edges";

/*

# Developer Note

Since the expand request could come from the GraphViewer or the sidebar, we must
encapsulate the logic within a React context. This ensures the dependent queries
will be run regardless if the view is unmounted.

*/

type ExpandNodeFilters = Omit<
  NeighborsRequest,
  "vertexId" | "idType" | "vertexType"
>;

export type ExpandNodeRequest = {
  vertex: Vertex;
  filters?: ExpandNodeFilters;
};

export type ExpandNodeContextType = {
  expandNode: (vertex: Vertex, filters?: ExpandNodeFilters) => void;
  isPending: boolean;
};

const ExpandNodeContext = createContext<ExpandNodeContextType | null>(null);

export function ExpandNodeProvider(props: PropsWithChildren) {
  // Wires up node count query in response to new nodes in the graph
  useUpdateAllNodeCounts();

  const explorer = useRecoilValue(explorerSelector);
  const [_, setEntities] = useEntities();
  const { enqueueNotification, clearNotification } = useNotification();
  const remoteLogger = useRecoilValue(loggerSelector);

  const { isPending, mutate } = useMutation({
    mutationFn: async (
      expandNodeRequest: ExpandNodeRequest
    ): Promise<NeighborsResponse | null> => {
      // Perform the query when a request exists
      const request: NeighborsRequest | null = expandNodeRequest && {
        vertexId: expandNodeRequest.vertex.id,
        idType: expandNodeRequest.vertex.idType,
        vertexType:
          expandNodeRequest.vertex.types?.join("::") ??
          expandNodeRequest.vertex.type,
        ...expandNodeRequest.filters,
      };

      if (!explorer || !request) {
        return null;
      }

      return await explorer.fetchNeighbors(request);
    },
    onSuccess: data => {
      if (!data) {
        return;
      }
      // Update nodes and edges in the graph
      setEntities({
        nodes: toNodeMap(data.vertices),
        edges: toEdgeMap(data.edges),
      });
    },
    onError: error => {
      remoteLogger.error(`Failed to expand node: ${error.message}`);
      const displayError = createDisplayError(error);
      // Notify the user of the error
      enqueueNotification({
        title: "Expanding Node Failed",
        message: displayError.message,
        type: "error",
      });
    },
  });

  // Show a loading message to the user
  useEffect(() => {
    if (!isPending) {
      return;
    }
    // const displayName = getDisplayNames(expandNodeRequest.vertex);
    const notificationId = enqueueNotification({
      title: "Expanding Node",
      // message: `Expanding the node ${displayName.name}`,
      message: "Expanding neighbors for the given node.",
      stackable: true,
    });

    return () => clearNotification(notificationId);
  }, [clearNotification, enqueueNotification, isPending]);

  const connection = useRecoilValue(activeConnectionSelector);
  const expandNode = useCallback(
    (vertex: Vertex, filters?: ExpandNodeFilters) => {
      const request: ExpandNodeRequest = {
        vertex,
        filters: {
          ...filters,
          limit: filters?.limit || connection?.nodeExpansionLimit,
        },
      };

      // Only allow expansion if we are not busy with another expansion
      if (isPending) {
        return;
      }

      if (vertex.__unfetchedNeighborCount === 0) {
        enqueueNotification({
          title: "No more neighbors",
          message:
            "This vertex has been fully expanded or it does not have connections",
        });
        return;
      }

      mutate(request);
    },
    [connection?.nodeExpansionLimit, enqueueNotification, isPending, mutate]
  );

  const value: ExpandNodeContextType = {
    expandNode,
    isPending,
  };

  return (
    <ExpandNodeContext.Provider value={value}>
      {props.children}
    </ExpandNodeContext.Provider>
  );
}

/**
 * Provides a callback to submit a node expansion request, the query
 * information, and a callback to reset the request state.
 */
export default function useExpandNode() {
  const value = useContext(ExpandNodeContext);
  if (!value) {
    throw new Error("useExpandNode must be used within <ExpandNodeProvider>");
  }
  return value;
}
