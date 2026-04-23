import { defineConfig } from "orval";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
    backend: {
        output: {
            mode: "single",
            target: "./generated/backend.ts",
            schemas: "./generated/model",
            client: "axios",
            override: {
                mutator: {
                    path: "./src/lib/axios-instance.ts",
                    name: "customInstance",
                },
            },
        },
        input: {
            target: `${process.env.BACKEND_URL}/docs/json`,
        },
    },
});
