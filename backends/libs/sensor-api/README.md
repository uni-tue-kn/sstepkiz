# SSteP-KiZ Sensor API

An API to implement Sensor Drivers for the SSteP-KiZ Project.

## Table of content

1. [Usage](./README.md#1-usage)
   1. [Sensor Drivers](./README.md#11-sensor-drivers)
   2. [Communication Service](./README.md#12-communication-service)
   3. [Configuration Service](./README.md#13-configuration-service)
   4. [Logger Service](./README.md#14-logger-service)
   5. [UDP Connector Service](./README.md#15-udp-connector-service)
2. [Dependencies](./README.md#2-dependencies)

## 1. Usage

### 1.1. Sensor Drivers

A Sensor Driver is a technically injectable Service which implements specific functionalities for sensors.

All drivers are derived from the abstract class `SensorDriver`.
Each type of driver has another abstract implementation of this `SensorDriver`.

There are four types of sensors planned for the SSteP-KiZ project, so there are also four sensor driver types:

- `EdaDriver` for EDA sensors.
- `EcgDriver` for ECG sensors.
- `EyeTrackingDriver` for eye tracking sensors.
- `MovementDriver` for movement sensors.

To implement a driver for a specific sensor type, create a new library for it using the following command:

```bash
/backends$ nest g lib my-ecg
What prefix would you like to use for the library (default: @app)? @lib
```

This will generate a new Nest.js library in `/backends/libs/my-ecg/` with:

- A module named `MyEcgModule` defined in `/backends/libs/my-ecg/my-ecg.module.ts`
- A service named `MyEcgService` defined in `/backends/libs/my-ecg/my-ecg.service.ts`

Rename the the service to `MyEcgDriver` and its file to `/backends/libs/my-ecg/my-ecg.driver.ts`.

Then define the driver by extending one of the abstract driver classes above like this:

```typescript
import { EcgDriver } from '@libs/sensor-api';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyEcgDriver extends EcgDriver {

}
```

To interact with the Aggregator Server system, the Sensor API provides the following components:

- The [Communication Service](./README.md#12-communication-service) to communicate with the Aggregator UI via WebRTC.
- The [Configuration Service](./README.md#13-configuration-service) to read driver-specific configuration from environment.
- The [Logger Service](./README.md#14-logger-service) to perform logging into the console output.
- The [UDP Connector Service](./README.md#15-udp-connector-service) to receive data from a UDP socket.

Each of them can be implemented in the `@Injectable()` class (especially Drivers) by adding it as a parameter of the constructor as follows:

```typescript
import { CommunicationService, EcgDriver, EcgConfiguration } from '@libs/sensor-api';
import { ConfigService } from '@libs/logger';
import { UdpConnectorService } from '@libs/udp-connector';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyEcgDriver extends EcgDriver {

  get devices(): EcgDevice[] {
    // Return array of all connected devices here.
  }

  constructor(
    private readonly communicationService: CommunicationService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly udpConnectorService: UdpConnectorService
  ) {
    super();
  }

  configure(configuration: EcgConfiguration): Promise<void> | void {
    // This will be called to configure the sensors.
  }

  initialize(): Promise<void> | void {
    // This will be called on startup of Aggregator Server to initialize the driver.

    super.initialize();
  }

  start(): Promise<void> | void {
    // This will be called to start listening to the sensor data.

    // When sensor data is received, call the following (data is an array of received sensor data):
    this.emit('data', ...data);

    super.start();
  }

  stop(): Promise<void> | void {
    // This will be called to stop listening to the sensor data.

    super.stop();
  }

  terminate(): Promise<void> | void {
    // This will be called to disconnect from sensors before closing the Aggregator Server application.

    super.terminate();
  }
}
```

The services are described in the following sections.

To implement the driver into the Aggregator Server, you need to create a new module that provides and exports the Sensor Driver from file `/backends/libs/my-ecg/my-ecg.module`:

```typescript
import { SensorDriver } from '@libs/sensor-api';
import { Module, Provider } from '@nestjs/common';

import { MyEcgDriver } from './my-ecg.driver';

const DRIVERS: Provider<SensorDriver>[] = [
  {
    // Official name of the driver.
    provide: 'MyECG',

    // Class to provide and export.
    useClass: MyEcgDriver
  }
];

@Module({
  exports: DRIVERS,
  providers: DRIVERS
})
export class MyEcgModule {}
```

After that, define the new module for the Aggregator Server.
Therefore open the file `/backends/apps/aggregator/src/driver-modules.ts` and extend the `DRIVER_MODULES` array like this:

```typescript
import { MyEcgModule } from '@libs/my-ecg';

export const DRIVER_MODULES = [
  MyEcgModule
];
```

Now you can compile the Aggregator Server as described [here](../../apps/aggregator/README.md#24-build-for-production).

Before you start the Aggregator Server, define that you want to use your created driver for the specific sensor type in the file `/backends/sensor-configuration.json` as follows:

```json
{
  "ecg": {
    "configuration": {
      // Your configuration here.
    },

    // Official name as described in property "provide" in '/backends/libs/my-ecg/my-ecg.module'.
    "driver": "MyECG"
  }
}
```

Available sensor types are:

- `ecg`: ECG driver.
- `eda`: EDA driver.
- `etk`: Eye Tracking driver.
- `mov`: Movement driver.

### 1.2. Communication Service

The Communication service helps you to communicate with the Aggregator UI.

#### Send messages

To send messages through the `com` channel to the Aggregator UI use the method `sendMessage(message: string): void` as follows:

```typescript
this.communicationService.sendMessage('Hello!');
```

#### Open channels

To open a new WebRTC `MediaStreamTrack` between the Aggregator UI and the Aggregator Server, the Aggregator UI needs to initiate this.
*Hint: You can trigger it by using the `sendMessage(message: string): void` and implement the initiation on the UI side command*.

After initiating the media stream from the UI side, the Server can access the track instance using its unique identifier (`id`) as follows: 

```typescript
getTrack(id: string): MediaStreamTrack {
  if (this.communicationService.existsTrack(id)) {
   return this.communicationService.getTrack(id);
  }
}
```

The UI can get the `id` after initiation and can tell it to the Server for example via HTTP.
Therefore a Driver Module is free to create a [Controller](https://docs.nestjs.com/controllers) to define an HTTP REST endpoint, which will trigger the described method `getTrack(id: string): MediaStreamTrack` above.

### 1.3. Configuration Service

The Configuration Service lets you read the set configuration from the environment.

To get a specific environment variable, use the method `get<T>(name: string, default: any): T` as follows:

```typescript
this.configService.get<number>('MY_ENV_VARIABLE', 42);
```

### 1.4. Logger Service

The Logger Service lets you perform logging into the console output.

There are multiple types of logging, corresponding to a different log levels, which can be set in environment variable `LOG_LEVEL`:

```typescript
// Will be logged in log level 1, 2, 3, 4 and 5:
this.loggerService.debug('This is a debug message!'), this.constructor.name);
// Output: [MyEcgDriver] This is a debug message!

// Will be logged in log level 1, 2, 3 and 4:
this.loggerService.verbose('This is a verbose message!', this.constructor.name);
// Output: [MyEcgDriver] This is a verbose message!

// Will be logged in log level 1, 2 and 3:
this.loggerService.log('This is a log message!', this.constructor.name);
// Output: [MyEcgDriver] This is a log message!

// Will be logged in log level 1 and 2:
this.loggerService.warn('This is a warn message!', this.constructor.name);
// Output: [MyEcgDriver] This is a warn message!

// Will be logged in log level 1:
this.loggerService.error('This is a error message!', this.constructor.name);
// Output: [MyEcgDriver] This is a error message!
```

### 1.5. UDP Connector Service

The UDP Connector Service helps you to receive data from a UDP socket.

To open a UDP socket and receive data from it, use the method `on(channel: UdpChannelConfig, listener: (msg: Buffer) => void | Promise<void>): Promise<void>` as follows:

```typescript
const channel: UdpChannelConfig = {
// IP version ('udp4' = IPv4, 'udp6' = IPv6).
  ipType: this.configService.get<SocketType>('DRIVER_MyEcgDriver_TYPE', 'udp4'),

  // Hostname to listen on.
  host: this.configService.get<string>('DRIVER_MyEcgDriver_HOST', '127.0.0.1'),

  // Port to listen on.
  port: this.configService.get<number>('DRIVER_MyEcgDriver_PORT', 5000)

  // Name of driver.
  name: 'MyEcgDriver'
};

const listener: (msg: Buffer) => void = msg => {
  try {
    // Convert received byte array to string using UTF-8 encoding.
    const message: string = msg.toString('utf8');

    // Parse JSON-encoded string to object.
    const data: MyEcgDriverData[] = JSON.parse(message) as MyEcgDriverData[];

    this.loggerService.debug(`Receive data from driver ${channel.name}: ${JSON.stringify(data)}`, this.constructor.name);
  } catch (error) {
    this.loggerService.error(`Failed to parse received data: ${error}`, this.constructor.name);
  }
};

try {
  await this.udpConnectorService.on(channel, listener);
} catch (error) {
  this.loggerService.error(`Failed to open UDP channel: ${error}`, this.constructor.name);
}
```

Calling the method again will keep the socket open and attaches the new listener.

To close the socket and stop listening to received data, use the method `off(channel: string, listener: (msg: Buffer) => void | Promise<void>): void:` as follows:

```typescript
this.udpConnectorService.off(channel.name, listener);
```

**Keep in mind, that the socket will only be closed when all listeners are removed!**

## 2. Dependencies

The Sensor API depends on the following modules:

- `LoggerModule` (`LoggerService` from `@libs/logger`)
- `UdpConnectorModule` (`UdpConnectorService` from `@libs/udp-connector`)
- `ConfigModule` (`ConfigService` from `@nestjs/config`)
