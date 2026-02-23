import "@std/dotenv/load";

const env = await load({
    export: true,
});

import express from "express";
import morgan from "morgan";

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

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
