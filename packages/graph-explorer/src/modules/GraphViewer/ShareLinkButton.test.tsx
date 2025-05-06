import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareLinkButton, {
  compressJsonToBase64UrlParam,
  compressWithBase91,
  compressWithSmolWithBase91,
} from "./ShareLinkButton";
import { TooltipProvider } from "@/components";
import {
  createJotaiSnapshot,
  DbState,
  JotaiSnapshot,
  TestProvider,
} from "@/utils/testing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { compressToBase64, compressToEncodedURIComponent } from "lz-string";
import { getRawId } from "@/core";

describe("ShareLinkButton", () => {
  it("should render", async () => {
    renderShareLinkButton();
    await screen.findByText("Share Link");
  });

  it("should show a tooltip", async () => {
    renderShareLinkButton();

    const button = await screen.findByText("Share Link");
    expect(button).toBeInTheDocument();

    await userEvent.hover(button);
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Share Link");
  });

  it("should show a popover when clicked", async () => {
    const dbState = new DbState();
    renderShareLinkButton(snapshot => dbState.applyTo(snapshot));

    const button = await screen.findByText("Share Link");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    const popover = await screen.findByRole("dialog");
    expect(popover).toBeInTheDocument();
  });

  it("should generate link", async () => {
    const dbState = new DbState();
    renderShareLinkButton(snapshot => dbState.applyTo(snapshot));

    const button = await screen.findByText("Share Link");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    const popover = await screen.findByRole("dialog");
    expect(popover).toBeInTheDocument();

    const input: HTMLInputElement =
      await screen.findByLabelText("Shareable link");
    expect(input).toBeInTheDocument();

    await waitFor(() => expect(input.value?.length).toBeTruthy());

    const url = new URL(input.value);
    expect(url.searchParams.get("connection")).toBeTruthy();
    expect(url.searchParams.get("data")).toBeTruthy();
  });

  it("should generate link with graph data", async () => {
    const dbState = new DbState();
    for (let i = 0; i < 100; i++) {
      dbState.createVertexInGraph();
      dbState.createVertexInGraph();
      const vertex1 = dbState.vertices[dbState.vertices.length - 2];
      const vertex2 = dbState.vertices[dbState.vertices.length - 1];
      dbState.createEdgeInGraph(vertex1, vertex2);
      dbState.createEdgeInGraph(vertex2, vertex1);
    }
    renderShareLinkButton(snapshot => dbState.applyTo(snapshot));

    const button = await screen.findByText("Share Link");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    const popover = await screen.findByRole("dialog");
    expect(popover).toBeInTheDocument();

    const input: HTMLInputElement =
      await screen.findByLabelText("Shareable link");
    expect(input).toBeInTheDocument();

    await waitFor(() => expect(input.value?.length).toBeTruthy());

    const url = new URL(input.value);
    expect(url.searchParams.get("data")).toHaveLength(1);
  });

  const renderShareLinkButton = (
    initializeState?: (snapshot: JotaiSnapshot) => void
  ) => {
    // Provide a way to set atom initial values
    const snapshot = createJotaiSnapshot();
    if (initializeState) {
      initializeState(snapshot);
    }

    // Call the standard testing hook with TanStack Query and Jotai setup
    const queryClient = new QueryClient();

    return render(<ShareLinkButton />, {
      wrapper: props => (
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <TestProvider initialValues={snapshot.values()}>
              {props.children}
            </TestProvider>
          </QueryClientProvider>
        </TooltipProvider>
      ),
    });
  };
});

describe("compression", () => {
  it("should compress with gzip", async () => {
    const data = createTestData();

    const lzStringUriComponent = compressToEncodedURIComponent(data);
    const lzStringBase64 = compressToBase64(data);
    const gzipBase64 = await compressJsonToBase64UrlParam(data, "gzip");
    const deflateBase64 = await compressJsonToBase64UrlParam(data, "deflate");
    const gzipBase91 = await compressWithBase91(data, "gzip");
    const deflateBase91 = await compressWithBase91(data, "deflate");
    const smolBase91 = compressWithSmolWithBase91(data);

    const results = {
      lzStringUriComponent: lzStringUriComponent.length,
      lzStringBase64: lzStringBase64.length,
      gzipBase64: gzipBase64.length,
      deflateBase64: deflateBase64.length,
      gzipBase91: gzipBase91.length,
      deflateBase91: deflateBase91.length,
      smol: smolBase91.length,
    };

    expect(results).toEqual({});
  });

  it("should build URL", async () => {
    const data = createTestData();

    const lzStringUriComponent = compressToEncodedURIComponent(data);
    const lzStringBase64 = compressToBase64(data);
    const gzipBase64 = await compressJsonToBase64UrlParam(data, "gzip");
    const deflateBase64 = await compressJsonToBase64UrlParam(data, "deflate");
    const gzipBase91 = await compressWithBase91(data, "gzip");
    const deflateBase91 = await compressWithBase91(data, "deflate");
    const smolBase91 = compressWithSmolWithBase91(data);

    const results = {
      lzStringUriComponent: createTestUrl(lzStringUriComponent),
      // lzStringBase64: createTestUrl(lzStringBase64),
      // gzipBase64: createTestUrl(gzipBase64),
      // deflateBase64: createTestUrl(deflateBase64),
      // gzipBase91: createTestUrl(gzipBase91),
      // deflateBase91: createTestUrl(deflateBase91),
      // smol: createTestUrl(smolBase91),
    };

    expect(results).toEqual({});
  });
});

function createTestUrl(encodedData: string) {
  const url = new URL("http://localhost:5173/?data=" + encodedData);
  return url.toString();
}

function createTestData() {
  const dbState = new DbState();
  for (let i = 0; i < 500; i++) {
    dbState.createVertexInGraph();
    dbState.createVertexInGraph();
    const vertex1 = dbState.vertices[dbState.vertices.length - 2];
    const vertex2 = dbState.vertices[dbState.vertices.length - 1];
    dbState.createEdgeInGraph(vertex1, vertex2);
    dbState.createEdgeInGraph(vertex2, vertex1);
  }
  return JSON.stringify({
    vertices: dbState.vertices.map(v => getRawId(v.id)),
    edges: dbState.edges.map(e => getRawId(e.id)),
  });
}
