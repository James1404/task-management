import { Type } from "typebox";

export class AppError extends Error {
    statusCode: number;
    clearAuthCookie?: boolean;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
        this.clearAuthCookie = true;
    }
}

export const UnauthorizedResponseSchema = {
    401: Type.Object({
        error: Type.String(),
    }),
};

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

export const ForbiddenResponseSchema = {
    403: Type.Object({
        error: Type.String(),
    }),
};

export class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404);
    }
}

export const NotFoundResponseSchema = {
    404: Type.Object({
        error: Type.String(),
    }),
};

export class ValidationError extends AppError {
    constructor(message = "Invalid input") {
        super(message, 400);
    }
}

export const ValidationResponseSchema = {
    400: Type.Object({
        error: Type.String(),
    }),
};

export class InvalidCredentialsError extends AppError {
    constructor(message = "Invalid credentials") {
        super(message, 401);
    }
}

export const InvalidCredentialsResponseSchema = {
    401: Type.Object({
        error: Type.String(),
    }),
};
