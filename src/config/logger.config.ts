// Custom information logger instead of console.log()
import pino, { LoggerOptions } from "pino";
import { ENV } from "./env.config.js";

const loggerOptions: LoggerOptions = {
  level: ENV.NODE_ENV === "development" ? "debug" : "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(ENV.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid, hostname",
      },
    },
  }),
};

export const logger = pino(loggerOptions);
