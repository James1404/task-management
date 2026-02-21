import "dotenv/config";

import express from "express";
import morgan from "morgan";

const app = express();
const PORT = 3000;

import authentication from "./routes/authentication";
import task from "./routes/task";
import { decode } from "./jwt";

app.use(morgan("common"));

app.use("/static", express.static("public"));

app.use("/auth", authentication);
app.use("/task", task);

decode(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZjA0YzAwNy1kZmM2LTQ5YzMtOGY1Yy1hN2ViY2FiYTI0N2EiLCJuYW1lIjoiamFtZXNiYXJuZmF0aGVyOTlAZ21haWwuY29tIiwiaWF0IjoxNzcxNjk5NTg2LjQzMywiZXhwIjoxNzcxNzg1OTg2LjQzM30.B_m1CMfWbLeh4Vmqh0Nx7Lbwj5BMvOcMpQQvuyDF52U",
);

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
