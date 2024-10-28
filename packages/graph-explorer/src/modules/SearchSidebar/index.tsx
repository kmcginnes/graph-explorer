import {
  ModuleContainer,
  ModuleContainerContent,
  ModuleContainerHeader,
  ModuleContainerHeaderProps,
} from "@/components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";
import { RawQueryTabContent } from "./RawQueryTabContent";
import { FilterSearchTabContent } from "./FilterSearchTabContent";
import { NaturalLanguageTabContent } from "./NaturalLanguageTabContent";
import { BracesIcon, FilterIcon, SparklesIcon } from "lucide-react";
import { atom, useRecoilState } from "recoil";
import { Suspense } from "react";

export type SearchTabValues = "filter" | "query" | "ask";

export const searchTabSelectionAtom = atom<SearchTabValues>({
  key: "searchTabSelection",
  default: "filter",
});

export interface SearchSidebarPanelProps
  extends Pick<ModuleContainerHeaderProps, "onClose"> {}

export default function SearchSidebarPanel({
  onClose,
}: SearchSidebarPanelProps) {
  const [selectedTab, setSelectedTab] = useRecoilState(searchTabSelectionAtom);

  return (
    <ModuleContainer variant="sidebar">
      <ModuleContainerHeader
        title="Search"
        variant="sidebar"
        onClose={onClose}
      />
      <ModuleContainerContent className="">
        <Tabs
          value={selectedTab}
          onValueChange={value => setSelectedTab(value as SearchTabValues)}
          className="flex h-full grow flex-col"
        >
          <TabsList className="">
            <TabsTrigger value="filter" className="gap-2">
              <FilterIcon className="size-4" /> Filter
            </TabsTrigger>
            <TabsTrigger value="query" className="gap-2">
              <BracesIcon className="size-4" /> Query
            </TabsTrigger>
            <TabsTrigger value="ask" className="gap-2">
              <SparklesIcon className="size-4" />
              Ask
            </TabsTrigger>
          </TabsList>
          <TabsContent value="filter" className="h-full">
            <Suspense>
              <FilterSearchTabContent />
            </Suspense>
          </TabsContent>
          <TabsContent value="query" className="h-full">
            <Suspense>
              <RawQueryTabContent />
            </Suspense>
          </TabsContent>
          <TabsContent value="ask" className="h-full">
            <Suspense>
              <NaturalLanguageTabContent />
            </Suspense>
          </TabsContent>
        </Tabs>
      </ModuleContainerContent>
    </ModuleContainer>
  );
}
