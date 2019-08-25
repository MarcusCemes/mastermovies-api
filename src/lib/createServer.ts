import { createServer } from "http";
import Koa from "koa";
import pEvent from "p-event";
import stoppable from "stoppable";
import { promisify } from "util";

/** Create a server and listen on port */
export async function startServer(app: Koa, host: string, port: number) {
  const server = stoppable(createServer(app.callback()), 5000); // timeout 5s
  server.listen(port, host);
  server.stop = promisify(server.stop);

  await pEvent(server, "listening");
  return server;
}
