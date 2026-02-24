import "@std/dotenv/load";
import { parse } from "@std/yaml";

const env = await load({
    export: true,
});

import express from "express";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = env.PORT ?? 3000;

import authentication from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";
import user from "./routes/user.ts";
import projects from "./routes/projects.ts";
import { load } from "@std/dotenv";

app.use(morgan("common"));

app.use("/static", express.static("public"));

app.use("/auth", authentication);
app.use("/tasks", tasks);
app.use("/user", user);
app.use("/projects", projects);

const file = await Deno.readFile("./openapi/openapi.yaml");
const decoder = new TextDecoder("utf-8");
const swaggerDocument = parse(decoder.decode(file));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
