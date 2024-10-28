import { Vertex } from "@/@types/entities";
import { VertexIcon, Button, DeleteIcon } from "@/components";
import { vertexDetailsQuery } from "@/connector/queries";
import { useConfiguration } from "@/core";
import { explorerSelector } from "@/core/connector";
import useDisplayNames from "@/hooks/useDisplayNames";
import {
  useAddToGraph,
  useHasNodeBeenAddedToGraph,
  useRemoveNodeFromGraph,
} from "@/hooks/useFetchNode";
import useTextTransform from "@/hooks/useTextTransform";
import { cn } from "@/utils";
import DEFAULT_ICON_URL from "@/utils/defaultIconUrl";
import { useQuery } from "@tanstack/react-query";
import { ChevronRightIcon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { useRecoilValue } from "recoil";

export function NodeSearchResult({ node }: { node: Vertex }) {
  const [expanded, setExpanded] = useState(false);
  const getDisplayNames = useDisplayNames();
  const textTransform = useTextTransform();

  const explorer = useRecoilValue(explorerSelector);
  const detailsQuery = useQuery(
    vertexDetailsQuery(
      node.__isFragment ? { vertexId: node.id } : null,
      explorer
    )
  );

  const config = useConfiguration();
  const displayNode = detailsQuery.data?.vertex ?? node;
  const { name, longName } = getDisplayNames(displayNode);

  const vtConfig = config?.getVertexTypeConfig(displayNode.type);
  const nodeType = vtConfig?.displayLabel || textTransform(displayNode.type);

  const addToGraph = useAddToGraph([displayNode], []);
  const removeFromGraph = useRemoveNodeFromGraph(displayNode.id);
  const hasBeenAdded = useHasNodeBeenAddedToGraph(displayNode.id);

  return (
    <div
      className={cn(
        "bg-background-default group w-full overflow-hidden transition-all hover:cursor-pointer"
      )}
      data-expanded={expanded}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        className="group-data-[expanded=true]:border-background-secondary group flex w-full flex-row items-center gap-2 p-3 text-left ring-0"
      >
        <div>
          <ChevronRightIcon className="text-primary-dark/50 size-5 transition-transform duration-200 ease-in-out group-data-[expanded=true]:rotate-90" />
        </div>
        <div className="flex grow flex-row items-center gap-3">
          <div>
            <div className="text-primary-main bg-primary-main/20 grid size-12 place-content-center rounded-full text-[2em]">
              <VertexIcon
                iconUrl={DEFAULT_ICON_URL}
                iconImageType="image/svg+xml"
                className="size-8"
              />
            </div>
          </div>
          <div className="flex grow flex-col items-start">
            <div className="text-base font-bold leading-snug">
              {nodeType} &rsaquo; {name}
            </div>
            <div className="text-text-secondary/90 line-clamp-2 text-base leading-snug">
              {longName}
            </div>
          </div>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center">
          {hasBeenAdded ? (
            <Button
              icon={<DeleteIcon />}
              iconPlacement="end"
              variant="text"
              className="text-warning-dark hover:text-warning-main"
              onPress={removeFromGraph}
            >
              <span className="sr-only">Remove</span>
            </Button>
          ) : (
            <Button
              icon={<PlusCircleIcon />}
              variant="text"
              className="text-primary-dark hover:text-primary-main"
              onPress={addToGraph}
            >
              <span className="sr-only">Add to Graph</span>
            </Button>
          )}
        </div>
      </div>
      <div className="border-background-secondary px-8 transition-all group-data-[expanded=false]:h-0 group-data-[expanded=true]:h-auto group-data-[expanded=true]:border-t">
        <ul>
          {Object.keys(displayNode.attributes).map(attributeName => (
            <li
              key={attributeName}
              className="flex flex-col gap-1 border-b border-gray-200 px-3 py-2 last:border-0"
            >
              <div className="text-text-secondary text-sm">{attributeName}</div>
              <div className="text-text-primary">
                {displayNode.attributes[attributeName]}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
