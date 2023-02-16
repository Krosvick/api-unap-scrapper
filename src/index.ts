/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import funcionarios from "../db/funcionarios.json";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (ctx) => {
	return ctx.json([
		{
			endpoint: "/funcionarios",
			returns: "devuelve todos los funcionarios con contrato"
		}
	])
})

app.get("/funcionarios", (ctx) => {
	return ctx.json(funcionarios);
})

export default app