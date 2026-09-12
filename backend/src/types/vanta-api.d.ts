import { Request, Response, NextFunction } from "express";

declare module "vanta-api" {
    /**
     * Wraps an async Express route handler.
     * Automatically forwards any thrown errors to next(err).
     *
     * Usage:
     *   export const myHandler = catchAsync(async (req, res, next) => { ... });
     */
    export function catchAsync(
        fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
    ): (req: Request, res: Response, next: NextFunction) => void;

    /**
     * Operational HTTP error.
     *
     * Usage:
     *   throw new HandleERROR("Not found", 404);
     *   next(new HandleERROR("Forbidden", 403));
     */
    export class HandleERROR extends Error {
        statusCode: number;
        /** "fail" for 4xx, "error" for 5xx */
        status: string;
        /** Always true — marks this as an expected operational error */
        isOperational: boolean;
        constructor(message: string, statusCode: number);
    }

    /**
     * Express global error-handling middleware.
     * Register as the last middleware in app.ts:
     *   app.use(catchError);
     */
    export function catchError(
        err: HandleERROR & { statusCode?: number },
        req: Request,
        res: Response,
        next: NextFunction
    ): void;

    /**
     * Mongoose query builder for filtering, sorting, pagination, and field selection.
     * Default export.
     */
    export default class ApiFeatures {
        constructor(query: object, queryString: object);
        filter(): this;
        sort(): this;
        limitFields(): this;
        paginate(): this;
    }
}
