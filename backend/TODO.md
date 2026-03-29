# TODO

- Implement user ordering of tasks (Using fractional indexing)
- Implement user ordering of columns
- Implement pagination and infinite scrolling for tasks

## Potential ideas

- Use WebRTC (or something like that) to stream project changes across to the user and allow realtime multi-user collaboration.

## Bugs

```json
{
    "level": 50,
    "time": 1774796413465,
    "pid": 174,
    "hostname": "92d45cea9b13",
    "reqId": "req-1xb",
    "req": {
        "method": "POST",
        "url": "/v1/auth/refresh",
        "host": "localhost:3000",
        "remoteAddress": "172.18.0.1",
        "remotePort": 42372
    },
    "res": { "statusCode": 500 },
    "err": {
        "type": "PrismaClientKnownRequestError",
        "message": "\nInvalid `prisma.refreshToken.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. No record was found for a delete.",
        "stack": "PrismaClientKnownRequestError: \nInvalid `prisma.refreshToken.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. No record was found for a delete.\n    at zr.handleRequestError (file:///app/node_modules/.deno/@prisma+client@7.4.1/node_modules/@prisma/client/runtime/client.js:65:8286)\n    at zr.handleAndLogRequestError (file:///app/node_modules/.deno/@prisma+client@7.4.1/node_modules/@prisma/client/runtime/client.js:65:7581)\n    at zr.request (file:///app/node_modules/.deno/@prisma+client@7.4.1/node_modules/@prisma/client/runtime/client.js:65:7288)\n    at __drainNextTickAndMacrotasks (ext:core/01_core.js:439:7)\n    at async a (file:///app/node_modules/.deno/@prisma+client@7.4.1/node_modules/@prisma/client/runtime/client.js:75:5816)\n    at async file:///app/src/services/auth.services.ts:200:9\n    at async Proxy._transactionWithCallback (file:///app/node_modules/.deno/@prisma+client@7.4.1/node_modules/@prisma/client/runtime/client.js:75:4390)\n    at async Object.refresh (file:///app/src/services/auth.services.ts:199:21)\n    at async Object.<anonymous> (file:///app/src/routes/v1/auth.ts:170:41)",
        "code": "P2025",
        "meta": { "modelName": "RefreshToken", "operation": "a delete" },
        "clientVersion": "7.4.1",
        "name": "PrismaClientKnownRequestError"
    },
    "msg": "\nInvalid `prisma.refreshToken.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. No record was found for a delete."
}
```