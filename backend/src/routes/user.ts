import express from "express";

const router = express.Router();

router.get("/", (_, res) => {
    const user_id = res.locals["user"] as string;
    res.send(`Hello there from tasks: user = ${user_id}`);
});

export default router;
