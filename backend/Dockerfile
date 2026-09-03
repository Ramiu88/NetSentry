FROM node:24-alpine

# Alpine ships nmap in its main repo — no build-from-source needed.
RUN apk add --no-cache nmap nmap-scripts

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["node", "src/index.js"]
