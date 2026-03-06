import createClient, {
    createPathBasedClient,
    type Middleware,
} from "openapi-fetch";
import type { paths } from "../../generated/backend";
import useCredentials, {
    getAuthorizationHeader,
    setAccess,
} from "../stores/credentials";

async function refresh() {
    const access = useCredentials.getState().access;

    const { data, error } = await client.POST("/auth/refresh", {
        headers: { Authorization: getAuthorizationHeader() },
        credentials: "include",
    });

    if (error) {
        return;
    }

    if (data == undefined) {
        return;
    }

    setAccess(data.access);
}

const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
        const access = useCredentials.getState().access;
        request.headers.set("Authorization", getAuthorizationHeader());
    },

    async onResponse({ request, response }) {
        const { body, status, ...resOptions } = response;

        if (status == 401) {
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
