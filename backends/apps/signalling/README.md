# Signalling Server

This [Nest.js](https://github.com/nestjs/nest) server handles signalling of RTC connections.

## Setup

### Permission setup

To allow applications to connect to the Signalling Server, it is required to register the users by their username provided by the SSO in the database.
Therefore, a REST API is provided, which is documented using [Swagger UI](https://editor.swagger.io/) in [`/docs/signalling/signalling_api.yaml`](../../../docs/signalling/signalling_api.yaml).

You can also use the [Admin UI](../../../frontends/projects/admin-ui/README.md) to easily setup the users.

Run the Admin UI as provided [here](../../frontends/projects/admin-ui/README.md) and create the following users:

- `patient1`
- `therapist1`

Then add permissions for `patient1` to `therapist1` and enable permissions to all the sensors.
