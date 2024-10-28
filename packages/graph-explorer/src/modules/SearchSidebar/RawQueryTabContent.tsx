import { Button } from "@/components";
import { rawQuery } from "@/connector/queries";
import { explorerSelector } from "@/core/connector";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { SearchResultsList } from "./SearchResultsList";
import { asyncLocalForageEffect } from "@/core/StateProvider/localForageEffect";
import { ZapIcon } from "lucide-react";

type QueryFormData = {
  query: string;
};

export const rawQueryInputAtom = atom({
  key: "rawQueryInput",
  default: "",
  effects: [asyncLocalForageEffect("rawQueryInput")],
});

export function RawQueryTabContent() {
  const [rawQueryInput, setRawQueryInput] = useRecoilState(rawQueryInputAtom);

  const { register, handleSubmit } = useForm<QueryFormData>({
    defaultValues: {
      query: rawQueryInput,
    },
  });

  const explorer = useRecoilValue(explorerSelector);
  const query = useQuery(rawQuery({ query: rawQueryInput }, explorer));

  const onSubmit = handleSubmit(data => {
    setRawQueryInput(data.query);
    query.refetch();
  });

  return (
    <div className="flex h-full flex-col">
      <form
        onSubmit={onSubmit}
        className="border-divider flex flex-col gap-4 border-b p-3"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="query" className="text-sm leading-none">
            Query
          </label>
          <textarea
            {...register("query")}
            spellCheck={false}
            wrap="soft"
            className="text-text-primary placeholder:text-text-secondary focus-visible:ring-primary-main flex h-32 min-h-[60px] w-full overflow-auto whitespace-nowrap rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="filled" icon={<ZapIcon />}>
            Run Query
          </Button>
        </div>
      </form>

      <SearchResultsList query={query} />
    </div>
  );
}
