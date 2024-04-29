import { cx } from "@emotion/css";
import debounce from "lodash/debounce";
import { Resizable } from "re-resizable";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Button,
  EdgeIcon,
  IconButton,
  NamespaceIcon,
  PanelEmptyState,
} from "../../components";
import {
  DatabaseIcon,
  DetailsIcon,
  EmptyWidgetIcon,
  ExpandGraphIcon,
  FilterIcon,
  GraphIcon,
} from "../../components/icons";
import GridIcon from "../../components/icons/GridIcon";
import { useConfiguration, withClassNamePrefix } from "../../core";
import { edgesSelectedIdsAtom } from "../../core/StateProvider/edges";
import { nodesSelectedIdsAtom } from "../../core/StateProvider/nodes";
import { totalFilteredCount } from "../../core/StateProvider/filterCount";
import { userLayoutAtom } from "../../core/StateProvider/userPreferences";
import { usePrevious } from "../../hooks";
import useTranslations from "../../hooks/useTranslations";
import EdgesStyling from "../../modules/EdgesStyling/EdgesStyling";
import EntitiesFilter from "../../modules/EntitiesFilter";
import EntitiesTabular from "../../modules/EntitiesTabular/EntitiesTabular";
import EntityDetails from "../../modules/EntityDetails";
import GraphViewer from "../../modules/GraphViewer";
import KeywordSearch from "../../modules/KeywordSearch/KeywordSearch";
import Namespaces from "../../modules/Namespaces/Namespaces";
import NodeExpand from "../../modules/NodeExpand";
import NodesStyling from "../../modules/NodesStyling/NodesStyling";
import {
  NewContainer,
  NewContentArea,
  NewSidebarButton,
  NewTopBar,
  NewWorkspaceContainer,
} from "../common/NewWorkspace";

export type GraphViewProps = {
  classNamePrefix?: string;
};

const RESIZE_ENABLE_TOP = {
  top: true,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

const GraphExplorer = ({ classNamePrefix = "ft" }: GraphViewProps) => {
  const pfx = withClassNamePrefix(classNamePrefix);
  const config = useConfiguration();
  const t = useTranslations();
  const hasNamespaces = config?.connection?.queryEngine === "sparql";
  const [userLayout, setUserLayout] = useRecoilState(userLayoutAtom);

  const nodesSelectedIds = useRecoilValue(nodesSelectedIdsAtom);
  const edgesSelectedIds = useRecoilValue(edgesSelectedIdsAtom);
  const nodeOrEdgeSelected =
    nodesSelectedIds.size + edgesSelectedIds.size === 1;
  const filteredEntitiesCount = useRecoilValue(totalFilteredCount);

  const closeSidebar = useCallback(() => {
    setUserLayout(prev => ({
      ...prev,
      activeSidebarItem: null,
    }));
  }, [setUserLayout]);

  const toggleSidebar = useCallback(
    (item: string) => () => {
      setUserLayout(prev => {
        if (prev.activeSidebarItem === item) {
          return {
            ...prev,
            activeSidebarItem: null,
          };
        }

        return {
          ...prev,
          activeSidebarItem: item,
        };
      });
    },
    [setUserLayout]
  );

  const toggleView = useCallback(
    (item: string) => () => {
      setUserLayout(prev => {
        const toggles = new Set(prev.activeToggles);
        if (toggles.has(item)) {
          toggles.delete(item);
        } else {
          toggles.add(item);
        }

        return {
          ...prev,
          activeToggles: toggles,
        };
      });
    },
    [setUserLayout]
  );

  const onTableViewResizeStop = useCallback(
    (_e: unknown, _dir: unknown, _ref: unknown, delta: { height: number }) => {
      setUserLayout(prev => {
        return {
          ...prev,
          tableView: {
            ...(prev.tableView || {}),
            height: (prev.tableView?.height ?? 300) + delta.height,
          },
        };
      });
    },
    [setUserLayout]
  );

  const toggles = userLayout.activeToggles;
  const [customizeNodeType, setCustomizeNodeType] = useState<
    string | undefined
  >();
  const [customizeEdgeType, setCustomizeEdgeType] = useState<
    string | undefined
  >();

  const prevActiveSidebarItem = usePrevious(userLayout.activeSidebarItem);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceAutoOpenDetails = useCallback(
    debounce((nodeOrEdgeSelected: boolean) => {
      if (!nodeOrEdgeSelected) {
        return;
      }

      if (
        userLayout.detailsAutoOpenOnSelection === false ||
        userLayout.activeSidebarItem !== null
      ) {
        return;
      }

      if (prevActiveSidebarItem != null) {
        return;
      }

      setUserLayout(prevState => ({
        ...prevState,
        activeSidebarItem: "details",
      }));
    }, 400),
    [
      setUserLayout,
      prevActiveSidebarItem,
      userLayout.activeSidebarItem,
      userLayout.detailsAutoOpenOnSelection,
    ]
  );

  useEffect(() => {
    debounceAutoOpenDetails(nodeOrEdgeSelected);
  }, [debounceAutoOpenDetails, nodeOrEdgeSelected]);

  // NEW CODE
  //////////////////////////////////////////////////////

  const isSidebarOpen =
    !hasNamespaces && userLayout.activeSidebarItem === "namespaces"
      ? false
      : userLayout.activeSidebarItem !== null;

  return (
    <NewWorkspaceContainer>
      <NewTopBar>
        <div>
          <div className="font-bold">
            Graph Explorer v{__GRAPH_EXP_VERSION__}
          </div>
          <div>Active connection: {config?.displayLabel || config?.id}</div>
        </div>
        <div className="grow flex items-center justify-center">
          <KeywordSearch />
        </div>
        <div className="flex flex-row gap-1 items-center">
          <NewSidebarButton
            tooltipText={
              toggles.has("graph-viewer")
                ? "Hide Graph View"
                : "Show Graph View"
            }
            tooltipPlacement={"bottom-center"}
            active={toggles.has("graph-viewer")}
            icon={<GraphIcon />}
            onPress={toggleView("graph-viewer")}
          />
          <NewSidebarButton
            tooltipText={
              toggles.has("table-view") ? "Hide Table View" : "Show Table View"
            }
            tooltipPlacement={"bottom-center"}
            icon={<GridIcon />}
            onPress={toggleView("table-view")}
            active={toggles.has("table-view")}
          />
          <div className={pfx("v-divider")} />
          <Link to={"/connections"}>
            <Button
              className={pfx("button")}
              icon={<DatabaseIcon />}
              variant={"filled"}
            >
              Open Connections
            </Button>
          </Link>
        </div>
      </NewTopBar>
      <NewContentArea className="flex flex-row gap-3">
        <div className="grow flex flex-col h-full gap-3 min-w-0">
          {toggles.size === 0 && (
            <div style={{ width: "100%", flexGrow: 1 }}>
              <PanelEmptyState
                icon={<EmptyWidgetIcon />}
                title={"No active views"}
                subtitle={
                  "Use toggles in the top-right corner to show/hide views"
                }
              />
            </div>
          )}
          {toggles.size === 0 && (
            <div style={{ width: "100%", flexGrow: 1 }}>
              <PanelEmptyState
                icon={<EmptyWidgetIcon />}
                title={"No active views"}
                subtitle={
                  "Use toggles in the top-right corner to show/hide views"
                }
              />
            </div>
          )}
          {toggles.has("graph-viewer") && (
            <NewContainer className="w-full grow relative">
              <GraphViewer
                onNodeCustomize={setCustomizeNodeType}
                onEdgeCustomize={setCustomizeEdgeType}
              />
            </NewContainer>
          )}
          {toggles.has("table-view") && (
            <Resizable
              enable={RESIZE_ENABLE_TOP}
              size={{
                width: "100%",
                height: !toggles.has("graph-viewer")
                  ? "100%"
                  : userLayout.tableView?.height || 300,
              }}
              minHeight={300}
              onResizeStop={onTableViewResizeStop}
            >
              <NewContainer className="w-full h-full grow">
                <EntitiesTabular />
              </NewContainer>
            </Resizable>
          )}
        </div>
        <NewContainer className="flex flex-row h-full flex-shrink-0">
          <div
            className={cx(
              "flex flex-col gap-3 p-3",
              isSidebarOpen && "border-e border-gray-200"
            )}
          >
            <NewSidebarButton
              tooltipText={"Details"}
              icon={<DetailsIcon />}
              onPress={toggleSidebar("details")}
              active={userLayout.activeSidebarItem === "details"}
            />
            <NewSidebarButton
              tooltipText={"Filters"}
              icon={<FilterIcon />}
              onPress={toggleSidebar("filters")}
              badge={filteredEntitiesCount}
              badgeVariant="undetermined"
              badgePlacement="top-right"
              active={userLayout.activeSidebarItem === "filters"}
            />
            <NewSidebarButton
              tooltipText={"Expand"}
              icon={<ExpandGraphIcon />}
              onPress={toggleSidebar("expand")}
              active={userLayout.activeSidebarItem === "expand"}
            />
            <NewSidebarButton
              tooltipText={t("nodes-styling.title")}
              icon={<GraphIcon />}
              onPress={toggleSidebar("nodes-styling")}
              active={userLayout.activeSidebarItem === "nodes-styling"}
            />
            <NewSidebarButton
              tooltipText={t("edges-styling.title")}
              icon={<EdgeIcon />}
              onPress={toggleSidebar("edges-styling")}
              active={userLayout.activeSidebarItem === "edges-styling"}
            />
            {hasNamespaces && (
              <NewSidebarButton
                tooltipText={"Namespaces"}
                icon={<NamespaceIcon />}
                onPress={toggleSidebar("namespaces")}
                active={userLayout.activeSidebarItem === "namespaces"}
              />
            )}
          </div>
          <div className={cx("w-[24rem] min-w-0", !isSidebarOpen && "hidden")}>
            {userLayout.activeSidebarItem === "details" && (
              <EntityDetails onClose={closeSidebar} />
            )}
            {userLayout.activeSidebarItem === "expand" && (
              <NodeExpand onClose={closeSidebar} />
            )}
            {userLayout.activeSidebarItem === "filters" && (
              <EntitiesFilter onClose={closeSidebar} />
            )}
            {userLayout.activeSidebarItem === "nodes-styling" && (
              <NodesStyling
                onClose={closeSidebar}
                customizeNodeType={customizeNodeType}
                onNodeCustomize={setCustomizeNodeType}
              />
            )}
            {userLayout.activeSidebarItem === "edges-styling" && (
              <EdgesStyling
                onClose={closeSidebar}
                customizeEdgeType={customizeEdgeType}
                onEdgeCustomize={setCustomizeEdgeType}
              />
            )}
            {userLayout.activeSidebarItem === "namespaces" && (
              <Namespaces onClose={closeSidebar} />
            )}
          </div>
        </NewContainer>
      </NewContentArea>
    </NewWorkspaceContainer>
  );
};

export default GraphExplorer;
