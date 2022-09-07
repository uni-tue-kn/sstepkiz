# SSteP-KiZ Backend

This is a [Nest.js](https://github.com/nestjs/nest) workspace containing all backend applications for the SSteP-KiZ project.

## 1. Overview

There are multiple backend applications:

- [Gamification Server](./apps/gamification/README.md): The server to store gamification progresses.
- [Signalling Server](./apps/signalling/README.md): A WebSocket server for signalling of WebRTC connections.

Additionally, there is the [Aggregator Server](./apps/aggregator/README.md).

## 2. Quick start

### 2.1. Installation

Use the following command to install all external dependencies:

```bash
/backends$ npm install
```

If not yet done, also install dependencies and build the SSteP-KiZ Shared Library as described [here](../shared/README.md).

### 2.2. Running the applications

#### 2.2.1. Production

To run the applications in production mode, use the following commands to build them:

```bash
# Build Aggregator Server
/backends$ npm run build:aggregator

# Build Gamification Server
/backends$ npm run build:gamification

# Build Signalling Server
/backends$ npm run build:signalling
```

This will build the applications to the following directories:

- Aggregator Server: [`/backends/dist/apps/aggregator`](./dist/apps/aggregator)
- Gamification Server: [`/backends/dist/apps/gamification`](./dist/apps/gamification)
- Signalling Server: [`/backends/dist/apps/signalling`](./dist/apps/signalling)

Then use the following commands, to run them:

```bash
# Run Aggregator Server
/backends$ npm run start:aggregator:prod

# Run Gamification Server
/backends$ npm run start:gamification:prod

# Run Signalling Server
/backends$ npm run start:signalling:prod
```

This will start a Node.js instance that will run the application.

It is highly recommended to host that application behind a reverse proxy.
A template for the popular [NGINX](https://github.com/nginx/nginx) HTTP Server is provided in [`deployment/nginx-template.conf](../deployment/nginx-template.conf).

#### 2.2.2. Development

To run the applications in development (watch) mode, use the following commands:

```bash
# Run Aggregator Server
/backends$ npm run start:aggregator

# Run Gamification Server
/backends$ npm run start:gamification

# Run Signalling Server
/backends$ npm run start:signalling
```

Depending on the environment variable `PORT`, which can be configured in the `.dev.env` files in `/backends/`, the applications will start on the following ports (default ports are listed below):

- Aggregator Server: http://localhost:3000
- Gamification Server: http://localhost:3200
- Signalling Server: http://localhost:3300

##### 2.2.2.1. Linting

All the applications can be linted at once using the following command:

```bash
/backends$ npm run lint
```

Alternatively it is also possible to lint each project separately using one of the following commands:

```bash
# Lint Aggregator Server
/backends$ npm run lint:aggregator

# Lint Gamification Server
/backends$ npm run lint:gamification

# Lint Signalling Server
/backends$ npm run lint:signalling
```

##### 2.2.2.2. Cleaning

The workspace can be cleaned up using the following command:

```bash
/backends$ npm run clean
```

**This will remove the directory `/backends/dist` with all its files.**
