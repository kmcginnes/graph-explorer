import { SearchIcon } from "@/components/icons";
import { PlusCircleIcon } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8">
      <div className="bg-primary-dark/75 size-24 rounded-full p-5">
        <SearchIcon className="h-full w-full text-white/75" />
      </div>
      <div className="text-primary-dark max-w-lg space-y-2 text-center text-lg">
        <div className="text-xl font-bold">Search For Vertices</div>
        <div className="text-balance leading-snug">
          To get started, use the search sidebar panel to browse graph data.
          Click the <PlusCircleIcon className="-mt-1 inline size-5" /> to add to
          Graph View.
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
