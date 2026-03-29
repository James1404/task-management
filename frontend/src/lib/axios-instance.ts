import { router } from "@/main";
import {
    clearAccess,
    getAuthorizationHeader,
    setAccess,
} from "@/stores/credentials";
import Axios, {
    type AxiosRequestConfig,
    AxiosError,
    isAxiosError,
} from "axios";
import { createAuthRefresh } from "axios-auth-refresh";

export const AXIOS_INSTANCE = Axios.create({
    baseURL: "http://localhost:3000",
});

const NON_AUTH_AXIOS_INSTANCE = AXIOS_INSTANCE.create();

AXIOS_INSTANCE.interceptors.request.use(request => {
    request.headers.Authorization = getAuthorizationHeader();

    return request;
});

createAuthRefresh(AXIOS_INSTANCE, async failedRequest => {
    try {
        const response = await NON_AUTH_AXIOS_INSTANCE.post(
            "/v1/auth/refresh",
            {},
            {
                headers: { Authorization: getAuthorizationHeader() },
                withCredentials: true,
            },
        );

        setAccess(response.data.access);

        failedRequest.response.config.headers["Authorization"] =
            getAuthorizationHeader();

        return Promise.resolve();
    } catch (err) {
        clearAccess();
        router.navigate({ to: "/" });

        return Promise.reject();
    }
});

// async function refresh() {
//     try {
//         const response = await NON_AUTH_AXIOS_INSTANCE.post(
//             "/v1/auth/refresh",
//             {},
//             {
//                 headers: { Authorization: getAuthorizationHeader() },
//                 withCredentials: true,
//             },
//         );

//         setAccess(response.data.access);
//     } catch (err) {
//         console.log(err as Error);

//         clearAccess();
//         router.navigate({ to: "/" });

//         // if (error || !data) {
//         //     return response;
//         // }
//     }
// }

const NonAuthPaths: string[] = [
    "/v1/auth/refresh",
    "/v1/auth/login",
    "/v1/auth/register",
];

// // Request interceptor for auth
// AXIOS_INSTANCE.interceptors.request.use(
//     request => {
//         if (!NonAuthPaths.includes(request?.url ?? "")) {
//             request.headers.Authorization = getAuthorizationHeader();
//         }

//         return request;
//     },
//     error => Promise.reject(error),
// );

// // Response interceptor for error handling
// AXIOS_INSTANCE.interceptors.response.use(
//     response => response,
//     async error => {
//         if (isAxiosError(error)) {
//             const originalRequest = error.request;

//             console.log(error.config?.url);

//             if (
//                 error.response?.status === 401 &&
//                 !NonAuthPaths.includes(error.config?.url ?? "")
//             ) {
//                 await refresh();
//                 originalRequest.headers.Authorization =
//                     getAuthorizationHeader();
//                 return AXIOS_INSTANCE(originalRequest);
//             }
//         }

//         return Promise.reject(error);
//     },
// );

export const customInstance = <T>(
    config: AxiosRequestConfig,
    options?: AxiosRequestConfig,
): Promise<T> => {
    if (NonAuthPaths.includes(config.url ?? "")) {
        return NON_AUTH_AXIOS_INSTANCE({
            ...config,
            ...options,
        }).then(({ data }) => data);
    }

    return AXIOS_INSTANCE({
        ...config,
        ...options,
    }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
