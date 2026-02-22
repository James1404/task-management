import bodyParser from "body-parser";
import express from "express";
import { auth } from "../jwt";
import prisma from "../client";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);
router.use(jsonParser);

router.get("/", async (req, res) => {
    try {
        // const user_id = res.locals["user"] as string;

        const projectId = Number(req.query["projectId"]);
        if (projectId == null) {
            throw new Error("Requires project id");
        }

        const tasks = await prisma.task.findMany({ where: { projectId } });

        res.status(200).json(JSON.stringify(tasks));
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
