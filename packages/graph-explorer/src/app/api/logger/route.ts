import "server-only";
import { headers } from "next/headers";
import { getLogger } from "@/utils/logging";

export const dynamic = "force-dynamic"; // defaults to auto

export function POST() {
  const headersList = headers();
  const level = headersList.get("level");
  if (level == null) {
    throw new Error("No log level passed.");
  }
  const messageRaw = headersList.get("message");
  if (messageRaw == null) {
    throw new Error("No log message passed.");
  }
  const message = JSON.parse(messageRaw).replaceAll("\\", "");

  const proxyLogger = getLogger();

  if (level.toLowerCase() === "error") {
    proxyLogger.error(message);
  } else if (level.toLowerCase() === "warn") {
    proxyLogger.warn(message);
  } else if (level.toLowerCase() === "info") {
    proxyLogger.info(message);
  } else if (level.toLowerCase() === "debug") {
    proxyLogger.debug(message);
  } else if (level.toLowerCase() === "trace") {
    proxyLogger.trace(message);
  } else {
    throw new Error("Tried to log to an unknown level.");
  }

  return new Response("Logged", { status: 200 });
}
