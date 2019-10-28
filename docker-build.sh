docker build -t build:latest .
docker run --rm -v "$(pwd):/app" -v "$(pwd)/.docker_cache:/go" -w /app build:latest make dist
