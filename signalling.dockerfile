# Create image for building process.
FROM node:16 AS builder

# Install dependencies.
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y build-essential python make g++ libudev-dev libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Update NPM.
RUN npm install --location=global npm@8.18

WORKDIR /app

# Copy source files.
COPY ./shared ./shared
COPY ./backends ./backends

# Build shared project.
WORKDIR /app/shared
RUN npm install
RUN npm run build
RUN npm prune --production

# Build signalling server.
WORKDIR /app/backends
RUN npm install
RUN npm run build:signalling
RUN npm prune --production


# Create new image for final deployment.
FROM node:16

# Create user with restricted permissions.
RUN groupadd app
RUN useradd --home /home/app -g app app

# Go to user's home directory.
WORKDIR /home/app

# Copy necessary files from build image.
COPY --chown=app:app --from=builder /app/backends/dist/apps/signalling/main.js ./dist/apps/signalling/main.js
COPY --chown=app:app --from=builder /app/backends/node_modules ./node_modules

# Switch to user with restricted permissions.
USER app:app

# Set default configuration
ENV DB_PORT=5432
ENV LOG_LEVEL=3
ENV DB_PREFIX=signalling_
ENV OIDC_PUBLIC_KEY_FILE=/home/app/sso_public_key.pem
ENV OIDC_AUDIENCE=account
ENV OIDC_ALGORITHMS=RS256
ENV PORT=80

# Expose listening port an start backend.
EXPOSE ${PORT}
CMD [ "node", "./dist/apps/signalling/main.js" ]
