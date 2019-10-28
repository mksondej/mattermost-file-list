FROM golang:1.12
RUN curl -sL https://deb.nodesource.com/setup_13.x | bash - && \
    apt-get install -y nodejs
VOLUME ["/go", "/app"]
