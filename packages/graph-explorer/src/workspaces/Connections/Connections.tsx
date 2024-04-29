import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import Button from "../../components/Button";
import { ExplorerIcon } from "../../components/icons";
import { useConfiguration } from "../../core";
import {
  activeConfigurationAtom,
  configurationAtom,
} from "../../core/StateProvider/configuration";
import useSchemaSync from "../../hooks/useSchemaSync";
import AvailableConnections from "../../modules/AvailableConnections";
import ConnectionDetail from "../../modules/ConnectionDetail";
import {
  NewContainer,
  NewContentArea,
  NewTopBar,
  NewWorkspaceContainer,
} from "../common/NewWorkspace";

const Connections = () => {
  const config = useConfiguration();
  const activeConfig = useRecoilValue(activeConfigurationAtom);
  const configuration = useRecoilValue(configurationAtom);
  const [isModalOpen, setModal] = useState(configuration.size === 0);
  const [isSyncing, setSyncing] = useState(false);

  // Everytime that the active connection changes,
  // if it was not synchronized yet, try to sync it
  const updateSchema = useSchemaSync(setSyncing);
  useEffect(() => {
    if (config?.schema?.triedToSync === true) {
      return;
    }

    updateSchema();
  }, [activeConfig, config?.schema?.triedToSync, updateSchema]);

  return (
    <NewWorkspaceContainer>
      <NewTopBar>
        <div>
          <div>
            <div className="font-bold">Connections Details</div>
            <div>Active connection: {config?.displayLabel || config?.id}</div>
          </div>
        </div>
        <div>
          <Link
            to={
              !activeConfig || !config?.schema?.lastUpdate
                ? "/connections"
                : "/graph-explorer"
            }
          >
            <Button
              isDisabled={!activeConfig || !config?.schema?.lastUpdate}
              className="whitespace-nowrap"
              icon={<ExplorerIcon />}
              variant={"filled"}
            >
              Open Graph Explorer
            </Button>
          </Link>
        </div>
      </NewTopBar>
      <NewContentArea>
        <div className="grid grid-cols-2 h-full gap-3">
          <NewContainer>
            <AvailableConnections
              isSync={isSyncing}
              isModalOpen={isModalOpen}
              onModalChange={setModal}
            />
          </NewContainer>
          {activeConfig ? (
            <NewContainer>
              <ConnectionDetail isSync={isSyncing} onSyncChange={setSyncing} />
            </NewContainer>
          ) : (
            <NewContainer className="flex flex-col justify-center items-center text-xl text-gray-500">
              No Connection Selected
            </NewContainer>
          )}
        </div>
      </NewContentArea>
    </NewWorkspaceContainer>
  );
};

export default Connections;
