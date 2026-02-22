import bodyParser from "body-parser";
import express from "express";
import { auth } from "../jwt";
import prisma from "../client";
import { validate, z } from "../middleware";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);
router.use(jsonParser);

router.get("/", async (_, res) => {
    let user_id = res.locals["user"] as string;

    const projects = await prisma.project.findMany({
        where: { ownerId: user_id },
    });

    res.status(200).json(projects);
});

const postSchema = z.object({
    name: z.string(),
    description: z.string(),
});

router.post("/", validate(postSchema), async (req, res) => {
    let user_id = res.locals["user"] as string;

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
        let user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.projectId), ownerId: user_id },
        });

        if (project == null) {
            throw new Error("Project does not exist with ID");
        }

        res.status(200).json(JSON.stringify(project));
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.post("/:projectId", async (req, res) => {
    try {
        let user_id = res.locals["user"] as string;

        const project = await prisma.project.findUnique({
            where: { id: Number(req.params.projectId), ownerId: user_id },
        });

        if (project == null) {
            throw new Error("Project does not exist with ID");
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
