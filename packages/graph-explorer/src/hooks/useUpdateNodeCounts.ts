import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { VertexId } from "@/types/entities";
import { useNotification } from "@/components/NotificationProvider";
import { neighborsCountQuery } from "@/connector/queries";
import { activeConnectionSelector, explorerSelector } from "@/core/connector";
import useEntities from "./useEntities";
import { VertexIdType } from "@/connector/useGEFetchTypes";

export function useUpdateNodeCountsQuery(
  nodeId: VertexId,
  nodeIdType: VertexIdType
) {
  const connection = useRecoilValue(activeConnectionSelector);
  const explorer = useRecoilValue(explorerSelector);
  return useQuery(
    neighborsCountQuery(
      nodeId,
      nodeIdType,
      connection?.nodeExpansionLimit,
      explorer
    )
  );
}

/**
 * Hook that watches nodes added to the graph and queries the database for
 * neighbor counts. There should be only one instance of this hook in the render
 * pipeline since it uses effects for progress and error notifications.
 */
export function useUpdateAllNodeCounts() {
  const [entities] = useEntities();
  const connection = useRecoilValue(activeConnectionSelector);
  const explorer = useRecoilValue(explorerSelector);
  const { enqueueNotification, clearNotification } = useNotification();

  const query = useQueries({
    queries: entities.nodes
      .values()
      .map(node =>
        neighborsCountQuery(
          node.id,
          node.idType,
          connection?.nodeExpansionLimit,
          explorer
        )
      )
      .toArray(),
    combine: results => {
      // Combines data with existing node data and filters out undefined
      const data = results.flatMap(result =>
        result.data ? [result.data] : []
      );

      return {
        data: data,
        pending: results.some(result => result.isPending),
        errors: results.map(result => result.error),
        hasErrors: results.some(result => result.isError),
      };
    },
  });

  // Show loading notification
  useEffect(() => {
    if (!query.pending) {
      return;
    }
    const notificationId = enqueueNotification({
      title: "Updating Neighbors",
      message: `Updating neighbor counts for new nodes`,
      autoHideDuration: null,
    });
    return () => clearNotification(notificationId);
  }, [clearNotification, query.pending, enqueueNotification]);

  // Show error notification
  useEffect(() => {
    if (query.pending || !query.hasErrors) {
      return;
    }
    const notificationId = enqueueNotification({
      title: "Some Errors Occurred",
      message: `While requesting counts for neighboring nodes, some errors occurred.`,
      type: "error",
    });
    return () => clearNotification(notificationId);
  }, [clearNotification, query.pending, query.hasErrors, enqueueNotification]);

  return query;
}
