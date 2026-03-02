FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno install

FROM denoland/deno:latest
WORKDIR /app
COPY --from=builder /app .
# USER deno
EXPOSE 3000
CMD ["sh", "-c", "deno task db:deploy && deno run -A src/app.ts"]