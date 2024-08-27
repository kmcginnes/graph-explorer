import { z } from "zod";
import { LogLevelSchema, logMessage } from "./logging.js";
import { createExpressMiddleware, publicProcedure, router } from "./trpc.js";

const appRouter = router({
  /** Logs a message to the server log stream. */
  log: publicProcedure
    .input(
      z.object({
        level: LogLevelSchema,
        message: z.string(),
      })
    )
    .mutation(opts => {
      const level = opts.input.level;
      const message = opts.input.message;

      logMessage(level, message);

      return {
        message: "Log received.",
      };
    }),
});

export type AppRouter = typeof appRouter;

export function createRouterMiddleware() {
  return createExpressMiddleware(appRouter);
}
