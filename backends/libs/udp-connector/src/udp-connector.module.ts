import { Global, Module } from '@nestjs/common';

import { UdpConnectorService } from './udp-connector.service';

@Global()
@Module({
  exports: [UdpConnectorService],
  providers: [UdpConnectorService],
})
export class UdpConnectorModule {}
