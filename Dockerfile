#
# Author:   Marcus Cemes
# Date:     2022-04-05
#
# Builds the project and delivers an optimised release image
# that can serve API requsts. Leverges Docker's multi-stage
# builds to cache unchanges steps.
#


FROM node:17-alpine as base
WORKDIR /app

COPY assets assets
COPY package.json package-lock.json ./



FROM base as builder
ENV CI=true

RUN npm ci

COPY tsconfig.json ./
COPY src src

RUN npm run build



FROM base as release

RUN deluser --remove-home node && addgroup -S node -g 9001 && adduser -S -G node -u 9001 node

RUN npm ci --only=production

COPY --from=builder /app/build build

CMD ["node", "build/index.js"]
