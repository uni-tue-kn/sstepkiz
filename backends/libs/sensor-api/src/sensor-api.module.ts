import { UdpConnectorModule } from '@libs/udp-connector';
import { UsbDeviceModule } from 'libs/usb-device/src';
import { DynamicModule, Module } from '@nestjs/common';

import { RtcConnectController } from './controllers/rtc-connect/rtc-connect.controller';
import { DriverInformationController } from './controllers/driver-information/driver-information.controller';
import { AggregationService } from './services/aggregation/aggregation.service';
import { CommunicationService } from './services/communication/communication.service';
import { CsvLoggerService } from './services/csv-logger/csv-logger.service';
import { DriverService } from './services/driver/driver.service';
import { LocalPeerService } from './services/local-peer/local-peer.service';
import { RemotePeerService } from './services/remote-peer/remote-peer.service';
import { SensorDataService } from './services/sensor-data/sensor-data.service';
import { SensorApiModuleOptions } from './types/sensor-api-module-options.interface';
import { SensorType, sensorTypeToDriverType } from './types/sensor-type.enum';
import { SensorDriverInfo } from './types/sensor-driver-info.class';
import { SensorConfiguration } from './types/sensor/sensor-configuration.interface';
import { VariablesService } from './variables/variables.service';
import { EcgDrivers, EdaDrivers, EyeTrackingDrivers, MovementDrivers } from '.';

@Module({
  controllers: [
    RtcConnectController, 
    DriverInformationController
  ],
  exports: [
    AggregationService,
    CommunicationService,
    CsvLoggerService,
    DriverService,
    RemotePeerService,
    SensorDataService,
    VariablesService,
  ],
  imports: [
    UdpConnectorModule,
    UsbDeviceModule
  ],
  providers: [
    AggregationService,
    CommunicationService,
    CsvLoggerService,
    DriverService,
    LocalPeerService,
    RemotePeerService,
    SensorDataService,
    VariablesService,
    EcgDrivers,
    EdaDrivers,
    EyeTrackingDrivers,
    MovementDrivers,
  ],
})
export class SensorApiModule {
  /**
   * Creates a dynamic sensor module.
   * @param options Sensor module options.
   */
  static forRoot(options: SensorApiModuleOptions): DynamicModule {
    // Get all configured sensor types that are configured.
    const driverTypes = Object.getOwnPropertyNames(options.driverConfiguration);
    const unfilteredSensorTypes: SensorType[] = driverTypes.map(type => SensorType[type]);
    const sensorTypes = unfilteredSensorTypes.filter(type => !!type && !!options.driverConfiguration[type] && Object.getOwnPropertyNames(options.driverConfiguration[type]).length > 0);
    // Generate providers of drivers.
    const driverProvidersArray: any[] = sensorTypes.map(sensorType => {
      const driverTypeConfigurations = options.driverConfiguration[sensorType.toString()];
      const driverNames = Object.getOwnPropertyNames(driverTypeConfigurations);
      const providers = driverNames.map(driverName => options.driverRegistry[sensorType][driverName]);
      return [
        ...providers,
        {
          provide: sensorType.toString(),
          useFactory: (...d: any) => [...d],
          inject: [
            ...providers,
          ],
        }
      ];
    }).filter(p => p.length > 0);
    const driverProviders = driverProvidersArray.length > 0 ? driverProvidersArray.reduce((p, c) => [...p, ...c]) : [];
    return {
      imports: [
        UdpConnectorModule,
        UsbDeviceModule,
        ...options.driverModules
      ],
      global: options.global || false,
      module: SensorApiModule,
      providers: [
        ...driverProviders,
        {
          provide: SensorDriverInfo,
          useValue: new SensorDriverInfo(options.driverConfiguration)
        }
      ],
      exports: [
        ...driverProviders,
        {
          provide: SensorDriverInfo,
          useValue: new SensorDriverInfo(options.driverConfiguration)
        }
      ]
    };
  }
}
