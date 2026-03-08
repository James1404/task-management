import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Type from "typebox";

declare module "fastify" {}

const limitMax = 100;

const PaginationQuery = Type.Object({
    offset: Type.Number(),
    limit: Type.Number({ minimum: 0, maximum: limitMax }),
});

const paginationPlugin: FastifyPluginAsync = fp(async (server, _options) => {
    server.addHook("onRoute", routeOptions => {
        const existingQuerystring = routeOptions.schema?.querystring || {};
        routeOptions.schema = {
            ...routeOptions.schema,
            querystring: Type.Intersect([existingQuerystring, PaginationQuery]),
        };
    });
});
