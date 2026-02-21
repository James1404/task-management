import bodyParser from "body-parser";
import express from "express";
import { auth } from "../auth";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);

router.get("/", (req, res) => {
    res.send("Hello there from tasks");
});

export default router;
