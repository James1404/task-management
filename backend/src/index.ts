import "@std/dotenv/load";
import { parse } from "@std/yaml";

import express, { ErrorRequestHandler } from "express";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";

import * as OpenApiValidator from "express-openapi-validator";

import authentication from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";
import user from "./routes/user.ts";
import projects from "./routes/projects.ts";
import { load } from "@std/dotenv";
import process from "node:process";
import { auth } from "./jwt.ts";

const env = await load({
    export: true,
});

const app = express();
const PORT = env.PORT ?? 3000;

const file = await Deno.readFile("./openapi/openapi.yaml");
const decoder = new TextDecoder("utf-8");
const swaggerDocument = parse(decoder.decode(file));

app.use(morgan("common"));

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));

app.use(
    OpenApiValidator.middleware({
        apiSpec: "./openapi/openapi.yaml",
        validateRequests: true,
        validateSecurity: true,
    }),
);

app.use("/auth", authentication);
app.use("/user", auth, user);
app.use("/projects", auth, projects);
app.use("/tasks", auth, tasks);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.use(((err, _, res) => {
    // format error
    console.log(err);

    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
}) as ErrorRequestHandler);

const server = app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
    console.debug("SIGTERM signal received: closing HTTP server");

    server.close(() => {
        console.debug("HTTP server closed");
    });
});
