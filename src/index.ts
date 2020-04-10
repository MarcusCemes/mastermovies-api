import { logger } from "./lib/logger";
import { createServer } from "./server";

process.on("uncaughtException", (err) => {
  logger.fatal({ msg: "Uncaught process exception!", err });
  // @ts-ignore
  process.emit("SIGINT");
  setTimeout(() => process.exit(1), 3000);
});

createServer().catch((err) => {
  logger.fatal({ msg: "Server start-up failed", err });
  process.exit(1);
});
