import {
  EdgeIcon,
  Panel,
  PanelContent,
  PanelHeader,
  PanelHeaderCloseButton,
  PanelHeaderActions,
  PanelTitle,
  toHumanString,
  VertexSymbolByType,
} from "@/components";
import { useDisplayEdgeTypeConfig, useEdgeTypeTotal } from "@/core";

export type EdgeConnectionDetailsProps = {
  edgeType: string;
  sourceLabel: string;
  targetLabel: string;
  onClose: () => void;
};

export function EdgeConnectionDetails({
  edgeType,
  sourceLabel,
  targetLabel,
  onClose,
}: EdgeConnectionDetailsProps) {
  const config = useDisplayEdgeTypeConfig(edgeType);
  const total = useEdgeTypeTotal(edgeType);

  return (
    <Panel className="max-w-sm shadow-md">
      <PanelHeader>
        <PanelTitle className="flex items-center gap-2">
          <EdgeIcon className="size-5" />
          {config.displayLabel}
        </PanelTitle>
        <PanelHeaderActions>
          <PanelHeaderCloseButton onClose={onClose} />
        </PanelHeaderActions>
      </PanelHeader>
      <PanelContent className="space-y-4 p-4">
        <div>
          <div className="text-text-secondary text-sm font-medium">Type</div>
          <div className="text-text-primary">{edgeType}</div>
        </div>

        <div>
          <div className="text-text-secondary mb-1 text-sm font-medium">
            Connection
          </div>
          <div className="flex items-center gap-2">
            <VertexSymbolByType vertexType={sourceLabel} className="size-5" />
            <span className="text-text-primary text-sm">{sourceLabel}</span>
            <span className="text-text-secondary">→</span>
            <VertexSymbolByType vertexType={targetLabel} className="size-5" />
            <span className="text-text-primary text-sm">{targetLabel}</span>
          </div>
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
