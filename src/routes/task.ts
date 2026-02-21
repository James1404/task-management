import bodyParser from "body-parser";
import express from "express";
import { auth } from "../jwt";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);

router.get("/", (req, res) => {
    let user_id = res.locals["user"] as string;
    res.send(`Hello there from tasks: user = ${user_id}`);
});

export default router;
