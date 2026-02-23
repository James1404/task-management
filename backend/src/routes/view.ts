import bodyParser from "body-parser";
import express from "express";
import { auth } from "../jwt";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);
router.use(jsonParser);

router.get("/", async (req, res) => {});

export default router;
