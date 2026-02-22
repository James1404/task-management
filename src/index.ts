import "dotenv/config";

import express from "express";
import morgan from "morgan";

const app = express();
const PORT = 3000;

import authentication from "./routes/authentication";
import task from "./routes/task";
import user from "./routes/user";

app.use(morgan("common"));

app.use("/static", express.static("public"));

app.use("/auth", authentication);
app.use("/task", task);
app.use("/user", user);

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
