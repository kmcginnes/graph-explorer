import { SearchIcon } from "../../icons";
import { PanelEmptyState } from "../../PanelEmptyState";

const EmptyState = () => {
  return (
    <div className="inset-0 flex justify-center h-full items-center flex-col select-none pointer-events-none">
      <PanelEmptyState
        icon={<SearchIcon />}
        title="To get started, click into the search bar to browse graph data. Click + to add to Graph View."
        size="md"
      />
    </div>
  );
};

export default EmptyState;
