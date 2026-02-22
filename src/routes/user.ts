import bodyParser from "body-parser";
import express, { Request } from "express";
import { auth } from "../jwt";
import prisma from "../client";

import { validate, z } from "../middleware";

const router = express.Router();
const jsonParser = bodyParser.json();

router.use(auth);
router.use(jsonParser);

router.get("/", async (_, res) => {
    let id = res.locals["user"] as string;

    const user = await prisma.user.findUnique({ where: { id } });
    res.json(JSON.stringify(user));
});

const loginSchema = z.object({
    first_name: z.optional(z.string()),
    last_name: z.optional(z.string()),
});

router.post("/", validate(loginSchema), async (req, res) => {
    let id = res.locals["user"] as string;

    await prisma.user.update({
        where: { id },
        data: req.body,
    });

    res.status(204).end();
});

router.delete("/", async (_, res) => {
    let id = res.locals["user"] as string;

    await prisma.user.delete({ where: { id } });

    res.status(204).end();
});

export default router;
