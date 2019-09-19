import Router from "@koa/router";
import Koa from "koa";



const app = new Koa();

const router = new Router();

router.get("/", async ctx => ctx.body = "Working");

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(80);