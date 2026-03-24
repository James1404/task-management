import { defineConfig } from "orval";

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
            target: "http://localhost:3000/docs/json",
        },
    },
});
