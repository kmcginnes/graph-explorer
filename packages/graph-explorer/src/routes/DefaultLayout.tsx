import { QueryClientProvider } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";

import { TooltipProvider } from "@/components";
import { Toaster } from "@/components/Toaster";
import { PostMessagePrompt } from "@/connector/localData/PostMessagePrompt";
import { useLocalDataLoader } from "@/connector/localData/useLocalDataLoader";
import { usePostMessageListener } from "@/connector/localData/usePostMessageListener";
import { diagnosticLoggingAtom } from "@/core";
import AppErrorPage from "@/core/AppErrorPage";
import AppStatusLoader from "@/core/AppStatusLoader";
import { setDiagnosticLogging } from "@/utils/logger";

import { createQueryClient } from "../core/queryClient";

const queryClient = createQueryClient();

/** Bridges the diagnosticLogging Jotai atom to the logger's module-level flag. */
function useSyncDiagnosticLogging() {
  const enabled = useAtomValue(diagnosticLoggingAtom);
  useEffect(() => {
    setDiagnosticLogging(enabled);
    return () => setDiagnosticLogging(false);
  }, [enabled]);
}

/**
 * The default layout for the app, which sets up the query client, a global
 * error boundary, and other app wide services.
 */
export default function DefaultLayout() {
  useSyncDiagnosticLogging();

  return (
    <ErrorBoundary FallbackComponent={AppErrorPage}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <AppStatusLoader>
            <LocalDataLoaderMount />
            <PostMessageListenerMount />
            <Outlet />
            <Toaster />
          </AppStatusLoader>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/** Mounts the local data loader hook to handle local data connection activation. */
function LocalDataLoaderMount() {
  useLocalDataLoader();
  return null;
}

/** Mounts the postMessage listener and shows the prompt dialog when data arrives. */
function PostMessageListenerMount() {
  const { pending, dismiss } = usePostMessageListener();
  if (!pending) {
    return null;
  }
  return <PostMessagePrompt pending={pending} onDismiss={dismiss} />;
}
