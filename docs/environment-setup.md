# Environment Setup

The target platform of the SSteP-KiZ project on server side is Ubuntu 20.04 LTS.
The target platform of the SSteP-KiZ project on client side is Windows 10 21H1.

Most of the server applications will run on Windows 10 as well.
However, on Windows 10, it is recommend to use the [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10), using the distribution Ubuntu 20.04 LTS.

The following guides will contain examples for Ubuntu 20.04 LTS and are tested on Windows 10 21H2 in WSL 2 with Ubuntu 20.04 LTS.

## 1. Setup JavaScript Runtime environment

Most the applications and libraries in the SSteP-KiZ project are written in [TypeScript](https://github.com/microsoft/TypeScript).

To compile and run the code, it is required to install the [Node.js JavaScript runtime](https://github.com/nodejs/node) on your system.
The target version is Node.js 14 LTS.

You can download and install Node.js from the [official website](https://nodejs.org/de/download/).

On Ubuntu 20.04, use the following commands to install Node.js 14 LTS:

```bash
$ curl -sL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

Make sure, that the Node Package Manager (NPM) is up to date, using the following command:

```bash
$ sudo npm install --location=global npm@8.18
```

### 1.1. Setup Nest.js CLI

For development of the console (or server) applications, it might be more comfortable to have installed the [Nest.js CLI](https://github.com/nestjs/nest-cli), but it is not required.

You can download and install the Nest.js CLI using the following command:

```bash
$ sudo npm install --location=global @nestjs/cli
```

This will install the Nest.js CLI globally, so you can use the `nest` command everywhere.
If you don't install the Nest.js CLI globally, in `/backends/` you can also use the command `npm run nest` instead of `nest`.

A full Nest.js CLI command reference is provided on the [official website](https://docs.nestjs.com/cli/usages).

### 1.2. Setup Angular CLI

For development of the frontend applications, it might be more comfortable to have installed the [Angular CLI](https://github.com/angular/angular-cli), but it is not required.

You can download and install the Angular CLI using the following command:

```bash
$ sudo npm install --location=global @angular/cli
```

This will install the Angular CLI globally, so you can use the `ng` command everywhere.
If you don't install the Angular CLI globally, in `/frontends/` you can also use the command `npm run ng` instead of `ng`.

A full Angular CLI command reference is provided on the [official website](https://angular.io/cli).

## 2. PostgreSQL Database

Some server side applications require the installation of [PostgreSQL](https://www.postgresql.org/).
Those applications were developed using PostgreSQL 12.
Minor versions might work as well, but they are not tested.

Download and install PostgreSQL 12 from the [official Website](https://www.postgresql.org/download/).

On Ubuntu 20.04, you can install PostgreSQL 12, using the following commands:

```bash
$ sudo apt-get update
$ sudo apt-get -y install postgresql-12 postgresql-client-12
```

If not yet done, start the PostgreSQL server using the following command:

```bash
$ sudo service postgresql start
```

For development, create a default user `sstepkiz` using password `sstepkiz` and the database `sstepkiz` using the following commands:

```bash
$ sudo su - postgres
$ psql -c "DROP DATABASE IF EXISTS sstepkiz"
$ psql -c "DROP USER IF EXISTS sstepkiz"
$ psql -c "CREATE DATABASE sstepkiz"
$ psql -c "CREATE USER sstepkiz WITH ENCRYPTED PASSWORD 'sstepkiz'"
$ psql -c "GRANT ALL PRIVILEGES ON DATABASE sstepkiz TO sstepkiz"
$ psql -d sstepkiz -c "CREATE EXTENSION IF NOT EXISTS pgcrypto"
```

**Disclaimer**: These credentials are for development only!
**DO NOT USE THESE CREDENTIALS IN PRODUCTION!**

## 3. Setup Keycloak as Single Sign On

**WARNING: The IMeRa SSO uses WSO2 instead of Keycloak on TEST and soon on PROD!**

*If you are using the Keycloak instance on https://sso.example.org/ (PROD) or https://sso-test.example.org/ (TEST), you can skip this section.*

Download and install OpenJDK version 1.8 or higher from the [official website](https://openjdk.java.net/).

On Ubuntu 20.04, you can install :

```bash
$ sudo apt-get update
$ sudo apt-get install -y default-jdk
```

Download and extract the latest version of Keycloak Server from the [official website](https://www.keycloak.org/downloads) and extract the archive.
This can be done using the following command (maybe you need to exchange the versions by the latest version, this is an example with version 13.0.1):

```bash
$ wget https://downloads.jboss.org/keycloak/13.0.1/keycloak-13.0.1.tar.gz
$ tar -zxf keycloak-13.0.1.tar.gz
```

To start Keycloak, use the following command:

```bash
$ ./keycloak-13.0.1/bin/standalone.sh
```

Your local Keycloak instance will then be available on http://localhost:8080/.

**Disclaimer**: This in the following, we will setup a Keycloak instance for testing only.
**DO NOT USE THIS INSTANCE FOR PRODUCTION!**

On first launch, you are asked to create a new admin account.
We will use the default username `admin` with password `admin` here.

After that, go to http://localhost:8080/auth/admin/ and log in using the credentials of your admin account created before.
Then create a new realm for testing.

### 3.1. Setup Realm

You can use the provided realm configuration [here](../docker/sso/realm-export.json) or create a new default realm.

If you want to create a new realm on your own, make sure to set it up as follows, a manual can be found in the [official Keycloak Documentation](https://www.keycloak.org/documentation).

Name the realm `sstepkiz`.

Add the following roles:

- `ADMIN`.
- `USER`.
- `MANAGER`.

Add the following groups:

- `admins` assigned to roles `ADMIN`, `USER` and `MANAGER`.
- `patients` assigned to role `USER`.
- `therapists` assigned to role `MANAGER`.

Add the following users:

- `admin1` with password `admin1` in group `admins`.
- `patient1` with password `patient1` in group `patients`.
- `therapist1` with password `therapist1` in group `therapists`.

Add the following OpenID Connect Client Scopes:

- `signalling_admin` with assigned role `ADMIN`.
- `signalling_monitor` with assigned role `USER`.
- `signalling_receive` with assigned role `MANAGER`.
- `signalling_send` with assigned role `USER`.

Add the following OpenID Connect Clients (URLs depend on your individual port configuration, the examples here show the default):

- `sstepkiz-admin` with URL `http://localhost:4400` and default scope `signalling_admin`.
- `sstepkiz-aggregator` with URL `http://localhost:3100` and default scope `signalling_send`.
- `sstepkiz-patient` with URL `http://localhost:4200` and default scope `signalling_monitor`.
- `sstepkiz-therapist` with URL `http://localhost:4300` with default scope `signalling_receive`.

### 3.2. Add Single Sign On (Keycloak) Server to trusted Authorities

If you are using the Keycloak instance on https://sso.example.org (PROD), you can use the existing file `/backends/sso_public_key_prod.pem` by copying it to `/backends/sso_public_key.pem`.
If you are using the Keycloak instance on https://sso-test.example.org (TEST), you can use the existing file `/backends/sso_public_key_test.pem` by copying it to `/backends/sso_public_key.pem`.
If one of these is true, you can skip this step.

If you are using your local Keycloak instance, go to http://localhost:8080/auth/realms/sstepkiz.
You will get a JSON response.

Create the file `/backends/sso_public_key.pem` and paste the `public_key` parameter of your JSON response into the file and insert the `public_key` as follows:

```pem
-----BEGIN PUBLIC KEY-----
[YOUR PUBLIC_KEY HERE]
-----END PUBLIC KEY-----
```

Then make sure, that the parameters `OIDC_ISSUER` in your environment or in your used `.env`-files in `/backends/` are the `http://localhost:8080/auth/realms/sstepkiz`.

## 4. Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) is a target code editor for the project.

It is a platform independent extensible code editor with great support TypeScript.

Due to the committed configuration in `/.vscode/`, Visual Studio Code will be set up automatically.

Here is a list of recommended extensions:

- [Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl): (Recommended if you are developing in WSL) Allows a connection from VS Code on Windows to WSL.
- [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker): Allows manage Docker containers.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint): JavaScript Linter.
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker): English Language Spell checker.

## 5. Other dependencies

### 5.1. Web Browser

The development of the web applications is targeted for the latest version of Microsoft Edge.

Most Chromium-based Web Browsers such as the Google Chrome, Chromium, or Vivaldi might work as well.
The use of some features (especially that depending on WebRTC) might cause problems on other non-Chromium-based Web Browsers such as Mozilla Firefox.
