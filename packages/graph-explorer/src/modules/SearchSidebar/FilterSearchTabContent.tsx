import useKeywordSearch from "../KeywordSearch/useKeywordSearch";
import { SearchResultsList } from "./SearchResultsList";
import { Checkbox } from "@/components/NewCheckbox/Checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/NewSelect/Select";
import { Input } from "@/components/NewInput/Input";

export function FilterSearchTabContent() {
  const {
    query,
    onSearchTermChange,
    onVertexOptionChange,
    searchPlaceholder,
    searchTerm,
    selectedVertexType,
    vertexOptions,
    selectedAttribute,
    attributesOptions,
    onAttributeOptionChange,
    exactMatch,
    onExactMatchChange,
  } = useKeywordSearch({
    isOpen: true,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-4 border-b border-gray-300 p-3">
        <div className="grid w-full grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-text-primary text-sm">Node Type</label>
            <Select
              value={selectedVertexType}
              onValueChange={onVertexOptionChange}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select a node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {vertexOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-primary text-sm">Attribute</label>
            <Select
              value={selectedAttribute}
              onValueChange={onAttributeOptionChange}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Select an attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {attributesOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Search term</label>
          <Input
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exactMatch"
              checked={!exactMatch}
              onCheckedChange={checked =>
                onExactMatchChange(checked ? "Partial" : "Exact")
              }
            />
            <label
              htmlFor="exactMatch"
              className="text-sm leading-none peer-hover:cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Partial match
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="caseInsensitive" disabled />
            <label
              htmlFor="caseInsensitive"
              className="text-sm leading-none peer-hover:cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Case Insensitive
            </label>
          </div>
        </div>
      </div>
      <SearchResultsList query={query} />
    </div>
  );
}
