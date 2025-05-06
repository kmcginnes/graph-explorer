import {
  IconButton,
  Input,
  PanelHeaderActionButton,
  Paragraph,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@/components";
import {
  EdgeId,
  edgesAtom,
  nodesAtom,
  SensibleConnection,
  useSensibleConnection,
  VertexId,
} from "@/core";
import { logger } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { ClipboardIcon, ShareIcon } from "lucide-react";
import { compressToBase64, compressToEncodedURIComponent } from "lz-string";
import { Link, useHref } from "react-router";
// import * as base91 from "node-base91";
// import * as smol from "smol-string";
// import * as brotli from "brotli";

/**
 * A button that shows a popover that allows the user to copy a shareable link
 * that contains the connection information and the IDs of the entities in the
 * graph.
 */
export default function ShareLinkButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <PanelHeaderActionButton icon={<ShareIcon />} label="Share Link" />
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-[450px]">
        <ShareableLinkContent />
      </PopoverContent>
    </Popover>
  );
}

function ShareableLinkContent() {
  const linkUrl = useSharableLinkV2();
  const counts = useEntityCounts();

  // const placeholder = linkUrl.isFetching ? "Generating link..." : "";
  // const value = linkUrl.data ?? "";

  // const queryData = useQueryData();
  // const href = useHref({ search: "?data=" + queryData });

  return (
    <div className="flex flex-col gap-4 px-3 py-3">
      <div className="space-y-6">
        <div className="text-lg font-bold leading-none">Share Link</div>
        <div>
          <Paragraph className="text-text-primary text-base">
            The link below contains the node and edge IDs of your current graph
            visualization. It also contains information about the connection to
            your database.
          </Paragraph>
          <Paragraph className="text-text-primary text-base">
            There are {counts.vertexCount} vertices and {counts.edgeCount} edges
            in the graph.
          </Paragraph>
          <Paragraph className="text-text-primary text-base">
            Share this link only with people you trust.
          </Paragraph>
        </div>
        <div className="flex flex-row gap-3">
          <Input
            className="w-full grow"
            readOnly
            name="shareable-link"
            aria-label="Shareable link"
            // placeholder={placeholder}
            value={linkUrl}
          />
          <IconButton
            variant="filled"
            title="Copy to clipboard"
            // disabled={linkUrl.isFetching}
            onClick={() => navigator.clipboard.writeText(linkUrl)}
          >
            {/* {linkUrl.isFetching ? <Spinner /> : <ClipboardIcon />} */}
            <ClipboardIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function useEntityCounts() {
  const vertexCount = useAtomValue(nodesAtom).size;
  const edgeCount = useAtomValue(edgesAtom).size;
  return { vertexCount, edgeCount };
}

function useQueryData() {
  const vertexIds = useAtomValue(nodesAtom).keys().toArray();
  const edgeIds = useAtomValue(edgesAtom).keys().toArray();
  return compressToEncodedURIComponent(
    JSON.stringify({
      vertices: vertexIds,
      edges: edgeIds,
    })
  );
}

function useSharableLinkV2() {
  const data = useQueryData();
  const connection = useSensibleConnection();
  const connectionHash = encodeURIComponent(connection.hash);
  const baseUrl = connection.apiUrl;
  const href = useHref({
    search: `?connection=${connectionHash}&data=${data}`,
  });

  return baseUrl + href;
}

function useSharableLink() {
  const vertexIds = useAtomValue(nodesAtom).keys().toArray();
  const edgeIds = useAtomValue(edgesAtom).keys().toArray();
  const connection = useSensibleConnection();

  const query = useQuery({
    queryKey: ["shareable-link", connection, vertexIds, edgeIds],
    queryFn: () => createShareableLink(connection, vertexIds, edgeIds),
  });

  return query;
}

async function createShareableLink(
  connection: SensibleConnection,
  vertexIds: VertexId[],
  edgeIds: EdgeId[]
) {
  const url = new URL("/restore", connection.apiUrl);

  const params = new URLSearchParams();

  params.append("connection", connection.hash);

  const payload = JSON.stringify({
    vertices: vertexIds,
    edges: edgeIds,
  });
  // base64 encode the data and add it to the URL
  const data = await compressJsonToBase64UrlParam(payload);
  params.append("data", data);

  // add the parameters to the URL
  url.search = params.toString();

  const result = url.toString();

  logger.debug("Created shareable link", result);

  // const decoded = await decodeBase64UrlParamToJson(
  //   url.searchParams.get("data") ?? ""
  // );
  // logger.debug("Decoded data from shareable link", decoded);

  return result;
}

// async function decodeBase64UrlParamToJson(base64Param: string): Promise<any> {
//   const binary = Uint8Array.from(atob(base64Param), c => c.charCodeAt(0));

//   const ds = new DecompressionStream("gzip");
//   const decompressedStream = new Blob([binary]).stream().pipeThrough(ds);
//   const jsonString = await new Response(decompressedStream).text();

//   return JSON.parse(jsonString);
// }

export async function compressJsonToBase64UrlParam(
  value: string,
  compressionFormat: CompressionFormat = "gzip"
): Promise<string> {
  const compressed = await compressWithGzip(value, compressionFormat);

  // Step 5: Base64 encode
  const base64 = btoa(String.fromCharCode(...compressed));

  // Step 6: URL-encode the base64 string
  return base64;
}

export async function compressWithGzip(
  value: string,
  compressionFormat: CompressionFormat
) {
  // Step 2: Encode to Uint8Array
  const encoder = new TextEncoder();
  const input = encoder.encode(value);

  // Step 3: Wrap in a Blob so we can stream it
  const inputBlob = new Blob([input]);

  // Step 4: Compress using GZIP
  const cs = new CompressionStream(compressionFormat);
  const compressedStream = inputBlob.stream().pipeThrough(cs);
  const compressedBuffer = await new Response(compressedStream).arrayBuffer();
  const compressed = new Uint8Array(compressedBuffer);
  return compressed;
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function compressJsonWithLzString(obj: any): Promise<string> {
  const result = compressToEncodedURIComponent(JSON.stringify(obj));
  return result;
}

// export async function compressWithBase91(
//   value: string,
//   compressionFormat: CompressionFormat = "gzip"
// ): Promise<string> {
//   const compressed = await compressWithGzip(value, compressionFormat);
//   const result = base91.encode(compressed);
//   return result;
// }

// export function compressWithSmolWithBase91(value: string): string {
//   const compressed = smol.compress(value);
//   return base91.encode(compressed);
// }
