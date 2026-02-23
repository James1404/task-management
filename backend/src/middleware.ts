import { RequestHandler } from "express";
import * as z from "zod";

export { z };

export const validate = (schema: z.ZodType) =>
    ((req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400);
            res.json({
                error: z.treeifyError(result.error),
            });
            return;
        }

        req.body = result.data;
        next();
    }) as RequestHandler;
