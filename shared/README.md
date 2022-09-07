# SSteP-KiZ Shared Library

This is a [TypeScript](https://github.com/microsoft/TypeScript) Library containing all shared classes and type definitions of the SSteP-KiZ project.

## 1. Overview

The shared library is divided into the following sections:

- Aggregator: Contains library shared between Aggregator UI and Aggregator Backend.
- Common: Contains commonly used definitions.
- Feedback: Contains all necessary definitions for the Live-Feedback of the patient.
- IMeRa API: Contains all IMeRa API specific definitions.
- Game: Contains all necessary definitions for the gamification API.
- Peer: Contains all necessary definitions for the Peer-to-Peer connection.
- Sensors: Contains all necessary definitions for the Sensor data.
- Signalling: Contains all the necessary definitions for connection establishment of the Peer-to-Peer connection.

## 2. Quick start

### 2.1. Installation

Use the following command to install all external dependencies:

```bash
/shared$ npm install
```

### 2.2. Building

Use the following command to build the library:

```bash
/shared$ npm run build
```

This will build the library to the directory `/shared/dist`.

### 2.3. Linting

The library can be linted using the following command:

```bash
$ npm run lint
```

### 2.4. Cleaning

The workspace can be cleaned up using the following command:

```bash
$ npm run clean
```

This will remove the directory `/shared/dist` with all its files.
