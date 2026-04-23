import { router } from "@/main";
import {
    clearAccess,
    getAuthorizationHeader,
    setAccess,
} from "@/stores/credentials";
import Axios, { type AxiosRequestConfig, AxiosError } from "axios";
import { createAuthRefresh } from "axios-auth-refresh";

const axios_params = {
    baseURL: import.meta.env.BACKEND_URL,
};

export const AXIOS_INSTANCE = Axios.create(axios_params);
const NON_AUTH_AXIOS_INSTANCE = Axios.create(axios_params);
const REFRESH_AXIOS_INSTANCE = Axios.create(axios_params);

AXIOS_INSTANCE.interceptors.request.use(request => {
    request.headers.Authorization = getAuthorizationHeader();
    return request;
});

createAuthRefresh(AXIOS_INSTANCE, async failedRequest => {
    try {
        const response = await REFRESH_AXIOS_INSTANCE.post(
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
    } catch (error) {
        return Promise.reject(error);
    }
});

createAuthRefresh(REFRESH_AXIOS_INSTANCE, async () => {
    try {
        clearAccess();
        router.navigate({ to: "/" });

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
});

const NonAuthPaths: string[] = [
    "/v1/auth/refresh",
    "/v1/auth/login",
    "/v1/auth/register",
];

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
