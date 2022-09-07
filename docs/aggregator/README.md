# Documentation: Aggregator Software

## 1. Terminology

- **Aggregator Device**: The device that is connected to the sensors.
- **Aggregator Server**: The Nest.js console application.
- **Aggregator Client**: The Angular web application used as frontend UI.
- **Aggregator Software**: The software combination of the **Aggregator Server** and **Aggregator Client**.

## 2. Configuration

The static configuration is defined in the configuration file, which is named `aggregator-config.env` or `aggregator-config.dev.env` in development mode.
Alternatively, the properties can be stored as environment variables.

It is loaded when the application is starting.

The following properties can be defined in the configuration file:

| Name                      | Default value          | Example                                                              | Description                                                                         |
| -----------------------   | ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `CONFIG_SYNC_RETRIES`     | `10`                   | `10`                                                                 | Number of retries to load Dynamic Configuration.                                    |
| `LOG_LEVEL`               | `0`                    | `3`                                                                  | Log level (0 = none, 1 = Errors, 2 = Warnings, 3 = Normal, 4 = Debug, 5 = Verbose). |
| `OIDC_CHALLENGE_METHOD`   | `S256`                 | `S256`                                                               | Challenge method of OpenID Connect Token.                                           |
| `OIDC_CLIENT_ID`          |                        | `sstepkiz-aggregator`                                                | OAuth 2 Client Identity of the application.                                         |
| `OIDC_CLIENT_ID_FILE`     |                        | `./client_id.txt`                                                    | Path to file with OAuth 2 Client Identity of the application.                       |
| `OIDC_CLIENT_SECRET`      |                        | `secret!`                                                            | OAuth 2 Client Secret of the application.                                           |
| `OIDC_CLIENT_SECRET_FILE` |                        | `./client_secret.txt`                                                | Path to file with OAuth 2 Client Secret of the application.                         |
| `OIDC_ISSUER`             |                        | `https://sso.example.org/auth/realms/sstepkiz/auth/realms/sstep-kiz` | OAuth 2 Token issuer (= the Authorization Server endpoint).                         |
| `OIDC_SCOPES`             | `openid,email,profile` | `signalling_send,profile`                                            | Comma-separated OpenID Connect Scopes to request form Authorization Server.         |
| `OIDC_SIGNING_ALG`        | `RS256`                | `RS256`                                                              | OAuth 2 Signing Algorithm.                                                          |
| `PORT`                    | `3100`                 | `3100`                                                               | Port to run application on.                                                         |
| `SIGNALLING_SERVER`       |                        | `https://signalling.example.org`                                     | Root URL of the Signalling Server.                                                  |
| `STUN_SERVERS`            |                        | `stun1.example.org,stun2.example.org`                                | Comma-separated host names of STUN servers.                                         |
| `TURN_SERVERS`            |                        | `turn1.example.org,turn2.example.org`                                | Comma-separated host names of TURN servers.                                         |
