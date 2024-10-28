import { Button } from "@/components";
import { explorerSelector } from "@/core/connector";
import { queryOptions, useQuery, UseQueryResult } from "@tanstack/react-query";
import { ComponentProps, PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { Explorer } from "@/connector/useGEFetchTypes";
import {
  activeSchemaSelector,
  SchemaInference,
} from "@/core/StateProvider/schema";
import { cn } from "@/utils";
import { asyncLocalForageEffect } from "@/core/StateProvider/localForageEffect";
import { searchTabSelectionAtom } from ".";
import { rawQueryInputAtom } from "./RawQueryTabContent";
import { SparkleIcon, ZapIcon } from "lucide-react";

type QueryFormData = {
  query: string;
};

export const naturalLanguageQueryInputAtom = atom({
  key: "naturalLanguageQueryInput",
  default: "",
  effects: [asyncLocalForageEffect("naturalLanguageQueryInput")],
});

const naturalLanguageQuery = (
  query: string,
  schema: SchemaInference | null | undefined,
  explorer: Explorer | null
) => {
  const baseUrl = explorer ? explorer.connection.url : "";
  const nodeSentences =
    schema?.vertices.map(node => {
      const propertyList = node.attributes.map(
        attribute => `  * Property named \`${attribute.name}\``
      );

      const properties =
        propertyList.length > 0
          ? `which has the following properties:\n${propertyList.join("\n")}`
          : "which has no properties";

      return `* Vertex with label \`${node.type}\` ${properties}`;
    }) ?? [];
  const edgeSentences =
    schema?.edges.map(edge => {
      const propertyList = edge.attributes.map(
        attribute => `  * Property named \`${attribute.name}\``
      );

      const properties =
        propertyList.length > 0
          ? `which has the following properties:\n${propertyList.join("\n")}`
          : "which has no properties";

      return `* Edge with label \`${edge.type}\` ${properties}.`;
    }) ?? [];

  const databaseStructure = [...nodeSentences, ...edgeSentences]
    .map(sentence => `${sentence}`)
    .join("\n");

  const promptPrefix = `My database has the following structure:\n\n${databaseStructure}\n\n`;

  const fullQuery = promptPrefix + "\n\n" + query;

  return queryOptions({
    queryKey: ["natural-language", "ask", query, fullQuery, baseUrl],
    staleTime: 0,
    queryFn: async () => {
      if (!baseUrl) {
        return {
          message: "Could not connect to REST API.",
        };
      }

      if (!query) {
        return {
          message: "",
        };
      }

      const data = {
        query: fullQuery,
      };
      const url = new URL("/ask", baseUrl);
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as NaturalLanguageQueryResult;
      return result;
    },
  });
};

type NaturalLanguageQueryResult = {
  message: string;
};

export function NaturalLanguageTabContent() {
  const [rawQueryInput, setRawQueryInput] = useRecoilState(
    naturalLanguageQueryInputAtom
  );

  const { register, handleSubmit } = useForm<QueryFormData>({
    defaultValues: {
      query: rawQueryInput,
    },
  });

  const explorer = useRecoilValue(explorerSelector);
  const schema = useRecoilValue(activeSchemaSelector);
  const query = useQuery(naturalLanguageQuery(rawQueryInput, schema, explorer));

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
            Prompt
          </label>
          <textarea
            {...register("query")}
            className="placeholder:text-text-secondary text-text-primary focus-visible:ring-primary-main flex h-32 min-h-[60px] w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="filled" icon={<SparkleIcon />}>
            Generate Query
          </Button>
        </div>
      </form>

      <QueryResults query={query} />
    </div>
  );
}

function QueryResultsLayout({
  className,
  children,
  ...props
}: PropsWithChildren<ComponentProps<"div">>) {
  return (
    <div className={cn("bg-background-default grow p-3", className)} {...props}>
      {children}
    </div>
  );
}

function QueryResults({
  query,
}: {
  query: UseQueryResult<NaturalLanguageQueryResult, Error>;
}) {
  const setSelectedTab = useSetRecoilState(searchTabSelectionAtom);
  const setRawQuery = useSetRecoilState(rawQueryInputAtom);

  if (query.isPending) {
    return <QueryResultsLayout>Loading...</QueryResultsLayout>;
  }

  if (query.isError) {
    return (
      <QueryResultsLayout>
        Has error: {JSON.stringify(query.error, null, 2)}
      </QueryResultsLayout>
    );
  }

  const copyQuery = () => {
    setSelectedTab("query");
    setRawQuery(query.data.message);
  };

  return (
    <>
      <QueryResultsLayout className="flex h-full flex-col gap-2">
        <div className="">Generated Query</div>
        <pre
          className={cn(
            "text-text-primary grow overflow-x-auto font-mono",
            query.isFetching && "opacity-50"
          )}
        >
          {query.data.message}
        </pre>
      </QueryResultsLayout>
      <div className="bg-background-default border-divider flex justify-end border-t p-3">
        <Button onPress={copyQuery} variant="default" icon={<ZapIcon />}>
          Run Query
        </Button>
      </div>
    </>
  );
}
