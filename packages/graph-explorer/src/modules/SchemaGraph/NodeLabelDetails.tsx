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
import { useDisplayVertexTypeConfig, useVertexTypeTotal } from "@/core";

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
    <Panel className="max-w-sm shadow-md">
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
            <ul className="space-y-1">
              {config.attributes.map(attr => (
                <li
                  key={attr.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary">{attr.displayLabel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PanelContent>
    </Panel>
  );
}
