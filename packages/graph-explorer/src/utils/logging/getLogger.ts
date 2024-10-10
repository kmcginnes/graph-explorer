import "server-only";
import { pino } from "pino";
import { PrettyOptions } from "pino-pretty";

// export type LogLevel = pino.LevelWithSilent;

/** Create a logger instance with pino. */
export function getLogger(options?: { name?: string }) {
  // Check whether we are configured with CloudWatch style
  const loggingInCloudWatch = process.env.LOG_STYLE === "cloudwatch";
  const configuredOptions: PrettyOptions = loggingInCloudWatch
    ? {
        // Avoid colors
        colorize: false,
        // Timestamp is handled by CloudWatch, and hostname/pid are not important
        ignore: "time,hostname,pid",
      }
    : {
        colorize: true,
        translateTime: true,
      };
  const level = process.env.LOG_LEVEL;

  return pino({
    name: options?.name,
    level,
    transport: {
      target: "pino-pretty",
      options: configuredOptions,
    },
  });
}
