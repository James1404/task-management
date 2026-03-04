docker_build:
    @docker build --tag task-management-backend:latest ./backend

run_docker:
    @docker run --env-file ./backend/.env -p 3000:3000 task-management-backend:latest
