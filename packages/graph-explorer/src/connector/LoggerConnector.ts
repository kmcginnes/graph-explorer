import { trpc } from "./trpc";

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

/** Sends log messages to the server in the connection configuration. */
export const serverLoggerConnector = {
  error(message: unknown) {
    return trpc.log.mutate({
      level: "error",
      message: JSON.stringify(message),
    });
  },
  warn(message: unknown) {
    return trpc.log.mutate({
      level: "warn",
      message: JSON.stringify(message),
    });
  },
  info(message: unknown) {
    return trpc.log.mutate({
      level: "info",
      message: JSON.stringify(message),
    });
  },
  debug(message: unknown) {
    return trpc.log.mutate({
      level: "debug",
      message: JSON.stringify(message),
    });
  },
  trace(message: unknown) {
    return trpc.log.mutate({
      level: "trace",
      message: JSON.stringify(message),
    });
  },
};
