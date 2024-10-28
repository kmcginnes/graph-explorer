import {
  PanelEmptyState,
  LoadingSpinner,
  PanelError,
  SearchSadIcon,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components";
import { KeywordSearchResponse } from "@/connector/useGEFetchTypes";
import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { useCancelKeywordSearch } from "../KeywordSearch/useKeywordSearchQuery";
import { NodeSearchResult } from "./NodeSearchResult";
import { useAddToGraph } from "@/hooks/useFetchNode";
import { vertexDetailsQuery, edgeDetailsQuery } from "@/connector/queries";
import { explorerSelector } from "@/core/connector";
import { useRecoilValue } from "recoil";
import { EdgeSearchResult } from "./EdgeSearchResult";
import { MappedQueryResults } from "@/connector/gremlin/mappers/mapResults";
import { ScalarSearchResult } from "./ScalarSearchResult";
import { PlusCircleIcon } from "lucide-react";

export function SearchResultsList({
  query,
}: {
  query: UseQueryResult<KeywordSearchResponse | null, Error>;
}) {
  const cancelAll = useCancelKeywordSearch();

  if (query.isLoading) {
    return (
      <PanelEmptyState
        title="Searching..."
        subtitle="Looking for matching results"
        actionLabel="Cancel"
        onAction={() => cancelAll()}
        icon={<LoadingSpinner />}
        className="p-8"
      />
    );
  }

  if (query.isError && !query.data) {
    return (
      <PanelError error={query.error} onRetry={query.refetch} className="p-8" />
    );
  }

  if (
    !query.data ||
    (query.data.vertices.length === 0 &&
      query.data.edges.length === 0 &&
      query.data.scalars.length === 0)
  ) {
    return (
      <PanelEmptyState
        title="No Results"
        subtitle="Your criteria does not match with any record"
        icon={<SearchSadIcon />}
        className="p-8"
      />
    );
  }

  return <LoadedResults {...query.data} />;
}

function LoadedResults({ vertices, edges, scalars }: MappedQueryResults) {
  const explorer = useRecoilValue(explorerSelector);

  const vertexDetailsQueries = useQueries({
    queries: vertices.map(v => ({
      ...vertexDetailsQuery(
        v.__isFragment ? { vertexId: v.id } : null,
        explorer
      ),
      placeholderData: { vertex: v },
    })),
  });

  const edgeDetailsQueries = useQueries({
    queries: edges.map(e => ({
      ...edgeDetailsQuery(e.__isFragment ? { edgeId: e.id } : null, explorer),
      placeholderData: { edge: e },
    })),
  });

  const fullVertices = vertexDetailsQueries
    .map(q => q.data?.vertex)
    .filter(v => v != null);
  const fullEdges = edgeDetailsQueries
    .map(q => q.data?.edge)
    .filter(v => v != null);

  const sendToGraph = useAddToGraph(fullVertices, fullEdges);
  const canSendToGraph = fullVertices.length > 0 || fullEdges.length > 0;

  const counts = [
    vertices.length ? `${vertices.length} nodes` : null,
    edges.length ? `${edges.length} edges` : null,
    scalars.length ? `${scalars.length} values` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <div className="bg-background-contrast/35 grow p-3">
        <ul className="flex flex-col overflow-hidden rounded-xl border shadow">
          {fullVertices.map(entity => (
            <li
              key={`node:${entity.type}:${entity.id}`}
              className="border-divider border-b last:border-0"
            >
              <NodeSearchResult node={entity} />
            </li>
          ))}
          {fullEdges.map(entity => (
            <li
              key={`edge:${entity.type}:${entity.id}`}
              className="border-divider border-b last:border-0"
            >
              <EdgeSearchResult edge={entity} />
            </li>
          ))}
          {scalars.map((entity, index) => (
            <li
              key={`scalar:${String(entity)}:${index}`}
              className="border-divider border-b last:border-0"
            >
              <ScalarSearchResult scalar={entity} />
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-background-default sticky bottom-0 flex flex-col border-t border-gray-300">
        <div className="flex flex-row items-center justify-between border-b px-3 py-3">
          <Button
            icon={<PlusCircleIcon />}
            onPress={sendToGraph}
            isDisabled={!canSendToGraph}
          >
            Add all
          </Button>
          <div className="flex items-center gap-2">
            <div className="text-text-secondary text-sm">
              {counts || "No results"}
            </div>
            <div className="flex">
              <Button
                icon={<ChevronLeftIcon />}
                variant="default"
                isDisabled={true}
                className="rounded-e-none"
              >
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                icon={<ChevronRightIcon />}
                iconPlacement="end"
                variant="default"
                isDisabled={true}
                className="rounded-s-none"
              >
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
