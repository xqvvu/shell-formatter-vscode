FROM alpine:3.20

LABEL org.opencontainers.image.title="shell-tidy fixture"
ENV APP_HOME=/work APP_ENV=dev

WORKDIR ${APP_HOME}

RUN mkdir -p scripts logs && \
  printf '%s\n' "echo hello" "date -u" > scripts/bootstrap.sh && \
  chmod +x scripts/bootstrap.sh && \
  ./scripts/bootstrap.sh

CMD ["sh", "-c", "./scripts/bootstrap.sh"]
