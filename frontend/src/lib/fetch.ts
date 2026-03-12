import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../../generated/backend";
import { getAuthorizationHeader, setAccess } from "../stores/credentials";

async function refresh() {
    const { data, error, response } = await client.POST("/v1/auth/refresh", {
        headers: { Authorization: getAuthorizationHeader() },
        credentials: "include",
    });

    if (error || !data) {
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

            const retryRequest = new Request(request);
            request.headers.set("Authorization", getAuthorizationHeader());
            return fetch(retryRequest);
        }

        return new Response(body, { ...resOptions });
    },
};

const client = createClient<paths>({ baseUrl: "http://localhost:3000" });

client.use(authMiddleware);

export default client;
