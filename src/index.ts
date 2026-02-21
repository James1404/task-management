import "dotenv/config";

import express, { Request } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

import { randomBytes, scryptSync } from "crypto";
import prisma from "./client";

const app = express();
const PORT = 3000;

const jsonParser = bodyParser.json();

app.use("/static", express.static("public"));
app.use(morgan("common"));

interface HashedPassword {
    hash: string;
    salt: string;
}

function hashPassword(password: string): HashedPassword | null {
    let hash: HashedPassword | null = null;
    let salt = randomBytes(128).toString("base64");

    let derivedKey = scryptSync(password, salt, 64);

    hash = { hash: derivedKey.toString("hex"), salt };
    console.log(hash); // '3745e48...08d59ae'

    return hash;
}

app.get("/", (_, res) => {
    res.send("Hello, World!");
});

interface RegisterModel extends Request {
    body: {
        email: string;
        password: string;
    };
}

app.post("/api/register", jsonParser, async (req: RegisterModel, res) => {
    let hash = hashPassword(req.body.password);

    if (hash == null) return;

    await prisma.user.create({
        data: {
            email: req.body.email,
            password: hash.hash,
            salt: hash.salt,
        },
    });

    res.send(
        `${req.body["password"]} once hashed is: ${hash?.hash}, with salt: ${hash?.salt}`,
    );
});

app.listen(PORT, () => {
    console.log(`Task Management listening on port: http://localhost:${PORT}`);
});
