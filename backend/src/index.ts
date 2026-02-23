import "dotenv/config";

import express from "express";
import morgan from "morgan";

const app = express();
const PORT = 3000;

import authentication from "./routes/auth";
import tasks from "./routes/tasks";
import user from "./routes/user";
import projects from "./routes/projects";
import view from "./routes/view";

app.use(morgan("common"));

app.use("/static", express.static("public"));

app.use("/auth", authentication);
app.use("/tasks", tasks);
app.use("/user", user);
app.use("/projects", projects);
app.use("/view", view);

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
