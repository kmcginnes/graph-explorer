import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelHeaderCloseButton,
  PanelHeaderActions,
  PanelTitle,
  toHumanString,
  VertexSymbolByType,
} from "@/components";
import {
  useDisplayVertexTypeConfig,
  useVertexTypeTotal,
  type DisplayConfigAttribute,
} from "@/core";

export type NodeLabelDetailsProps = {
  nodeLabel: string;
  onClose: () => void;
};

export function NodeLabelDetails({
  nodeLabel,
  onClose,
}: NodeLabelDetailsProps) {
  const config = useDisplayVertexTypeConfig(nodeLabel);
  const total = useVertexTypeTotal(nodeLabel);

  return (
    <Panel className="max-w-sm shadow-lg">
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <VertexSymbolByType vertexType={nodeLabel} className="size-6" />
          {config.displayLabel}
        </PanelTitle>
        <PanelHeaderActions>
          <PanelHeaderCloseButton onClose={onClose} />
        </PanelHeaderActions>
      </PanelHeader>
      <PanelContent className="space-y-4 p-4">
        <div>
          <div className="text-text-secondary text-sm font-medium">Type</div>
          <div className="text-text-primary">{nodeLabel}</div>
        </div>

        {total != null && (
          <div>
            <div className="text-text-secondary text-sm font-medium">
              Total Count
            </div>
            <div className="text-text-primary">{toHumanString(total)}</div>
          </div>
        )}

        <div>
          <div className="text-text-secondary mb-2 text-sm font-medium">
            Attributes ({config.attributes.length})
          </div>
          {config.attributes.length === 0 ? (
            <div className="text-text-secondary text-sm italic">
              No attributes discovered
            </div>
          ) : (
            <AttributeList attributes={config.attributes} />
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}

function AttributeList({
  attributes,
}: {
  attributes: DisplayConfigAttribute[];
}) {
  return (
    <ul className="space-y-1.5">
      {attributes.map(attr => (
        <li key={attr.name} className="grid grid-cols-2">
          <div className="text-text-primary">{attr.displayLabel}</div>
          <div className="text-muted-foreground bg-muted place-self-end rounded-md px-2 py-0.5 text-right font-mono text-sm lowercase">
            {attr.dataType}
          </div>
        </li>
      ))}
    </ul>
  );
}
