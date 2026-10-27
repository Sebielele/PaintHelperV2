# PaintHelperV2 – statische App + Node-Server mit SQLite (keine npm-Abhängigkeiten)
FROM node:24-alpine

RUN apk add --no-cache su-exec tzdata

WORKDIR /app
COPY WarhammerPaintHelper.html styles.css package.json ./
COPY src ./src
COPY data ./data
COPY assets ./assets
COPY server ./server

# Windows-Zeilenenden entfernen, falls das Repo mit CRLF ausgecheckt wurde
RUN sed -i 's/\r$//' server/docker-entrypoint.sh server/wph-user \
 && chmod 0755 server/docker-entrypoint.sh server/wph-user \
 && ln -s /app/server/wph-user /usr/local/bin/wph-user \
 && mkdir -p /data && chown node:node /data

ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    TZ=Europe/Zurich

EXPOSE 8080
VOLUME ["/data"]

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1

ENTRYPOINT ["/app/server/docker-entrypoint.sh"]
CMD ["node", "--disable-warning=ExperimentalWarning", "server/server.js"]
