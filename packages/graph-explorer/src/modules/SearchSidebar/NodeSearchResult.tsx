import { Vertex } from "@/@types/entities";
import { Button, Tooltip, VertexRow } from "@/components";
import {
  useAddToGraph,
  useHasNodeBeenAddedToGraph,
  useRemoveNodeFromGraph,
} from "@/hooks";
import { cn } from "@/utils";
import {
  ChevronRightIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "lucide-react";
import { useState } from "react";

export function NodeSearchResult({ node }: { node: Vertex }) {
  const [expanded, setExpanded] = useState(false);
  const addToGraph = useAddToGraph(node);
  const removeFromGraph = useRemoveNodeFromGraph(node.id);
  const hasBeenAdded = useHasNodeBeenAddedToGraph(node.id);

  return (
    <div
      className={cn(
        "bg-background-default group w-full overflow-hidden transition-all"
      )}
      data-expanded={expanded}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        className="group-data-[expanded=true]:border-background-secondary group flex w-full flex-row items-center gap-2 p-3 text-left ring-0 hover:cursor-pointer"
      >
        <div>
          <ChevronRightIcon className="text-primary-dark/50 size-5 transition-transform duration-200 ease-in-out group-data-[expanded=true]:rotate-90" />
        </div>
        <VertexRow vertex={node} className="grow" />
        <Tooltip
          text={hasBeenAdded ? "Remove node from view" : "Add node to view"}
          delayEnter={200}
        >
          <div className="flex size-8 shrink-0 items-center justify-center">
            {hasBeenAdded ? (
              <Button
                icon={<MinusCircleIcon />}
                variant="text"
                onPress={removeFromGraph}
              >
                <span className="sr-only">Remove node from view</span>
              </Button>
            ) : (
              <Button
                icon={<PlusCircleIcon />}
                variant="text"
                onPress={addToGraph}
              >
                <span className="sr-only">Add node to view</span>
              </Button>
            )}
          </div>
        </Tooltip>
      </div>
      <div className="border-background-secondary px-8 transition-all group-data-[expanded=false]:h-0 group-data-[expanded=true]:h-auto group-data-[expanded=true]:border-t">
        <ul>
          {Object.keys(node.attributes).map(attributeName => (
            <li
              key={attributeName}
              className="flex flex-col gap-1 border-b border-gray-200 px-3 py-2 last:border-0"
            >
              <div className="text-text-secondary text-sm">{attributeName}</div>
              <div className="text-text-primary">
                {node.attributes[attributeName]}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
