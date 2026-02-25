import express from "express";
import prisma from "../client.ts";
import { RouteError } from "../utils.ts";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // const user_id = res.locals["user"] as string;

        const projectId = Number(req.query["projectId"]);
        if (projectId == null) {
            throw new RouteError("Requires project id");
        }

        const tasks = await prisma.task.findMany({ where: { projectId } });

        res.status(200).json(JSON.stringify(tasks));
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: req.body.projectId },
        });

        if (project == null) {
            throw new RouteError("Project does not exist with ID");
        }

        if (project.ownerId != user_id) {
            throw new RouteError("Access denied", 401);
        }

        const task = await prisma.task.create({
            data: {
                title: req.body.title,
                description: req.body.description ?? null,
                status: req.body.status,
                project: { connect: { id: req.body.projectId } },
            },
        });

        res.status(200).json({ id: task.id });
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

export default router;
