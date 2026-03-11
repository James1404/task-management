import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../../generated/backend";
import { getAuthorizationHeader, setAccess } from "../stores/credentials";

async function refresh() {
    const { data, error, response } = await client.POST("/v1/auth/refresh", {
        headers: { Authorization: getAuthorizationHeader() },
        credentials: "include",
    });

    if (error || data == undefined) {
        return response;
    }

    setAccess(data.access);
}

const NonAuthPaths = [
    "/v1/auth/refresh",
    "/v1/auth/login",
    "/v1/auth/register",
];

const authMiddleware: Middleware = {
    async onRequest({ request, schemaPath }) {
        if (NonAuthPaths.includes(schemaPath)) {
            return;
        }

        request.headers.set("Authorization", getAuthorizationHeader());
    },

    async onResponse({ request, response, schemaPath }) {
        const { body, status, ...resOptions } = response;

        if (status === 401 && !NonAuthPaths.includes(schemaPath)) {
            await refresh();
        }

        return new Response(body, { ...resOptions });
    },
};

const client = createClient<paths>({ baseUrl: "http://localhost:3000" });
// const client = createPathBasedClient<paths>({
//     baseUrl: "http://localhost:3000",
// });

client.use(authMiddleware);

export default client;
