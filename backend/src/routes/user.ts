import bodyParser from "body-parser";
import express from "express";
import { auth } from "../jwt.ts";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);
router.use(jsonParser);

router.get("/", (_, res) => {
    const user_id = res.locals["user"] as string;
    res.send(`Hello there from tasks: user = ${user_id}`);
});

export default router;
