# Aggregator Server

The Aggregator Server is a software to stream sensor data to the [Therapist UI](../../../frontends/projects/therapist-ui/README.md), temporarily store them on the [Aggregator Device](../../../deployment/aggregator-device/README.md) and to upload them to the SSteP-KiZ [Storage Server](../../../deployment/storage-server/README.md).
Additionally, the software manages configuration of the sensor devices.

The Aggregator Server also has a user interface, called [Aggregator UI](../../../frontends/projects/aggregator-ui/README.md).
Together the Aggregator Server and the Aggregator UI are called **Aggregator Software**.

## 1. Driver Libraries

The Aggregator Server is designed to be modular so it can be extended by additional "drivers" for different sensor devices.
The provided sensor drivers are:

- **[APDM Sensor Driver](../../libs/apdm/README.md)**: A driver for [APDM Wearable Sensors](https://www.apdm.com/wearable-sensors/) to track movement.
- **[Look Driver](../../libs/look/README.md)**: A driver for the [Look!](https://www.fahren-sie-sicher.de/) eye tracking software.
- **[Movesense Driver](../../libs/movesense/README.md)**: A driver for the [Movesense ECG Sensor](https://www.movesense.com/product/movesense-sensor/).

To implement your own sensor driver, follow the guide of the [Sensor API](../../libs/sensor-api/README.md).

## 2. Deployment

### 2.1. Requirements

- Windows 10 (version 2004 build 19041 or higher) x64

### 2.2. Setup

To setup the whole Aggregator Device, go to [the Aggregator Device Deployment Guide](../../../deployment/aggregator-device/README.md#2-deployment) and follow the instructions.

## 3. Development

### 3.1. Environment setup

The development of the Aggregator Server is targeted to run natively on Windows 10 (version 2004 / build 19041 or higher, lower versions might work as well, but not tested) x64.
All the features might work on Linux distributions as well.

To install the required software, install [Node.js](../../../docs/environment-setup.md#1-setup-javascript-runtime-environment), [Nest.js CLI](../../../docs/environment-setup.md#11-setup-nestjs-cli), [PostgreSQL](../../../docs/environment-setup.md#2-postgresql-database), [Keycloak](../../../docs/environment-setup.md#3-setup-keycloak-as-single-sign-on) and [Visual Studio Code](../../../docs/environment-setup.md#4-visual-studio-code) as described in the [Environment Setup manual](../../../docs/environment-setup.md).

### 3.2. Project setup

If not yet done, also build the SSteP-KiZ Shared Library as described [here](../../../shared/README.md#22-building).

Then use the following command to install all external dependencies:

```powershell
PC C:\sstep-kiz\backends> npm install
```

### 3.3. Starting

To run the application in development (watch) mode, execute the following command:

```powershell
PC C:\sstep-kiz\backends> npm run start:aggregator
```

### 3.4. Building

To build the application in production mode, use the following command in PowerShell:

```powershell
PC C:\sstep-kiz\backends> npm run build:aggregator
```

This will build the application to `C:\sstep-kiz\backends\dist\apps\aggregator`.

You can then start the Aggregator Server in production mode using the following command:

```powershell
PC C:\sstep-kiz\backends> npm run start:aggregator:prod
```
