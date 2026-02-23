class RouteError extends Error {
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
