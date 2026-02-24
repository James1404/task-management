FROM denoland/deno:alpine AS builder
WORKDIR /app
COPY . .

RUN deno install --entrypoint src/index.ts

FROM denoland/deno:alpine

WORKDIR /app
COPY --from=builder /app .

ENV HOST=0.0.0.0
ENV PORT=4321

EXPOSE 4321

CMD ["deno", "run", "--allow-read", "--allow-env", "--allow-sys", "--allow-net", "src/index.ts"]