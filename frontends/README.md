# SSteP-KiZ Frontend

This is an [Angular](https://github.com/angular/angular) workspace containing all frontend applications and libraries for the SSteP-KiZ project.

## 1. Overview

There are multiple frontend applications:

- [Admin UI](./projects/admin-ui/README.md): A temporary application for administrative configurations.
- [Aggregator UI](./projects/aggregator-ui/README.md): The UI for the [Aggregator Server](../backends/apps/aggregator/README.md).
- [Patient UI](./projects/patient-ui/README.md): The application for patients to send live feedback, to participate in surveys and to monitor sensor activities.
- [Therapist UI](./projects/therapist-ui/README.md): The application for therapists to manage surveys, stream sensor data and visualize data from the [IMeRa platform](https://www.medizin.uni-tuebingen.de/nfmi/imera/imera_start.html).

With the following libraries:

- [AggregatorLib](./projects/aggregator/README.md): A library for the aggregation.
- [AuthLib](./projects/auth/README.md): A library to handle OpenID Connect Authentication.
- [GameLib](./projects/game/README.md): A library for the gamification elements.
- [RESTAPILib](./projects/rest-api/README.md): A library for the IMeRa REST API.
- [RTCLib](./projects/rtc/README.md): A library to handle WebRTC connections.
- [SyncLib](./projects/sync/README.md): A library to cache generated data offline and synchronize it with a server after online connectivity is reestablished.

## 2. Quick start

### 2.1. Installation

Use the following command to install all external dependencies:

```bash
$ npm install
```

If not yet done, also install dependencies and build the SSteP-KiZ Shared Library as described [here](../shared/README.md).

### 2.2. Running the applications

#### 2.2.1. Development

To run the applications in development (watch) mode, use the following commands:

```bash
# Admin UI
$ npm run start:admin

# Patient UI
$ npm run start:patient

# Therapist UI
$ npm run start:therapist
```

This will start the applications on the following ports:

- Admin UI: http://localhost:4100
- Patient UI: http://localhost:4200
- Therapist UI: http://localhost:4300

To prevent errors due to the CORS policy, all necessary Endpoints will be reverse-proxied by the Angular Development Server to the Backend applications on the ports described [here](../backends/README.md#221-development).

##### 2.2.1.1. Linting

All the applications can be linted at once using the following command:

```bash
$ npm run lint
```

##### 2.2.1.2. Cleaning

The workspace can be cleaned up using the following command:

```bash
$ npm run clean
```

This will remove the directory `/frontends/dist` with all its files.

#### 2.2.2. Production

To run the apps in production mode, use the following commands to build them:

```bash
# Admin UI
$ npm run build:admin

# Patient UI
$ npm run start:patient

# Therapist UI
$ npm run build:therapist
```

This will build the applications to the following directories:

- Admin UI: `/frontends/dist/admin-ui`
- Patient UI: `/frontends/dist/patient-ui`
- Therapist UI: `/frontends/dist/therapist-ui`

Then host the built files in these directories as static files using a web server.

A template for the popular [NGINX](https://github.com/nginx/nginx) HTTP Server is provided in [`/frontends/nginx-template-ssl.conf`](./nginx-template-ssl.conf).
If you run the NGINX for serving the Angular static files behind a reverse proxy, use the template in [`/frontends/nginx-template.conf`](./nginx-template.conf).
For the reverse proxy, use the template of the [SSteP-KiZ Backend](../backends/README.md) provided in [`/backends/nginx-template.conf`](../backends/nginx-template.conf).
