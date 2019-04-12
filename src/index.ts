// Entry point, spin up the ExpressJS server
import express from "express";
import routes from "./routes";
const app = express();

const PORT = process.env.PORT || 3000;
app.use(routes);
app.listen(PORT, () =>
  process.stdout.write("MasterMovies API is listening on http://127.0.0.1:" + PORT + "\n"
));