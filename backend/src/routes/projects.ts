import express from "express";
import prisma from "../client.ts";
import { RouteError } from "../utils.ts";

const router = express.Router();

router.get("/", async (_, res) => {
    const user_id = res.locals["user"] as string;

    const projects = await prisma.project.findMany({
        where: { ownerId: user_id },
        include: { tasks: true },
    });

    res.status(200).json(projects);
});

router.post("/", async (req, res) => {
    const user_id = res.locals["user"] as string;

    const project = await prisma.project.create({
        data: {
            owner: {
                connect: {
                    id: user_id,
                },
            },
            name: req.body.name,
            description: req.body.description,
        },
    });

    res.status(200).json(project);
});

router.get("/:projectId", async (req, res) => {
    try {
        const user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.projectId), ownerId: user_id },
            include: { tasks: true },
        });

        if (project == null) {
            throw new RouteError("Project does not exist with ID");
        }

        res.status(200).json(JSON.stringify(project));
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

router.post("/:projectId", async (req, res) => {
    try {
        const user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.projectId), ownerId: user_id },
        });

        if (project == null) {
            throw new RouteError("Project does not exist with ID");
        }

        res.status(200).json(project);
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

router.delete("/:projectId", async (req, res) => {
    try {
        const user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.projectId), ownerId: user_id },
        });

        if (project == null) {
            throw new RouteError("Project does not exist with ID");
        }

        await prisma.project.delete({
            where: { id: Number(req.params.projectId), ownerId: user_id },
        });

        res.status(204).end();
    } catch (e) {
        const err = e as RouteError;
        res.status(err.status_code).json({ error: err.message });
    }
});

export default router;
