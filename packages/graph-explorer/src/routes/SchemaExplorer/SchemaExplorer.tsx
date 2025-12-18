import { cn } from "@/utils";
import { Link, Navigate } from "react-router";
import {
  buttonStyles,
  NavBar,
  NavBarContent,
  NavBarActions,
  NavBarTitle,
  NavBarVersion,
  PanelEmptyState,
  PanelGroup,
  Workspace,
  WorkspaceContent,
} from "@/components";
import { DatabaseIcon } from "@/components/icons";
import { useConfiguration } from "@/core";
import { LABELS } from "@/utils/constants";

export default function SchemaExplorer() {
  const config = useConfiguration();

  // Redirect to connections if no active connection
  if (!config) {
    return <Navigate to="/connections" replace />;
  }

  return (
    <Workspace>
      <NavBar logoVisible>
        <NavBarContent>
          <NavBarTitle
            title="Schema Explorer"
            subtitle={`Connection: ${config?.displayLabel || config?.id}`}
          />
        </NavBarContent>
        <NavBarActions>
          <NavBarVersion>{__GRAPH_EXP_VERSION__}</NavBarVersion>
          <Link
            to="/connections"
            className={cn(buttonStyles({ variant: "filled" }))}
          >
            <DatabaseIcon />
            Open Connections
          </Link>
        </NavBarActions>
      </NavBar>
      <WorkspaceContent>
        <PanelGroup className="grid">
          <PanelEmptyState
            title="Schema Explorer"
            subtitle={`Visualize the schema for ${config?.displayLabel || config?.id}. Coming soon!`}
            className="p-6"
          />
        </PanelGroup>
      </WorkspaceContent>
    </Workspace>
  );
}
