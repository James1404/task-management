import { paths } from "../generated/openapi/openapi.d.ts";

export class RouteError extends Error {
    status_code: number;

    constructor(
        message: string,
        status_code: number = 400,
        options?: ErrorOptions | undefined,
    ) {
        super(message, options);

        this.status_code = status_code;
    }
}

export type JsonRequest<
    P extends keyof paths,
    M extends keyof paths[P],
> = paths[P][M] extends {
    requestBody: {
        content: {
            "application/json": infer Body;
        };
    };
}
    ? Body
    : never;

export type JsonResponse<
    P extends keyof paths,
    M extends keyof paths[P],
    Code extends number,
> = paths[P][M] extends {
    responses: {
        [K in Code]: {
            content: {
                "application/json": infer Res;
            };
        };
    };
}
    ? Res
    : never;
