# Gamification Server

The game server is responsible for the reward system. For each user, acquired items, titles and such are stored. See [here](../../../backends/apps/gamification/src/game-logic/entities/user-game-sheet.entity.ts) for all saved parameters.

## 1. Overview

This is a guide for developers that want to quickly start with development of the Gamification Server.

A more detailed documentation can be found [here](../../../docs/gamification/README.md).

## 2. Quick start

### 2.1. Installation

Make sure, you have installed the JavaScript Environment as described [here](../../../docs/environment-setup.md#1-setup-javascript-runtime-environment) and you have downloaded and started the PostgreSQL Service, as described [here](../../../docs/environment-setup.md#2-postgresql-database).

Also make sure you have downloaded and installed all dependencies of the [Shared project](../../../shared/README.md) and the [Backend project](../../README.md) as described [here](../../../shared/README.md#21-installation) and [here](../../README.md#21-installation).
You also need to build the [Shared project](../../../shared/README.md) as described [here](../../../shared/README.md#22-building).

If you have installed everything, on Ubuntu 20.04 LTS you can use the following commands to start and build everything you need for development, building or execution of the Gamification Server:

```bash
$ sudo service postgresql start
/shared$ npm install
/shared$ npm run build
/backends$ npm install
```

### 2.2. Running the application

#### 2.2.1. Development

To run the application in development (watch) mode, use the following command:

```bash
/backends$ npm run start:gamification
```

By default, the Gamification Server will run on http://localhost:3400/.
Depending on the environment variable `PORT`, which can be configured in the configuration file [`/backends/gamification-config.dev.env`](../../gamification-config.dev.env), the port may be different.

##### 2.2.1.1. Linting

The code for all the backend applications (including the Gamification Server) can linted using the following command:

```bash
/backends$ npm run lint
```

##### 2.2.1.2. Cleaning

The workspace for all backend applications (including the Gamification Server) can be cleaned up using the following command:

```bash
/backends$ npm run clean
```

This will remove the directories `/backends/dist` and `/backends/build` with all its files.

#### 2.2.2. Production

To run the Gamification Server in production mode, use the following command to build it:

```bash
/backends$ npm run build:gamification
```

This will build the application to `/backends/dist/apps/gamification`.

Then use the following command to run it:

```bash
/backends$ npm run start:gamification:prod
```

By default, the Gamification Server will run on http://localhost:4000/.
Depending on your environment variable `PORT`, which can be configured in the configuration file [`/backends/gamification-config.env`](../../gamification-config.env), the port may be different.

It is highly recommended to host that application behind a reverse proxy.
A template for the popular [NGINX](https://github.com/nginx/nginx) HTTP Server is provided in [`/backends/nginx-template.conf](../../nginx-template.conf).
